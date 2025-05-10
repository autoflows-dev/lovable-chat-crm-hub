
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Contact, KanbanColumn as KanbanColumnType } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import './kanban.css';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  contacts: Contact[];
  onMoveContact: (contactId: string, fromColumn: string, toColumn: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, contacts, onMoveContact }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 overflow-x-auto pb-6 px-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            contacts={contacts.filter(c => column.contactIds.includes(c.id))}
            onMoveContact={onMoveContact}
          />
        ))}
        
        <div className="kanban-column flex flex-col items-center justify-center min-h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Button variant="ghost" className="text-gray-500 dark:text-gray-400">
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Coluna
          </Button>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
