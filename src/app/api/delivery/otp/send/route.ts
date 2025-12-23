import connectDB from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { orderId } = await request.json();

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.deliveryOtp = otp;
    await order.save();

    await sendMail(
      order.user.email,
      "Your Snapcart OTP",
      `<h2>Your OTP is <strong> ${otp} </strong></h2>`
    );

    return NextResponse.json(
      { message: "Otp sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Send otp error" }, { status: 500 });
  }
}
