import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTime, generateInitials } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  alternateBackground: boolean;
}

export function ChatMessage({ message, isCurrentUser, alternateBackground }: ChatMessageProps) {
  const { user, createdAt, message: messageText } = message;
  
  // Format the message content with links and emojis
  const formatMessageContent = (content: string) => {
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const contentWithLinks = content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
    });
    
    return <p className="text-neutral-dark" dangerouslySetInnerHTML={{ __html: contentWithLinks }} />;
  };
  
  return (
    <div className={`flex items-start p-3 rounded-lg ${
      alternateBackground ? 'bg-gray-50' : ''
    } ${isCurrentUser ? 'bg-blue-50' : ''}`}>
      <Avatar className="w-10 h-10 mr-3">
        <AvatarImage src={user?.profileImage} alt={user?.username} />
        <AvatarFallback>{generateInitials(user?.fullName || user?.username || '')}</AvatarFallback>
      </Avatar>
      
      <div>
        <div className="flex items-center mb-1">
          <p className={`font-bold mr-2 ${isCurrentUser ? 'text-blue-600' : 'text-primary'}`}>
            {user?.fullName || user?.username}
          </p>
          
          {(user?.isAdmin || user?.isModerator) && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                user?.isAdmin 
                  ? 'border-red-500 text-red-500' 
                  : 'border-blue-500 text-blue-500'
              }`}
            >
              {user?.isAdmin ? 'Admin' : 'Moderator'}
            </Badge>
          )}
          
          <span className="text-xs text-gray-500 ml-2">
            {formatTime(createdAt)}
          </span>
        </div>
        
        {formatMessageContent(messageText)}
      </div>
    </div>
  );
}
