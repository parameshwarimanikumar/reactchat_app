import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Message from "./Message";
import "../pages/dashboard.css";

const Messages = ({ selectedUser, currentUserId, socket }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // ✅ Fetch messages from API
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
  }, [selectedUser?.id, selectedUser?.isGroup]);

  // ✅ Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Handle incoming WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      console.log("Received message:", message);

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

  // ✅ Handle scrolling behavior
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
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
          }}
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default Messages;
