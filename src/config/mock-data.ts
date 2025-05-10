
import { Contact, Message, KanbanColumn, User } from '@/types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '5511999887766',
    profilePic: 'https://i.pravatar.cc/150?img=1',
    unreadCount: 3,
    status: 'online',
    tags: ['cliente', 'premium'],
    funnelStage: 'novo-lead',
    originMetadata: {
      source: 'facebook',
      campaign: 'Promo Verão 2023',
      adId: 'fb123456',
      adImage: 'https://picsum.photos/100/100',
      sourceApp: 'Facebook',
      timestamp: '2023-05-15T10:30:00.000Z'
    }
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    phone: '5511988776655',
    profilePic: 'https://i.pravatar.cc/150?img=5',
    unreadCount: 0,
    status: 'offline',
    tags: ['prospect'],
    funnelStage: 'negociação',
    originMetadata: {
      source: 'instagram',
      sourceApp: 'Instagram',
      timestamp: '2023-05-14T14:20:00.000Z'
    }
  },
  {
    id: '3',
    name: 'Carlos Santos',
    phone: '5511977665544',
    profilePic: 'https://i.pravatar.cc/150?img=8',
    unreadCount: 1,
    status: 'offline',
    tags: ['cliente', 'varejo'],
    funnelStage: 'fechamento',
    originMetadata: {
      source: 'organic',
      referrer: 'google',
      timestamp: '2023-05-10T09:15:00.000Z'
    }
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '5511966554433',
    profilePic: 'https://i.pravatar.cc/150?img=9',
    unreadCount: 0,
    status: 'online',
    tags: ['lead', 'evento'],
    funnelStage: 'qualificação',
    originMetadata: {
      source: 'facebook',
      campaign: 'Evento Anual 2023',
      adId: 'fb789012',
      adImage: 'https://picsum.photos/100/100?random=2',
      sourceApp: 'Facebook',
      timestamp: '2023-05-12T15:45:00.000Z'
    }
  },
  {
    id: '5',
    name: 'Pedro Alves',
    phone: '5511955443322',
    profilePic: 'https://i.pravatar.cc/150?img=11',
    unreadCount: 5,
    status: 'online',
    tags: ['lead', 'importado'],
    funnelStage: 'novo-lead',
    originMetadata: {
      source: 'imported',
      timestamp: '2023-05-16T08:30:00.000Z'
    }
  }
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '101',
      contactId: '1',
      content: 'Olá, tenho interesse no seu produto!',
      timestamp: '2023-05-15T10:35:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '102',
      contactId: '1',
      content: 'Vi seu anúncio no Facebook',
      timestamp: '2023-05-15T10:36:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '103',
      contactId: '1',
      content: 'Olá João! Obrigado pelo interesse. Como posso ajudar?',
      timestamp: '2023-05-15T10:40:00.000Z',
      direction: 'out',
      status: 'read',
      type: 'text'
    },
    {
      id: '104',
      contactId: '1',
      content: 'Gostaria de saber o preço do produto X',
      timestamp: '2023-05-15T10:45:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '105',
      contactId: '1',
      content: 'Segue nossa tabela de preços atual',
      timestamp: '2023-05-15T10:50:00.000Z',
      direction: 'out',
      status: 'delivered',
      type: 'document',
      mediaUrl: 'https://picsum.photos/200/300'
    },
    {
      id: '106',
      contactId: '1',
      content: 'Obrigado! Vou analisar',
      timestamp: '2023-05-15T11:00:00.000Z',
      direction: 'in',
      type: 'text'
    }
  ],
  '2': [
    {
      id: '201',
      contactId: '2',
      content: 'Boa tarde, ainda tem aquele produto em promoção?',
      timestamp: '2023-05-14T14:25:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '202',
      contactId: '2',
      content: 'Boa tarde Maria! Sim, ainda temos em estoque.',
      timestamp: '2023-05-14T14:30:00.000Z',
      direction: 'out',
      status: 'read',
      type: 'text'
    },
    {
      id: '203',
      contactId: '2',
      content: 'Ótimo! Como faço para comprar?',
      timestamp: '2023-05-14T14:32:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '204',
      contactId: '2',
      content: 'Pode fazer pelo nosso site ou aqui mesmo pelo WhatsApp',
      timestamp: '2023-05-14T14:35:00.000Z',
      direction: 'out',
      status: 'read',
      type: 'text'
    }
  ],
  '3': [
    {
      id: '301',
      contactId: '3',
      content: 'Bom dia, meu pedido já foi enviado?',
      timestamp: '2023-05-16T09:10:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '302',
      contactId: '3',
      content: 'Bom dia Carlos! Deixe-me verificar para você.',
      timestamp: '2023-05-16T09:15:00.000Z',
      direction: 'out',
      status: 'delivered',
      type: 'text'
    },
    {
      id: '303',
      contactId: '3',
      content: 'Seu pedido foi enviado ontem, segue o código de rastreio: AB123456789BR',
      timestamp: '2023-05-16T09:20:00.000Z',
      direction: 'out',
      status: 'delivered',
      type: 'text'
    }
  ],
  '4': [
    {
      id: '401',
      contactId: '4',
      content: 'Olá, vi que vocês terão um evento mês que vem',
      timestamp: '2023-05-12T15:50:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '402',
      contactId: '4',
      content: 'Olá Ana! Sim, será no dia 15 de junho.',
      timestamp: '2023-05-12T15:55:00.000Z',
      direction: 'out',
      status: 'read',
      type: 'text'
    },
    {
      id: '403',
      contactId: '4',
      content: 'Como faço para me inscrever?',
      timestamp: '2023-05-12T16:00:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '404',
      contactId: '4',
      content: 'Segue o link de inscrição: https://evento2023.exemplo.com',
      timestamp: '2023-05-12T16:05:00.000Z',
      direction: 'out',
      status: 'read',
      type: 'text'
    },
    {
      id: '405',
      contactId: '4',
      content: 'Também estou enviando o folder do evento',
      timestamp: '2023-05-12T16:06:00.000Z',
      direction: 'out',
      status: 'read',
      type: 'image',
      mediaUrl: 'https://picsum.photos/300/200?random=1'
    },
    {
      id: '406',
      contactId: '4',
      content: 'Obrigada! Vou me inscrever.',
      timestamp: '2023-05-12T16:10:00.000Z',
      direction: 'in',
      type: 'text'
    }
  ],
  '5': [
    {
      id: '501',
      contactId: '5',
      content: 'Bom dia, gostaria de um orçamento',
      timestamp: '2023-05-16T08:35:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '502',
      contactId: '5',
      content: 'Qual serviço especificamente?',
      timestamp: '2023-05-16T09:30:00.000Z',
      direction: 'out',
      status: 'delivered',
      type: 'text'
    },
    {
      id: '503',
      contactId: '5',
      content: 'Para consultoria em marketing digital',
      timestamp: '2023-05-16T09:40:00.000Z',
      direction: 'in',
      type: 'text'
    },
    {
      id: '504',
      contactId: '5',
      content: 'Pode me enviar mais detalhes sobre sua empresa?',
      timestamp: '2023-05-16T09:45:00.000Z',
      direction: 'out',
      status: 'delivered',
      type: 'text'
    },
    {
      id: '505',
      contactId: '5',
      content: 'Claro, somos uma empresa de médio porte no setor de varejo',
      timestamp: '2023-05-16T09:50:00.000Z',
      direction: 'in',
      type: 'text'
    }
  ]
};

