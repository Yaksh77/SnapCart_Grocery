import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import GroceryItemCard from "./GroceryItemCard";
import { IGrocery } from "@/models/grocery.model";

async function UserDashboard({ groceryList }: { groceryList: IGrocery[] }) {
  const plainGrocery = JSON.parse(JSON.stringify(groceryList));

  return (
    <>
      <HeroSection />
      <CategorySlider />

      <div className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          Popular Grocery Items
        </h2>

        {plainGrocery.length === 0 ? (
          <p className="text-center text-gray-500">
            No grocery items available
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {plainGrocery.map((item: any, index: any) => (
              <GroceryItemCard item={item} key={item._id} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default UserDashboard;
