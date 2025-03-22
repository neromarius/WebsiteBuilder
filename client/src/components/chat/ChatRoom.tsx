import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, AlertTriangle } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as ChatMessageType, User } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export default function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { sendMessage, isConnected } = useWebSocket();
  
  // Get messages for this room
  const { data: messages, isLoading, error } = useQuery<ChatMessageType[]>({
    queryKey: ['/api/chat/messages', roomId],
    enabled: isAuthenticated,
  });
  
  // Get online users
  const { data: onlineUsers } = useQuery<User[]>({
    queryKey: ['/api/chat/users/online'],
    enabled: isAuthenticated,
  });
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle message sending
  const handleSendMessage = () => {
    if (!message.trim() || !isAuthenticated || !isConnected) return;
    
    sendMessage(roomId, message);
    setMessage("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // If no user is authenticated, prompt to login
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md p-6">
          <h3 className="text-xl font-bold mb-4">Autentifică-te pentru a accesa chat-ul</h3>
          <p className="text-gray-600 mb-6">
            Trebuie să ai un cont pentru a putea participa la conversațiile din comunitate.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/auth/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Autentificare
            </a>
            <a href="/auth/register" className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors">
              Înregistrare
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle WebSocket connection status
  if (!isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Nu se poate conecta la server</AlertTitle>
        <AlertDescription>
          Conexiunea la chat a fost întreruptă. Se încearcă reconectarea...
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="flex flex-col h-[600px] rounded-lg border">
      {/* Chat Header */}
      <div className="p-4 border-b bg-primary text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-xl font-bold">{roomName}</h3>
            <Badge variant="secondary" className="ml-2 bg-white/20">
              {onlineUsers?.length || 0} online
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-start p-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <div className="h-4 bg-gray-300 rounded w-20 mr-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-1"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>
              Nu s-au putut încărca mesajele. Încearcă să reîmprospătezi pagina.
            </AlertDescription>
          </Alert>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">Nu există mesaje în această cameră încă.</p>
            <p className="text-sm text-gray-400">Fii primul care începe o conversație!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isCurrentUser={msg.userId === user?.id}
              alternateBackground={index % 2 === 0}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrie un mesaj..."
            className="flex-grow mr-2 focus:ring-primary"
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage} 
            type="button"
            disabled={!isConnected || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
