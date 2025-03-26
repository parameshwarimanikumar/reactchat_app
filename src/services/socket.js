const socket = new WebSocket(`ws://localhost:8000/ws/chat/room_name/`);

socket.onopen = () => {
    console.log("Connected to WebSocket");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Message received:", data);
};

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

socket.onclose = () => {
    console.log("WebSocket disconnected");
};

export default socket;
