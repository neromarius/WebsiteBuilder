import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (roomId: string, message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  
  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    // Establish WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      // Send authentication message
      ws.send(JSON.stringify({
        type: "auth",
        userId: user.id,
        username: user.username
      }));
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      
      // Try to reconnect after 2 seconds
      setTimeout(() => {
        if (user) {
          setSocket(null);
        }
      }, 2000);
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user, !socket]);
  
  // Function to send chat messages
  const sendMessage = (roomId: string, message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      socket.send(JSON.stringify({
        type: "chat",
        roomId,
        userId: user.id,
        message
      }));
    }
  };
  
  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
