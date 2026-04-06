import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface OrdemServicoProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

interface OS {
  id: number;
  veiculo: string;
  placa: string;
  servico: string;
  status: 'aberta' | 'andamento' | 'esperando' | 'concluida';
  data: string;
  valor: number;
}

const initialOS: OS[] = [
  { id: 1, veiculo: 'Volkswagen Constellation', placa: 'ABC-1234', servico: 'Troca de óleo e filtros', status: 'andamento', data: '05/04/2026', valor: 450 },
  { id: 2, veiculo: 'Mercedes-Benz Axor', placa: 'XYZ-9876', servico: 'Revisão geral', status: 'esperando', data: '04/04/2026', valor: 1200 },
  { id: 3, veiculo: 'Ford Cargo', placa: 'DEF-5678', servico: 'Reparo freios', status: 'aberta', data: '05/04/2026', valor: 380 },
  { id: 4, veiculo: 'Scania R500', placa: 'GHI-4321', servico: 'Troca de pneus', status: 'concluida', data: '03/04/2026', valor: 2800 },
  { id: 5, veiculo: 'Volvo FH', placa: 'JKL-8765', servico: 'Diagnóstico motor', status: 'andamento', data: '04/04/2026', valor: 650 },
];

export const OrdemServicoPage: React.FC<OrdemServicoProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('ordem-servico');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [osList, setOsList] = useState<OS[]>(initialOS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'aberta' | 'andamento' | 'esperando' | 'concluida'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OS | null>(null);
  const [formData, setFormData] = useState({ veiculo: '', placa: '', servico: '', status: 'aberta' as OS['status'] });
  const itemsPerPage = 5;

  const filteredOS = useMemo(() => {
    return osList.filter(os => {
      const matchesSearch = 
        os.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.placa.includes(searchTerm) ||
        os.servico.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || os.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [osList, searchTerm, filterStatus]);

  const paginatedOS = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOS.slice(start, start + itemsPerPage);
  }, [filteredOS, currentPage]);

  const getStatusBadge = (status: OS['status']) => {
    switch (status) {
      case 'aberta': return 'bg-blue-100 text-blue-700';
      case 'andamento': return 'bg-yellow-100 text-yellow-700';
      case 'esperando': return 'bg-orange-100 text-orange-700';
      case 'concluida': return 'bg-green-100 text-green-700';
    }
  };

  const getStatusLabel = (status: OS['status']) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'andamento': return 'Em Andamento';
      case 'esperando': return 'Aguardando Peças';
      case 'concluida': return 'Concluída';
    }
  };

  const handleAdd = () => {
    setEditingOS(null);
    setFormData({ veiculo: '', placa: '', servico: '', status: 'aberta' });
    setIsModalOpen(true);
  };

  const handleEdit = (os: OS) => {
    setEditingOS(os);
    setFormData({ veiculo: os.veiculo, placa: os.placa, servico: os.servico, status: os.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Deseja realmente excluir esta OS?')) {
      setOsList(prev => prev.filter(os => os.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.veiculo || !formData.placa || !formData.servico) {
      alert('Preencha todos os campos');
      return;
    }

    if (editingOS) {
      setOsList(prev => prev.map(os => os.id === editingOS.id ? { ...os, ...formData } : os));
    } else {
      const newOS: OS = {
        id: Date.now(),
        ...formData,
        data: new Date().toLocaleDateString('pt-BR'),
        valor: 0
      };
      setOsList(prev => [newOS, ...prev]);
    }
    setIsModalOpen(false);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer" onClick={() => setActiveSection('oficina-dashboard')}>Oficina</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Ordem de Serviço</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Ordens de Serviço</h1>
        <p className="text-[#555f70] text-sm">Gerenciamento de ordens de serviço da oficina.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">filter_list</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
            >
              <option value="all">Todos</option>
              <option value="aberta">Aberta</option>
              <option value="andamento">Em Andamento</option>
              <option value="esperando">Aguardando Peças</option>
              <option value="concluida">Concluída</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Nova OS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Veículo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Placa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Serviço</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedOS.map((os) => (
                <tr key={os.id} className="hover:bg-[#f8f9fa]">
                  <td className="px-4 py-4 text-sm font-medium text-[#191c1d]">#{os.id}</td>
                  <td className="px-4 py-4 text-sm text-[#555f70]">{os.veiculo}</td>
                  <td className="px-4 py-4 text-sm text-[#555f70] font-mono">{os.placa}</td>
                  <td className="px-4 py-4 text-sm text-[#555f70]">{os.servico}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(os.status)}`}>
                      {getStatusLabel(os.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#555f70]">{os.data}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(os)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(os.id)} className="p-1.5 transition-colors text-[#555f70] hover:text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedOS.length === 0 && (
            <div className="px-6 py-8 text-center text-[#555f70]">
              Nenhuma ordem de serviço encontrada
            </div>
          )}
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedOS.length} de {filteredOS.length} registros</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="p-1 rounded hover:bg-[#e7e8e9] transition-colors text-[#555f70]"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: Math.ceil(filteredOS.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded cursor-pointer ${
                  currentPage === page 
                    ? 'bg-[#006e2d] text-white' 
                    : 'hover:bg-[#e7e8e9]'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredOS.length / itemsPerPage), currentPage + 1))}
              className="p-1 rounded hover:bg-[#e7e8e9] transition-colors text-[#555f70]"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#191c1d]">{editingOS ? 'Editar OS' : 'Nova OS'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Veículo</label>
                <input
                  type="text"
                  value={formData.veiculo}
                  onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm"
                  placeholder="Digite o veículo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Placa</label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm"
                  placeholder="Digite a placa"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Serviço</label>
                <input
                  type="text"
                  value={formData.servico}
                  onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm"
                  placeholder="Digite o serviço"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as OS['status'] })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
                >
                  <option value="aberta">Aberta</option>
                  <option value="andamento">Em Andamento</option>
                  <option value="esperando">Aguardando Peças</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-[#bccbb9] transition-colors text-[#191c1d] text-sm font-semibold rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-[#006e2d] hover:bg-[#005a26] text-white text-sm font-semibold rounded-md"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection} 
      onLogout={() => setShowLogoutModal(true)} 
      showLogoutModal={showLogoutModal} 
      onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} 
      onCancelLogout={() => setShowLogoutModal(false)}
    >
      {content}
    </MainLayout>
  );
};