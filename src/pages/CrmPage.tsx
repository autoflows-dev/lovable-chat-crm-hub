
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import KanbanBoard from '@/components/crm/KanbanBoard';
import { KanbanColumn, Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';
import { CustomInput } from '@/components/ui/custom-input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const defaultColumns: KanbanColumn[] = [
  { id: 'new', title: 'Novos Leads', contactIds: [] },
  { id: 'contacted', title: 'Contatados', contactIds: [] },
  { id: 'meeting', title: 'Reunião Agendada', contactIds: [] },
  { id: 'proposal', title: 'Proposta Enviada', contactIds: [] },
  { id: 'closed', title: 'Negócio Fechado', contactIds: [] }
];

const CrmPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
        
      if (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
      
      return data as Contact[];
    },
    enabled: !!session?.user,
  });

  // Create columns with contacts assigned to them
  const columns = defaultColumns.map(column => {
    return {
      ...column,
      contactIds: contacts
        .filter(contact => contact.funnel_stage === column.id)
        .map(contact => contact.id)
    };
  });

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleMoveContact = async (contactId: string, fromColumn: string, toColumn: string) => {
    if (!session?.user) return;

    try {
      // Update contact in database
      const { error } = await supabase
        .from('contacts')
        .update({ funnel_stage: toColumn })
        .eq('id', contactId);

      if (error) throw error;
      
      // Update local state through query invalidation
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      
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
    } catch (error) {
      console.error('Error moving contact:', error);
      toast({
        variant: "destructive",
        title: "Erro ao mover contato",
        description: "Ocorreu um erro ao atualizar o estágio do contato."
      });
    }
  };

  // Set up realtime subscription for contact changes
  useEffect(() => {
    if (!session?.user) return;
    
    const channel = supabase
      .channel('contacts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
        });
      
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, queryClient]);

  if (isLoadingContacts) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
