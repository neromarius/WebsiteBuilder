import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Facebook, Instagram, Mail, Phone, Globe, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Service } from "@shared/schema";
import { truncateText } from "@/lib/utils";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const {
    id,
    title,
    shortDescription,
    mainImage,
    category,
    location,
    tags,
    rating,
    reviewCount,
    isPremium,
    socialLinks
  } = service;

  // Get rating stars
  const renderRatingStars = () => {
    if (rating === null || rating === undefined) return null;
    
    const fullStars = Math.floor(rating / 20);
    const halfStar = rating % 20 >= 10;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {halfStar && (
          <Star key="half" className="h-4 w-4 text-yellow-400 fill-yellow-400 half-star" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />
        ))}
      </div>
    );
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: { 
      y: -8,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Badge animation variants
  const badgeVariants = {
    hover: { scale: 1.1 }
  };

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
            transition={{ duration: 0.3 }}
            src={mainImage || `https://source.unsplash.com/random/600x400/?${encodeURIComponent(category)}`} 
            alt={title} 
            className="w-full h-48 object-cover transition-all duration-500"
          />
          {isPremium && (
            <motion.div 
              className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary text-sm font-bold rounded-full"
              animate={{ 
                boxShadow: ['0 0 0 rgba(255,215,0,0)', '0 0 15px rgba(255,215,0,0.7)', '0 0 0 rgba(255,215,0,0)'] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            >
              Premium
            </motion.div>
          )}
        </div>
        
        <CardContent className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold">{title}</h3>
            {rating > 0 && (
              <div className="flex items-center">
                <motion.span 
                  className="text-yellow-500 mr-1"
                  whileHover={{ scale: 1.2 }}
                >
                  {(rating / 20).toFixed(1)}
                </motion.span>
                {renderRatingStars()}
              </div>
            )}
          </div>
          
          <p className="text-neutral-dark mb-4 flex-grow">{truncateText(shortDescription, 120)}</p>
          
          {location && (
            <div className="flex items-center text-sm text-neutral-dark mb-4">
              <motion.div 
                whileHover={{ scale: 1.2, color: "#005BBB" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MapPin className="mr-2 h-4 w-4 text-primary" />
              </motion.div>
              <span>{location}</span>
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <motion.div key={index} variants={badgeVariants} whileHover="hover">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 hover:shadow-md">
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-auto pt-2">
            <Link href={`/servicii/${id}`}>
              <motion.a 
                className="text-primary font-medium hover:underline relative inline-block"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 8px rgba(0,91,187,0.3)",
                }}
              >
                Vezi detalii
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            </Link>
            
            <div className="flex space-x-3">
              {socialLinks && Object.entries(socialLinks).map(([platform, url], index) => {
                let Icon;
                switch (platform.toLowerCase()) {
                  case 'facebook': Icon = Facebook; break;
                  case 'instagram': Icon = Instagram; break;
                  case 'email': Icon = Mail; break;
                  case 'phone': Icon = Phone; break;
                  case 'website': Icon = Globe; break;
                  default: Icon = ExternalLink;
                }
                
                return (
                  <motion.a 
                    key={index}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary"
                    aria-label={platform}
                    whileHover={{ 
                      scale: 1.3, 
                      rotate: 5,
                      color: "#CE1126" 
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
