
import { useEffect, useState } from 'react';
import KanbanBoard from '@/components/crm/KanbanBoard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Interfaces
interface Contact {
  id: string;
  name: string;
  phone: string;
  profilePic?: string;
  unreadCount: number;
  funnelStage?: string;
  tags?: string[];
  lastActivity?: string;
}

interface Column {
  id: string;
  title: string;
  contacts: Contact[];
}

// Estágios do funil
const FUNNEL_STAGES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  CLOSED: 'closed',
};

const CrmPage = () => {
  const [columns, setColumns] = useState<Column[]>([]);
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
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        // Transformar dados para o formato esperado
        const contacts: Contact[] = data.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          profilePic: contact.profile_pic,
          unreadCount: contact.unread_count || 0,
          funnelStage: contact.funnel_stage || FUNNEL_STAGES.NEW,
          tags: contact.tags,
          lastActivity: contact.last_message_at
        }));

        // Organizar contatos em colunas
        const newColumns: Column[] = [
          {
            id: FUNNEL_STAGES.NEW,
            title: 'Novos Leads',
            contacts: contacts.filter(c => c.funnelStage === FUNNEL_STAGES.NEW)
          },
          {
            id: FUNNEL_STAGES.CONTACTED,
            title: 'Contatados',
            contacts: contacts.filter(c => c.funnelStage === FUNNEL_STAGES.CONTACTED)
          },
          {
            id: FUNNEL_STAGES.QUALIFIED,
            title: 'Qualificados',
            contacts: contacts.filter(c => c.funnelStage === FUNNEL_STAGES.QUALIFIED)
          },
          {
            id: FUNNEL_STAGES.PROPOSAL,
            title: 'Proposta',
            contacts: contacts.filter(c => c.funnelStage === FUNNEL_STAGES.PROPOSAL)
          },
          {
            id: FUNNEL_STAGES.CLOSED,
            title: 'Fechados',
            contacts: contacts.filter(c => c.funnelStage === FUNNEL_STAGES.CLOSED)
          }
        ];
        
        setColumns(newColumns);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar contatos",
          description: "Não foi possível carregar os dados do CRM."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();

    // Configurar escuta em tempo real para mudanças na tabela contacts
    const contactsChannel = supabase
      .channel('contacts-changes-crm')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactsChannel);
    };
  }, [user]);

  const handleContactMove = async (contactId: string, newColumnId: string) => {
    if (!user) return;
    
    try {
      // Atualizar o estágio do contato no banco de dados
      const { error } = await supabase
        .from('contacts')
        .update({ funnel_stage: newColumnId })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setColumns(prevColumns => {
        // Encontrar o contato em qualquer coluna
        let targetContact: Contact | undefined;
        const sourceColumnId = prevColumns.find(col => 
          col.contacts.some(c => {
            if (c.id === contactId) {
              targetContact = c;
              return true;
            }
            return false;
          })
        )?.id;

        if (!sourceColumnId || !targetContact) return prevColumns;

        // Criar novas colunas com o contato movido
        return prevColumns.map(column => {
          // Remover o contato da coluna atual
          if (column.id === sourceColumnId) {
            return {
              ...column,
              contacts: column.contacts.filter(c => c.id !== contactId)
            };
          }
          // Adicionar o contato à nova coluna
          if (column.id === newColumnId) {
            const updatedContact = {...targetContact, funnelStage: newColumnId};
            return {
              ...column,
              contacts: [...column.contacts, updatedContact]
            };
          }
          return column;
        });
      });
    } catch (error) {
      console.error('Error moving contact:', error);
      toast({
        variant: "destructive",
        title: "Erro ao mover contato",
        description: "Não foi possível atualizar o estágio do contato."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CRM - Gerenciamento de Leads</h1>
      <KanbanBoard columns={columns} onCardMove={handleContactMove} />
    </div>
  );
};

export default CrmPage;
