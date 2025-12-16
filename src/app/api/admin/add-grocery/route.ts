import uploadOnClodinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
      return NextResponse.json(
        { message: "You are not an Admin" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const unit = formData.get("unit") as string;
    const file = formData.get("image") as Blob | null;

    let imageUrl;
    if (file) {
      imageUrl = await uploadOnClodinary(file);
    }

    const grocery = await Grocery.create({
      name,
      price,
      category,
      unit,
      image: imageUrl,
    });
    return NextResponse.json(grocery, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Add grocery error" }, { status: 500 });
  }
}
