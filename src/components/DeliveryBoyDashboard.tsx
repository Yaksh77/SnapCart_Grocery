"use client";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import React, { useEffect, useState } from "react";

function DeliveryBoyDashboard() {
  const [assignments, setAssingments] = useState<any[]>();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get("/api/delivery/get-assignments");
        console.log(response.data);

        setAssingments(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAssignments();
  }, []);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("new-delivery-assignment", (populatedAssignment) => {
      setAssingments((prev) => [populatedAssignment, ...(prev || [])]);
    });
    return () => socket.off("new-delivery-assignment");
  }, []);

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
