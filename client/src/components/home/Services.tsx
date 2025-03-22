import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import { serviceCategories } from "@/lib/utils";
import { Service } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("Toate");
  const { isAuthenticated } = useAuth();
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  const filteredServices = services?.filter(
    (service) => activeCategory === "Toate" || service.category === activeCategory
  ).slice(0, 3) || [];
  
  return (
    <section id="servicii" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Serviciile Comunității</h2>
          <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
            Descoperă serviciile oferite de membrii comunității românești din Belgia sau 
            adaugă-ți propriile servicii.
          </p>
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
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
            Array(3).fill(0).map((_, index) => (
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
                Nu există servicii în această categorie momentan.
              </p>
            </div>
          )}
        </div>

        {/* Add Service Button */}
        <div className="text-center mt-12">
          <Link href={isAuthenticated ? "/servicii/adauga" : "/auth/login"}>
            <Button className="px-6 py-6 bg-primary text-white font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300">
              <Plus className="mr-2" /> Adaugă Serviciul Tău
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