export const mockKanbanData: KanbanColumn[] = [
  {
    id: 'novo-lead',
    title: 'Novo Lead',
    contactIds: ['1', '5']
  },
  {
    id: 'qualificação',
    title: 'Qualificação',
    contactIds: ['4']
  },
  {
    id: 'negociação',
    title: 'Negociação',
    contactIds: ['2']
  },
  {
    id: 'fechamento',
    title: 'Fechamento',
    contactIds: ['3']
  },
  {
    id: 'pós-venda',
    title: 'Pós-Venda',
    contactIds: []
  }
];

export const mockUser: User = {
  id: 'u1',
  name: 'Administrador',
  email: 'admin@mayachat.com',
  role: 'admin',
  avatar: 'https://i.pravatar.cc/150?img=12'
};

export const mockAnalyticsData = {
  messagesSent: 543,
  messagesReceived: 782,
  responseRate: 94.2,
  averageResponseTime: 12.5, // minutes
  contactsBySource: {
    facebook: 45,
    instagram: 32,
    organic: 18,
    imported: 5
  },
  messagesByDay: [
    { date: '2023-05-10', sent: 42, received: 65 },
    { date: '2023-05-11', sent: 38, received: 57 },
    { date: '2023-05-12', sent: 56, received: 78 },
    { date: '2023-05-13', sent: 62, received: 91 },
    { date: '2023-05-14', sent: 49, received: 73 },
    { date: '2023-05-15', sent: 68, received: 103 },
    { date: '2023-05-16', sent: 78, received: 114 }
  ]
};
