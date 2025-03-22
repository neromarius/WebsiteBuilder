import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { News } from "@shared/schema";
import { formatRelativeTime, truncateText } from "@/lib/utils";
import { Newspaper, Eye, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 80,
        damping: 10
      }
    },
    hover: { 
      y: -10,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
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
            <div className="flex items-start">
              <motion.div 
                className="w-16 h-16 flex-shrink-0 mr-3 overflow-hidden rounded-md"
                whileHover={{ scale: 1.05 }}
              >
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src={image || `https://source.unsplash.com/random/100x100/?news,${encodeURIComponent(category || '')}`} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div>
                <motion.p 
                  className="text-sm text-gray-600 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {formatRelativeTime(publishedAt)}
                </motion.p>
                <motion.h3 
                  className="font-medium text-sm line-clamp-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {title}
                </motion.h3>
              </div>
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
            src={image || `https://source.unsplash.com/random/800x450/?news,${encodeURIComponent(category || '')}`} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge className="absolute top-3 left-3 bg-primary shadow-md">
              {category}
            </Badge>
          </motion.div>
        </div>
        
        <CardContent className="p-6 flex flex-col flex-grow">
          <motion.div 
            className="flex items-center text-sm text-neutral-dark mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 15, color: "#005BBB" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Newspaper className="h-4 w-4 mr-2" />
            </motion.div>
            <motion.a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
              whileHover={{ color: "#005BBB" }}
            >
              {source}
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1, rotate: 15 }}
              >
                <ExternalLink className="h-3 w-3" />
              </motion.span>
            </motion.a>
            <span className="mx-2">•</span>
            <span>{formatRelativeTime(publishedAt)}</span>
          </motion.div>
          
          <motion.h3 
            className="text-xl font-bold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="text-neutral-dark mb-4 flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {truncateText(content, 150)}
          </motion.p>
          
          <motion.div 
            className="flex justify-between items-center mt-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href={`/stiri/${id}`}>
              <motion.div 
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" className="relative group">
                  <span className="mr-2">Citește articolul</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatDelay: 3,
                      duration: 1
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
            
            <div className="flex space-x-3 text-neutral-dark">
              <motion.span 
                title="Vizualizări"
                whileHover={{ scale: 1.1, color: "#005BBB" }}
              >
                <Eye className="h-4 w-4 inline mr-1" /> 
                <motion.span
                  animate={(viewCount || 0) > 100 ? { 
                    scale: [1, 1.1, 1],
                    color: ["#6b7280", "#005BBB", "#6b7280"]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  {viewCount || 0}
                </motion.span>
              </motion.span>
              <motion.span 
                title="Comentarii"
                whileHover={{ scale: 1.1, color: "#005BBB" }}
              >
                <MessageSquare className="h-4 w-4 inline mr-1" /> 
                <motion.span
                  animate={commentCount > 10 ? { 
                    scale: [1, 1.1, 1],
                    color: ["#6b7280", "#005BBB", "#6b7280"]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  {commentCount}
                </motion.span>
              </motion.span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
