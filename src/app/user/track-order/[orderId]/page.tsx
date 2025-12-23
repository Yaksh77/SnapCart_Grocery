"use client";
import LiveMap from "@/components/LiveMap";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";
import { RootState } from "@/redux/store";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import mongoose from "mongoose";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface IOrder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: [
    {
      grocery: mongoose.Types.ObjectId;
      name: string;
      category: string;
      price: string;
      unit: string;
      image: string;
      quantity: number;
    }
  ];
  totalAmount: string;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    mobile: string;
    latitude: number;
    longitude: number;
  };
  status: "pending" | "out of delivery" | "delivered";
  assignedDeliveryBoy?: IUser;
  assignment?: mongoose.Types.ObjectId;
  isPaid?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ILocation {
  latitude: number;
  longitude: number;
}

function TrackOrder({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const { orderId } = useParams();
  const [order, setOrder] = useState<IOrder>();
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const getOrder = async () => {
      try {
        const response = await axios.get(`/api/user/get-order/${orderId}`);
        setOrder(response.data);
        setUserLocation({
          latitude: response.data.address.latitude,
          longitude: response.data.address.longitude,
        });

        if (response.data.assignedDeliveryBoy) {
          setDeliveryBoyLocation({
            latitude: response.data.assignedDeliveryBoy.location.coordinates[1],
            longitude:
              response.data.assignedDeliveryBoy.location.coordinates[0],
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    getOrder();
  }, [userData?._id]);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("update-deliveryBoy-location", (data) => {
      setDeliveryBoyLocation({
        latitude: data.location.coordinates[1],
        longitude: data.location.coordinates[0],
      });
    });

    return () => {
      socket.off("update-deliveryBoy-location");
    };
  }, [order]);

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-uto pb-24">
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-999">
          <button
            className="p-2 bg-green-100 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="text-green-700" size={20} />
          </button>
          <div>
            <h2 className="font-bold">Track Order</h2>
            <p className="text-gray-600">
              Order# {order?._id?.toString().slice(0, 8)}{" "}
              <span className="text-gray-700 font-semibold">
                {order?.status}
              </span>
            </p>
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className="rounded-3xl overflow-hidden border shadow">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
