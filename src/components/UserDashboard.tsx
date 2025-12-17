import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import GroceryItemCard from "./GroceryItemCard";
import connectDB from "@/lib/db";
import Grocery from "@/models/grocery.model";

async function UserDashboard() {
  await connectDB();
  const groceries = await Grocery.find({});
  const planGroceries = JSON.parse(JSON.stringify(groceries));

  return (
    <>
      <HeroSection />
      <CategorySlider />
      <div className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-3xl font-bold to-green-700 mb-6 text-center">
          Popular Gorcery Items
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {planGroceries.map((item: any, index: number) => (
            <GroceryItemCard item={item} key={index} />
          ))}
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
