import * as React from "react"
import { ChevronRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  items?: NavItem[]
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItens: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboardIcon,
    items: [],
  },
  {
    id: 'administrativo',
    label: 'Administrativo',
    icon: Building2Icon,
    items: [
      { id: 'almoxarifados', label: 'Almoxarifados', icon: PackageIcon },
      { id: 'auditoria-admin', label: 'Auditoria', icon: FileCheckIcon },
      { id: 'clientes', label: 'Clientes', icon: UsersIcon },
      { id: 'contratos', label: 'Contratos', icon: FileTextIcon },
      { id: 'empresas', label: 'Empresas', icon: Building2Icon },
      { id: 'periodo-ano', label: 'Período Ano', icon: CalendarIcon },
      { id: 'servicos', label: 'Serviços', icon: WrenchIcon },
    ],
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: ShoppingCartIcon,
    items: [
      { id: 'fornecedores', label: 'Fornecedores', icon: TruckIcon },
      { id: 'solicitacao-compra', label: 'Solicitação de Compra', icon: ShoppingCartIcon },
      { id: 'pedidos-compra', label: 'Pedidos de Compra', icon: ClipboardIcon },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: WalletIcon,
    items: [
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: WalletIcon },
      { id: 'contas-receber', label: 'Contas a Receber', icon: TrendingUpIcon },
    ],
  },
  {
    id: 'frota',
    label: 'Frota',
    icon: TruckIcon,
    items: [
      { id: 'marcas', label: 'Marcas', icon: AwardIcon },
      { id: 'modelos', label: 'Modelos', icon: BadgeCheckIcon },
      { id: 'veiculos', label: 'Veículos e Máquinas', icon: CarIcon },
    ],
  },
  {
    id: 'gente-gestao',
    label: 'Gente e Gestão',
    icon: UsersIcon,
    items: [
      { id: 'auditoria', label: 'Auditoria', icon: FileCheckIcon },
      { id: 'cargos', label: 'Cargos', icon: AwardIcon },
      { id: 'funcionarios', label: 'Funcionários', icon: UserCheckIcon },
    ],
  },
  {
    id: 'oficina',
    label: 'Oficina',
    icon: WrenchIcon,
    items: [
      { id: 'oficina-dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
      { id: 'ordem-servico', label: 'Ordem de Serviço', icon: ClipboardIcon },
    ],
  },
  {
    id: 'residuos',
    label: 'Resíduos',
    icon: Trash2Icon,
    items: [
      { id: 'residuos-mtr', label: 'Resíduos MTR', icon: TruckIcon },
      { id: 'residuos-urbano', label: 'Resíduos Urbano', icon: Building2Icon },
    ],
  },
  {
    id: 'suprimentos',
    label: 'Suprimentos',
    icon: HardDriveIcon,
    items: [
      { id: 'produtos', label: 'Produtos', icon: PackageIcon },
      { id: 'catalogo-produtos', label: 'Catálogo de Produtos', icon: StoreIcon },
      { id: 'requisicao-compra-produtos', label: 'Requisição de Compra', icon: ShoppingCartIcon },
      { id: 'requisicao-departamento', label: 'Req. Departamentos', icon: ClipboardIcon },
    ],
  },
  {
    id: 'ti',
    label: 'T.I.',
    icon: MonitorIcon,
    items: [
      { id: 'permissoes', label: 'Permissões', icon: ShieldIcon },
      { id: 'tipos-usuario', label: 'Tipos de Usuário', icon: UsersIcon },
      { id: 'usuarios', label: 'Usuários', icon: UserCogIcon },
    ],
  },
  {
    id: 'vendas',
    label: 'Vendas',
    icon: TrendingUpIcon,
    items: [
      { id: 'catalogo-servicos', label: 'Catálogo de Serviços', icon: WrenchIcon },
      { id: 'vendas-relatorio', label: 'Gestão de Vendas', icon: TrendingUpIcon },
    ],
  },
]

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  )
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"/><path d="M10 4v16"/><path d="M2 10h8"/><path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M4 14v-4a2 2 0 0 0-2-2H2"/><path d="M18 18v-4a2 2 0 0 0-2-2h-4"/><path d="M14 4v16"/><path d="M2 18h8"/>
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>
    </svg>
  )
}

function FileCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15 11 17 15 13"/>
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  )
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  )
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
    </svg>
  )
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  )
}

function AwardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  )
}

function BadgeCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H6L4 10l-2.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 10v2"/><path d="M19 10v2"/>
    </svg>
  )
}

function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 2-2.5 2.5M21.5 7.5 19 5M20 8l2-2"/>
    </svg>
  )
}

function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
    </svg>
  )
}

function HardDriveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6" y1="16" y2="16"/><line x1="10" x2="10" y1="16" y2="16"/>
    </svg>
  )
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  )
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  )
}

function UserCogIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4"/><path d="M12 8h.01"/><path d="M17.5 17.5 19 19"/>
    </svg>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [internalOpenGroups, setInternalOpenGroups] = React.useState<Record<string, boolean>>(() => {
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
  })

  const openGroups = internalOpenGroups

  const toggleGroup = (groupId: string) => {
    setInternalOpenGroups(prev => {
      const updated = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem('sidebarOpenGroups', JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <aside className="w-72 shrink-0 border-0 bg-[#f5f5f5] flex flex-col h-full">
      <header className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">SW</div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">SigWeb</span>
            <span className="text-[10px] text-gray-500">Sistema de Gestão</span>
          </div>
        </div>
      </header>
      
      <nav className="flex-1 overflow-y-auto px-0">
        <div className="px-0">
          {menuItens.map((grupo) => {
            const Icon = grupo.icon
            const hasSubItems = grupo.items && grupo.items.length > 0
            
            return (
              <Collapsible
                key={grupo.id}
                open={openGroups[grupo.id] ?? true}
                onOpenChange={() => toggleGroup(grupo.id)}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    <Icon className="h-4 w-4" />
                    {grupo.label}
                    {hasSubItems && (
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </button>
                </CollapsibleTrigger>
                {hasSubItems && (
                  <CollapsibleContent>
                    <ul className="mt-1 space-y-0.5 border-l-2 border-gray-200 ml-4 pl-3">
                      {grupo.items?.map((item) => {
                        const ItemIcon = item.icon
                        const isItemActive = activeSection === item.id
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => onSectionChange(item.id)}
                              className={`
                                block rounded-md px-3 py-1.5 text-sm w-full text-left flex items-center gap-2
                                ${isItemActive
                                  ? "bg-gray-200 font-medium text-gray-900"
                                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                }
                              `}
                            >
                              <ItemIcon className="h-4 w-4 opacity-70" />
                              {item.label}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </CollapsibleContent>
                )}
              </Collapsible>
            )
          })}
        </div>
      </nav>
      
      <footer className="border-t-0 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onSectionChange('sair')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <span className="text-xs">Sair</span>
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">Admin</div>
            <div className="text-[10px] text-gray-500">admin@sigweb.com</div>
          </div>
        </div>
      </footer>
    </aside>
  )
}