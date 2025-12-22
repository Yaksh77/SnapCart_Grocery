import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const orders = await Order.find({ user: session?.user.id })
      .populate("user")
      .sort({ createdAt: -1 });

    if (!orders) {
      return NextResponse.json(
        { message: "Orders not found" },
        { status: 400 }
      );
    }
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error while fetching orders" },
      { status: 500 }
    );
  }
}
