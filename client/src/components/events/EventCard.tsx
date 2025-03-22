import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, ExternalLink, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const [isParticipating, setIsParticipating] = useState(event.isParticipating || false);
  const [participantCount, setParticipantCount] = useState(event.participantCount || 0);
  
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('ro-RO', { month: 'short' });
  
  // Mutation for participating in an event
  const participateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/events/${event.id}/participate`, {});
      return res.json();
    },
    onSuccess: () => {
      setIsParticipating(true);
      setParticipantCount(prev => prev + 1);
      
      toast({
        title: "Participare confirmată",
        description: `Te-ai înscris cu succes la evenimentul "${event.title}"`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut confirma participarea. Încearcă din nou.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for canceling participation
  const cancelParticipationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/events/${event.id}/participate`, {});
      return res.json();
    },
    onSuccess: () => {
      setIsParticipating(false);
      setParticipantCount(prev => prev - 1);
      
      toast({
        title: "Participare anulată",
        description: `Nu mai participi la evenimentul "${event.title}"`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut anula participarea. Încearcă din nou.",
        variant: "destructive",
      });
    }
  });
  
  const handleParticipation = () => {
    if (!isAuthenticated) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a participa la evenimente.",
        variant: "destructive",
      });
      return;
    }
    
    if (isParticipating) {
      cancelParticipationMutation.mutate();
    } else {
      participateMutation.mutate();
    }
  };
  
  if (compact) {
    return (
      <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="flex flex-col items-center justify-center bg-primary text-white w-12 h-12 rounded-lg mr-3">
                <span className="text-lg font-bold">{day}</span>
                <span className="text-xs uppercase">{month}</span>
              </div>
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </div>
            <Link href={`/evenimente/${event.id}`}>
              <Button size="sm" variant="ghost">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img 
          src={event.image || `https://source.unsplash.com/random/800x450/?event,${encodeURIComponent(event.category || 'party')}`} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
        
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-white">
            {event.category}
          </Badge>
        </div>
        
        <div className="absolute bottom-3 left-3 flex flex-col items-center justify-center bg-white text-primary w-16 h-16 rounded-lg shadow-md">
          <span className="text-xl font-bold">{day}</span>
          <span className="text-xs uppercase">{month}</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>{formatDate(event.date)}</span>
            {event.endDate && (
              <span>
                {' - '}
                {formatDate(event.endDate)}
              </span>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span>{event.location}</span>
              {event.gpsLocation && (
                <a 
                  href={`https://maps.google.com/?q=${event.gpsLocation}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3 inline" />
                </a>
              )}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="mr-2 h-4 w-4 text-primary" />
            <span>{participantCount} participanți</span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">
          {event.description.length > 120 
            ? `${event.description.substring(0, 120)}...` 
            : event.description}
        </p>
        
        <div className="flex justify-between items-center pt-2">
          <Button
            variant={isParticipating ? "outline" : "default"}
            onClick={handleParticipation}
            disabled={participateMutation.isPending || cancelParticipationMutation.isPending}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isParticipating ? "Nu mai particip" : "Particip"}
          </Button>
          
          <Link href={`/evenimente/${event.id}`}>
            <Button variant="ghost">
              Detalii <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
