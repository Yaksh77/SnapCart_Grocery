import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log(`Signature Verification Failed : ${error}`);
  }

  if (event?.type === "checkout.session.completed") {
    const session = event.data.object;
    await connectDB();
    await Order.findByIdAndUpdate(
      session?.metadata?.orderId,
      {
        isPaid: true,
      },
      { new: true }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
