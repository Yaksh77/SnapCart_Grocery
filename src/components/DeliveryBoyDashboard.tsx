"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DeliveryChat from "./DeliveryChat";
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";
const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
});

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ILocation {
  latitude: number;
  longitude: number;
}

function DeliveryBoyDashboard({ earnings }: { earnings: number }) {
  const [assignments, setAssingments] = useState<any[]>();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const { userData } = useSelector((state: RootState) => state.user);

  const fetchCurrentOrder = async () => {
    try {
      const response = await axios.get("/api/delivery/current-order");
      if (response.data.active) {
        setActiveOrder(response.data.assignment);
        setUserLocation({
          latitude: response.data.assignment.order.address.latitude,
          longitude: response.data.assignment.order.address.longitude,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get("/api/delivery/get-assignments");
      setAssingments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAccept = async (assignmentId: string) => {
    try {
      const response = await axios.get(
        `/api/delivery/assignment/${assignmentId}/accept-assignment`
      );
      fetchCurrentOrder();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect((): any => {
    const socket = getSocket();
    socket.on("new-delivery-assignment", (populatedAssignment) => {
      setAssingments((prev) => [populatedAssignment, ...(prev || [])]);
    });
    return () => socket.off("new-delivery-assignment");
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchCurrentOrder();
  }, [userData]);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("update-deliveryBoy-location", ({ userId, location }) => {
      setDeliveryBoyLocation({
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
      });
    });

    return () => socket.off("update-deliveryBoy-location");
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!userData?._id) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setDeliveryBoyLocation({
          latitude: lat,
          longitude: lon,
        });

        socket.emit("update-location", {
          userId: userData._id,
          latitude: lat,
          longitude: lon,
        });
      },

      (error) => {
        console.log(error);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [userData?._id]);

  const sendOtp = async () => {
    setSendOtpLoading(true);
    try {
      let response = await axios.post("/api/delivery/otp/send", {
        orderId: activeOrder.order._id,
      });
      setShowOtpBox(true);
    } catch (error) {
      setSendOtpLoading(false);
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    setVerifyOtpLoading(true);
    try {
      const response = await axios.post("/api/delivery/otp/verify", {
        orderId: activeOrder.order._id,
        otp,
      });
      setActiveOrder(null);
      setShowOtpBox(false);
      setVerifyOtpLoading(false);
      await fetchCurrentOrder();
    } catch (error) {
      setOtpError("Invalid Otp");
      setVerifyOtpLoading(false);
    }
  };

  if (!activeOrder && assignments?.length === 0) {
    const todayEarning = [
      { name: "Today", earnings, deliveries: earnings / 40 },
    ];
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-white to-green-50 p-6">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No Active Deliveries
          </h2>
          <p className="text-gray-500 mb-5">Stay tuned for new deliveries</p>

          <div className="bg-white border rounded-xl shadow-xl p-6">
            <h2 className="font-medium text-green-700 mb-2">
              Today's Earnings
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={todayEarning}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earnings" name="Earnings" />
                <Bar dataKey="deliveries" name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-4 text-lg font-bold text-green-700">
              {earnings || 0} Earned today
            </p>
            <button
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              onClick={() => window.location.reload()}
            >
              Refresh Earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeOrder && userLocation) {
    return (
      <div className="p-4 pt-25 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Active Delivery
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            order# {activeOrder.order._id.slice(0, 6)}
          </p>
          <div className="rounded-xl shadow-lg mb-6 border">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>
          <DeliveryChat
            orderId={activeOrder.order._id}
            deliveryBoyId={userData?._id!}
          />

          <div className="mt-6 bg-white rounded-xl border shadow p-6">
            {!activeOrder.order.deliveryOtpVeryfication && !showOtpBox && (
              <button
                className="bg-green-600 w-full text-center text-white px-4 py-2 rounded-lg"
                onClick={sendOtp}
              >
                {sendOtpLoading ? (
                  <Loader size={16} className="animate-spin text-center" />
                ) : (
                  "Mark As Delivered"
                )}
              </button>
            )}

            {showOtpBox && (
              <div className="mt-4">
                <input
                  type="text"
                  className="w-full py-3 border rounded-lg text-center"
                  placeholder="Enter Otp"
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  className="w-full mt-4 bg-blue-600 text-center text-white py-3 rounded-lg"
                  onClick={verifyOtp}
                >
                  {verifyOtpLoading ? (
                    <Loader size={16} className="animate-spin text-center" />
                  ) : (
                    "Verify OTP"
                  )}
                  {otpError && <p className="text-red-600 mt-2">{otpError}</p>}
                </button>
              </div>
            )}

            {activeOrder.order.deliveryOtpVeryfication && (
              <div className="mt-4">
                <p className="text-green-600 text-center">Order Delivered!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-30 mb-7.5">
          Delivery Assignments
        </h2>
        {assignments?.map((assignment, index) => (
          <div
            key={index}
            className="p-5 bg-white rounded-xl shadow mb-4 border"
          >
            <p>
              <b>Order ID:</b> #{assignment.order?._id.slice(0, 6)}
            </p>
            <p>
              <b>Delivery Address: </b>
              {assignment?.order?.address?.fullAddress}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
                onClick={() => handleAccept(assignment._id)}
              >
                Accept
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
