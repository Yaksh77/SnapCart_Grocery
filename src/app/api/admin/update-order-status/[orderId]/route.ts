import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();
    const { orderId } = await params;
    const { status } = await request.json();

    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }

    order.status = status;
    let availableDeliveryBoysPayload: any[] = [];

    if (status == "out of delivery" && !order.assignment) {
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

      const busyIdSet = new Set(busyIds.map((b) => String(b)));
      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );

      const candidates = availableDeliveryBoys.map((boy) => boy._id);

      if (candidates.length == 0) {
        await order.save();
        return NextResponse.json(
          { message: "No delivery boy available" },
          { status: 200 }
        );
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        orderId: order._id,
        status: "broadcasted",
        broadcastedTo: candidates,
      });

      order.assignment = deliveryAssignment._id;
      availableDeliveryBoysPayload = availableDeliveryBoys.map((boy) => ({
        id: boy._id,
        name: boy.name,
        mobile: boy.mobile,
        latitude: boy.location.coordinates[1],
        longitude: boy.location.coordinates[0],
      }));

      await deliveryAssignment.populate("order");
    }

    await order.save();
    await order.populate("user");

    return NextResponse.json(
      {
        assignment: order.assignment._id,
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
