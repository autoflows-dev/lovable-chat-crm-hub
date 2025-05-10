
import { mockAnalyticsData } from '@/config/mock-data';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const AnalyticsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Métricas e estatísticas da sua comunicação via WhatsApp
        </p>
      </div>

      <AnalyticsDashboard data={mockAnalyticsData} />
    </div>
  );
};

export default AnalyticsPage;
