import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../components/Icon';

interface AbastecimentoProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
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

export const AbastecimentoPage: React.FC<AbastecimentoProps> = () => {
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    window.location.reload();
  };

  const [horaAtual, setHoraAtual] = useState(() => new Date().toLocaleTimeString('pt-BR'));

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#006e2d] to-[#44c365] rounded flex items-center justify-center text-white font-bold text-sm">SW</div>
          <div>
            <span className="font-bold text-[#1C1C1E]">SigWeb Prototipo</span>
            <span className="text-xs text-[#555f70] ml-2">Abastecimento</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-[#1C1C1E]">{horaAtual}</div>
            <div className="text-xs text-[#555f70]">{new Date().toLocaleDateString('pt-BR')}</div>
          </div>
          <button onClick={handleLogout} className="p-2 text-[#8E8E93] hover:bg-gray-100 rounded-lg">
            <MaterialIcon name="logout" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-[1200px] mx-auto">
        {/* Status Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="absolute top-3 right-3">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-medium">
              {dashboardData.status.status}
            </span>
          </div>
          <div className="pr-20">
            <h2 className="text-sm font-semibold text-[#8E8E93] mb-2">Status Atual</h2>
            <div className="space-y-1">
              <p className="text-sm text-[#1C1C1E]"><span className="font-medium">Atividade:</span> {dashboardData.status.atividade}</p>
              <p className="text-sm text-[#1C1C1E]"><span className="font-medium">Veículo:</span> {dashboardData.status.veiculo}</p>
              <p className="text-xs text-[#8E8E93]">{dashboardData.status.descricao}</p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-4">
          <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Ações Rápidas</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dashboardData.actions.map((action) => (
              <div 
                key={action.id}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative"
              >
                {action.badge && (
                  <span className="absolute top-3 right-3 bg-[#5B5FEF] text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    {action.badge}
                  </span>
                )}
                
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${iconColors[action.color]}`}>
                  <span className="material-symbols-outlined text-lg">{action.icon}</span>
                </div>
                
                <h3 className="font-semibold text-sm text-[#1C1C1E] pr-16">{action.title}</h3>
                <p className="text-xs text-[#8E8E93] mt-1">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sair Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto h-12 px-6 bg-[#5B5FEF] text-white rounded-lg font-medium hover:bg-[#4a4cd6] transition-colors flex items-center justify-center gap-2"
          >
            <MaterialIcon name="logout" />
            Sair
          </button>
        </div>
      </main>
    </div>
  );
};