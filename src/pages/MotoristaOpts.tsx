import { useState } from 'react';

interface MotoristaOptsProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

const dashboardData = {
  status: {
    atividade: 'Limpeza pública',
    veiculo: 'CTB001 - LWO-3915',
    descricao: 'CAM. BASC. M. BENZ 1319',
    status: 'Em Rota'
  },
  actions: [
    { 
      id: 1,
      title: 'Registrar Fotos', 
      description: 'Tire fotos das atividades executadas', 
      icon: 'photo_camera', 
      color: 'purple',
      badge: null
    },
    { 
      id: 2,
      title: 'Solicitar Abastecimento', 
      description: 'Envie uma solicitação para aprovação.', 
      icon: 'local_gas_station', 
      color: 'yellow',
      badge: 'Solicitado'
    },
    { 
      id: 3,
      title: 'Devolver Veículo', 
      description: 'Inicie o processo de devolução do veículo ao pátio.', 
      icon: 'directions_car', 
      color: 'blue',
      badge: null
    },
    { 
      id: 4,
      title: 'Prestar Contas', 
      description: 'Registre os detalhes dos abastecimentos realizados.', 
      icon: 'payments', 
      color: 'green',
      badge: null
    }
  ]
};

const iconColors: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600'
};

const menuItems = [
  { id: 'inicio', label: 'Início', icon: 'home' },
  { id: 'tarefas', label: 'Tarefas', icon: 'assignment', active: true },
  { id: 'veiculo', label: 'Veículo', icon: 'directions_car' },
  { id: 'perfil', label: 'Perfil', icon: 'person' },
];

export const MotoristaOptsPage: React.FC<MotoristaOptsProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('tarefas');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Mobile Header */}
      <header className="lg:hidden h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-[#8E8E93] hover:bg-gray-100 rounded-lg"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        <h1 className="text-base font-semibold text-[#1C1C1E]">Opções do Motorista</h1>
        
        <button className="p-2 text-[#8E8E93] hover:bg-gray-100 rounded-lg">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Drawer on mobile, fixed on desktop */}
      <aside className={`
        lg:w-[220px] lg:fixed lg:left-0 lg:top-0 lg:h-screen
        fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-gray-200 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#006e2d] to-[#44c365] rounded flex items-center justify-center text-white font-bold text-sm">FE</div>
            <span className="font-bold text-[#1C1C1E]">SigWeb</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#8E8E93]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    item.active || activeMenu === item.id
                      ? 'bg-indigo-50 text-[#5B5FEF]'
                      : 'text-[#8E8E93] hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-[220px]">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-gray-200 px-6 items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-[#1C1C1E]">Opções do Motorista</h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#8E8E93] hover:bg-gray-100 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5B5FEF] text-white flex items-center justify-center text-sm font-medium">
                JS
              </div>
              <span className="text-sm font-medium text-[#1C1C1E]">João Silva</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6 max-w-[1200px] mx-auto">
          {/* Status Card */}
          <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#8E8E93] mb-2 lg:mb-3">Status Atual</h2>
                <div className="space-y-1">
                  <p className="text-sm text-[#1C1C1E]"><span className="font-medium">Atividade:</span> {dashboardData.status.atividade}</p>
                  <p className="text-sm text-[#1C1C1E]"><span className="font-medium">Veículo:</span> {dashboardData.status.veiculo}</p>
                  <p className="text-xs lg:text-sm text-[#8E8E93]">{dashboardData.status.descricao}</p>
                </div>
              </div>
              <div className="self-start sm:self-center">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium">
                  {dashboardData.status.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="mt-4 lg:mt-6">
            <h2 className="text-base lg:text-lg font-semibold text-[#1C1C1E] mb-3 lg:mb-4">Ações Rápidas</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {dashboardData.actions.map((action) => (
                <div 
                  key={action.id}
                  className="bg-white p-4 lg:p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative"
                >
                  {action.badge && (
                    <span className="absolute top-2 right-2 lg:top-3 lg:right-3 bg-[#5B5FEF] text-white text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-full">
                      {action.badge}
                    </span>
                  )}
                  
                  <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center mb-2 lg:mb-3 ${iconColors[action.color]}`}>
                    <span className="material-symbols-outlined text-lg lg:text-xl">{action.icon}</span>
                  </div>
                  
                  <h3 className="font-semibold text-sm lg:text-base text-[#1C1C1E]">{action.title}</h3>
                  <p className="text-xs lg:text-sm text-[#8E8E93] mt-1">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sair Button */}
          <div className="mt-6 lg:mt-8 flex justify-end">
            <button
              onClick={onLogout}
              className="w-full sm:w-auto h-12 lg:h-12 px-6 bg-[#5B5FEF] text-white rounded-lg font-medium hover:bg-[#4a4cd6] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">logout</span>
              Sair
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};