
import { useDrag } from 'react-dnd';
import { Contact } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContactCardProps {
  contact: Contact;
  columnId: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, columnId }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'contact',
    item: { id: contact.id, columnId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      className={`kanban-card ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ cursor: 'grab' }}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.profilePic} alt={contact.name} />
          <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{contact.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{contact.phone}</p>
          
          {contact.originMetadata && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-gray-500">
                Via: {contact.originMetadata.source}
                {contact.originMetadata.campaign && ` (${contact.originMetadata.campaign})`}
              </span>
            </div>
          )}
          
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs py-0 px-1.5 h-5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {contact.lastMessage && (
            <div className="mt-2 text-xs text-gray-500">
              <p className="truncate">Última msg: {contact.lastMessage.content}</p>
              <p>
                {formatDistanceToNow(new Date(contact.lastMessage.timestamp), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
