import "@/lib/registerModels";
import authOptions from "@/lib/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: session.user.id,
      status: "assigned",
    })
      .populate("order") // address is embedded, so works fine
      .lean();

    if (!activeAssignment) {
      return NextResponse.json({ active: false }, { status: 200 });
    }

    return NextResponse.json(
      { active: true, assignment: activeAssignment },
      { status: 200 }
    );
  } catch (error) {
    console.error("CURRENT ORDER ERROR:", error);
    return NextResponse.json(
      { message: "Get current order error", error },
      { status: 500 }
    );
  }
}
