"use client";
import { getSocket } from "@/lib/socket";
import React, { useEffect } from "react";

function GeoUpdater({ userId }: { userId: string }) {
  let socket = getSocket();
  socket.emit("identity", userId);

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        socket.emit("update-location", {
          userId,
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
  }, [userId]);

  return null;
}

export default GeoUpdater;
