import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { role, mobile } = await request.json();
    const session = await getServerSession();
    const user = await User.findOneAndUpdate(
      { email: session?.user?.email },
      {
        role,
        mobile,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Edit role and mobile error" },
      { status: 500 }
    );
  }
}
