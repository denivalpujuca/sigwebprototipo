import { MaterialIcon } from '../components/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const statsCards = [
  { label: 'Veículos', value: '156', icon: 'directions_car', color: 'from-emerald-600 to-emerald-400', change: '+12%', changeType: 'positive' as const },
  { label: 'Motoristas', value: '89', icon: 'person', color: 'from-blue-600 to-blue-400', change: '+5%', changeType: 'positive' as const },
  { label: 'Ordens de Serviço', value: '234', icon: 'assignment', color: 'from-amber-600 to-amber-400', change: '+18%', changeType: 'positive' as const },
  { label: 'Abastecimentos', value: '1.247', icon: 'local_gas_station', color: 'from-red-600 to-red-400', change: '+32%', changeType: 'positive' as const },
];

const quickActions = [
  { label: 'Nova OS', icon: 'add_circle', section: 'ordem-servico' },
  { label: 'Abastecimento', icon: 'local_gas_station', section: 'abastecimento' },
  { label: 'Cadastrar Veículo', icon: 'directions_car', section: 'veiculos' },
  { label: 'Nova Venda', icon: 'point_of_sale', section: 'vendas-relatorio' },
];

const recentOrders = [
  { id: 'OS-001', vehicle: 'ABC-1234', service: 'Troca de Óleo', status: 'Em Andamento', date: '06/04/2026' },
  { id: 'OS-002', vehicle: 'DEF-5678', service: 'Revisão', status: 'Pendente', date: '05/04/2026' },
  { id: 'OS-003', vehicle: 'GHI-9012', service: 'Freios', status: 'Concluído', date: '05/04/2026' },
  { id: 'OS-004', vehicle: 'JKL-3456', service: 'Alinhamento', status: 'Em Andamento', date: '04/04/2026' },
];

const vehicleStatus = [
  { type: 'Em Uso', count: 89, color: 'bg-emerald-600' },
  { type: 'Disponível', count: 45, color: 'bg-blue-500' },
  { type: 'Manutenção', count: 18, color: 'bg-red-600' },
  { type: 'Inativo', count: 4, color: 'bg-slate-400' },
];

interface DashboardProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500 text-sm">Visão geral do sistema de gestão</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className={`${stat.color} text-white border-0`}>
            <CardContent className="p-4 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest opacity-80">{stat.label}</span>
                <MaterialIcon name={stat.icon} className="opacity-80" />
              </div>
              <div>
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <div className="text-xs opacity-80">{stat.change} este mês</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <MaterialIcon name={action.icon} className="text-emerald-600" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ordens de Serviço Recentes</CardTitle>
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">OS</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Veículo</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Serviço</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{order.vehicle}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{order.service}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Concluído' ? 'bg-green-100 text-green-700' :
                        order.status === 'Em Andamento' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicleStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-slate-600 flex-1">{status.type}</span>
                  <span className="text-lg font-bold text-slate-900">{status.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                {vehicleStatus.map((status, index) => (
                  <div 
                    key={index} 
                    className={`${status.color} ${index === 0 ? 'rounded-l-full' : ''} ${index === vehicleStatus.length - 1 ? 'rounded-r-full' : ''}`}
                    style={{ width: `${(status.count / 156) * 100}%` }}
                  ></div>
                ))}
              </div>
              <div className="text-center mt-2 text-xs text-slate-500">Total: 156 veículos</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};