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
import { motion } from "framer-motion";

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
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: { 
      y: -10,
      scale: 1.02,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };
  
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
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="flex items-center">
                <motion.div 
                  className="flex flex-col items-center justify-center bg-primary text-white w-12 h-12 rounded-lg mr-3"
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-lg font-bold">{day}</span>
                  <span className="text-xs uppercase">{month}</span>
                </motion.div>
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>
              <Link href={`/evenimente/${event.id}`}>
                <motion.div whileHover={{ scale: 1.1, x: 3 }}>
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            src={event.image || `https://source.unsplash.com/random/800x450/?event,${encodeURIComponent(event.category || 'party')}`} 
            alt={event.title} 
            className="w-full h-48 object-cover"
          />
          
          <motion.div 
            className="absolute top-3 right-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.1 }}>
              <Badge className="bg-primary text-white shadow-md">
                {event.category}
              </Badge>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-3 left-3 flex flex-col items-center justify-center bg-white text-primary w-16 h-16 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              rotate: 3
            }}
          >
            <motion.span 
              className="text-xl font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              {day}
            </motion.span>
            <span className="text-xs uppercase">{month}</span>
          </motion.div>
        </div>
        
        <CardContent className="p-6 flex flex-col flex-grow">
          <motion.h3 
            className="text-xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {event.title}
          </motion.h3>
          
          <motion.div 
            className="space-y-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center text-sm text-gray-600">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 15, color: "#005BBB" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="mr-2 h-4 w-4 text-primary" />
              </motion.div>
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
                <motion.div 
                  whileHover={{ scale: 1.2, rotate: 15, color: "#005BBB" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                </motion.div>
                <span>{event.location}</span>
                {event.gpsLocation && (
                  <motion.a 
                    href={`https://maps.google.com/?q=${event.gpsLocation}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline"
                    whileHover={{ scale: 1.2 }}
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </motion.a>
                )}
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-600">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 15, color: "#005BBB" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="mr-2 h-4 w-4 text-primary" />
              </motion.div>
              <motion.span 
                animate={participantCount > 10 ? { 
                  scale: [1, 1.1, 1],
                  color: ["#6b7280", "#005BBB", "#6b7280"]
                } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {participantCount} participanți
              </motion.span>
            </div>
          </motion.div>
          
          <motion.p 
            className="text-gray-700 mb-4 flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {event.description.length > 120 
              ? `${event.description.substring(0, 120)}...` 
              : event.description}
          </motion.p>
          
          <motion.div 
            className="flex justify-between items-center pt-2 mt-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isParticipating ? "outline" : "default"}
                onClick={handleParticipation}
                disabled={participateMutation.isPending || cancelParticipationMutation.isPending}
                className={isParticipating ? "border-primary border-2" : ""}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {isParticipating ? "Nu mai particip" : "Particip"}
              </Button>
            </motion.div>
            
            <Link href={`/evenimente/${event.id}`}>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  x: 3
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost">
                  Detalii <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
