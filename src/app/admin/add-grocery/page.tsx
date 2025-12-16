"use client";
import axios from "axios";
import { ArrowLeft, Loader, PlusCircle, Upload } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const categories = [
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
];
const units = ["kg", "g", "liter", "ml", "piece", "pack"];

function AddGrocery() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [frontendImage, setFrontendImage] = useState<string | null>();
  const [backendImage, setBackendImage] = useState<File | null>();
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length == 0) {
      return;
    }
    const file = files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("unit", unit);
      formData.append("price", price);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const response = await axios.post("/api/admin/add-grocery", formData);
      setName("");
      setCategory("");
      setUnit("");
      setPrice("");
      setFrontendImage(null);
      setLoading(false);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white
  py-16 px-4 relative"
    >
      <Link
        href={"/"}
        className="absolute top-6 left-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden md:flex font-medium">Back To Home</span>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl border-green-100 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-8 h-8 text-green-600" />
            <h1>Add You Grocery</h1>
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Fiil out the details below to add a new item
          </p>
        </div>
        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Grocery Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="eg. sweets,Milk..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Select Unit:<span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                onChange={(e) => setUnit(e.target.value)}
                value={unit}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Price: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="eg. 199"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <label
              htmlFor="image"
              className="cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-6 py-3
              hover:bg-green-100 transition-all w-full sm:w-auto"
            >
              <Upload /> Upload Image: <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              id="image"
              onChange={handleImageChange}
              hidden
            />
            {frontendImage && (
              <Image
                src={frontendImage}
                alt="Grocery Image"
                width={100}
                height={100}
                className="rounded-xl shadow-md border border-gray-200 object-cover"
              />
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.9 }}
            className="mt-4 w-full bg-linear-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              "Add Grocery"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default AddGrocery;
