import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar } from "lucide-react";
import { Event } from "@shared/schema";
import { eventCategories } from "@/lib/utils";
import EventCard from "@/components/events/EventCard";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const { isAuthenticated } = useAuth();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  const filteredEvents = events?.filter(event => 
    (activeCategory === "Toate" || event.category === activeCategory) &&
    (searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  ) || [];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Evenimente</h1>
          <p className="text-neutral-dark">
            Descoperă și participă la evenimente organizate de comunitatea românească din Belgia
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Caută evenimente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Link href={isAuthenticated ? "/evenimente/adauga" : "/auth/login"}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adaugă Eveniment
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        {/* Categories Navigation */}
        <div className="flex flex-wrap gap-3">
          {eventCategories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={activeCategory === category 
                ? "bg-primary text-white" 
                : "bg-white text-primary border border-primary hover:bg-primary hover:text-white"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* View Toggle */}
        <div className="flex">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode("list")}
          >
            Listă
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" /> Calendar
          </Button>
        </div>
      </div>
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "calendar")}>
        <TabsContent value="list" className="m-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md overflow-hidden h-96 animate-pulse"
                ></div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="h-16 w-16 mx-auto text-primary opacity-20 mb-4" />
              <p className="text-lg text-gray-500 mb-4">
                {searchQuery 
                  ? "Nu există evenimente care să corespundă criteriilor tale de căutare." 
                  : "Nu există evenimente în această categorie momentan."}
              </p>
              <Link href={isAuthenticated ? "/evenimente/adauga" : "/auth/login"}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Adaugă Primul Eveniment
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="m-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center py-10 text-gray-500">
              Vizualizarea tip calendar va fi disponibilă în curând.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
