import React, { useState, useEffect } from "react";
import "../pages/dashboard.css"; // Ensure you have this CSS file

const ScrollButton = ({ messagesContainerRef }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const toggleVisibility = () => {
            if (container.scrollTop < container.scrollHeight - container.clientHeight - 100) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        container.addEventListener("scroll", toggleVisibility);
        return () => container.removeEventListener("scroll", toggleVisibility);
    }, [messagesContainerRef]);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: "smooth" });
        }
    };

    return (
        <button 
            className="scroll-button" 
            style={{ display: visible ? "flex" : "none" }} 
            onClick={scrollToBottom}
        >
            ⬇
        </button>
    );
};

export default ScrollButton;
