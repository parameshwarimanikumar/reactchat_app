import { io } from 'socket.io-client';

const socket = io('ws://localhost:8000/ws/chat/', {
    transports: ['websocket'],  // Ensures WebSocket-only transport
    withCredentials: true,      // Allows authentication cookies
});

export default socket;