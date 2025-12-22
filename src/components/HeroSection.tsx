"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import { Leaf, ShoppingBasket, ShoppingCart, Truck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function HeroSection() {
  const { userData } = useSelector((state: RootState) => state.user);
  const slides = [
    {
      id: 1,
      icon: (
        <Leaf className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />
      ),
      title: "Fresh Organic Groceries",
      subtitle:
        "Farm-fresh fruits, vegetables, and daily essentials delivered to you.",
      btnText: "Shop Now",
      bg: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      icon: (
        <ShoppingCart className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />
      ),
      title: "Smart & Easy Shopping",
      subtitle:
        "Browse, compare, and order groceries effortlessly with a smooth experience.",
      btnText: "Explore Products",
      bg: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMGRlbGl2ZXJ5fGVufDB8fDB8fHww",
    },
    {
      id: 3,
      icon: (
        <Truck className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />
      ),
      title: "Fast & Reliable Delivery",
      subtitle:
        "Get your groceries delivered quickly and safely right at your doorstep.",
      btnText: "Track Order",
      bg: "https://images.unsplash.com/photo-1668275057553-885fd9bb2b45?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGdyb2NlcnklMjB0cnVja3xlbnwwfHwwfHx8MA%3D%3D",
    },
  ];

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userData) {
      let socket = getSocket();
      socket.emit("identity", userData?._id);
    }
  }, [userData]);

  return (
    <div className="relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].bg}
            fill
            alt="slide"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 flex items-center justify-center text-center text-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center gap-6 max-w-3xl"
        >
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-full shadow-lg">
            {slides[current].icon}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            {slides[current].title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl">
            {slides[current].subtitle}
          </p>

          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.96 }}
            className="bg-white text-green-700 hover:bg-green-100 px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingBasket className="w-5 h-5" />
            {slides[current].btnText}
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
