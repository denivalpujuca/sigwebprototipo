import React from 'react';
import { NavLink } from 'react-router-dom';
import { MaterialIcon } from './Icon';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  items?: NavItem[];
}

const menuItens: NavItem[] = [
  {
    id: 'administrativo',
    label: 'Administrativo',
    icon: 'business',
    items: [
      { id: 'administrativo-dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'almoxarifados', label: 'Almoxarifados', icon: 'inventory_2' },
      { id: 'auditoria-admin', label: 'Auditoria', icon: 'fact_check' },
      { id: 'clientes', label: 'Clientes', icon: 'groups' },
      { id: 'contratos', label: 'Contratos', icon: 'description' },
      { id: 'empresas', label: 'Empresas', icon: 'business' },
      { id: 'periodo-ano', label: 'Período Ano', icon: 'calendar_month' },
      { id: 'servicos', label: 'Serviços', icon: 'build' },
    ],
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: 'shopping_cart',
    items: [
      { id: 'fornecedores', label: 'Fornecedores', icon: 'local_shipping' },
      { id: 'solicitacao-compra', label: 'Solicitação de Compra', icon: 'shopping_cart' },
      { id: 'pedidos-compra', label: 'Pedidos de Compra', icon: 'assignment' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'account_balance_wallet',
    items: [
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: 'account_balance_wallet' },
      { id: 'contas-receber', label: 'Contas a Receber', icon: 'trending_up' },
    ],
  },
  {
    id: 'frota',
    label: 'Frota',
    icon: 'local_shipping',
    items: [
      { id: 'marcas', label: 'Marcas', icon: 'emoji_events' },
      { id: 'modelos', label: 'Modelos', icon: 'verified' },
      { id: 'veiculos', label: 'Veículos e Máquinas', icon: 'directions_car' },
    ],
  },
  {
    id: 'gente-gestao',
    label: 'Gente e Gestão',
    icon: 'groups',
    items: [
      { id: 'auditoria', label: 'Auditoria', icon: 'fact_check' },
      { id: 'cargos', label: 'Cargos', icon: 'emoji_events' },
      { id: 'funcionarios', label: 'Funcionários', icon: 'person_check' },
    ],
  },
  {
    id: 'oficina',
    label: 'Oficina',
    icon: 'build',
    items: [
      { id: 'oficina-dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'ordem-servico', label: 'Ordem de Serviço', icon: 'assignment' },
    ],
  },
  {
    id: 'residuos',
    label: 'Resíduos',
    icon: 'delete',
    items: [
      { id: 'residuos-mtr', label: 'Resíduos MTR', icon: 'local_shipping' },
      { id: 'residuos-urbano', label: 'Resíduos Urbano', icon: 'business' },
    ],
  },
  {
    id: 'suprimentos',
    label: 'Suprimentos',
    icon: 'cloud',
    items: [
      { id: 'produtos', label: 'Produtos', icon: 'inventory_2' },
      { id: 'catalogo-produtos', label: 'Catálogo de Produtos', icon: 'store' },
      { id: 'requisicao-compra-produtos', label: 'Requisição de Compra', icon: 'shopping_cart' },
      { id: 'requisicao-departamento', label: 'Req. Departamentos', icon: 'assignment' },
    ],
  },
  {
    id: 'ti',
    label: 'T.I.',
    icon: 'computer',
    items: [
      { id: 'permissoes', label: 'Permissões', icon: 'shield' },
      { id: 'tipos-usuario', label: 'Tipos de Usuário', icon: 'groups' },
      { id: 'usuarios', label: 'Usuários', icon: 'manage_accounts' },
    ],
  },
  {
    id: 'vendas',
    label: 'Vendas',
    icon: 'trending_up',
    items: [
      { id: 'catalogo-servicos', label: 'Catálogo de Serviços', icon: 'build' },
      { id: 'vendas-relatorio', label: 'Gestão de Vendas', icon: 'trending_up' },
    ],
  },
];

export const AppSidebar: React.FC = () => {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebarOpenGroups');
    return saved ? JSON.parse(saved) : {
      administrativo: true,
      compras: true,
      financeiro: true,
      frota: true,
      'gente-gestao': true,
      oficina: true,
      residuos: true,
      suprimentos: true,
      ti: true,
      vendas: true,
    };
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const updated = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem('sidebarOpenGroups', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <aside className="w-72 shrink-0 border-0 bg-[#f5f5f5] flex flex-col h-full">
      <header className="h-16 border-b border-slate-200 px-4 flex items-center shrink-0">
        <div className="flex items-center justify-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">SW</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">SigWeb</span>
            <span className="text-[10px] text-slate-500">Sistema de Gestão</span>
          </div>
        </div>
      </header>
      
      <nav className="flex-1 overflow-y-auto px-0">
        <div className="px-0">
          {menuItens.map((grupo) => {
            const hasSubItems = grupo.items && grupo.items.length > 0;
            
            return (
              <div key={grupo.id} className="group/collapsible">
                <button 
                  onClick={() => hasSubItems && toggleGroup(grupo.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <MaterialIcon name={grupo.icon} className="h-4 w-4" />
                  {grupo.label}
                  {hasSubItems && (
                    <span className={`ml-auto text-xs transition-transform ${openGroups[grupo.id] ? 'rotate-90' : ''}`}>▶</span>
                  )}
                </button>
                {hasSubItems && openGroups[grupo.id] && (
                  <ul className="mt-1 space-y-0.5 border-l-2 border-gray-200 ml-4 pl-3">
                    {grupo.items?.map((item) => (
                      <li key={item.id}>
                        <NavLink
                          to={`/${item.id}`}
                          className={({ isActive }) =>
                            `block rounded-md px-3 py-1.5 text-sm w-full text-left flex items-center gap-2 ${
                              isActive
                                ? "bg-gray-200 font-medium text-gray-900"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            }`
                          }
                        >
                          <MaterialIcon name={item.icon} className="h-4 w-4 opacity-70" />
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <footer className="border-t border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">DS</div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">Denival Santos</span>
            <span className="text-[10px] text-slate-500">Administrador</span>
          </div>
        </div>
      </footer>
    </aside>
  );
};