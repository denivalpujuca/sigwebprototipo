import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  FilePlus,
  Building,
  Hammer,
  MapPinPlus,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';

const quickActions = [
  { label: 'Novo Cliente', icon: UserPlus, link: '/clientes' },
  { label: 'Novo Contrato', icon: FilePlus, link: '/contratos' },
  { label: 'Nova Empresa', icon: Building, link: '/empresas' },
  { label: 'Novo Serviço', icon: Hammer, link: '/servicos' },
  { label: 'Almoxarifado', icon: MapPinPlus, link: '/almoxarifados' },
  { label: 'Auditoria', icon: ClipboardList, link: '/auditoria-admin' },
];

const recentClients = [
  { id: 1, name: 'Transportadora Silva', type: 'Empresa', status: 'Ativo', date: '06/04/2026' },
  { id: 2, name: 'João Oliveira', type: 'Pessoa Física', status: 'Ativo', date: '05/04/2026' },
  { id: 3, name: 'LogTech Logística', type: 'Empresa', status: 'Pendente', date: '05/04/2026' },
  { id: 4, name: 'Maria Santos', type: 'Pessoa Física', status: 'Ativo', date: '04/04/2026' },
];

const recentContracts = [
  { id: 'CTR-001', client: 'Transportadora Silva', value: 'R$ 45.000,00', status: 'Vigente', end: '31/12/2026' },
  { id: 'CTR-002', client: 'João Oliveira', value: 'R$ 12.500,00', status: 'Vigente', end: '30/06/2026' },
  { id: 'CTR-003', client: 'LogTech Logística', value: 'R$ 78.000,00', status: 'Em Análise', end: '-' },
  { id: 'CTR-004', client: 'Maria Santos', value: 'R$ 8.900,00', status: 'Vigente', end: '15/09/2026' },
];

export const AdministrativoDashboardPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Dashboard Administrativo</h1>
        <p className="text-slate-500 text-sm">Visão geral do módulo administrativo</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <div className="h-auto py-4 flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-emerald-300 transition-colors cursor-pointer">
                    <IconComponent className="w-6 h-6 text-emerald-600" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Clientes Recentes</CardTitle>
              <Link to="/clientes" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Nome</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{client.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{client.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contratos Recentes</CardTitle>
              <Link to="/contratos" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{contract.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{contract.client}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{contract.value}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'Vigente' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
