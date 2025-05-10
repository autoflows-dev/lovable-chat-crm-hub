
import { useState } from 'react';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Image, Calendar, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomInput } from '@/components/ui/custom-input';

interface BulkMessageFormProps {
  contacts: Contact[];
  onSendBulkMessage: (contactIds: string[], message: string, mediaUrl?: string) => void;
  isLoading?: boolean;
}

const BulkMessageForm: React.FC<BulkMessageFormProps> = ({ contacts, onSendBulkMessage, isLoading = false }) => {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contact.phone.includes(searchQuery)
  );

  const toggleContactSelection = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };

  const selectAllContacts = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(contact => contact.id));
    }
  };

  const handleSendMessage = () => {
    if (selectedContactIds.length > 0 && messageText.trim()) {
      onSendBulkMessage(selectedContactIds, messageText, mediaUrl || undefined);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Contatos</CardTitle>
          <CardDescription>
            Escolha os contatos para enviar a mensagem em massa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CustomInput
                placeholder="Buscar contatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
                startAdornment={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all"
                checked={selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0}
                onCheckedChange={selectAllContacts}
              />
              <Label htmlFor="select-all" className="text-sm">
                Selecionar todos ({filteredContacts.length})
              </Label>
            </div>

            <div className="border rounded-md h-[300px] overflow-y-auto">
              {filteredContacts.length > 0 ? (
                <ul className="divide-y">
                  {filteredContacts.map(contact => (
                    <li key={contact.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Checkbox 
                        id={`contact-${contact.id}`}
                        checked={selectedContactIds.includes(contact.id)}
                        onCheckedChange={() => toggleContactSelection(contact.id)}
                        className="mr-3"
                      />
                      <label 
                        htmlFor={`contact-${contact.id}`} 
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contact.profilePic} alt={contact.name} />
                          <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.phone}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Nenhum contato encontrado
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compor Mensagem</CardTitle>
          <CardDescription>
            Crie a mensagem para enviar aos contatos selecionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="media">Mídia (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="media"
                  placeholder="URL da imagem ou documento"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSendMessage}
                disabled={selectedContactIds.length === 0 || !messageText.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {selectedContactIds.length > 0
                      ? `Enviar (${selectedContactIds.length})`
                      : "Enviar"
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          <p>
            {selectedContactIds.length > 0
              ? `${selectedContactIds.length} contatos selecionados`
              : "Nenhum contato selecionado"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BulkMessageForm;
