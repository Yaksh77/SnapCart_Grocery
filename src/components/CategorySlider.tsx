"use client";
import {
  Apple,
  Milk,
  Wheat,
  Droplet,
  Cookie,
  Coffee,
  Croissant,
  Snowflake,
  Utensils,
  Leaf,
  Home,
  Heart,
  Drumstick,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { clearInterval } from "timers";

function CategorySlider() {
  const categories = [
    {
      name: "fruits_vegetables",
      icon: Apple,
      color: "bg-green-100",
    },
    {
      name: "dairy",
      icon: Milk,
      color: "bg-blue-100",
    },
    {
      name: "grains_pulses",
      icon: Wheat,
      color: "bg-yellow-100",
    },
    {
      name: "oil_ghee",
      icon: Droplet,
      color: "bg-amber-100",
    },
    {
      name: "snacks",
      icon: Cookie,
      color: "bg-orange-100",
    },
    {
      name: "beverages",
      icon: Coffee,
      color: "bg-stone-200",
    },
    {
      name: "bakery",
      icon: Croissant,
      color: "bg-yellow-100",
    },
    {
      name: "meat_seafood",
      icon: Drumstick,
      color: "bg-red-100",
    },
    {
      name: "frozen_foods",
      icon: Snowflake,
      color: "bg-sky-100",
    },
    {
      name: "condiments_spices",
      icon: Flame,
      color: "bg-red-100",
    },
    {
      name: "ready_to_eat",
      icon: Utensils,
      color: "bg-indigo-100",
    },
    {
      name: "organic",
      icon: Leaf,
      color: "bg-green-100",
    },
    {
      name: "household",
      icon: Home,
      color: "bg-slate-100",
    },
    {
      name: "personal_care",
      icon: Heart,
      color: "bg-pink-100",
    },
  ];
  const [showLeft, setShowLeft] = useState<Boolean>();
  const [showRight, setShowRight] = useState<Boolean>();

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) {
      return;
    }
    const scrollAmount = direction == "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const checkScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth <= scrollWidth);
  };

  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (!scrollRef.current) {
        return;
      }
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(autoScroll);
  }, []);

  useEffect(() => {
    scrollRef.current?.addEventListener("scroll", checkScroll);
    return () => removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <motion.div
      className="w-[90%] md:w-[80%] mx-auto mt-10 relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, amount: 0.5 }}
    >
      <h2 className="text-2xl  md:text-3xl font-bold text-green-700 mb-6 text-center">
        🛒 Shop By Category
      </h2>
      {showLeft && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-6 h-6 text-green-700" />
        </button>
      )}

      <div
        className="flex gap-6 overflow-x-auto px-10 pb-4 scrollbar-hide scroll-smooth"
        ref={scrollRef}
      >
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={index}
              className={`min-w-max flex flex-col items-center justify-center gap-2 p-6 rounded-2xl ${cat.color} shadow-md hover:shadow-xl transition-all cursor-pointer`}
            >
              <div className="flex flex-col items-center justify-center p-5">
                <Icon className="w-10 h-10 text-green-700 mb-3" />
                <p className="text-center text-sm md:text-base font-semibold text-gray-700 capitalize">
                  {cat.name}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showRight && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-6 h-6 text-green-700" />
        </button>
      )}
    </motion.div>
  );
}

export default CategorySlider;
