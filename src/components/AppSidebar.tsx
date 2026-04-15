import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, type LucideIcon, Building, ShoppingCart, Wallet, Truck, Users, Wrench, Trash2, Cloud, Computer, TrendingUp, LayoutDashboard, Package, FolderOpen, CalendarDays, Truck as TruckIcon, FileText, Award, CheckCircle, Settings, Users as UsersIcon, Store, ClipboardList, Car, UserCog, Shield } from 'lucide-react';
import { useEmpresa } from '@/context/EmpresaContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  modulo?: string;
  items?: NavItem[];
}

const menuItens: NavItem[] = [
  {
    id: 'administrativo',
    label: 'Administrativo',
    icon: Building,
    modulo: 'administrativo',
    items: [
      { id: 'administrativo-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'almoxarifados', label: 'Almoxarifados', icon: Package },
      { id: 'auditoria-admin', label: 'Auditoria', icon: FolderOpen },
      { id: 'clientes', label: 'Clientes', icon: UsersIcon },
      { id: 'contratos', label: 'Contratos', icon: FileText },
      { id: 'departamentos', label: 'Departamentos', icon: Settings },
      { id: 'empresas', label: 'Empresas', icon: Building },
      { id: 'periodo-ano', label: 'Período Ano', icon: CalendarDays },
      { id: 'servicos', label: 'Serviços', icon: Wrench },
    ],
  },
  {
    id: 'gente-gestao',
    label: 'Gente e Gestão',
    icon: Users,
    modulo: 'administrativo',
    items: [
      { id: 'cargos', label: 'Cargos', icon: Award },
      { id: 'funcionarios', label: 'Funcionários', icon: UsersIcon },
    ],
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: ShoppingCart,
    modulo: 'compras',
    items: [
      { id: 'fornecedores', label: 'Fornecedores', icon: TruckIcon },
      { id: 'solicitacao-compra', label: 'Solicitação de Compra', icon: ShoppingCart },
      { id: 'pedidos-compra', label: 'Pedidos de Compra', icon: ClipboardList },
      { id: 'requisicao-compra-produtos', label: 'Requisição de Compra', icon: ShoppingCart },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    modulo: 'financeiro',
    items: [
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: Wallet },
      { id: 'contas-receber', label: 'Contas a Receber', icon: TrendingUp },
    ],
  },
  {
    id: 'frota',
    label: 'Frota',
    icon: Truck,
    modulo: 'frota',
    items: [
      { id: 'marcas', label: 'Marcas', icon: Award },
      { id: 'modelos', label: 'Modelos', icon: CheckCircle },
      { id: 'veiculos', label: 'Veículos e Máquinas', icon: Car },
    ],
  },
  {
    id: 'oficina',
    label: 'Oficina',
    icon: Wrench,
    modulo: 'oficina',
    items: [
      { id: 'oficina-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ordem-servico', label: 'Ordem de Serviço', icon: ClipboardList },
    ],
  },
  {
    id: 'residuos',
    label: 'Resíduos',
    icon: Trash2,
    modulo: 'residuos',
    items: [
      { id: 'residuos-mtr', label: 'Resíduos MTR', icon: TruckIcon },
      { id: 'residuos-urbano', label: 'Resíduos Urbano', icon: Building },
    ],
  },
  {
    id: 'suprimentos',
    label: 'Suprimentos',
    icon: Cloud,
    modulo: 'almoxarifado',
    items: [
      { id: 'produtos', label: 'Produtos', icon: Package },
      { id: 'categorias-produto', label: 'Categorias', icon: Package },
      { id: 'catalogo-produtos', label: 'Catálogo de Produtos', icon: Store },
      { id: 'requisicao-departamento', label: 'Requisição de Produtos', icon: ClipboardList },
    ],
  },
  {
    id: 'ti',
    label: 'T.I.',
    icon: Computer,
    modulo: 'ti',
    items: [
      { id: 'usuarios-permissoes', label: 'Perm. Almoxarifados', icon: UserCog },
      { id: 'usuario-modulos', label: 'Perm. Módulos', icon: Shield },
      { id: 'tipos-usuario', label: 'Tipos de Usuário', icon: UsersIcon },
      { id: 'usuarios', label: 'Usuários', icon: UserCog },
    ],
  },
  {
    id: 'vendas',
    label: 'Vendas',
    icon: TrendingUp,
    modulo: 'vendas',
    items: [
      { id: 'catalogo-servicos', label: 'Catálogo de Serviços', icon: Wrench },
      { id: 'vendas-relatorio', label: 'Gestão de Orçamentos', icon: TrendingUp },
    ],
  },
];

export const AppSidebar: React.FC = () => {
  const { hasModuleAccess, modulosPermitidos } = useEmpresa();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebarOpenGroups');
    return saved ? JSON.parse(saved) : {};
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [userName, setUserName] = React.useState('Usuário');
  const [userType, setUserType] = React.useState('Operador');

  React.useEffect(() => {
    const nome = localStorage.getItem('usuario_nome');
    if (nome) setUserName(nome);
    
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      fetch(`/api/usuarios/${usuarioId}`)
        .then(r => r.json())
        .then(data => {
          if (data.tipo_usuario) setUserType(data.tipo_usuario);
        })
        .catch(() => {});
    }
  }, []);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const updated = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem('sidebarOpenGroups', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredMenuItens = React.useMemo(() => {
    const hasModulePermissions = modulosPermitidos.length > 0;
    
    const filterGroups = (groups: NavItem[]): NavItem[] => {
      return groups
        .map(group => {
          const filteredItems = group.items?.filter(item => {
            if (!item.modulo) return true;
            if (!hasModulePermissions) return true;
            return hasModuleAccess(item.modulo);
          });
          return { ...group, items: filteredItems };
        })
        .filter(group => {
          if (!group.modulo) return true;
          if (!hasModulePermissions) return true;
          return hasModuleAccess(group.modulo);
        })
        .filter(group => group.items && group.items.length > 0);
    };

    if (searchTerm) {
      return filterGroups(menuItens).map(group => ({
        ...group,
        items: group.items?.filter(item => 
          item.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.items && group.items.length > 0);
    }

    return filterGroups(menuItens);
  }, [searchTerm, hasModuleAccess, modulosPermitidos.length]);

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
      
      <div className="px-4 py-3">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-0">
        <div className="px-0">
          {filteredMenuItens.map((grupo) => {
            const hasSubItems = grupo.items && grupo.items.length > 0;
            
            return (
              <div key={grupo.id} className="group/collapsible">
                <button 
                  onClick={() => hasSubItems && toggleGroup(grupo.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {React.createElement(grupo.icon, { className: "h-4 w-4" })}
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
                          {React.createElement(item.icon, { className: "h-4 w-4 opacity-70" })}
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
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
            {userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">{userName}</span>
            <span className="text-[10px] text-slate-500">{userType}</span>
          </div>
        </div>
      </footer>
    </aside>
  );
};