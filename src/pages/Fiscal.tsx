import { useState } from 'react';
import { MaterialIcon } from '../components/Icon';

interface FiscalProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
  foto?: string;
  status: 'presente' | 'ausente' | 'afastado';
}

const funcionarios: Funcionario[] = [
  { id: 1, nome: 'Ricardo Mendes', cargo: 'Diretor', status: 'presente' },
  { id: 2, nome: 'João Silva', cargo: 'Motorista', status: 'presente' },
  { id: 3, nome: 'Maria Santos', cargo: 'Assistente', status: 'presente' },
  { id: 4, nome: 'Pedro Oliveira', cargo: 'Mecânico', status: 'ausente' },
  { id: 5, nome: 'Ana Costa', cargo: 'Técnica T.I.', status: 'presente' },
  { id: 6, nome: 'Carlos Souza', cargo: 'Motorista', status: 'presente' },
  { id: 7, nome: 'Juliana Lima', cargo: 'Assistente', status: 'afastado' },
  { id: 8, nome: 'Roberto Alves', cargo: 'Motorista', status: 'presente' },
];

export const FiscalPage: React.FC<FiscalProps> = ({ activeSection: _activeSection, onSectionChange: _onSectionChange }) => {
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    window.location.reload();
  };

  const [dataAtual] = useState(new Date().toLocaleDateString('pt-BR'));
  const [horaAtual, setHoraAtual] = useState(new Date().toLocaleTimeString('pt-BR'));
  const [funcionariosList, setFuncionariosList] = useState(funcionarios);

  setInterval(() => {
    setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
  }, 1000);

  const toggleStatus = (id: number) => {
    setFuncionariosList(prev => prev.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === 'presente' ? 'ausente' : 'presente';
        return { ...f, status: nextStatus };
      }
      return f;
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'presente':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'ausente':
        return 'bg-[#ffdad6] text-[#93000a]';
      case 'afastado':
        return 'bg-[#ffe4b3] text-[#663c00]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const presentes = funcionariosList.filter(f => f.status === 'presente').length;
  const ausentes = funcionariosList.filter(f => f.status === 'ausente').length;
  const afastados = funcionariosList.filter(f => f.status === 'afastado').length;

  return (
    <div className="min-h-screen bg-[#f3f4f5]">
      <header className="bg-[#2e3132] text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#006e2d] to-[#44c365] rounded-lg flex items-center justify-center font-bold">SW</div>
            <div>
              <h1 className="text-lg font-bold">SigWeb Prototipo</h1>
              <span className="text-xs text-slate-400">Fiscal - Controle de Chamada</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">{horaAtual}</div>
              <div className="text-xs text-slate-400">{dataAtual}</div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MaterialIcon name="logout" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl shadow-lg">
            <div className="text-[11px] font-bold tracking-widest opacity-80 mb-2">PRESENTES</div>
            <div className="text-4xl font-extrabold">{presentes}</div>
            <div className="text-xs opacity-80">funcionários</div>
          </div>
          <div className="bg-[#ba1a1a] text-white p-6 rounded-xl shadow-lg">
            <div className="text-[11px] font-bold tracking-widest opacity-80 mb-2">AUSENTES</div>
            <div className="text-4xl font-extrabold">{ausentes}</div>
            <div className="text-xs opacity-80">funcionários</div>
          </div>
          <div className="bg-[#f59e0b] text-white p-6 rounded-xl shadow-lg">
            <div className="text-[11px] font-bold tracking-widest opacity-80 mb-2">AFASTADOS</div>
            <div className="text-4xl font-extrabold">{afastados}</div>
            <div className="text-xs opacity-80">funcionários</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-[11px] font-bold tracking-widest text-[#555f70] mb-2">TOTAL</div>
            <div className="text-4xl font-extrabold text-[#191c1d]">{funcionariosList.length}</div>
            <div className="text-xs text-[#555f70]">funcionários</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#191c1d]">Lista de Funcionários</h2>
            <p className="text-sm text-[#555f70]">Clique no botão para marcar presença/ausência</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {funcionariosList.map(funcionario => (
              <div
                key={funcionario.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  funcionario.status === 'presente' 
                    ? 'border-[#006e2d] bg-[#006e2d]/5' 
                    : funcionario.status === 'ausente'
                    ? 'border-[#ba1a1a] bg-[#ba1a1a]/5'
                    : 'border-[#f59e0b] bg-[#f59e0b]/5'
                }`}
                onClick={() => toggleStatus(funcionario.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006e2d] to-[#44c365] flex items-center justify-center text-white font-bold">
                    {funcionario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-[#191c1d]">{funcionario.nome}</div>
                    <div className="text-xs text-[#555f70]">{funcionario.cargo}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(funcionario.status)}`}>
                    {funcionario.status.toUpperCase()}
                  </span>
                  <button className={`p-2 rounded-full ${
                    funcionario.status === 'presente' ? 'bg-[#006e2d] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <span className="material-symbols-outlined text-lg">
                      {funcionario.status === 'presente' ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};