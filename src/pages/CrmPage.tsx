
import { useState } from 'react';
import { mockContacts, mockKanbanData } from '@/config/mock-data';
import KanbanBoard from '@/components/crm/KanbanBoard';
import { KanbanColumn, Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';
import { useToast } from '@/components/ui/use-toast';

const CrmPage = () => {
  const [contacts] = useState<Contact[]>(mockContacts);
  const [columns, setColumns] = useState<KanbanColumn[]>(mockKanbanData);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleMoveContact = (contactId: string, fromColumn: string, toColumn: string) => {
    // Create new columns array with updated contactIds
    const newColumns = columns.map(column => {
      if (column.id === fromColumn) {
        return {
          ...column,
          contactIds: column.contactIds.filter(id => id !== contactId)
        };
      }
      if (column.id === toColumn) {
        return {
          ...column,
          contactIds: [...column.contactIds, contactId]
        };
      }
      return column;
    });

    // Update state
    setColumns(newColumns);
    
    const contact = contacts.find(c => c.id === contactId);
    const fromColumnName = columns.find(c => c.id === fromColumn)?.title;
    const toColumnName = columns.find(c => c.id === toColumn)?.title;
    
    // Show toast notification
    if (contact) {
      toast({
        title: "Contato movido",
        description: `${contact.name} foi movido de ${fromColumnName} para ${toColumnName}.`
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">CRM Kanban</h1>
        
        <div className="flex items-center gap-2">
          <CustomInput
            placeholder="Buscar contatos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            startAdornment={<Search className="h-4 w-4 text-gray-400" />}
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <KanbanBoard 
          columns={columns} 
          contacts={filteredContacts} 
          onMoveContact={handleMoveContact}
        />
      </div>
    </div>
  );
};

export default CrmPage;
