
import React, { useEffect, useState } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Definindo interfaces para os dados
interface Contact {
  id: string;
  name: string;
  phone: string;
  profilePic?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  funnelStage?: string;
}

interface Message {
  id: string;
  content?: string;
  timestamp: string;
  contactId: string;
  direction: 'in' | 'out';
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

const ChatPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('last_message_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        // Mapeando os dados para o formato usado na interface
        const mappedContacts: Contact[] = data.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          profilePic: contact.profile_pic || undefined,
          unreadCount: contact.unread_count || 0,
          funnelStage: contact.funnel_stage || undefined,
          lastMessageTime: contact.last_message_at
        }));

        setContacts(mappedContacts);

        // Se há contatos, selecione o primeiro por padrão
        if (mappedContacts.length > 0) {
          setSelectedContact(mappedContacts[0]);
          fetchMessages(mappedContacts[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar contatos",
          description: "Não foi possível carregar seus contatos."
        });
        setIsLoading(false);
      }
    };

    fetchContacts();

    // Configurar o canal de tempo real para contatos
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactsChannel);
    };
  }, [user]);

  const fetchMessages = async (contactId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', contactId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Mapeando os dados para o formato usado na interface
      const mappedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        content: msg.content || undefined,
        timestamp: msg.created_at,
        contactId: msg.contact_id,
        direction: msg.direction as 'in' | 'out',
        type: (msg.media_type ? msg.media_type : 'text') as 'text' | 'image' | 'audio' | 'video' | 'document',
        mediaUrl: msg.media_url || undefined,
        status: msg.status as 'sent' | 'delivered' | 'read' | 'failed' | undefined
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens deste contato."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    fetchMessages(contact.id);

    // Atualizar contador de não lidas
    if (contact.unreadCount > 0 && user) {
      supabase
        .from('contacts')
        .update({ unread_count: 0 })
        .eq('id', contact.id)
        .eq('user_id', user.id)
        .then();
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedContact || !user) return;

    try {
      // Inserir na base de dados
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: message,
          contact_id: selectedContact.id,
          direction: 'out',
          user_id: user.id,
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar o último horário de mensagem do contato
      await supabase
        .from('contacts')
        .update({ 
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedContact.id)
        .eq('user_id', user.id);

      // Enviar a mensagem para o WhatsApp via Z-API
      // Esta parte seria implementada com o serviço Z-API
      
      // Adicionar a mensagem à lista local
      if (data) {
        const newMessage: Message = {
          id: data.id,
          content: data.content || undefined,
          timestamp: data.created_at,
          contactId: data.contact_id,
          direction: 'out',
          type: 'text',
          status: data.status as 'sent' | 'delivered' | 'read' | 'failed' | undefined
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem."
      });
    }
  };

  useEffect(() => {
    if (!selectedContact || !user) return;
    
    // Configurar o canal de tempo real para mensagens do contato selecionado
    const messagesChannel = supabase
      .channel(`messages-${selectedContact.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `contact_id=eq.${selectedContact.id}`
        },
        (payload) => {
          if (payload.new && payload.new.contact_id === selectedContact.id) {
            const newMsg = payload.new as any;
            
            const message: Message = {
              id: newMsg.id,
              content: newMsg.content || undefined,
              timestamp: newMsg.created_at,
              contactId: newMsg.contact_id,
              direction: newMsg.direction as 'in' | 'out',
              type: (newMsg.media_type ? newMsg.media_type : 'text') as 'text' | 'image' | 'audio' | 'video' | 'document',
              mediaUrl: newMsg.media_url || undefined,
              status: newMsg.status as 'sent' | 'delivered' | 'read' | 'failed' | undefined
            };
            
            setMessages(prev => [...prev, message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedContact, user]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar 
        contacts={contacts} 
        selectedContact={selectedContact} 
        onSelectContact={handleSelectContact} 
      />
      <ChatWindow 
        contact={selectedContact} 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatPage;
