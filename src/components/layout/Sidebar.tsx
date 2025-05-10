
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  Send, 
  BarChart4, 
  Settings, 
  LogOut, 
  X,
  Check
} from 'lucide-react';
import { mockUser } from '@/config/mock-data';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const [connected, setConnected] = useState(true);

  const navItems = [
    { path: '/chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
    { path: '/crm', icon: <Users className="w-5 h-5" />, label: 'CRM Kanban' },
    { path: '/bulk-messages', icon: <Send className="w-5 h-5" />, label: 'Disparos em Massa' },
    { path: '/analytics', icon: <BarChart4 className="w-5 h-5" />, label: 'Analytics' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Configurações' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r">
      {/* Close button - mobile only */}
      <button 
        className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Logo area */}
      <div className="flex items-center justify-center h-16 border-b px-6">
        <div className="flex items-center gap-2">
          <div className="bg-maya-primary rounded-md w-8 h-8 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 dark:text-white">MayaChat</span>
        </div>
      </div>

      {/* Z-API Connection status */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status Z-API:
          </span>
          <div className={cn(
            "flex items-center gap-1 text-sm",
            connected ? "text-green-500" : "text-red-500"
          )}>
            {connected ? (
              <>
                <Check className="w-4 h-4" />
                <span>Conectado</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                <span>Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-maya-primary/10 text-maya-primary dark:bg-maya-primary/20" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
              onClick={onClose}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={mockUser.avatar} />
            <AvatarFallback>{mockUser.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {mockUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {mockUser.email}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
