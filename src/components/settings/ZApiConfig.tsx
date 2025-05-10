
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, QrCode, RefreshCw, X } from 'lucide-react';
import { saveZApiConfig, getConnectionStatus, getQrCode } from '@/services/z-api';
import { useInterval } from '@/hooks/use-interval';
import { supabase } from '@/integrations/supabase/client';

const ZApiConfig = () => {
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [clientToken, setClientToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrRetries, setQrRetries] = useState(0);
  const [activeTab, setActiveTab] = useState('credentials');
  
  const { toast } = useToast();
  
  // Load existing configuration
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('z_api_config')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.log('No Z-API configuration found');
          return;
        }
        
        if (data) {
          setInstanceId(data.instance_id);
          setToken(data.token);
          setClientToken(data.client_token);
          setIsConfigured(true);
          setIsConnected(data.is_connected);
          if (data.qr_code) {
            setQrCode(data.qr_code);
          }
        }
      } catch (error) {
        console.error('Error loading Z-API config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  // Check connection status periodically
  useInterval(() => {
    if (isConfigured) {
      checkConnection();
    }
  }, isConnected ? 60000 : 15000); // Check every minute if connected, every 15s if not
  
  // QR code refresh
  useEffect(() => {
    if (activeTab === 'qrcode' && isConfigured && !isConnected) {
      fetchQrCode();
    }
  }, [activeTab, isConfigured, isConnected]);
  
  // Refresh QR code automatically
  useInterval(() => {
    if (activeTab === 'qrcode' && isConfigured && !isConnected && qrRetries < 5) {
      fetchQrCode();
      setQrRetries(prev => prev + 1);
    }
  }, 20000); // Refresh QR code every 20 seconds
  
  const handleSaveConfig = async () => {
    if (!instanceId || !token || !clientToken) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios para configurar a Z-API."
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para configurar a Z-API."
        });
        return;
      }
      
      const result = await saveZApiConfig(user.id, instanceId, token, clientToken);
      
      if (result.success) {
        toast({
          title: "Configuração salva",
          description: "Configuração da Z-API salva com sucesso."
        });
        setIsConfigured(true);
        setActiveTab('qrcode');
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar a configuração da Z-API."
        });
      }
    } catch (error) {
      console.error('Error saving Z-API config:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar a configuração."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const checkConnection = async () => {
    try {
      const status = await getConnectionStatus();
      setIsConnected(status.connected);
      
      if (status.connected && activeTab === 'qrcode') {
        setActiveTab('status');
        toast({
          title: "Conectado",
          description: "Seu WhatsApp está conectado com sucesso!"
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };
  
  const fetchQrCode = async () => {
    try {
      const result = await getQrCode();
      if (result.success && result.data) {
        setQrCode(result.data);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };
  
  const handleRefreshQrCode = () => {
    setQrRetries(0);
    fetchQrCode();
    toast({
      title: "Atualizando QR Code",
      description: "Gerando um novo QR Code para conexão."
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração da Z-API</CardTitle>
        <CardDescription>
          Conecte sua instância da Z-API para utilizar o WhatsApp
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="credentials">Credenciais</TabsTrigger>
          <TabsTrigger value="qrcode" disabled={!isConfigured}>QR Code</TabsTrigger>
          <TabsTrigger value="status" disabled={!isConfigured}>Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credentials">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instance-id">Instance ID da Z-API</Label>
              <Input
                id="instance-id"
                placeholder="Insira o ID da sua instância"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Encontrado no painel da Z-API em Instâncias → ID da Instância
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="token">Token da Instância</Label>
              <Input
                id="token"
                type="password"
                placeholder="Insira o token da instância"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Encontrado no painel da Z-API em Instâncias → Token
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client-token">Client-Token Z-API</Label>
              <Input
                id="client-token"
                type="password"
                placeholder="Insira o Client-Token da conta"
                value={clientToken}
                onChange={(e) => setClientToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Encontrado no painel da Z-API em Configurações → Account Security Token
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSaveConfig}
              disabled={isSaving || isLoading}
            >
              {isSaving ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="qrcode">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            {isConnected ? (
              <div className="flex flex-col items-center py-8">
                <Check className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">WhatsApp Conectado</h3>
                <p className="text-gray-500">
                  Seu WhatsApp já está conectado e pronto para uso.
                </p>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-white inline-block">
                  <img 
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR Code para conexão com WhatsApp"
                    className="w-64 h-64"
                  />
                </div>
                <div>
                  <p className="text-sm mb-2">
                    Escaneie o QR Code com seu WhatsApp para conectar
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    O QR Code expira em aproximadamente 20 segundos
                  </p>
                  <Button onClick={handleRefreshQrCode} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar novo QR Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <QrCode className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                <h3 className="text-lg font-medium mb-2">Carregando QR Code...</h3>
                <p className="text-gray-500">
                  Aguarde enquanto geramos o QR Code para conexão.
                </p>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="status">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center">
              {isConnected ? (
                <div className="py-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4 mx-auto">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    WhatsApp Conectado
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Sua instância da Z-API está funcionando corretamente
                  </p>
                  <Button
                    onClick={checkConnection}
                    variant="outline"
                    size="sm"
                    className="mb-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Novamente
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
                    <X className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    WhatsApp Desconectado
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Escaneie o QR Code para conectar seu WhatsApp
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setActiveTab('qrcode')}
                      className="w-full"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Escanear QR Code
                    </Button>
                    <Button
                      onClick={checkConnection}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verificar Novamente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ZApiConfig;
