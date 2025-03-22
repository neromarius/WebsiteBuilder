import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import { serviceCategories } from "@/lib/utils";
import { Service } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  const filteredServices = services?.filter(service => 
    (activeCategory === "Toate" || service.category === activeCategory) &&
    (searchQuery === "" || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  ) || [];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Servicii</h1>
          <p className="text-neutral-dark">
            Descoperă serviciile oferite de membrii comunității românești din Belgia
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Caută servicii..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Link href={isAuthenticated ? "/servicii/adauga" : "/auth/login"}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adaugă Serviciu
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Categories Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        {serviceCategories.map((category) => (
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
      
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array(6).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden h-96 animate-pulse"
            ></div>
          ))
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <p className="text-lg text-gray-500 mb-4">
              {searchQuery 
                ? "Nu există servicii care să corespundă criteriilor tale de căutare." 
                : "Nu există servicii în această categorie momentan."}
            </p>
            <Link href={isAuthenticated ? "/servicii/adauga" : "/auth/login"}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adaugă Primul Serviciu
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
