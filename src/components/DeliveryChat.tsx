import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import axios from "axios";
import { Send } from "lucide-react";
import mongoose from "mongoose";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";

type props = {
  orderId: mongoose.Types.ObjectId;
  deliveryBoyId: mongoose.Types.ObjectId;
};

function DeliveryChat({ orderId, deliveryBoyId }: props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>();

  useEffect((): any => {
    const socket = getSocket();
    socket.emit("join-room", orderId.toString());
    socket.on("receive-message", (message: IMessage) => {
      if (message.roomId === orderId) {
        setMessages((prevMessages) => [...prevMessages!, message]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = () => {
    const socket = getSocket();
    const message = {
      roomId: orderId,
      senderId: deliveryBoyId,
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
          roomId: orderId.toString(),
        });
        setMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getAllMessages();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col">
      <div className="flex-1 overflow-y-auto  p-2 space-y-3">
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                message.senderId === deliveryBoyId
                  ? "justify-end"
                  : "justify-start"
              } gap-2`}
            >
              <div
                className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${
                  message.senderId === deliveryBoyId
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
  );
}

export default DeliveryChat;
