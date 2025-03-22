import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Newspaper } from "lucide-react";
import { News } from "@shared/schema";
import { newsCategories } from "@/lib/utils";
import NewsCard from "@/components/news/NewsCard";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: news, isLoading, refetch } = useQuery<News[]>({
    queryKey: ['/api/news'],
  });
  
  const filteredNews = news?.filter(item => 
    (activeCategory === "Toate" || item.category === activeCategory) &&
    (searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Știri</h1>
          <p className="text-neutral-dark">
            Cele mai recente știri relevante pentru comunitatea românească din Belgia
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Caută știri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Actualizează
          </Button>
        </div>
      </div>
      
      {/* Categories Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        {newsCategories.map((category) => (
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
      
      {/* News Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden h-96 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((newsItem) => (
            <NewsCard key={newsItem.id} news={newsItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Newspaper className="h-16 w-16 mx-auto text-primary opacity-20 mb-4" />
          <p className="text-lg text-gray-500 mb-4">
            {searchQuery 
              ? "Nu există știri care să corespundă criteriilor tale de căutare." 
              : "Nu există știri în această categorie momentan."}
          </p>
          <p className="text-gray-500">
            Știrile sunt actualizate automat în fiecare dimineață la ora 5:00.
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Încearcă o actualizare manuală
          </Button>
        </div>
      )}
    </div>
  );
}
