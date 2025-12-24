import authOptions from "@/lib/auth";
import uploadOnClodinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin") {
      return NextResponse.json(
        { message: "You are not an Admin" },
        { status: 400 }
      );
    }
    const { groceryId } = await request.json();

    const grocery = await Grocery.findByIdAndDelete(groceryId);
    return NextResponse.json(grocery, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: `Delete grocery error ${error}` },
      { status: 500 }
    );
  }
}
