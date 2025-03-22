import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatRoom from "@/components/chat/ChatRoom";

export default function Chat() {
  const [activeTab, setActiveTab] = useState("general");
  
  // Chat room definitions
  const chatRooms = [
    { id: "general", name: "General", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "transport", name: "Transport", icon: <User className="h-4 w-4 mr-2" /> },
    { id: "intrebari", name: "Întrebări", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
  ];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Chat Comunitar</h1>
          <p className="text-neutral-dark">
            Conectează-te cu alți membri ai comunității românești din Belgia
          </p>
        </div>
      </div>
      
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
          <TabsContent key={room.id} value={room.id}>
            <ChatRoom roomId={room.id} roomName={room.name} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
