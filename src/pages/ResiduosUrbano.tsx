import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface ResiduoUrbano {
  id: number;
  tipo: string;
  descricao: string;
  origem: string;
  volume: number;
  unidade: string;
  dataColeta: string;
  status: 'COLETADO' | 'PENDENTE' | 'ATRASADO';
}

const initialResiduos: ResiduoUrbano[] = [
  { id: 1, tipo: 'Orgânico', descricao: 'Resíduos de origem vegetal', origem: 'Parques', volume: 500, unidade: 'kg', dataColeta: '2026-04-01', status: 'COLETADO' },
  { id: 2, tipo: 'Reciclável', descricao: 'Papel, plástico, vidro', origem: 'Escolas', volume: 200, unidade: 'kg', dataColeta: '2026-04-02', status: 'COLETADO' },
  { id: 3, tipo: 'Orgânico', descricao: 'Resíduos de origem vegetal', origem: 'Mercados', volume: 800, unidade: 'kg', dataColeta: '2026-04-03', status: 'PENDENTE' },
  { id: 4, tipo: 'Rejeito', descricao: 'Resíduo não reciclável', origem: 'Postos de Saúde', volume: 50, unidade: 'kg', dataColeta: '2026-03-28', status: 'ATRASADO' },
  { id: 5, tipo: 'Reciclável', descricao: 'Papel, plástico, vidro', origem: 'Terminal', volume: 150, unidade: 'kg', dataColeta: '2026-04-04', status: 'PENDENTE' },
];

interface ResiduosUrbanoProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const ResiduosUrbanoPage: React.FC<ResiduosUrbanoProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [residuos, setResiduos] = useState<ResiduoUrbano[]>(initialResiduos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResiduo, setEditingResiduo] = useState<ResiduoUrbano | null>(null);
  const [formData, setFormData] = useState({ tipo: '', descricao: '', origem: '', volume: 0, unidade: 'kg', dataColeta: '', status: 'PENDENTE' as ResiduoUrbano['status'] });
  const itemsPerPage = 5;

  const filteredResiduos = useMemo(() => {
    return residuos.filter(residuo => {
      const matchesSearch = residuo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residuo.origem.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || residuo.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [residuos, searchTerm, filterStatus]);

  const paginatedResiduos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResiduos.slice(start, start + itemsPerPage);
  }, [filteredResiduos, currentPage]);

  const totalPages = Math.ceil(filteredResiduos.length / itemsPerPage);

  const handleSave = () => {
    if (editingResiduo) {
      setResiduos(prev => prev.map(r => r.id === editingResiduo.id ? { ...formData, id: editingResiduo.id } : r));
    } else {
      const newId = Math.max(...residuos.map(r => r.id), 0) + 1;
      setResiduos(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingResiduo(null);
    setFormData({ tipo: '', descricao: '', origem: '', volume: 0, unidade: 'kg', dataColeta: '', status: 'PENDENTE' });
  };

  const handleEdit = (residuo: ResiduoUrbano) => {
    setEditingResiduo(residuo);
    setFormData({ tipo: residuo.tipo, descricao: residuo.descricao, origem: residuo.origem, volume: residuo.volume, unidade: residuo.unidade, dataColeta: residuo.dataColeta, status: residuo.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setResiduos(prev => prev.filter(r => r.id !== id));
  };

  const handleAdd = () => {
    setEditingResiduo(null);
    setFormData({ tipo: '', descricao: '', origem: '', volume: 0, unidade: 'kg', dataColeta: '', status: 'PENDENTE' });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COLETADO':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'PENDENTE':
        return 'bg-[#ffe4b3] text-[#663c00]';
      case 'ATRASADO':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Resíduos</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Resíduos Urbano</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Resíduos Urbano</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de resíduos urbanos.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">COLETADOS</span>
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {residuos.filter(r => r.status === 'COLETADO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Registros</div>
              </div>
            </div>
            <div className="bg-[#f59e0b] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#f59e0b]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">PENDENTES</span>
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {residuos.filter(r => r.status === 'PENDENTE').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">A Collectar</div>
              </div>
            </div>
            <div className="bg-[#ba1a1a] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#ba1a1a]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ATRASADOS</span>
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {residuos.filter(r => r.status === 'ATRASADO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Em Atraso</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar resíduo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="COLETADO">Coletado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATRASADO">Atrasado</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Origem</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-right">Volume</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Data Coleta</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedResiduos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedResiduos.map(residuo => (
                  <tr key={residuo.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{residuo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{residuo.tipo}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{residuo.descricao}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{residuo.origem}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-[#191c1d]">{residuo.volume} {residuo.unidade}</td>
                    <td className="px-4 py-4 text-center text-sm text-[#555f70]">
                      {new Date(residuo.dataColeta).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(residuo.status)}`}>
                        {residuo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(residuo)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(residuo.id)} className="p-1.5 text-[#555f70] hover:text-[#ba1a1a] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedResiduos.length} de {filteredResiduos.length} registros</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-[#006e2d] text-white' : 'hover:bg-[#e7e8e9]'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingResiduo ? 'Editar Resíduo' : 'Novo Resíduo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Tipo</label>
                <input type="text" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Descrição</label>
                <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" rows={2} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Origem</label>
                <input type="text" value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Volume</label>
                  <input type="number" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Unidade</label>
                  <select value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="m3">m³</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Data Coleta</label>
                  <input type="date" value={formData.dataColeta} onChange={(e) => setFormData({ ...formData, dataColeta: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ResiduoUrbano['status'] })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                    <option value="PENDENTE">Pendente</option>
                    <option value="COLETADO">Coletado</option>
                    <option value="ATRASADO">Atrasado</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">save</span>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={() => setShowLogoutModal(true)} showLogoutModal={showLogoutModal} onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} onCancelLogout={() => setShowLogoutModal(false)}>
      {content}
    </MainLayout>
  );
};