
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

interface AnalyticsDashboardProps {
  data: {
    messagesSent: number;
    messagesReceived: number;
    responseRate: number;
    averageResponseTime: number;
    contactsBySource: Record<string, number>;
    messagesByDay: Array<{
      date: string;
      sent: number;
      received: number;
    }>;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  // Transform contacts by source data for pie chart
  const contactsBySourceData = Object.entries(data.contactsBySource).map(([key, value]) => ({
    name: key,
    value
  }));
  
  // Colors for the pie chart
  const COLORS = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#ECE5DD'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stats cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Mensagens Enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.messagesSent}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Mensagens Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.messagesReceived}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Taxa de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.responseRate}%</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Tempo Médio de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageResponseTime} min</div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Mensagens por Dia</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.messagesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sent" stroke="#128C7E" name="Enviadas" />
              <Line type="monotone" dataKey="received" stroke="#25D366" name="Recebidas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Contatos por Origem</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={contactsBySourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {contactsBySourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Volume de Mensagens</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.messagesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sent" stackId="a" fill="#128C7E" name="Enviadas" />
              <Bar dataKey="received" stackId="a" fill="#25D366" name="Recebidas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
