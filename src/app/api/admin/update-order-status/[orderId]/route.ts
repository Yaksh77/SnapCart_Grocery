import connectDB from "@/lib/db";
import Order from "@/models/order.model";
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
    let availableDeliveryBoys: any[];

    if (status == "out of delivery" && !order.assignment) {
    }

    // return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {}
}
