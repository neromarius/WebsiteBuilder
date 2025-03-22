import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Event } from "@shared/schema";
import { eventCategories } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("Toate");
  const { isAuthenticated } = useAuth();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  const filteredEvents = events?.filter(
    (event) => activeCategory === "Toate" || event.category === activeCategory
  ).slice(0, 3) || [];
  
  return (
    <section id="evenimente" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Evenimente</h2>
          <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
            Descoperă evenimentele organizate de și pentru comunitatea românească din Belgia.
          </p>
        </div>

        {/* Events Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
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

        {/* Events Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary transform md:translate-x-px"></div>

          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="relative flex flex-col md:flex-row items-center md:justify-between mb-12">
                <div className="absolute left-0 md:left-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold transform -translate-x-1/2 z-10">
                  {index + 1}
                </div>
                <div className={`ml-12 md:ml-0 ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'} w-full md:w-5/12 p-6 bg-white rounded-lg shadow-md animate-pulse h-72`}></div>
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-16 h-16 mx-auto text-primary opacity-20 mb-4" />
              <p className="text-lg font-medium text-neutral-dark mb-2">
                Nu există evenimente în această categorie
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Fii primul care organizează un eveniment pentru comunitate!
              </p>
              <Link href={isAuthenticated ? "/evenimente/adauga" : "/auth/login"}>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Adaugă un Eveniment
                </Button>
              </Link>
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const eventDate = new Date(event.date);
              const day = eventDate.getDate();
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={event.id} 
                  className="relative flex flex-col md:flex-row items-center md:justify-between mb-12"
                >
                  {/* Date Badge */}
                  <div className="absolute left-0 md:left-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold transform -translate-x-1/2 z-10">
                    {day}
                  </div>
                  
                  {/* Empty space for right side on desktop if it's a left item */}
                  {isLeft && <div className="hidden md:block w-5/12"></div>}
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 ${isLeft ? 'md:ml-12' : 'md:mr-12'} w-full md:w-5/12 p-6 bg-white rounded-lg shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
                    <div className="relative">
                      <img 
                        src={event.image || `https://source.unsplash.com/random/600x400/?event,${encodeURIComponent(event.category || 'party')}`} 
                        alt={event.title} 
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <Badge className="absolute top-3 right-3 bg-secondary text-primary">
                        Nou
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-neutral-dark mb-2">
                      <time dateTime={event.date}>{formatDate(event.date)}</time>
                      {event.endDate && (
                        <>
                          {' • '}
                          <time dateTime={event.date}>{formatDate(event.endDate)}</time>
                        </>
                      )}
                    </p>
                    
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-neutral-dark mb-4">{event.description}</p>
                    
                    {event.location && (
                      <div className="flex items-center text-sm text-neutral-dark mb-4">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Link href={`/evenimente/${event.id}`}>
                        <Button>
                          <Calendar className="h-4 w-4 mr-1" /> Particip
                        </Button>
                      </Link>
                      <span className="text-neutral-dark">
                        <Users className="h-4 w-4 inline mr-1" /> {event.participantCount || 0} participanți
                      </span>
                    </div>
                  </div>
                  
                  {/* Empty space for left side on desktop if it's a right item */}
                  {!isLeft && <div className="hidden md:block w-5/12"></div>}
                </div>
              );
            })
          )}
        </div>

        {/* Add Event Button */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <Link href={isAuthenticated ? "/evenimente/adauga" : "/auth/login"}>
              <Button className="px-6 py-6 bg-primary text-white font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300">
                <Plus className="mr-2" /> Adaugă un Eveniment
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
