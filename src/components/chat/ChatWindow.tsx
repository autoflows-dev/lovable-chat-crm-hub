
import { useState, useRef, useEffect } from 'react';
import { Contact, Message } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, MoreVertical, ArrowLeft, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ChatWindowProps {
  selectedContact: Contact | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBackClick?: () => void;
  isMobile?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedContact,
  messages,
  onSendMessage,
  onBackClick,
  isMobile = false
}) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  if (!selectedContact) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4">
            <MessageIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Selecione um contato
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Escolha um contato para iniciar uma conversa
          </p>
        </div>
      </div>
    );
  }

  const showContactMetadata = () => {
    if (selectedContact.originMetadata) {
      const { source, campaign, sourceApp, timestamp } = selectedContact.originMetadata;
      toast({
        title: "Dados do Contato",
        description: (
          <div className="space-y-1 mt-2">
            <p><strong>Origem:</strong> {source}</p>
            {campaign && <p><strong>Campanha:</strong> {campaign}</p>}
            {sourceApp && <p><strong>Aplicativo:</strong> {sourceApp}</p>}
            <p><strong>Data de captura:</strong> {format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
          </div>
        )
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b bg-white dark:bg-gray-900">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={onBackClick}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center flex-1">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={selectedContact.profilePic} alt={selectedContact.name} />
            <AvatarFallback>{selectedContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-sm">{selectedContact.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {selectedContact.status === 'online' ? 'Online' : 'Offline'}
              </span>
              {selectedContact.originMetadata && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1 h-5 cursor-pointer hover:bg-gray-100"
                  onClick={showContactMetadata}
                >
                  {selectedContact.originMetadata.source}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 chat-bg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "mb-4 flex",
              message.direction === 'out' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={
                message.direction === 'out'
                  ? "message-bubble-sent"
                  : "message-bubble-received"
              }
            >
              {message.type === 'text' ? (
                <p>{message.content}</p>
              ) : message.type === 'image' ? (
                <div>
                  <img
                    src={message.mediaUrl}
                    alt="Image"
                    className="w-full h-auto rounded mb-1"
                  />
                  {message.content && <p>{message.content}</p>}
                </div>
              ) : message.type === 'document' ? (
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <DocumentIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Document</p>
                    <p className="text-xs text-gray-500">{message.content}</p>
                  </div>
                </div>
              ) : (
                <p>{message.content}</p>
              )}

              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[10px] text-gray-500">
                  {format(new Date(message.timestamp), 'HH:mm', { locale: ptBR })}
                </span>
                {message.direction === 'out' && message.status && (
                  <span>
                    {message.status === 'read' ? (
                      <div className="text-maya-primary">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        className="p-4 bg-white dark:bg-gray-900 border-t"
        onSubmit={handleSendMessage}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-grow"
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!messageInput.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

// Simple message icon for the empty state
const MessageIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
    />
  </svg>
);

// Document icon
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
    />
  </svg>
);

export default ChatWindow;
