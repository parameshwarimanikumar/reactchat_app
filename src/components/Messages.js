import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Message from "./Message";
import "../pages/dashboard.css";

const Messages = ({ selectedUser, currentUserId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // ✅ Fetch previous messages based on user type (private vs. group chat)
  useEffect(() => {
    if (!selectedUser?.id) return;

    const fetchMessages = async () => {
      try {
        const url = selectedUser.isGroup
          ? `http://localhost:8000/api/group-messages/${selectedUser.id}/`
          : `http://localhost:8000/api/messages/${selectedUser.id}/`;

        const res = await axios.get(url);
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser?.id, selectedUser?.isGroup]); // ✅ FIXED: Added isGroup to dependencies

  // ✅ Scroll to bottom when new messages arrive (if autoScroll is enabled)
  useEffect(() => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // ✅ Handle incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      console.log("Received message:", message);

      // Check if the message is for the selected user/group
      if (
        (selectedUser?.isGroup && message.group_id === selectedUser.id) ||
        (!selectedUser?.isGroup && message.sender_id === selectedUser.id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [socket, selectedUser]);

  // ✅ Show the scroll-to-bottom button when the user scrolls up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setAutoScroll(isAtBottom);
      setShowScrollButton(!isAtBottom);
    }
  };

  return (
    <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
      <div className="messages">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message, index) => (
            <Message
              key={message.id || `msg-${index}`}
              message={message}
              currentUserId={currentUserId}
              isGroupChat={selectedUser?.isGroup}
              previousMessage={messages[index - 1]}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          className="scroll-to-bottom"
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setAutoScroll(true);
          }}
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default Messages;
