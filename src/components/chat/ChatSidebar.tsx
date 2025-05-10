
import { useState } from 'react';
import { Contact } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  contacts,
  selectedContactId,
  onSelectContact
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contact.phone.includes(searchQuery)
  );

  return (
    <div className="h-full flex flex-col border-r">
      {/* Header with search */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Buscar contato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhum contato encontrado
          </div>
        ) : (
          <ul>
            {filteredContacts.map(contact => (
              <li key={contact.id} onClick={() => onSelectContact(contact.id)}>
                <button
                  className={cn(
                    "w-full text-left px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                    selectedContactId === contact.id && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 relative">
                      <AvatarImage src={contact.profilePic} alt={contact.name} />
                      <AvatarFallback>
                        {contact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                      {contact.status === 'online' && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                        {contact.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(contact.lastMessage.timestamp), 'HH:mm', { locale: ptBR })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        {contact.lastMessage && (
                          <p className="text-xs text-gray-500 truncate mr-2">
                            {contact.lastMessage.content}
                          </p>
                        )}
                        {contact.unreadCount && contact.unreadCount > 0 ? (
                          <Badge variant="default" className="bg-maya-primary h-5 w-5 flex items-center justify-center rounded-full p-0">
                            {contact.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 overflow-hidden">
                          {contact.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
