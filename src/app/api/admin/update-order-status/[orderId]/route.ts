import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    const { orderId } = await context.params;
    const { status } = await request.json();

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }

    if (status === "pending") {
      // Remove delivery assignment if exists
      if (order.assignment) {
        await DeliveryAssignment.findByIdAndDelete(order.assignment);
        order.assignment = null;
      }

      order.status = "pending";
      await order.save();

      await emitEventHandler("order-status-update", {
        orderId: order._id,
        status: order.status,
      });

      return NextResponse.json(
        { message: "Order reverted to pending" },
        { status: 200 }
      );
    }

    order.status = status;
    let availableDeliveryBoysPayload: any[] = [];

    if (status === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address;

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((boy) => boy._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map(String));

      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );

      if (availableDeliveryBoys.length === 0) {
        await order.save();

        await emitEventHandler("order-status-update", {
          orderId: order._id,
          status: order.status,
        });

        return NextResponse.json(
          { message: "No delivery boy available" },
          { status: 200 }
        );
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        status: "broadcasted",
        broadcastedTo: availableDeliveryBoys.map((b) => b._id),
      });

      const populatedAssignment = await DeliveryAssignment.findById(
        deliveryAssignment._id
      ).populate("order");

      for (const boy of availableDeliveryBoys) {
        if (boy.socketId) {
          await emitEventHandler(
            "new-delivery-assignment",
            populatedAssignment,
            boy.socketId
          );
        }
      }

      order.assignment = deliveryAssignment._id;

      availableDeliveryBoysPayload = availableDeliveryBoys.map((boy) => ({
        id: boy._id,
        name: boy.name,
        mobile: boy.mobile,
        latitude: boy.location.coordinates[1],
        longitude: boy.location.coordinates[0],
      }));
    }

    await order.save();
    await order.populate("user");

    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
    });

    return NextResponse.json(
      {
        assignment: order.assignment || null,
        availableDeliveryBoys: availableDeliveryBoysPayload,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Update order status error" },
      { status: 500 }
    );
  }
}
