"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LiveMap from "./LiveMap";
import DeliveryChat from "./DeliveryChat";

interface ILocation {
  latitude: number;
  longitude: number;
}

function DeliveryBoyDashboard() {
  const [assignments, setAssingments] = useState<any[]>();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const { userData } = useSelector((state: RootState) => state.user);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get("/api/delivery/get-assignments");
      console.log(response.data);

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
      console.log(response.data);
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
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchCurrentOrder();
  }, [userData]);

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
