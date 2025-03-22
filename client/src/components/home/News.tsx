import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Newspaper, RefreshCw } from "lucide-react";
import { News } from "@shared/schema";
import { formatRelativeTime, newsCategories } from "@/lib/utils";

export default function NewsSection() {
  const [activeCategory, setActiveCategory] = useState("Toate");
  
  const { data: news, isLoading, refetch } = useQuery<News[]>({
    queryKey: ['/api/news'],
  });
  
  const filteredNews = news?.filter(
    (item) => activeCategory === "Toate" || item.category === activeCategory
  ).slice(0, 3) || [];
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <section id="stiri" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Știri Recente</h2>
          <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
            Cele mai recente știri relevante pentru comunitatea românească din Belgia.
          </p>
        </div>

        {/* News Source Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden h-96 animate-pulse"
              ></div>
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map((newsItem) => (
              <div key={newsItem.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img 
                    src={newsItem.image || `https://source.unsplash.com/random/600x400/?news,${encodeURIComponent(newsItem.category || '')}`} 
                    alt={newsItem.title} 
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary">
                    {newsItem.category}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-neutral-dark mb-2">
                    <Newspaper className="h-4 w-4 mr-2" />
                    <span>{newsItem.source}</span>
                    <span className="mx-2">•</span>
                    <span>{formatRelativeTime(newsItem.publishedAt)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{newsItem.title}</h3>
                  
                  <p className="text-neutral-dark mb-4">
                    {newsItem.content.length > 120 
                      ? `${newsItem.content.substring(0, 120)}...` 
                      : newsItem.content}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Link href={`/stiri/${newsItem.id}`}>
                      <a className="text-primary font-medium hover:underline">Citește articolul</a>
                    </Link>
                    
                    <div className="flex space-x-3 text-neutral-dark">
                      <span>
                        <Eye className="h-4 w-4 inline mr-1" /> {newsItem.viewCount}
                      </span>
                      <span>
                        <MessageSquare className="h-4 w-4 inline mr-1" /> {newsItem.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <Newspaper className="w-16 h-16 mx-auto text-primary opacity-20 mb-4" />
              <p className="text-lg font-medium text-neutral-dark mb-2">
                Nu există știri în această categorie momentan
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Știrile sunt actualizate automat în fiecare dimineață.
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="px-6 py-3 bg-gray-200 text-neutral-dark font-bold hover:bg-gray-300"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Încarcă mai multe știri
          </Button>
        </div>
      </div>
    </section>
  );
}
