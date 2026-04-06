import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Almoxarifado {
  id: number;
  nome: string;
  endereco: string;
  responsavel: string;
  empresa: string;
  ativo: boolean;
}

const initialAlmoxarifados: Almoxarifado[] = [
  { id: 1, nome: 'Almoxarifado Central', endereco: 'Av. Principal, 1000 - Centro', responsavel: 'João Silva', empresa: 'Gestão Urbana S/A', ativo: true },
  { id: 2, nome: 'Almoxarifado Norte', endereco: 'Rua das Indústrias, 250 - Zona Norte', responsavel: 'Maria Santos', empresa: 'Serviços Metropolitanos Ltda', ativo: true },
  { id: 3, nome: 'Almoxarifado Sul', endereco: 'Estrada dos Hangares, 500 - Zona Sul', responsavel: 'Pedro Oliveira', empresa: 'Ambiental Norte S/A', ativo: true },
  { id: 4, nome: 'Almoxarifado Zona Leste', endereco: 'Av. Brasil, 800 - Zona Leste', responsavel: 'Ana Costa', empresa: 'Transporte Público Municipal', ativo: false },
];

const empresas = ['Gestão Urbana S/A', 'Serviços Metropolitanos Ltda', 'Ambiental Norte S/A', 'Transporte Público Municipal', 'Saneamento Básico S/A'];

interface AlmoxarifadosPageProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const AlmoxarifadosPage: React.FC<AlmoxarifadosPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [almoxarifados, setAlmoxarifados] = useState<Almoxarifado[]>(initialAlmoxarifados);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativos' | 'inativos'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlmoxarifado, setEditingAlmoxarifado] = useState<Almoxarifado | null>(null);
  const [formData, setFormData] = useState({ nome: '', endereco: '', responsavel: '', empresa: '', ativo: true });
  const [internalActiveSection, setInternalActiveSection] = useState('administrativo');
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
          <title>Relatório de Almoxarifados</title>
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
          <h1>Relatório de Almoxarifados</h1>
          <p>Total de registros: ${filteredAlmoxarifados.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nome</th><th>Endereço</th><th>Responsável</th><th>Empresa</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAlmoxarifados.map(a => `
                <tr>
                  <td>${a.id}</td><td>${a.nome}</td><td>${a.endereco}</td><td>${a.responsavel}</td><td>${a.empresa}</td><td>${a.ativo ? 'Ativo' : 'Inativo'}</td>
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

  const filteredAlmoxarifados = useMemo(() => {
    return almoxarifados.filter(alm => {
      const matchesSearch = alm.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           alm.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alm.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alm.empresa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'ativos' && alm.ativo) || 
                            (filterStatus === 'inativos' && !alm.ativo);
      return matchesSearch && matchesStatus;
    });
  }, [almoxarifados, searchTerm, filterStatus]);

  const paginatedAlmoxarifados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlmoxarifados.slice(start, start + itemsPerPage);
  }, [filteredAlmoxarifados, currentPage]);

  const totalPages = Math.ceil(filteredAlmoxarifados.length / itemsPerPage);

  const handleSave = () => {
    if (!formData.nome || !formData.endereco || !formData.responsavel || !formData.empresa) {
      alert('Preencha todos os campos');
      return;
    }
    if (editingAlmoxarifado) {
      setAlmoxarifados(prev => prev.map(a => a.id === editingAlmoxarifado.id ? { ...formData, id: editingAlmoxarifado.id } : a));
    } else {
      const newId = Math.max(...almoxarifados.map(a => a.id), 0) + 1;
      setAlmoxarifados(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingAlmoxarifado(null);
    setFormData({ nome: '', endereco: '', responsavel: '', empresa: '', ativo: true });
  };

  const handleEdit = (almoxarifado: Almoxarifado) => {
    setEditingAlmoxarifado(almoxarifado);
    setFormData({ nome: almoxarifado.nome, endereco: almoxarifado.endereco, responsavel: almoxarifado.responsavel, empresa: almoxarifado.empresa, ativo: almoxarifado.ativo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setAlmoxarifados(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  const handleAdd = () => {
    setEditingAlmoxarifado(null);
    setFormData({ nome: '', endereco: '', responsavel: '', empresa: '', ativo: true });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="text-[#191c1d]">Almoxarifados</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Almoxarifados</h1>
        <p className="text-[#555f70] text-sm">Gerenciamento de almoxarifados e depósitos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar almoxarifado..."
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Endereço</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Responsável</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedAlmoxarifados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555f70]">Nenhum almoxarifado encontrado</td>
                </tr>
              ) : (
                paginatedAlmoxarifados.map(alm => (
                  <tr key={alm.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{alm.id}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{alm.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{alm.endereco}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{alm.responsavel}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{alm.empresa}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${alm.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {alm.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(alm)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(alm.id)} className={`p-1.5 transition-colors ${alm.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{alm.ativo ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedAlmoxarifados.length} de {filteredAlmoxarifados.length} registros</span>
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
              <h2 className="text-lg font-bold text-[#191c1d]">{editingAlmoxarifado ? 'Editar Almoxarifado' : 'Novo Almoxarifado'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Endereço</label>
                <input type="text" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Responsável</label>
                <input type="text" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Empresa</label>
                <select value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm">
                  <option value="">Selecione</option>
                  {empresas.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
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