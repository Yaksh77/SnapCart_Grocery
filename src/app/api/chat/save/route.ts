import connectDB from "@/lib/db";
import Message from "@/models/message.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { senderId, text, roomId, time } = await request.json();
    const room = await Order.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 400 });
    }

    const message = await Message.create({
      roomId: room._id,
      senderId,
      text,
      time,
    });
    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Save chat room error", error },
      { status: 500 }
    );
  }
}
