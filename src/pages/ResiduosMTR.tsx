import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface ResiduoMTR {
  id: number;
  codigo: string;
  residuo: string;
  classe: string;
  quantidade: number;
  unidade: string;
  transportador: string;
  dataEmissao: string;
  status: 'EMITIDO' | 'TRANSPORTADO' | 'RECEBIDO' | 'CANCELADO';
}

const initialMTRs: ResiduoMTR[] = [
  { id: 1, codigo: 'MTR-001/2026', residuo: 'Óleo Usado', classe: 'Classe I', quantidade: 200, unidade: 'L', transportador: 'Transp. Omega', dataEmissao: '2026-04-01', status: 'RECEBIDO' },
  { id: 2, codigo: 'MTR-002/2026', residuo: 'Bateria', classe: 'Classe II', quantidade: 50, unidade: 'un', transportador: 'Transp. Delta', dataEmissao: '2026-04-02', status: 'TRANSPORTADO' },
  { id: 3, codigo: 'MTR-003/2026', residuo: 'Resíduo Hospitalar', classe: 'Classe I', quantidade: 30, unidade: 'kg', transportador: 'Transp. Omega', dataEmissao: '2026-04-03', status: 'EMITIDO' },
  { id: 4, codigo: 'MTR-004/2026', residuo: 'Lodo de ETA', classe: 'Classe II', quantidade: 500, unidade: 'kg', transportador: 'Transp. Beta', dataEmissao: '2026-03-28', status: 'CANCELADO' },
  { id: 5, codigo: 'MTR-005/2026', residuo: 'Tonner Usado', classe: 'Classe II', quantidade: 10, unidade: 'un', transportador: 'Transp. Delta', dataEmissao: '2026-04-04', status: 'EMITIDO' },
];

interface ResiduosMTRProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const ResiduosMTRPage: React.FC<ResiduosMTRProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [mtrs, setMtrs] = useState<ResiduoMTR[]>(initialMTRs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMtr, setEditingMtr] = useState<ResiduoMTR | null>(null);
  const [formData, setFormData] = useState({ codigo: '', residuo: '', classe: '', quantidade: 0, unidade: 'kg', transportador: '', dataEmissao: '', status: 'EMITIDO' as ResiduoMTR['status'] });
  const itemsPerPage = 5;

  const filteredMtrs = useMemo(() => {
    return mtrs.filter(mtr => {
      const matchesSearch = mtr.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mtr.residuo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mtr.transportador.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || mtr.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [mtrs, searchTerm, filterStatus]);

  const paginatedMtrs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMtrs.slice(start, start + itemsPerPage);
  }, [filteredMtrs, currentPage]);

  const totalPages = Math.ceil(filteredMtrs.length / itemsPerPage);

  const handleSave = () => {
    const novoCodigo = editingMtr 
      ? editingMtr.codigo 
      : `MTR-${String(mtrs.length + 1).padStart(3, '0')}/2026`;
    
    const mtrData = { ...formData, codigo: novoCodigo };
    
    if (editingMtr) {
      setMtrs(prev => prev.map(m => m.id === editingMtr.id ? { ...mtrData, id: editingMtr.id } : m));
    } else {
      const newId = Math.max(...mtrs.map(m => m.id), 0) + 1;
      setMtrs(prev => [...prev, { ...mtrData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingMtr(null);
    setFormData({ codigo: '', residuo: '', classe: '', quantidade: 0, unidade: 'kg', transportador: '', dataEmissao: '', status: 'EMITIDO' });
  };

  const handleEdit = (mtr: ResiduoMTR) => {
    setEditingMtr(mtr);
    setFormData({ codigo: mtr.codigo, residuo: mtr.residuo, classe: mtr.classe, quantidade: mtr.quantidade, unidade: mtr.unidade, transportador: mtr.transportador, dataEmissao: mtr.dataEmissao, status: mtr.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setMtrs(prev => prev.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    setEditingMtr(null);
    setFormData({ codigo: '', residuo: '', classe: '', quantidade: 0, unidade: 'kg', transportador: '', dataEmissao: '', status: 'EMITIDO' });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EMITIDO':
        return 'bg-[#bae3ff] text-[#003366]';
      case 'TRANSPORTADO':
        return 'bg-[#ffe4b3] text-[#663c00]';
      case 'RECEBIDO':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'CANCELADO':
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
        <span className="text-[#191c1d]">Resíduos MTR</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Resíduos MTR</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de Manifesto de Transporte de Resíduos.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            <div className="bg-[#005ac2] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#005ac2]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">EMITIDOS</span>
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {mtrs.filter(m => m.status === 'EMITIDO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Documentos</div>
              </div>
            </div>
            <div className="bg-[#f59e0b] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#f59e0b]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">TRANSPORTADOS</span>
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {mtrs.filter(m => m.status === 'TRANSPORTADO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Em Trânsito</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">RECEBIDOS</span>
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {mtrs.filter(m => m.status === 'RECEBIDO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Concluídos</div>
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
              placeholder="Pesquisar MTR"
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
              <option value="EMITIDO">Emitido</option>
              <option value="TRANSPORTADO">Transportado</option>
              <option value="RECEBIDO">Recebido</option>
              <option value="CANCELADO">Cancelado</option>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Código</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Resíduo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Classe</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-right">Quantidade</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Transportador</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Data Emissão</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedMtrs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedMtrs.map(mtr => (
                  <tr key={mtr.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold font-mono text-[#191c1d]">{mtr.codigo}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#191c1d]">{mtr.residuo}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{mtr.classe}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-[#191c1d]">{mtr.quantidade} {mtr.unidade}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{mtr.transportador}</td>
                    <td className="px-4 py-4 text-center text-sm text-[#555f70]">
                      {new Date(mtr.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(mtr.status)}`}>
                        {mtr.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(mtr)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(mtr.id)} className="p-1.5 text-[#555f70] hover:text-[#ba1a1a] transition-colors">
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedMtrs.length} de {filteredMtrs.length} registros</span>
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
              <h2 className="text-lg font-bold text-[#191c1d]">{editingMtr ? 'Editar MTR' : 'Novo MTR'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              {editingMtr && (
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Código</label>
                  <input type="text" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Resíduo</label>
                <input type="text" value={formData.residuo} onChange={(e) => setFormData({ ...formData, residuo: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Classe</label>
                <select value={formData.classe} onChange={(e) => setFormData({ ...formData, classe: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required>
                  <option value="">Selecione</option>
                  <option value="Classe I">Classe I - Perigoso</option>
                  <option value="Classe II">Classe II - Não Perigoso</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Quantidade</label>
                  <input type="number" value={formData.quantidade} onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Unidade</label>
                  <select value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="un">un</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Transportador</label>
                <input type="text" value={formData.transportador} onChange={(e) => setFormData({ ...formData, transportador: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Data Emissão</label>
                  <input type="date" value={formData.dataEmissao} onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ResiduoMTR['status'] })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                    <option value="EMITIDO">Emitido</option>
                    <option value="TRANSPORTADO">Transportado</option>
                    <option value="RECEBIDO">Recebido</option>
                    <option value="CANCELADO">Cancelado</option>
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