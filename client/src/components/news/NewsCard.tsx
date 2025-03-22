import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { News } from "@shared/schema";
import { formatRelativeTime, truncateText } from "@/lib/utils";
import { Newspaper, Eye, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsCardProps {
  news: News;
  compact?: boolean;
}

export default function NewsCard({ news, compact = false }: NewsCardProps) {
  const {
    id,
    title,
    content,
    source,
    sourceUrl,
    category,
    image,
    publishedAt,
    viewCount,
    commentCount
  } = news;
  
  if (compact) {
    return (
      <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="w-16 h-16 flex-shrink-0 mr-3">
              <img 
                src={image || `https://source.unsplash.com/random/100x100/?news,${encodeURIComponent(category || '')}`} 
                alt={title} 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {formatRelativeTime(publishedAt)}
              </p>
              <h3 className="font-medium text-sm line-clamp-2">{title}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img 
          src={image || `https://source.unsplash.com/random/800x450/?news,${encodeURIComponent(category || '')}`} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        <Badge className="absolute top-3 left-3 bg-primary">
          {category}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center text-sm text-neutral-dark mb-2">
          <Newspaper className="h-4 w-4 mr-2" />
          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {source}
          </a>
          <span className="mx-2">•</span>
          <span>{formatRelativeTime(publishedAt)}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        
        <p className="text-neutral-dark mb-4">
          {truncateText(content, 150)}
        </p>
        
        <div className="flex justify-between items-center">
          <Link href={`/stiri/${id}`}>
            <Button variant="ghost">
              Citește articolul <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          <div className="flex space-x-3 text-neutral-dark">
            <span title="Vizualizări">
              <Eye className="h-4 w-4 inline mr-1" /> {viewCount}
            </span>
            <span title="Comentarii">
              <MessageSquare className="h-4 w-4 inline mr-1" /> {commentCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
