import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import axios from "axios";
import { Loader, Send, Sparkle } from "lucide-react";
import mongoose from "mongoose";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";

type props = {
  orderId: string;
  deliveryBoyId: string;
};

function DeliveryChat({ orderId, deliveryBoyId }: props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>();
  const chatBoxRef = React.useRef<HTMLDivElement>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect((): any => {
    const socket = getSocket();
    socket.emit("join-room", orderId.toString());
    socket.on("receive-message", (message: IMessage) => {
      if (message.roomId.toString() === orderId) {
        setMessages((prevMessages) => [...prevMessages!, message]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

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
        .find((m) => m.senderId.toString() !== deliveryBoyId);

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
    <div className="bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700 text-sm">
          Quick Replies
        </span>
        <motion.button
          className="px-3 py-1 cursor-pointer text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200"
          onClick={getSuggestedMessages}
        >
          <Sparkle size={14} />{" "}
          {loading ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            "Get AI Suggestions"
          )}
        </motion.button>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {suggestedMessages?.map((message, index) => (
          <motion.div
            key={index}
            whileTap={{ scale: 0.92 }}
            className="px-3 py-1 text-xs cursor-pointer bg-green-50 border-green-200 text-green-700 rounded-full"
            onClick={() => setNewMessage(message)}
          >
            {message}
          </motion.div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto  p-2 space-y-3" ref={chatBoxRef}>
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                message.senderId.toString() === deliveryBoyId
                  ? "justify-end"
                  : "justify-start"
              } gap-2`}
            >
              <div
                className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${
                  message.senderId.toString() === deliveryBoyId
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
