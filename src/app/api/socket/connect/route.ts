import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, socketId } = await request.json();
    await User.findByIdAndUpdate(
      userId,
      { socketId, isOnline: true },
      { new: true }
    );

    return NextResponse.json({ message: "Connected" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Connect error" }, { status: 500 });
  }
}
