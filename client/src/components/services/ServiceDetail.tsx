import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  Award,
  Star,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Service, User } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateInitials, formatDate } from "@/lib/utils";

interface ServiceDetailProps {
  serviceId: number;
}

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const [activeTab, setActiveTab] = useState("description");
  const { isAuthenticated } = useAuth();

  // Get service data
  const { data: service, isLoading } = useQuery<Service & { user: User }>({
    queryKey: [`/api/services/${serviceId}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Serviciu negăsit</h2>
        <p className="mb-8">Serviciul pe care îl cauți nu există sau a fost șters.</p>
        <Link href="/servicii">
          <Button variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi la Servicii
          </Button>
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    shortDescription,
    category,
    location,
    contactEmail,
    contactPhone,
    mainImage,
    images,
    tags,
    rating,
    reviewCount,
    isPremium,
    socialLinks,
    user,
  } = service;

  const allImages = [mainImage, ...(images || [])].filter(Boolean) as string[];

  // Render rating stars
  const renderRatingStars = () => {
    const fullStars = Math.floor(rating / 20);
    const halfStar = rating % 20 >= 10;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
        {halfStar && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/servicii">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi la Servicii
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            <p className="text-gray-600 mt-1">{shortDescription}</p>
          </div>
          
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary text-sm font-bold px-4 py-1 mt-2 md:mt-0">
              Premium
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {category}
          </Badge>
          {tags && tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {allImages.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {allImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={image || `https://source.unsplash.com/random/800x450/?${encodeURIComponent(category)}`}
                        alt={`${title} - Imagine ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg mb-6">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nu există imagini disponibile</p>
              </div>
            </AspectRatio>
          )}

          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Descriere</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="reviews">Recenzii</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Despre acest serviciu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informații de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Locație</p>
                        <p>{location}</p>
                      </div>
                    </div>
                  )}
                  
                  {contactPhone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Telefon</p>
                        <a href={`tel:${contactPhone}`} className="text-primary hover:underline">
                          {contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contactEmail && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                          {contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {socialLinks && Object.keys(socialLinks).length > 0 && (
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Rețele sociale</p>
                        <div className="flex space-x-3 mt-2">
                          {Object.entries(socialLinks).map(([platform, url], index) => {
                            let Icon;
                            switch (platform.toLowerCase()) {
                              case 'facebook': Icon = Facebook; break;
                              case 'instagram': Icon = Instagram; break;
                              case 'linkedin': Icon = Linkedin; break;
                              case 'twitter': Icon = Twitter; break;
                              default: Icon = Globe;
                            }
                            
                            return (
                              <a 
                                key={index}
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-accent"
                              >
                                <Icon className="h-5 w-5" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recenzii</CardTitle>
                  <CardDescription>
                    {reviewCount 
                      ? `${reviewCount} recenzii, rating mediu ${(rating / 20).toFixed(1)} din 5` 
                      : "Nu există recenzii pentru acest serviciu încă."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reviewCount ? (
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        {renderRatingStars()}
                        <span className="ml-2 text-lg font-bold">{(rating / 20).toFixed(1)}</span>
                      </div>
                      
                      {isPremium ? (
                        <div className="space-y-4">
                          {/* Sample reviews would go here, but we're not implementing mock data */}
                          <p className="text-gray-500 italic">
                            Recenziile reale vor fi afișate aici când vor fi disponibile.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-md">
                          <p>
                            Serviciile premium pot afișa recenziile primite de la utilizatori.
                          </p>
                          <Button variant="outline" className="mt-2">
                            Activează Premium
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">
                        Nu există recenzii pentru acest serviciu încă. Fii primul care lasă o recenzie!
                      </p>
                      <Button
                        disabled={!isAuthenticated}
                        onClick={() => {/* To be implemented */}}
                      >
                        Adaugă o recenzie
                      </Button>
                      
                      {!isAuthenticated && (
                        <p className="text-sm text-gray-500 mt-2">
                          Trebuie să fii autentificat pentru a lăsa o recenzie.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Furnizorul serviciului</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={user?.profileImage} alt={user?.username} />
                  <AvatarFallback>{generateInitials(user?.fullName || user?.username || '')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{user?.fullName || user?.username}</p>
                  <p className="text-sm text-gray-500">
                    Membru din {formatDate(user?.createdAt || new Date())}
                  </p>
                </div>
              </div>
              
              {user?.isPremium && (
                <div className="flex items-center mb-4 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                  <Award className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Membru Premium</span>
                </div>
              )}
              
              {isAuthenticated ? (
                <Button className="w-full mb-2" variant="default">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contactează
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button className="w-full mb-2" variant="default">
                    Autentifică-te pentru contact
                  </Button>
                </Link>
              )}
              
              {isPremium && (
                <div className="mt-6">
                  <p className="font-medium mb-2">Program de lucru</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="col-span-1 font-medium">Luni-Vineri:</div>
                    <div className="col-span-2">9:00 - 18:00</div>
                    <div className="col-span-1 font-medium">Sâmbătă:</div>
                    <div className="col-span-2">10:00 - 15:00</div>
                    <div className="col-span-1 font-medium">Duminică:</div>
                    <div className="col-span-2">Închis</div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <p className="font-medium mb-2">Certificări și Acreditări</p>
                {isPremium ? (
                  <div className="space-y-2">
                    <Badge variant="outline" className="mr-2">Autorizat</Badge>
                    <Badge variant="outline" className="mr-2">Verificat</Badge>
                    <Badge variant="outline">Recomandat</Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Certificările sunt disponibile pentru serviciile Premium.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Rezervări</CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div>
                  <p className="mb-4">Alege o dată disponibilă pentru programare:</p>
                  <div className="mb-4">
                    <Calendar className="h-5 w-5 inline-block mr-2 text-primary" />
                    <span>Următoarea disponibilitate: Mâine</span>
                  </div>
                  <Button className="w-full">
                    <Clock className="mr-2 h-4 w-4" /> Programează-te
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Opțiunile de programare sunt disponibile pentru serviciile Premium.
                  </p>
                  <Button variant="outline" className="text-sm">
                    Activează Premium
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
