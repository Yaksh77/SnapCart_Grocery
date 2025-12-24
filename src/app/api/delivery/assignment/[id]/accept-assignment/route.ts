import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const deliveryBoyId = session?.user.id;
    if (!deliveryBoyId) {
      return NextResponse.json(
        { message: "Delivery boy not found" },
        { status: 400 }
      );
    }

    const assignment = await DeliveryAssignment.findById(id);

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 400 }
      );
    }

    if (assignment.status !== "broadcasted") {
      return NextResponse.json(
        { message: "Assignment expired" },
        { status: 400 }
      );
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: { $nin: ["broadcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return NextResponse.json(
        { message: "Assignment already assigned" },
        { status: 400 }
      );
    }

    assignment.assignedTo = deliveryBoyId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }

    order.assignedDeliveryBoy = deliveryBoyId;
    await order.save();

    await order.populate("assignedDeliveryBoy");

    await emitEventHandler("order-assigned", {
      orderId: order._id,
      assignedDeliveryBoy: order.assignedDeliveryBoy,
    });

    await DeliveryAssignment.updateMany(
      {
        _id: { $ne: assignment._id },
        broadcastedTo: deliveryBoyId,
        status: "broadcasted",
      },
      {
        $pull: { broadcastedTo: deliveryBoyId },
      }
    );

    return NextResponse.json(
      { message: "Order accepted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "" }, { status: 500 });
  }
}
