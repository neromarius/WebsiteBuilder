import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Facebook, Instagram, Mail, Phone, Globe, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Service } from "@shared/schema";
import { truncateText } from "@/lib/utils";

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
    const fullStars = Math.floor(rating / 20);
    const halfStar = rating % 20 >= 10;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>
        ))}
        {halfStar && <i className="fas fa-star-half-alt text-yellow-400"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img 
          src={mainImage || `https://source.unsplash.com/random/600x400/?${encodeURIComponent(category)}`} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        {isPremium && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary text-sm font-bold rounded-full">
            Premium
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold">{title}</h3>
          {rating > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">{(rating / 20).toFixed(1)}</span>
              {renderRatingStars()}
            </div>
          )}
        </div>
        
        <p className="text-neutral-dark mb-4">{truncateText(shortDescription, 120)}</p>
        
        {location && (
          <div className="flex items-center text-sm text-neutral-dark mb-4">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>{location}</span>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Link href={`/servicii/${id}`}>
            <a className="text-primary font-medium hover:underline">Vezi detalii</a>
          </Link>
          
          <div className="flex space-x-2">
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
                <a 
                  key={index}
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-[#CE1126]"
                  aria-label={platform}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
