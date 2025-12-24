"use client";
import { IndianRupee, Package, Truck, User } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type props = {
  earning: {
    total: number;
    sevenDays: number;
    today: number;
  };
  stats: {
    title: string;
    value: number;
  }[];
  chartData: {
    day: string;
    count: number;
  }[];
};

function AdmindashboardClient({ earning, stats, chartData }: props) {
  const [filter, setFilter] = useState<"last 7 days" | "today" | "total">();

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as "last 7 days" | "today" | "total");
  };

  const currentEarning =
    filter === "today"
      ? earning.today
      : filter === "last 7 days"
      ? earning.sevenDays
      : earning.total;

  const title =
    filter === "today"
      ? "Today's Earnings"
      : filter === "last 7 days"
      ? "Last 7 days Earnings"
      : "Total Earnings";

  return (
    <div className="pt-28 2-[90%] md:w-[80%] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-10 text-center sm:text-left">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold to-green-700"
        >
          📝 Admin Dashboard
        </motion.h1>

        <select
          className="border border-gray-400 rounded-lg px-4 py-2 text-sm focus:ring-2  focus:ring-green-500 outline-none transition w-full sm:w-auto"
          onChange={handleFilterChange}
          value={filter}
        >
          <option value="total">Total</option>
          <option value="last 7 days">Last 7 days</option>
          <option value="today">Today</option>
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-green-50 border-green-200 shadow-sm rounded-2xl p-6 text-center mb-10"
      >
        <h2 className="text-lg font-semibold text-green-700 mb-2">{title}</h2>
        <p className="text-4xl font-extrabold to-green-800">
          {currentEarning.toLocaleString()}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => {
          const icons = [
            <Package key={"p"} className="text-green-700 w-6 h-6" />,
            <User key={"u"} className="text-green-700 w-6 h-6" />,
            <Truck key={"t"} className="text-green-700 w-6 h-6" />,
            <IndianRupee key={"i"} className="text-green-700 w-6 h-6" />,
          ];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white border border-gray-100 shadow-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-all"
            >
              <div className="bg-green-100 p-3 rounded-xl">{icons[index]}</div>
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-gray-800 text-2xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          🛍️ Order's Overview (Last 7 Days)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="day" />
            <Tooltip />
            <Bar dataKey="orders" fill="#16A34A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdmindashboardClient;
