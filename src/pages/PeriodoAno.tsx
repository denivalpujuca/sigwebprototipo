import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface PeriodoAno {
  id: number;
  periodoAno: string;
  mes: number;
  ano: number;
  diasUteisSemana: number;
  sabadosUteis: number;
  status: 'ABERTO' | 'FECHADO';
}

const initialPeriodos: PeriodoAno[] = [
  { id: 1, periodoAno: '01/2026', mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4, status: 'ABERTO' },
  { id: 2, periodoAno: '02/2026', mes: 2, ano: 2026, diasUteisSemana: 20, sabadosUteis: 4, status: 'ABERTO' },
  { id: 3, periodoAno: '03/2026', mes: 3, ano: 2026, diasUteisSemana: 22, sabadosUteis: 5, status: 'ABERTO' },
  { id: 4, periodoAno: '04/2026', mes: 4, ano: 2026, diasUteisSemana: 21, sabadosUteis: 4, status: 'FECHADO' },
  { id: 5, periodoAno: '01/2025', mes: 1, ano: 2025, diasUteisSemana: 22, sabadosUteis: 4, status: 'FECHADO' },
  { id: 6, periodoAno: '02/2025', mes: 2, ano: 2025, diasUteisSemana: 20, sabadosUteis: 4, status: 'FECHADO' },
];

