import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, location } = await request.json();
    // console.log("UserID : ", userId);
    // console.log("Location: ", location);

    if (!userId || !location) {
      return NextResponse.json(
        { message: "Please send all credentials" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location,
      },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    return NextResponse.json({ message: "Location updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Update location error" },
      { status: 500 }
    );
  }
}
