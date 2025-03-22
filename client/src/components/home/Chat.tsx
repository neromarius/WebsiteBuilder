import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Search, Bell, Settings, Send, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { formatTime, generateInitials } from "@/lib/utils";
import { ChatMessage, User } from "@shared/schema";

interface ChatPreviewProps {
  showFullChat: boolean;
}

export default function Chat({ showFullChat = false }: ChatPreviewProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { sendMessage, socket } = useWebSocket();
  
  // Get chat room messages
  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages', activeTab],
    enabled: showFullChat || isAuthenticated,
  });
  
  // Get online users
  const { data: onlineUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/chat/users/online'],
    enabled: showFullChat || isAuthenticated,
  });
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!socket || !isAuthenticated) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat' && data.roomId === activeTab) {
          // This will trigger a re-fetch of the messages
          // In a production app, we might want to update the cache directly
          queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', activeTab] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, activeTab, isAuthenticated]);
  
  const handleSendMessage = () => {
    if (!message.trim() || !isAuthenticated) return;
    
    sendMessage(activeTab, message);
    setMessage("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // If we're showing this on the home page, just show a preview
  if (!showFullChat) {
    return (
      <section id="chat" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Chat Comunitar</h2>
            <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
              Conectează-te cu alți membri ai comunității în timp real. Discută, pune întrebări 
              și găsește soluții împreună.
            </p>
          </div>

          {/* Chat Interface Preview */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Chat Header */}
            <div className="bg-primary text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">Chat General</h3>
                    <p className="text-xs">
                      {usersLoading 
                        ? "Încărcare..." 
                        : onlineUsers ? `${onlineUsers.length} utilizatori online` : "0 utilizatori online"}
                    </p>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" size="icon" className="text-white hover:text-yellow-300">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:text-yellow-300">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Tabs */}
            <div className="bg-gray-100 p-2 flex border-b border-gray-200">
              <Button variant="default" size="sm" className="mr-2 bg-white text-primary shadow-sm">
                General
              </Button>
              <Button variant="ghost" size="sm" className="mr-2 text-neutral-dark hover:bg-gray-200">
                Transport
              </Button>
              <Button variant="ghost" size="sm" className="mr-2 text-neutral-dark hover:bg-gray-200">
                Întrebări
              </Button>
              <Button variant="ghost" size="sm" className="text-neutral-dark hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-1" /> Subiect Nou
              </Button>
            </div>

            {/* Chat Preview (simplified) */}
            <div className="h-64 bg-white p-4 flex flex-col justify-center items-center">
              <MessageSquare className="h-16 w-16 text-primary opacity-20 mb-4" />
              <p className="text-lg font-medium text-neutral-dark mb-2">
                Intră în conversație cu comunitatea
              </p>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                Conectează-te cu alți membri ai comunității, pune întrebări și oferă sfaturi.
              </p>
              <Link href="/chat">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Accesează Chat-ul Complet
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Full chat implementation
  return (
    <Card className="max-w-4xl mx-auto">
      {/* Chat Header */}
      <CardHeader className="bg-primary text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-3" />
            <div>
              <h3 className="text-xl font-bold">Chat Comunitar</h3>
              <p className="text-xs">
                {usersLoading 
                  ? "Încărcare..." 
                  : onlineUsers ? `${onlineUsers.length} utilizatori online` : "0 utilizatori online"}
              </p>
            </div>
          </div>
          <div>
            <Button variant="ghost" size="icon" className="text-white hover:text-yellow-300">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-yellow-300">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="general" onValueChange={setActiveTab}>
          <div className="bg-gray-100 px-2 pt-2 border-b border-gray-200">
            <TabsList className="bg-transparent">
              <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                General
              </TabsTrigger>
              <TabsTrigger value="transport" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Transport
              </TabsTrigger>
              <TabsTrigger value="intrebari" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Întrebări
              </TabsTrigger>
              <Button variant="ghost" size="sm" className="text-neutral-dark hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-1" /> Subiect Nou
              </Button>
            </TabsList>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Users Online - Only on desktop */}
            <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 p-4 hidden md:block">
              <div className="mb-4">
                <h4 className="font-bold text-neutral-dark mb-2">Utilizatori Online</h4>
                <div className="relative">
                  <Input 
                    placeholder="Caută utilizatori..." 
                    className="pl-8 text-sm" 
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
                {usersLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  ))
                ) : !onlineUsers || onlineUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Niciun utilizator online</p>
                ) : (
                  onlineUsers.map((onlineUser) => (
                    <div 
                      key={onlineUser.id} 
                      className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={onlineUser.profileImage} alt={onlineUser.username} />
                          <AvatarFallback>{generateInitials(onlineUser.fullName || onlineUser.username)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{onlineUser.fullName || onlineUser.username}</p>
                        <p className="text-xs text-gray-500">
                          {onlineUser.isAdmin 
                            ? "Administrator" 
                            : onlineUser.isModerator 
                              ? "Moderator" 
                              : "Membru"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <TabsContent value="general" className="w-full md:w-3/4 flex flex-col h-96 m-0">
              {/* Messages Container */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messagesLoading ? (
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
                ) : !messages || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Nu există mesaje în această cameră încă.</p>
                    <p className="text-sm text-gray-400">Fii primul care începe o conversație!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`flex items-start p-3 rounded-lg ${
                      index % 2 === 0 ? 'bg-gray-50' : ''
                    }`}>
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarImage src={msg.user?.profileImage} />
                        <AvatarFallback>{generateInitials(msg.user?.fullName || msg.user?.username || '')}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <p className="font-bold text-primary mr-2">
                            {msg.user?.fullName || msg.user?.username}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              msg.user?.isAdmin 
                                ? 'border-red-500 text-red-500' 
                                : msg.user?.isModerator 
                                  ? 'border-blue-500 text-blue-500' 
                                  : 'border-gray-300 text-gray-500'
                            }`}
                          >
                            {msg.user?.isAdmin 
                              ? 'Admin' 
                              : msg.user?.isModerator 
                                ? 'Moderator' 
                                : 'Membru'}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-neutral-dark">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="flex">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Scrie un mesaj..."
                      className="flex-grow mr-2 focus:ring-primary"
                    />
                    <Button onClick={handleSendMessage} type="button">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Trebuie să fii autentificat pentru a putea scrie mesaje.
                    </p>
                    <Link href="/auth/login">
                      <Button variant="default" size="sm">
                        Autentificare
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="transport" className="w-full md:w-3/4 flex flex-col h-96 m-0">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-700">Camera Transport</h3>
                  <p className="text-gray-500">
                    Discuții despre transport, curse și călătorii între România și Belgia.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="intrebari" className="w-full md:w-3/4 flex flex-col h-96 m-0">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-gray-700">Camera Întrebări</h3>
                  <p className="text-gray-500">
                    Pune întrebări comunității și primește răspunsuri de la alți membri.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
