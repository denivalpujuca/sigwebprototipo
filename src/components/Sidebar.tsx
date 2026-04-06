import React, { useState, useEffect } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { 
    id: 'administrativo', 
    label: 'Administrativo', 
    icon: 'admin_panel_settings',
    subItems: [
      { id: 'almoxarifados', label: 'Almoxarifados', icon: 'warehouse' },
      { id: 'auditoria-admin', label: 'Auditoria', icon: 'fact_check' },
      { id: 'clientes', label: 'Clientes', icon: 'person' },
      { id: 'contratos', label: 'Contratos', icon: 'description' },
      { id: 'empresas', label: 'Empresas', icon: 'business' },
      { id: 'periodo-ano', label: 'Período Ano', icon: 'calendar_month' },
      { id: 'servicos', label: 'Serviços', icon: 'build' },
    ]
  },
  { 
    id: 'compras', 
    label: 'Compras', 
    icon: 'shopping_bag',
    subItems: [
      { id: 'fornecedores', label: 'Fornecedores', icon: 'local_shipping' },
      { id: 'solicitacao-compra', label: 'Solicitação de Compra', icon: 'point_of_sale' },
      { id: 'pedidos-compra', label: 'Pedidos de Compra', icon: 'receipt_long' },
    ]
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: 'account_balance',
    subItems: [
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: 'payments' },
      { id: 'contas-receber', label: 'Contas a Receber', icon: 'trending_up' },
    ]
  },
  { 
    id: 'frota', 
    label: 'Frota', 
    icon: 'local_shipping',
    subItems: [
      { id: 'marcas', label: 'Marcas', icon: 'business' },
      { id: 'modelos', label: 'Modelos', icon: 'badge' },
      { id: 'veiculos', label: 'Veículos e Máquinas', icon: 'directions_car' },
    ]
  },
  { 
    id: 'gente-gestao', 
    label: 'Gente e Gestão', 
    icon: 'groups',
    subItems: [
      { id: 'auditoria', label: 'Auditoria', icon: 'fact_check' },
      { id: 'cargos', label: 'Cargos', icon: 'work' },
      { id: 'funcionarios', label: 'Funcionários', icon: 'badge' },
    ]
  },
  { 
    id: 'oficina', 
    label: 'Oficina', 
    icon: 'build',
    subItems: [
      { id: 'oficina-dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'ordem-servico', label: 'Ordem de Serviço', icon: 'assignment' },
    ]
  },
  { 
    id: 'residuos', 
    label: 'Resíduos', 
    icon: 'delete',
    subItems: [
      { id: 'residuos-mtr', label: 'Resíduos MTR', icon: 'local_shipping' },
      { id: 'residuos-urbano', label: 'Resíduos Urbano', icon: 'location_city' },
    ]
  },
  { 
    id: 'suprimentos', 
    label: 'Suprimentos', 
    icon: 'inventory_2',
    subItems: [
      { id: 'produtos', label: 'Produtos', icon: 'inventory' },
      { id: 'catalogo-produtos', label: 'Catálogo de Produtos', icon: 'shopping_cart' },
      { id: 'requisicao-compra-produtos', label: 'Requisição de Compra', icon: 'add_shopping_cart' },
      { id: 'requisicao-departamento', label: 'Req. Departamentos', icon: 'assignment' },
    ]
  },
  { 
    id: 'ti', 
    label: 'T.I.', 
    icon: 'computer',
    subItems: [
      { id: 'permissoes', label: 'Permissões', icon: 'lock_person' },
      { id: 'tipos-usuario', label: 'Tipos de Usuário', icon: 'group' },
      { id: 'usuarios', label: 'Usuários', icon: 'person' },
    ]
  },
  { 
    id: 'vendas', 
    label: 'Vendas', 
    icon: 'point_of_sale',
    subItems: [
      { id: 'catalogo-servicos', label: 'Catálogo de Serviços', icon: 'build' },
      { id: 'vendas-relatorio', label: 'Gestão de Vendas', icon: 'trending_up' },
    ]
  },
  { id: 'sair', label: 'Sair', icon: 'logout' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const getDefaultExpandedMenus = () => {
    const allMenus = ['administrativo', 'compras', 'financeiro', 'frota', 'gente-gestao', 'oficina', 'residuos', 'suprimentos', 'ti', 'vendas'];
    return allMenus.filter(menuId => 
      menuItems.some(item => item.id === menuId && item.subItems?.some(sub => sub.id === activeSection))
    );
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => getDefaultExpandedMenus());

  useEffect(() => {
    setExpandedMenus(prev => {
      const newExpanded = [...prev];
      menuItems.forEach(item => {
        if (item.subItems?.some(sub => sub.id === activeSection)) {
          if (!newExpanded.includes(item.id)) {
            newExpanded.push(item.id);
          }
        }
      });
      return newExpanded;
    });
  }, [activeSection]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSair = () => {
    onSectionChange('sair');
  };

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = activeSection === item.id || (hasSubItems && item.subItems?.some(sub => activeSection === sub.id));

    if (hasSubItems) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`flex items-center gap-4 w-full px-6 py-3 transition-colors hover:bg-white/10 ${
              isActive ? 'text-white' : 'text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined shrink-0">{item.icon}</span>
            <span className="text-sm flex-1 text-left truncate">{item.label}</span>
            <span className={`material-symbols-outlined text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {isExpanded && (
            <div className="bg-white/5">
              {item.subItems.map((subItem) => (
                <button
                  key={subItem.id}
                  onClick={() => onSectionChange(subItem.id)}
                  className={`flex items-center gap-4 w-full px-6 py-2.5 pl-12 transition-colors ${
                    activeSection === subItem.id
                      ? 'border-l-4 border-[#22C55E] text-white bg-white/5 font-semibold translate-x-1'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg shrink-0">{subItem.icon}</span>
                  <span className="text-sm truncate">{subItem.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <li key={item.id}>
        <button
          onClick={() => item.id === 'sair' ? handleSair() : onSectionChange(item.id)}
          className={`flex items-center gap-4 w-full px-6 py-3 transition-colors hover:bg-white/10 group ${
            isActive
              ? 'border-l-4 border-[#22C55E] text-white bg-white/5 font-semibold translate-x-1'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined shrink-0">{item.icon}</span>
          <span className="text-sm truncate">{item.label}</span>
        </button>
      </li>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#2e3132] flex flex-col shadow-2xl z-50">
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#006e2d] to-[#44c365] rounded flex items-center justify-center text-white font-bold">SW</div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">SigWeb Prototipo</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Sistema de Gestão</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 py-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
    </aside>
  );
};