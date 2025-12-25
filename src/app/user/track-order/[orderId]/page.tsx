"use client";
import LiveMap from "@/components/LiveMap";
import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import { IUser } from "@/models/user.model";
import { RootState } from "@/redux/store";
import axios from "axios";
import { ArrowLeft, Loader, Send, Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface IOrder {
  _id?: string;
  user: string;
  items: [
    {
      grocery: string;
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
  assignment?: string;
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
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const chatBoxRef = React.useRef<HTMLDivElement>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect((): any => {
    const socket = getSocket();
    socket.emit("join-room", orderId?.toString());
    socket.on("receive-message", (message: IMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = () => {
    const socket = getSocket();
    const message = {
      roomId: orderId?.toString(),
      senderId: userData?._id?.toString(),
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send-message", message);

    setNewMessage("");
  };

  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const response = await axios.post(`/api/chat/messages`, {
          roomId: orderId?.toString(),
        });

        setMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getAllMessages();
  }, []);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const normalizeSuggestions = (data: any): string[] => {
    if (!Array.isArray(data)) return [];

    return data
      .filter((s) => typeof s === "string")
      .map((s) =>
        s
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .replace(/[\[\]]/g, "")
          .trim()
      )
      .filter(Boolean);
  };

  const getSuggestedMessages = async () => {
    setLoading(true);

    try {
      const lastMessage = [...(messages || [])]
        .reverse()
        .find((m) => m.senderId.toString() !== userData?._id);

      if (!lastMessage) {
        setLoading(false);
        return;
      }

      const response = await axios.post(`/api/chat/ai-suggestions`, {
        message: lastMessage.text,
        role: "deliveryBoy",
      });

      console.log(response.data);

      const suggestions = normalizeSuggestions(response.data?.suggestions);

      setSuggestedMessages(suggestions);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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

          <div className="bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col mt-5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 text-sm">
                Quick Replies
              </span>
              <motion.button
                className="px-3 py-1 text-xs cursor-pointer flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200"
                onClick={getSuggestedMessages}
              >
                <Sparkle size={14} />{" "}
                {loading ? (
                  <Loader className="animate-spin" size={14} />
                ) : (
                  "Get AI Suggestions"
                )}
              </motion.button>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              {suggestedMessages.map((message, index) => (
                <motion.div
                  key={index}
                  whileTap={{ scale: 0.92 }}
                  className="px-3 py-1 text-xs bg-green-50 cursor-pointer border-green-200 text-green-700 rounded-full"
                  onClick={() => setNewMessage(message)}
                >
                  {message}
                </motion.div>
              ))}
            </div>

            <div
              className="flex-1 overflow-y-auto  p-2 space-y-3"
              ref={chatBoxRef}
            >
              <AnimatePresence>
                {messages?.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${
                      message.senderId.toString() === userData?._id
                        ? "justify-end"
                        : "justify-start"
                    } gap-2`}
                  >
                    <div
                      className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${
                        message.senderId.toString() === userData?._id
                          ? "bg-green-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-[10px] opacity-70 text-right">
                        {message.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex gap-2 mt-3 border-t pt-3">
              <input
                type="text"
                className="flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white"
                onClick={sendMessage}
              >
                <Send />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
