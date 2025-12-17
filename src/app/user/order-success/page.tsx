"use client";
import { ArrowRight, CheckCircle, Package } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";

const blinkDots = [
  { top: "5%", left: "8%", size: "w-2 h-2", color: "bg-green-400" },
  { top: "8%", left: "45%", size: "w-1.5 h-1.5", color: "bg-lime-400" },
  { top: "10%", left: "75%", size: "w-3 h-3", color: "bg-emerald-400" },

  { top: "18%", left: "12%", size: "w-2 h-2", color: "bg-green-300" },
  { top: "20%", left: "60%", size: "w-2.5 h-2.5", color: "bg-green-500" },
  { top: "22%", left: "90%", size: "w-1.5 h-1.5", color: "bg-lime-300" },

  { top: "30%", left: "5%", size: "w-3 h-3", color: "bg-emerald-500" },
  { top: "32%", left: "40%", size: "w-2 h-2", color: "bg-green-400" },
  { top: "35%", left: "78%", size: "w-2 h-2", color: "bg-lime-400" },

  { top: "42%", left: "15%", size: "w-1.5 h-1.5", color: "bg-green-300" },
  { top: "45%", left: "50%", size: "w-3 h-3", color: "bg-emerald-400" },
  { top: "48%", left: "88%", size: "w-2 h-2", color: "bg-green-500" },

  { top: "55%", left: "10%", size: "w-2.5 h-2.5", color: "bg-lime-500" },
  { top: "58%", left: "35%", size: "w-2 h-2", color: "bg-green-400" },
  { top: "60%", left: "70%", size: "w-1.5 h-1.5", color: "bg-emerald-300" },

  { top: "65%", left: "90%", size: "w-2 h-2", color: "bg-green-500" },
  { top: "70%", left: "20%", size: "w-3 h-3", color: "bg-emerald-400" },
  { top: "72%", left: "55%", size: "w-2 h-2", color: "bg-lime-400" },

  { top: "78%", left: "5%", size: "w-1.5 h-1.5", color: "bg-green-300" },
  { top: "80%", left: "40%", size: "w-2.5 h-2.5", color: "bg-green-500" },
  { top: "82%", left: "75%", size: "w-2 h-2", color: "bg-emerald-400" },

  { top: "88%", left: "15%", size: "w-2 h-2", color: "bg-lime-300" },
  { top: "90%", left: "60%", size: "w-3 h-3", color: "bg-green-400" },
  { top: "92%", left: "88%", size: "w-1.5 h-1.5", color: "bg-emerald-300" },
];

function OrderSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-linear-to-b from-green-50 to-white">
      <motion.div
        initial={{ opacity: 0, rotate: -80 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="relative"
      >
        <CheckCircle className="text-green-600 w-24 h-24 md:w-28 md:h-28" />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.3, 0, 0.3], scale: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-full h-full rounded-full bg-green-700 blur-2xl" />
        </motion.div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-green-700 mt-6"
      >
        Order Placed Successfully
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-gray-400 mt-3 text-sm md:text-base max-w-md"
      >
        Thank you shopping with us! Your order has been placed and is being
        processed. You can track its progress in your{" "}
        <span className="font-semibold text-green-700 ">My Orders</span>{" "}
        section.
      </motion.p>
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          delay: 1,
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
      >
        <Package className="w-16 h-16 md:w-20 md:h-20 text-green-500" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="mt-12"
      >
        <Link href={"/"}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold px-8 py-3 rounded-full shadow-lg transition-all"
          >
            Go to My Orders <ArrowRight />
          </motion.div>
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
      >
        {blinkDots.map((dot, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-pulse ${dot.size} ${dot.color} opacity-70`}
            style={{ top: dot.top, left: dot.left }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default OrderSuccess;
