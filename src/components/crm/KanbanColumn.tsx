
import { useDrop } from 'react-dnd';
import { Contact, KanbanColumn as KanbanColumnType } from '@/types';
import ContactCard from './ContactCard';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  column: KanbanColumnType;
  contacts: Contact[];
  onMoveContact: (contactId: string, fromColumn: string, toColumn: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, contacts, onMoveContact }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'contact',
    drop: (item: { id: string, columnId: string }) => {
      if (item.columnId !== column.id) {
        onMoveContact(item.id, item.columnId, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  return (
    <div 
      ref={drop}
      className={`kanban-column ${isOver ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{column.title}</h3>
          <Badge variant="outline" className="h-5">
            {contacts.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 mb-4">
        {contacts.map((contact) => (
          <ContactCard 
            key={contact.id} 
            contact={contact} 
            columnId={column.id} 
          />
        ))}
      </div>
      
      <Button variant="ghost" className="w-full text-gray-500 dark:text-gray-400 justify-start">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Contato
      </Button>
    </div>
  );
};

export default KanbanColumn;
