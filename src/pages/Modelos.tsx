import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Modelo {
  id: number;
  marcaId: number;
  marca: string;
  nome: string;
  ativo: boolean;
}

const initialModelos: Modelo[] = [
  { id: 1, marcaId: 1, marca: 'SCANIA', nome: 'R 420', ativo: true },
  { id: 2, marcaId: 1, marca: 'SCANIA', nome: 'G 440', ativo: true },
  { id: 3, marcaId: 2, marca: 'VOLVO', nome: 'FH 440', ativo: true },
  { id: 4, marcaId: 2, marca: 'VOLVO', nome: 'FMX 460', ativo: true },
  { id: 5, marcaId: 3, marca: 'MERCEDES', nome: 'AXOR 1844', ativo: true },
  { id: 6, marcaId: 3, marca: 'MERCEDES', nome: 'Atego 1418', ativo: true },
  { id: 7, marcaId: 4, marca: 'FORD', nome: 'Cargo 2629', ativo: true },
  { id: 8, marcaId: 5, marca: 'IVECO', nome: 'Stralis AS440', ativo: true },
  { id: 9, marcaId: 6, marca: 'DAF', nome: 'CF85 410', ativo: true },
  { id: 10, marcaId: 7, marca: 'CATERPILLAR', nome: '140B', ativo: true },
  { id: 11, marcaId: 8, marca: 'KOMATSU', nome: 'WA380-8', ativo: true },
  { id: 12, marcaId: 9, marca: 'JCB', nome: '3CX', ativo: true },
  { id: 13, marcaId: 10, marca: 'HYUNDAI', nome: 'HL770-9A', ativo: true },
  { id: 14, marcaId: 11, marca: 'JOHN DEERE', nome: '644K', ativo: true },
  { id: 15, marcaId: 12, marca: 'LIEBHERR', nome: 'LTM 1100-4.2', ativo: false },
];

const marcasDisponiveis = [
  { id: 1, nome: 'SCANIA' },
  { id: 2, nome: 'VOLVO' },
  { id: 3, nome: 'MERCEDES' },
  { id: 4, nome: 'FORD' },
  { id: 5, nome: 'IVECO' },
  { id: 6, nome: 'DAF' },
  { id: 7, nome: 'CATERPILLAR' },
  { id: 8, nome: 'KOMATSU' },
  { id: 9, nome: 'JCB' },
  { id: 10, nome: 'HYUNDAI' },
  { id: 11, nome: 'JOHN DEERE' },
  { id: 12, nome: 'LIEBHERR' },
];

interface ModelosPageProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const ModelosPage: React.FC<ModelosPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [modelos, setModelos] = useState<Modelo[]>(initialModelos);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativos' | 'inativos'>('all');
  const [filterMarca, setFilterMarca] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
  const [formData, setFormData] = useState({ marcaId: 1, nome: '', ativo: true });
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;
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
          <title>Relatório de Modelos</title>
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
          <h1>Relatório de Modelos</h1>
          <p>Total de registros: ${filteredModelos.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Marca</th><th>Modelo</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredModelos.map(m => `
                <tr>
                  <td>${m.id}</td><td>${m.marca}</td><td>${m.nome}</td><td>${m.ativo ? 'Ativo' : 'Inativo'}</td>
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

  const filteredModelos = useMemo(() => {
    return modelos.filter(modelo => {
      const matchesSearch = modelo.nome.toLowerCase().includes(searchTerm.toLowerCase()) || modelo.marca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'ativos' && modelo.ativo) || (filterStatus === 'inativos' && !modelo.ativo);
      const matchesMarca = filterMarca === 'all' || modelo.marcaId === filterMarca;
      return matchesSearch && matchesStatus && matchesMarca;
    });
  }, [modelos, searchTerm, filterStatus, filterMarca]);

  const paginatedModelos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredModelos.slice(start, start + itemsPerPage);
  }, [filteredModelos, currentPage]);

  const totalPages = Math.ceil(filteredModelos.length / itemsPerPage);

  const handleSave = () => {
    if (!formData.nome) {
      alert('Preencha o nome do modelo');
      return;
    }
    const marcaSelecionada = marcasDisponiveis.find(m => m.id === formData.marcaId);
    if (editingModelo) {
      setModelos(prev => prev.map(m => m.id === editingModelo.id ? { ...formData, marca: marcaSelecionada?.nome || '', id: editingModelo.id } : m));
    } else {
      const newId = Math.max(...modelos.map(m => m.id), 0) + 1;
      setModelos(prev => [...prev, { ...formData, marca: marcaSelecionada?.nome || '', id: newId }]);
    }
    setIsModalOpen(false);
    setEditingModelo(null);
    setFormData({ marcaId: 1, nome: '', ativo: true });
  };

  const handleEdit = (modelo: Modelo) => {
    setEditingModelo(modelo);
    setFormData({ marcaId: modelo.marcaId, nome: modelo.nome, ativo: modelo.ativo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setModelos(prev => prev.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m));
  };

  const handleAdd = () => {
    setEditingModelo(null);
    setFormData({ marcaId: 1, nome: '', ativo: true });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="text-[#191c1d]">Modelos</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Modelos</h1>
        <p className="text-[#555f70] text-sm">Gerenciamento de modelos de veículos e máquinas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar modelo..."
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
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">filter_list</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
            >
              <option value="all">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">factory</span>
            <select
              value={filterMarca}
              onChange={(e) => { setFilterMarca(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
            >
              <option value="all">Todas Marcas</option>
              {marcasDisponiveis.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Marca</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Modelo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedModelos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#555f70]">Nenhum modelo encontrado</td>
                </tr>
              ) : (
                paginatedModelos.map(modelo => (
                  <tr key={modelo.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{modelo.id}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{modelo.marca}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{modelo.nome}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${modelo.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {modelo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(modelo)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(modelo.id)} className={`p-1.5 transition-colors ${modelo.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{modelo.ativo ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedModelos.length} de {filteredModelos.length} registros</span>
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
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingModelo ? 'Editar Modelo' : 'Novo Modelo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Marca</label>
                <select value={formData.marcaId} onChange={(e) => setFormData({ ...formData, marcaId: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                  {marcasDisponiveis.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome do Modelo</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} id="ativo" className="w-4 h-4 text-[#006e2d]" />
                <label htmlFor="ativo" className="text-sm text-[#191c1d]">Ativo</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-[#bccbb9] transition-colors text-[#191c1d] text-sm font-semibold rounded-md">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#006e2d] hover:bg-[#005a26] text-white text-sm font-semibold rounded-md">Salvar</button>
              </div>
            </form>
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