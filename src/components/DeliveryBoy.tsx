import React from "react";
import DeliveryBoyDashboard from "./DeliveryBoyDashboard";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Order from "@/models/order.model";
import connectDB from "@/lib/db";

async function DeliveryBoy() {
  await connectDB();
  const session = await getServerSession(authOptions);
  const deliveryBoyId = session?.user.id;
  const orders = await Order.find({
    assignedDeliveryBoy: deliveryBoyId,
    deliveryOtpVerification: true,
  });

  const today = new Date().toDateString();
  const todaysEarning =
    orders.filter((order) => order.deliveredAt.toDateString() === today)
      .length * 40;

  return (
    <>
      <DeliveryBoyDashboard earnings={todaysEarning} />
    </>
  );
}

export default DeliveryBoy;
