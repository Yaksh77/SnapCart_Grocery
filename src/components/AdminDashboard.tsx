import React from "react";
import AdminDashboardClient from "./AdminDashboardClient";
import connectDB from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Grocery from "@/models/grocery.model";

async function AdminDashboard() {
  await connectDB();
  const orders = await Order.find({});
  const users = await User.find({ role: "user" });
  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const pendingDeliveries = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const totalRevenue = orders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const OrdersToday = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startOfToday;
  });
  const todayRevenue = OrdersToday.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const OrdersLast7Days = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= sevenDaysAgo;
  });
  const last7DaysRevenue = OrdersLast7Days.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const stats = [
    { title: "Total Orders", value: totalOrders },
    { title: "Total Customers", value: totalCustomers },
    { title: "Pending Deliveries", value: pendingDeliveries },
    { title: "Total Revenue", value: totalRevenue },
  ];

  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const ordersCount = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= date && orderDate < nextDay;
    });

    chartData.push({
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      count: ordersCount.length,
    });
  }

  return (
    <>
      <AdminDashboardClient
        earning={{
          today: todayRevenue,
          sevenDays: last7DaysRevenue,
          total: totalRevenue,
        }}
        stats={stats}
        chartData={chartData}
      />
    </>
  );
}

export default AdminDashboard;
