"use client";
import { RootState } from "@/redux/store";
import {
  ArrowLeft,
  Building,
  CreditCard,
  CreditCardIcon,
  Home,
  Loader,
  Locate,
  MapPin,
  Navigation,
  Phone,
  Search,
  Truck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import axios from "axios";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

const DraggableMarker = ({
  position,
  icon,
  setPosition,
}: {
  position: [number, number];
  icon: any;
  setPosition: (pos: [number, number]) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 13, { animate: true });
  }, [position, map]);

  return (
    <Marker
      position={position}
      icon={icon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    >
      <Popup>Drag me to adjust location</Popup>
    </Marker>
  );
};

function Checkout() {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const { cartData } = useSelector((state: RootState) => state.cart);
  const { subTotal, deliveryFee, finalTotal } = useSelector(
    (state: RootState) => state.cart
  );
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [icon, setIcon] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const handleSearchQuery = async () => {
    setSearchLoading(true);
    if (!searchQuery) return;

    try {
      // 🔥 CLIENT-ONLY dynamic import
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");

      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: searchQuery });
      setSearchLoading(false);
      if (results.length > 0) {
        setPosition([results[0].y, results[0].x]);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    // Import leaflet ONLY on client
    import("leaflet").then((L) => {
      const customIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/128/9458/9458234.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setIcon(customIcon);
    });
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
        },
        (error) => {
          console.log("Location Error: ", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 100000 }
      );
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({ ...prev, fullName: userData.name || "" }));
      setAddress((prev) => ({ ...prev, mobile: userData.mobile || "" }));
    }
  }, [userData]);

  useEffect(() => {
    if (!position) return;

    const fetchAddress = async () => {
      try {
        const [lat, lon] = position;

        const response = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              lat,
              lon,
              format: "json",
            },
            headers: {
              "Accept-Language": "en", // optional
            },
          }
        );
        const addressData = response.data.address;

        setAddress((prev) => ({
          ...prev,
          city: addressData.state_district || addressData.town || "",
          state: addressData.state || "",
          pincode: addressData.postcode || "",
          fullAddress: response.data.display_name || "",
        }));
      } catch (error) {
        console.log("Reverse geocode error:", error);
      }
    };

    fetchAddress();
  }, [position]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
        },
        (error) => {
          console.log("Location Error: ", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 100000 }
      );
    }
  };

  const handleCod = async () => {
    if (!position) {
      return;
    }

    try {
      const response = await axios.post("/api/user/order", {
        userId: userData?._id,
        items: cartData.map((item) => ({
          grocery: item._id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          fullAddress: address.fullAddress,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          latitude: position?.[0],
          longitude: position?.[1],
        },
        paymentMethod,
      });

      console.log(response.data);
      router.push("/user/order-success");
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const response = await axios.post("/api/user/payment", {
        userId: userData?._id,
        items: cartData.map((item) => ({
          grocery: item._id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          latitude: position?.[0],
          longitude: position?.[1],
        },
        paymentMethod,
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
        onClick={() => router.push("/user/cart")}
      >
        <ArrowLeft size={16} />
        <span>Back to cart</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 ">
            <MapPin className="text-green-700" />
            Delivery Address
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={address.fullName}
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>
            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                placeholder="mobile"
                value={address.mobile}
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, mobile: e.target.value }))
                }
              />
            </div>
            <div className="relative">
              <Home
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                placeholder="Full Address"
                value={address.fullAddress}
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullAddress: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <Navigation
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                />
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.pincode}
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Search city or area"
                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="text-white bg-green-600 px-5 rounded-lg hover:bg-green-700 transition-all font-medium"
                onClick={handleSearchQuery}
              >
                {searchLoading ? (
                  <Loader size={22} className="animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>
            <div className="relative mt-6 h-82.5 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {position && (
                <MapContainer
                  key={position.join(",")} // 🔥 VERY IMPORTANT
                  center={position}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="w-full h-full rounded-lg"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {position && icon && (
                    <DraggableMarker
                      position={position}
                      icon={icon}
                      setPosition={setPosition}
                    />
                  )}
                </MapContainer>
              )}
              <motion.button
                whileTap={{ scale: 0.93 }}
                className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999"
                onClick={handleCurrentLocation}
              >
                <Locate size={22} />
              </motion.button>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-green-600" /> Payment Method
          </h2>
          <div className="space-y-4 mb-6">
            <button
              className={`flex items-center gap-3 w-full border rounded-lg p-3 ${
                paymentMethod == "online"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "font-medium text-gray-700"
              } `}
              onClick={() => setPaymentMethod("online")}
            >
              <CreditCardIcon />
              <span>Pay Online (Stripe)</span>
            </button>
            <button
              className={`flex items-center gap-3 w-full border rounded-lg p-3 ${
                paymentMethod == "cod"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "font-medium text-gray-700"
              } `}
              onClick={() => setPaymentMethod("cod")}
            >
              <Truck />
              <span>Cash On Delivery</span>
            </button>
          </div>
          <div className="border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold text-green-600">₹ {subTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Delivery Fee</span>
              <span className="font-semibold text-green-600">
                ₹ {deliveryFee}
              </span>
            </div>
            <div className="flex font-bold justify-between text-lg border-t pt-3">
              <span>Final Total</span>
              <span className="font-semibold text-green-600">
                ₹ {finalTotal}
              </span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.93 }}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold"
            onClick={() => {
              if (paymentMethod == "cod") {
                handleCod();
              } else {
                handleOnlinePayment();
              }
            }}
          >
            {paymentMethod == "cod" ? "Place Order" : "Pay & Place ORder"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;
