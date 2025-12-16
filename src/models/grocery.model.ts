import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const grocerySchema = new mongoose.Schema<IGrocery>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "fruits_vegetables",
        "dairy",
        "grains_pulses",
        "oil_ghee",
        "snacks",
        "beverages",
        "bakery",
        "meat_seafood",
        "frozen_foods",
        "condiments_spices",
        "ready_to_eat",
        "organic",
        "household",
        "personal_care",
      ],
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "liter", "ml", "piece", "pack"],
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Grocery =
  mongoose.models?.Grocery || mongoose.model("Grocery", grocerySchema);

export default Grocery;
