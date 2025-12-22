import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: session?.user.id,
      status: "broadcasted",
    }).populate("order");

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Get assignments error" },
      { status: 500 }
    );
  }
}
