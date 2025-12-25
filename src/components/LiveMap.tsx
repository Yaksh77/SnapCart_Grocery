"use client";
import React, { useEffect } from "react";
import L, { icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

interface ILocation {
  latitude: number;
  longitude: number;
}

interface IProps {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation;
}

function Recenter({ positions }: { positions: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (positions[0] && positions[1]) {
      map.setView(positions, map.getZoom(), { animate: true });
    }
  }, []);
  return null;
}

function LiveMap({ userLocation, deliveryBoyLocation }: IProps) {
  const deliveryBoyIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/10396/10396466.png",
    iconSize: [45, 45],
  });
  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/4821/4821951.png",
    iconSize: [45, 45],
  });

  const center = deliveryBoyLocation
    ? [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
    : [userLocation.latitude, userLocation.longitude];

  const linePositions = [
    deliveryBoyLocation && userLocation
      ? [
          [userLocation.latitude, userLocation.longitude],
          [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude],
        ]
      : [],
  ];

  return (
    <div className="w-full h-125 rounded-xl overflow-hidden shadow relative z-2">
      <MapContainer
        center={center as LatLngExpression}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg"
      >
        <Recenter positions={center as any} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[userLocation?.latitude, userLocation?.longitude]}
          icon={userIcon}
        >
          <Popup>Your Location</Popup>
        </Marker>

        {deliveryBoyLocation && (
          <Marker
            position={[
              deliveryBoyLocation?.latitude,
              deliveryBoyLocation?.longitude,
            ]}
            icon={deliveryBoyIcon}
          >
            <Popup>Delivery Boy Location</Popup>
          </Marker>
        )}

        <Polyline positions={linePositions as any} color="green" />
      </MapContainer>
    </div>
  );
}

export default LiveMap;
