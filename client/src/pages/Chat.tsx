
import { useState, useEffect, useRef } from 'react';
import { Users, User, HelpCircle, Plus, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/context/WebSocketContext';

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  content: string;
  timestamp: string;
  roomId: string;
}

interface ChatUser {
  id: number;
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

export default function Chat() {
  const [activeTab, setActiveTab] = useState("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const notificationSound = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();
  const { socket } = useWebSocket();
  
  const chatRooms = [
    { id: "general", name: "General", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "transport", name: "Transport", icon: <User className="h-4 w-4 mr-2" /> },
    { id: "intrebari", name: "Întrebări", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
  ];

  useEffect(() => {
    if (socket) {
      socket.on('message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        if (soundEnabled && notificationSound.current) {
          notificationSound.current.play();
        }
      });

      socket.on('users', (activeUsers: ChatUser[]) => {
        setUsers(activeUsers);
      });

      return () => {
        socket.off('message');
        socket.off('users');
      };
    }
  }, [socket, soundEnabled]);

  return (
    <div className="container mx-auto px-4 py-12">
      <audio ref={notificationSound} src="/notification.mp3" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Chat Comunitar</h1>
          <p className="text-neutral-dark">
            Conectează-te cu alți membri ai comunității românești din Belgia
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="mt-4 md:mt-0"
        >
          {soundEnabled ? 'Dezactivează Sunetul' : 'Activează Sunetul'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                {chatRooms.map((room) => (
                  <TabsTrigger key={room.id} value={room.id} className="flex items-center">
                    {room.icon}
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Subiect Nou
              </Button>
            </div>
            
            {chatRooms.map((room) => (
              <TabsContent key={room.id} value={room.id} className="h-[60vh] bg-white rounded-lg shadow p-4">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto mb-4">
                    {messages
                      .filter(m => m.roomId === room.id)
                      .map((message) => (
                        <div 
                          key={message.id} 
                          className={`mb-4 ${message.userId === user?.id ? 'text-right' : ''}`}
                        >
                          <div className={`inline-block max-w-[70%] ${
                            message.userId === user?.id 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100'
                          } rounded-lg px-4 py-2`}>
                            <div className="font-semibold mb-1">{message.username}</div>
                            <div>{message.content}</div>
                            <div className="text-xs mt-1 opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <input
                      type="text"
                      placeholder="Scrie un mesaj..."
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && socket) {
                          const target = e.target as HTMLInputElement;
                          socket.emit('message', {
                            content: target.value,
                            roomId: activeTab
                          });
                          target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Utilizatori Online</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Circle 
                  className={`h-3 w-3 ${user.isOnline ? 'text-green-500' : 'text-gray-300'}`} 
                  fill="currentColor" 
                />
                <span>{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