interface PeriodoAnoProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const PeriodoAnoPage: React.FC<PeriodoAnoProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [periodos, setPeriodos] = useState<PeriodoAno[]>(initialPeriodos);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAno, setFilterAno] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoAno | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ periodoAno: '', mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4 });
  const itemsPerPage = 5;

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Períodos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #191c1d; margin-bottom: 10px; }
            p { color: #555f70; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f5; }
          </style>
        </head>
        <body>
          <h1>Relatório de Períodos do Ano</h1>
          <p>Total de registros: ${filteredPeriodos.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Período</th><th>Mês</th><th>Ano</th><th>Dias Úteis</th><th>Sábados Úteis</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPeriodos.map(p => `
                <tr>
                  <td>${p.id}</td><td>${p.periodoAno}</td><td>${p.mes}</td><td>${p.ano}</td><td>${p.diasUteisSemana}</td><td>${p.sabadosUteis}</td><td>${p.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    printFrame.contentWindow?.document.write(content);
    printFrame.contentWindow?.document.close();
  };

  const anos = useMemo(() => {
    const uniqueAnos = [...new Set(periodos.map(p => p.ano))];
    return uniqueAnos.sort((a, b) => b - a);
  }, [periodos]);

  const filteredPeriodos = useMemo(() => {
    return periodos.filter(periodo => {
      const matchesSearch = periodo.periodoAno.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAno = filterAno === 'all' || periodo.ano === Number(filterAno);
      return matchesSearch && matchesAno;
    });
  }, [periodos, searchTerm, filterAno]);

  const paginatedPeriodos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPeriodos.slice(start, start + itemsPerPage);
  }, [filteredPeriodos, currentPage]);

  const totalPages = Math.ceil(filteredPeriodos.length / itemsPerPage);

  const handleSave = () => {
    const periodoAnoStr = `${String(formData.mes).padStart(2, '0')}/${formData.ano}`;
    
    if (editingPeriodo) {
      setPeriodos(prev => prev.map(p => p.id === editingPeriodo.id ? { ...formData, periodoAno: periodoAnoStr, id: editingPeriodo.id, status: editingPeriodo.status } : p));
    } else {
      const newId = Math.max(...periodos.map(p => p.id), 0) + 1;
      setPeriodos(prev => [...prev, { ...formData, periodoAno: periodoAnoStr, id: newId, status: 'ABERTO' as const }]);
    }
    setIsModalOpen(false);
    setEditingPeriodo(null);
    setFormData({ periodoAno: '', mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4 });
  };

  const handleEdit = (periodo: PeriodoAno) => {
    setEditingPeriodo(periodo);
    setFormData({ periodoAno: periodo.periodoAno, mes: periodo.mes, ano: periodo.ano, diasUteisSemana: periodo.diasUteisSemana, sabadosUteis: periodo.sabadosUteis });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleStatus = (id: number) => {
    setPeriodos(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'ABERTO' ? 'FECHADO' : 'ABERTO' } : p));
    setOpenMenuId(null);
  };

  const handleGerarLancamentoUrbano = (id: number) => {
    alert(`Gerar Lançamentos Res. Urbano para período ${id}`);
    setOpenMenuId(null);
  };

  const handleGerarLancamentoMTR = (id: number) => {
    alert(`Gerar Lançamento MTR para período ${id}`);
    setOpenMenuId(null);
  };

  const handleAdd = () => {
    setEditingPeriodo(null);
    setFormData({ periodoAno: '', mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4 });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'FECHADO':
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
        <span className="hover:text-[#006e2d] cursor-pointer">Administrativo</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Período Ano</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Período Ano</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de períodos do ano.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 flex-1 max-w-2xl">
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ABERTOS</span>
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {periodos.filter(p => p.status === 'ABERTO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Abertos</div>
              </div>
            </div>
            <div className="bg-[#555f70] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#555f70]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">FECHADOS</span>
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {periodos.filter(p => p.status === 'FECHADO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Fechados</div>
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
              placeholder="Pesquisar período (MM/AAAA)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-[#006e2d] text-white rounded-md hover:bg-[#005a26] flex items-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="relative">
            <select
              value={filterAno}
              onChange={(e) => setFilterAno(e.target.value)}
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Anos</option>
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-white border border-gray-300 text-[#555f70] rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Gerar PDF
        </button>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Período</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Dias Úteis Semana</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Sábados Úteis</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedPeriodos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedPeriodos.map(periodo => (
                  <tr key={periodo.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{periodo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold font-mono text-[#191c1d]">{periodo.periodoAno}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-[#191c1d]">{periodo.diasUteisSemana}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-[#191c1d]">{periodo.sabadosUteis}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(periodo.status)}`}>
                        {periodo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === periodo.id ? null : periodo.id)}
                          className="p-2 text-[#555f70] hover:text-[#191c1d] hover:bg-[#f3f4f5] rounded-md transition-colors"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {openMenuId === periodo.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[220px]">
                            <button 
                              onClick={() => handleEdit(periodo)}
                              className="w-full px-4 py-2 text-left text-sm text-[#191c1d] hover:bg-[#f3f4f5] flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                              Editar
                            </button>
                            <button 
                              onClick={() => handleGerarLancamentoUrbano(periodo.id)}
                              className="w-full px-4 py-2 text-left text-sm text-[#191c1d] hover:bg-[#f3f4f5] flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-lg">location_city</span>
                              Gerar Lançamentos Res. Urbano
                            </button>
                            <button 
                              onClick={() => handleGerarLancamentoMTR(periodo.id)}
                              className="w-full px-4 py-2 text-left text-sm text-[#191c1d] hover:bg-[#f3f4f5] flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-lg">local_shipping</span>
                              Gerar Lançamento MTR
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                              onClick={() => handleToggleStatus(periodo.id)}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-[#f3f4f5] flex items-center gap-2 ${periodo.status === 'ABERTO' ? 'text-[#ba1a1a]' : 'text-[#006e2d]'}`}
                            >
                              <span className="material-symbols-outlined text-lg">{periodo.status === 'ABERTO' ? 'lock' : 'lock_open'}</span>
                              {periodo.status === 'ABERTO' ? 'Fechar Período' : 'Abrir Período'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedPeriodos.length} de {filteredPeriodos.length} registros</span>
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
              <h2 className="text-lg font-bold text-[#191c1d]">{editingPeriodo ? 'Editar Período' : 'Novo Período'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              {editingPeriodo && (
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Período (MM/AAAA)</label>
                  <input type="text" value={formData.periodoAno} onChange={(e) => setFormData({ ...formData, periodoAno: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm font-mono" placeholder="01/2026" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Mês</label>
                  <select value={formData.mes} onChange={(e) => setFormData({ ...formData, mes: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                    <option value={1}>Janeiro</option>
                    <option value={2}>Fevereiro</option>
                    <option value={3}>Março</option>
                    <option value={4}>Abril</option>
                    <option value={5}>Maio</option>
                    <option value={6}>Junho</option>
                    <option value={7}>Julho</option>
                    <option value={8}>Agosto</option>
                    <option value={9}>Setembro</option>
                    <option value={10}>Outubro</option>
                    <option value={11}>Novembro</option>
                    <option value={12}>Dezembro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Ano</label>
                  <select value={formData.ano} onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Dias Úteis Semana</label>
                  <input type="number" min="0" max="31" value={formData.diasUteisSemana} onChange={(e) => setFormData({ ...formData, diasUteisSemana: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Sábados Úteis</label>
                  <input type="number" min="0" max="5" value={formData.sabadosUteis} onChange={(e) => setFormData({ ...formData, sabadosUteis: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
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

      {openMenuId !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenuId(null)}></div>
      )}
    </>
  );

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={() => setShowLogoutModal(true)} showLogoutModal={showLogoutModal} onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} onCancelLogout={() => setShowLogoutModal(false)}>
      {content}
    </MainLayout>
  );
};