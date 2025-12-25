"use client";
import Grocery, { IGrocery } from "@/models/grocery.model";
import axios from "axios";
import {
  ArrowLeft,
  Edit,
  Loader,
  Package,
  Search,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

function page() {
  const router = useRouter();
  const [groceries, setGroceries] = useState<IGrocery[]>([]);
  const [editing, setEditing] = useState<IGrocery | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [backendImage, setBackendImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<IGrocery[]>([]);

  useEffect(() => {
    const getGroceries = async () => {
      try {
        const response = await axios.get("/api/admin/get-groceries");
        setGroceries(response.data);
        setFiltered(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getGroceries();
  }, []);

  useEffect(() => {
    if (editing) {
      setImagePreview(editing.image);
    }
  }, [editing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setBackendImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!editing) return;
    try {
      const formData = new FormData();

      formData.append("name", editing.name);
      formData.append("groceryId", editing._id?.toString()!);
      formData.append("category", editing.category);
      formData.append("unit", editing.unit);
      formData.append("price", editing.price);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const response = await axios.post("/api/admin/edit-grocery", formData);
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    setDeleteLoading(true);
    e.preventDefault();
    if (!editing) return;
    try {
      const response = await axios.post(`/api/admin/delete-grocery`, {
        groceryId: editing?._id,
      });
      setDeleteLoading(false);
      window.location.reload();
    } catch (error) {
      setDeleteLoading(false);
      console.log(error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.toLowerCase();

    setFiltered(
      groceries.filter((grocery) => {
        return (
          grocery.name.toLowerCase().includes(q) ||
          grocery.category.toLowerCase().includes(q)
        );
      })
    );
  };

  return (
    <div className="pt-4 w-[95%] md:w-[85%] mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-4 py-2 rounded-full transition-all w-full sm:w-auto"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-green-700 flex items-center justify-center gap-2">
          <Package size={28} className="text-green-600" /> Manage Groceries
        </h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center bg-white border border-gray-200 border-border-glass rounded-full px-5 py-3 shadow-sm mb-10 hover:shadow-lg transition-all max-w-lg mx-auto w-full"
        onSubmit={handleSearch}
      >
        <Search className="text-gray-500 w-5 h-5 mr-2" />
        <input
          type="text"
          className="w-full outline-none text-gray-700 placeholder-gray-400"
          placeholder="Search by name or category"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </motion.form>

      <div className="space-y-4">
        {filtered.map((grocery, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 100, damping: 14 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 transition-all"
          >
            <div className="relative w-full sm:w-44 aspect-square rounded-xl overflow-hidden border border-gray-200">
              <Image
                src={grocery.image}
                alt={grocery.name}
                fill
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between w-full">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg truncate">
                  {grocery.name}
                </h3>
                <p className="text-gray-500 text-sm capitalize">
                  {grocery.category}
                </p>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-gray-500 text-sm font-medium ml-1">
                  ₹ {grocery.price}/ {grocery.unit}
                </p>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-center font-semibold flec items-center justify-center gap-2 hover:bg-green-700 transition-all"
                  onClick={() => setEditing(grocery)}
                >
                  <Edit size={15} className="inline-block" /> Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        px-4
      "
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="
          w-full max-w-md
          bg-white rounded-2xl
          shadow-2xl
          p-6
        "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-700">
                  Edit Grocery
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="
              p-1.5 rounded-full
              text-gray-500
              hover:text-red-600
              hover:bg-red-50
              transition
            "
                >
                  <X size={18} />
                </button>
              </div>

              {/* IMAGE UPLOAD */}
              <div
                className="
    relative w-full
    h-44 sm:h-48
    rounded-xl
    overflow-hidden
    border border-gray-200
    bg-gray-50
    mb-4
    group
  "
              >
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt={editing.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* HOVER OVERLAY */}
                <label
                  htmlFor="imageUpload"
                  className="
      absolute inset-0
      flex flex-col items-center justify-center
      gap-2
      bg-linear-to-t
      from-black/60
      via-black/30
      to-black/10
      opacity-0
      group-hover:opacity-100
      transition-all duration-300
      cursor-pointer
    "
                >
                  {/* ICON */}
                  <motion.div
                    initial={{ scale: 0.8, y: 10 }}
                    whileHover={{ scale: 1.05, y: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="
        bg-white/90
        p-3 rounded-full
        shadow-lg
        text-green-600
      "
                  >
                    <Upload size={26} />
                  </motion.div>

                  {/* TEXT */}
                  <span className="text-sm font-medium text-white tracking-wide">
                    Change Image
                  </span>
                </label>

                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>

              {/* FORM */}
              <div className="space-y-3">
                <input
                  type="text"
                  className="
              w-full rounded-lg
              border border-gray-300
              px-3 py-2
              focus:ring-2 focus:ring-green-500
              outline-none
            "
                  placeholder="Grocery name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />

                <select
                  className="
              w-full rounded-lg
              border border-gray-300
              px-3 py-2
              focus:ring-2 focus:ring-green-500
              outline-none
            "
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="
              w-full rounded-lg
              border border-gray-300
              px-3 py-2
              focus:ring-2 focus:ring-green-500
              outline-none
            "
                  placeholder="Price"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: e.target.value })
                  }
                />

                <select
                  className="
              w-full rounded-lg
              border border-gray-300
              px-3 py-2
              focus:ring-2 focus:ring-green-500
              outline-none
            "
                  value={editing.unit}
                  onChange={(e) =>
                    setEditing({ ...editing, unit: e.target.value })
                  }
                >
                  {units.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-5">
                <button
                  className="
              flex-1 py-2.5 rounded-lg
              bg-green-600 text-white
              font-medium
              hover:bg-green-700
              transition
            "
                  onClick={handleEdit}
                  disabled={loading}
                >
                  {loading ? <Loader className="animate-spin" /> : "Save"}
                </button>

                <button
                  className="
              flex-1 py-2.5 rounded-lg
              border border-red-300
              text-red-600
              hover:bg-red-50
              transition
            "
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader className="animate-spin " />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default page;
