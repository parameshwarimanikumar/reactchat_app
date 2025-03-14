import React, { useState, useEffect, useRef, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import Img from "../assets/Img.png";
import api from "../services/apiService";
import "../pages/dashboard.css";

const Chat = ({ selectedUser, currentUserId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!selectedUser?.id) return;
    try {
      const response = await api.get(`messages/${selectedUser.id}/`);
      console.log("✅ Fetched messages:", response.data);
      setMessages(
        response.data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );
    } catch (error) {
      console.error(
        "❌ Failed to fetch messages:",
        error.response?.data || error.message
      );
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [fetchMessages, selectedUser]);

  const handleMessage = useCallback((newMessage) => {
    if (!newMessage?.id) return;
    console.log("📩 New WebSocket Message:", newMessage);
    setMessages((prev) =>
      [...prev, newMessage].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
    );
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", handleMessage);
    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [socket, handleMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedUser?.id || (!message.trim() && !selectedFile)) return;

    try {
      const formData = new FormData();
      formData.append("recipient_id", selectedUser.id);
      if (message.trim()) formData.append("content", message);
      if (selectedFile) formData.append("file", selectedFile);

      const response = await api.post("send_message/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        console.log("✅ Sent Message:", response.data);
        setMessages((prev) =>
          [...prev, response.data].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          )
        );
        setMessage("");
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error(
        "❌ Failed to send message:",
        error.response?.data || error.message
      );
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`delete_message/${messageId}/`);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error(
        "❌ Failed to delete message:",
        error.response?.data || error.message
      );
    }
  };

  const handleScroll = () => {
    if (!messagesEndRef.current) return;
    setShowScrollButton(
      messagesEndRef.current.getBoundingClientRect().bottom < window.innerHeight
    );
  };

  if (!selectedUser) {
    return (
      <div className="chat-container">
        Please select a user to start chatting
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-details">
          {selectedUser.profile_picture && (
            <img
              src={selectedUser.profile_picture}
              alt="Profile"
              className="avatar"
            />
          )}
          <h3>{selectedUser.username}</h3>
        </div>
      </div>

      <div className="chat-messages" onScroll={handleScroll}>
        {messages.length === 0 ? (
          <p className="no-messages">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => {
            if (!msg) return null;
            const { id, sender_username, file_url, content, timestamp } = msg;
            const msgTimestamp = timestamp ? new Date(timestamp) : new Date();
            const isSentByCurrentUser =
              sender_username !== selectedUser.username;

            return (
              <React.Fragment key={id}>
                {index === 0 ||
                format(new Date(messages[index - 1]?.timestamp), "yyyy-MM-dd") !==
                  format(msgTimestamp, "yyyy-MM-dd") ? (
                  <div className="date-header" style={{ textAlign: "center" }}>
                    {isToday(msgTimestamp)
                      ? "Today"
                      : isYesterday(msgTimestamp)
                      ? "Yesterday"
                      : format(msgTimestamp, "dd MMM yyyy")}
                  </div>
                ) : null}

                <div className={`message ${isSentByCurrentUser ? "sent" : "received"}`}>
                  {file_url ? (
                    file_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                      <img src={file_url} alt="Uploaded" className="message-img" />
                    ) : (
                      <a
                        href={file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        {file_url.split("/").pop()}
                      </a>
                    )
                  ) : (
                    <p>{content}</p>
                  )}
                  <span className="timestamp">
                    {format(msgTimestamp, "hh:mm a")}
                  </span>

                  {isSentByCurrentUser && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMessage(id)}
                    >
                      ❌
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          className="scroll-to-bottom"
          onClick={() =>
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          ↓
        </button>
      )}

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
        <label htmlFor="file-upload">
          <img src={Img} alt="Upload" width="30" height="30" />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="preview-img"
            width={30}
            height={30}
          />
        )}
        {selectedFile && !preview && (
          <p className="file-name">{selectedFile.name}</p>
        )}
        {selectedFile && (
          <button onClick={removeSelectedFile}>❌</button>
        )}
      </div>
    </div>
  );
};

export default Chat;
