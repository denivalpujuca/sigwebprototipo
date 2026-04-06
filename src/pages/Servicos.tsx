import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  valorUnitario: number;
  unidade: string;
  ativo: boolean;
}

const initialServicos: Servico[] = [
  { id: 1, nome: 'Frete', descricao: 'Serviço de transporte de cargas', categoria: 'Transporte', valorUnitario: 1500, unidade: 'viagem', ativo: true },
  { id: 2, nome: 'Locação de Máquina', descricao: 'Locação de máquinas pesadas', categoria: 'Locação', valorUnitario: 500, unidade: 'dia', ativo: true },
  { id: 3, nome: 'Manutenção Veicular', descricao: 'Serviço de manutenção de veículos', categoria: 'Serviços', valorUnitario: 300, unidade: 'serviço', ativo: true },
  { id: 4, nome: 'Aluguel de Empilhadeira', descricao: 'Aluguel de empilhadeira para movimentação', categoria: 'Locação', valorUnitario: 200, unidade: 'dia', ativo: true },
  { id: 5, nome: 'Seguro', descricao: 'Cobertura securitária para cargas', categoria: 'Seguros', valorUnitario: 5000, unidade: 'ano', ativo: false },
  { id: 6, nome: 'Acompanhamento', descricao: 'Serviço de acompanhamento de carga', categoria: 'Serviços', valorUnitario: 100, unidade: 'hora', ativo: true },
];

interface ServicosProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const ServicosPage: React.FC<ServicosProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [servicos, setServicos] = useState<Servico[]>(initialServicos);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativos' | 'inativos'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', categoria: '', valorUnitario: 0, unidade: '' });
  const itemsPerPage = 5;

  const categorias = useMemo(() => {
    const cats = [...new Set(servicos.map(s => s.categoria))];
    return cats;
  }, [servicos]);

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Serviços</title>
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
          <h1>Relatório de Serviços</h1>
          <p>Total de registros: ${filteredServicos.length}</p>
          <table>
            <thead>
              <tr>
                <th>Cod</th><th>Nome</th><th>Descrição</th><th>Categoria</th><th>Valor Unit.</th><th>Unidade</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredServicos.map(s => `
                <tr>
                  <td>${s.id}</td><td>${s.nome}</td><td>${s.descricao}</td><td>${s.categoria}</td><td>R$ ${s.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>${s.unidade}</td><td>${s.ativo ? 'Ativo' : 'Inativo'}</td>
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

  const filteredServicos = useMemo(() => {
    return servicos.filter(servico => {
      const matchesSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = filterCategoria === 'all' || servico.categoria === filterCategoria;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'ativos' && servico.ativo) || (filterStatus === 'inativos' && !servico.ativo);
      return matchesSearch && matchesCategoria && matchesStatus;
    });
  }, [servicos, searchTerm, filterCategoria, filterStatus]);

  const paginatedServicos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServicos.slice(start, start + itemsPerPage);
  }, [filteredServicos, currentPage]);

  const totalPages = Math.ceil(filteredServicos.length / itemsPerPage);

  const handleSave = () => {
    if (editingServico) {
      setServicos(prev => prev.map(s => s.id === editingServico.id ? { ...formData, id: editingServico.id, ativo: editingServico.ativo } : s));
    } else {
      const newId = Math.max(...servicos.map(s => s.id), 0) + 1;
      setServicos(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingServico(null);
    setFormData({ nome: '', descricao: '', categoria: '', valorUnitario: 0, unidade: '' });
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({ nome: servico.nome, descricao: servico.descricao, categoria: servico.categoria, valorUnitario: servico.valorUnitario, unidade: servico.unidade });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  const handleAdd = () => {
    setEditingServico(null);
    setFormData({ nome: '', descricao: '', categoria: '', valorUnitario: 0, unidade: '' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Administrativo</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Serviços</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Serviços</h1>
        <p className="text-[#555f70] text-sm">Cadastro e gerenciamento de serviços oferecidos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar serviço"
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
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Categoria</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-right">Valor Unit.</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Unidade</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedServicos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedServicos.map(servico => (
                  <tr key={servico.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{servico.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{servico.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{servico.descricao}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-medium bg-[#f3f4f5] text-[#555f70] px-3 py-1 rounded-full">{servico.categoria}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-[#191c1d]">R$ {servico.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-4 text-center text-sm text-[#555f70]">{servico.unidade}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${servico.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {servico.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(servico)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(servico.id)} className={`p-1.5 transition-colors ${servico.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{servico.ativo ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedServicos.length} de {filteredServicos.length} registros</span>
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
              <h2 className="text-lg font-bold text-[#191c1d]">{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome do Serviço</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Descrição</label>
                <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" rows={2} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Categoria</label>
                <input type="text" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" list="categorias" />
                <datalist id="categorias">
                  {categorias.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Valor Unitário</label>
                  <input type="number" step="0.01" value={formData.valorUnitario} onChange={(e) => setFormData({ ...formData, valorUnitario: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Unidade</label>
                  <input type="text" value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" placeholder="viagem, dia, hora..." required />
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