
import { useState, useEffect } from 'react';
import { mockContacts, mockMessages } from '@/config/mock-data';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { Message } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { sendTextMessage } from '@/services/z-api';

const ChatPage = () => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'chat'>('list');
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedContactId) {
      setMessages(mockMessages[selectedContactId] || []);
      if (isMobile) {
        setViewMode('chat');
      }
    }
  }, [selectedContactId, isMobile]);

  const handleSendMessage = (content: string) => {
    if (!selectedContactId) return;

    // Create a new message
    const newMessage: Message = {
      id: `new-${Date.now()}`,
      contactId: selectedContactId,
      content,
      timestamp: new Date().toISOString(),
      direction: 'out',
      status: 'sent',
      type: 'text'
    };

    // Update UI immediately
    setMessages([...messages, newMessage]);

    // Simulate sending via Z-API
    sendTextMessage(
      mockContacts.find(c => c.id === selectedContactId)?.phone || '',
      content
    )
      .then(() => {
        // Update message status to delivered
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
      })
      .catch(error => {
        toast({
          variant: "destructive",
          title: "Erro ao enviar mensagem",
          description: "Não foi possível enviar a mensagem. Tente novamente."
        });
        console.error('Error sending message:', error);
      });
  };

  const selectedContact = selectedContactId 
    ? mockContacts.find(contact => contact.id === selectedContactId) 
    : null;

  // For mobile view
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {viewMode === 'list' ? (
          <ChatSidebar 
            contacts={mockContacts}
            selectedContactId={selectedContactId}
            onSelectContact={(contactId) => setSelectedContactId(contactId)}
          />
        ) : (
          <ChatWindow 
            selectedContact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBackClick={() => setViewMode('list')}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  // For desktop view
  return (
    <div className="h-full flex">
      <div className="w-96 h-full">
        <ChatSidebar 
          contacts={mockContacts}
          selectedContactId={selectedContactId}
          onSelectContact={(contactId) => setSelectedContactId(contactId)}
        />
      </div>
      <div className="flex-1 h-full">
        <ChatWindow 
          selectedContact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;
