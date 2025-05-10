
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getConnectionStatus } from '@/services/z-api';
import { useToast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const [zApiInstance, setZApiInstance] = useState('');
  const [zApiToken, setZApiToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const { toast } = useToast();

  const handleTestConnection = async () => {
    if (!zApiInstance || !zApiToken) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha a Instância e o Token Z-API para testar a conexão."
      });
      return;
    }
    
    setIsConnecting(true);
    try {
      const status = await getConnectionStatus();
      setIsConnected(status.connected);
      
      if (status.connected) {
        toast({
          title: "Conexão bem-sucedida",
          description: "Sua conexão com a Z-API está funcionando corretamente.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Falha na conexão",
          description: "Não foi possível conectar com a Z-API. Verifique as credenciais."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na conexão",
        description: "Ocorreu um erro ao testar a conexão com a Z-API."
      });
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gerencie as configurações da sua conta e da integração com Z-API
        </p>
      </div>

      <Tabs defaultValue="zapi">
        <TabsList className="mb-6">
          <TabsTrigger value="zapi">Integração Z-API</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="zapi">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Z-API</CardTitle>
              <CardDescription>
                Configure sua conexão com a API do WhatsApp através da Z-API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zapi-instance">Instância Z-API</Label>
                <Input
                  id="zapi-instance"
                  placeholder="Insira o ID da sua instância"
                  value={zApiInstance}
                  onChange={(e) => setZApiInstance(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zapi-token">Token Z-API</Label>
                <Input
                  id="zapi-token"
                  type="password"
                  placeholder="Insira seu token de acesso"
                  value={zApiToken}
                  onChange={(e) => setZApiToken(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-reply">Respostas Automáticas</Label>
                  <Switch
                    id="auto-reply"
                    checked={autoReplyEnabled}
                    onCheckedChange={setAutoReplyEnabled}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Ativar respostas automáticas para mensagens recebidas fora do horário comercial
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button
                onClick={handleTestConnection}
                disabled={isConnecting}
              >
                {isConnecting ? "Conectando..." : "Testar Conexão"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como você recebe notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-messages">Notificações de Mensagens</Label>
                  <Switch
                    id="notify-messages"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Receba notificações quando novas mensagens chegarem
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-leads">Notificações de Novos Leads</Label>
                  <Switch
                    id="notify-leads"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Receba notificações quando novos leads forem adicionados ao CRM
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-email">Notificações por Email</Label>
                  <Switch
                    id="notify-email"
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Receba um resumo diário das atividades por email
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue="Administrador" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@mayachat.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Alterar Senha</Label>
                <Input id="password" type="password" placeholder="Nova senha" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-confirm">Confirmar Senha</Label>
                <Input id="password-confirm" type="password" placeholder="Confirme a senha" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Atualizar Perfil</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
