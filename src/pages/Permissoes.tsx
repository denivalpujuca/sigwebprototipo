import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';
import { Select } from '../components/Select';

interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  modulo: string;
  ativo: boolean;
}

const initialPermissoes: Permissao[] = [
  { id: 1, nome: 'Visualizar Veículos', descricao: 'Permite visualizar a lista de veículos', modulo: 'Frota', ativo: true },
  { id: 2, nome: 'Editar Veículos', descricao: 'Permite editar informações dos veículos', modulo: 'Frota', ativo: true },
  { id: 3, nome: 'Excluir Veículos', descricao: 'Permite excluir veículos do sistema', modulo: 'Frota', ativo: true },
  { id: 4, nome: 'Cadastrar Veículos', descricao: 'Permite cadastrar novos veículos', modulo: 'Frota', ativo: true },
  { id: 5, nome: 'Visualizar Compras', descricao: 'Permite visualizar pedidos e solicitações', modulo: 'Suprimentos', ativo: true },
  { id: 6, nome: 'Aprovar Compras', descricao: 'Permite aprovar pedidos de compra', modulo: 'Suprimentos', ativo: true },
  { id: 7, nome: 'Rejeitar Compras', descricao: 'Permite rejeitar pedidos de compra', modulo: 'Suprimentos', ativo: true },
  { id: 8, nome: 'Gerenciar Usuários', descricao: 'Permite gerenciar usuários do sistema', modulo: 'T.I.', ativo: false },
];

interface PermissoesProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const PermissoesPage: React.FC<PermissoesProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [permissoes, setPermissoes] = useState<Permissao[]>(initialPermissoes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModulo, setFilterModulo] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState<Permissao | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', modulo: 'Frota', ativo: true });
  const itemsPerPage = 5;

  const filteredPermissoes = useMemo(() => {
    return permissoes.filter(permissao => {
      const matchesSearch = permissao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permissao.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModulo = filterModulo === 'all' || permissao.modulo === filterModulo;
      return matchesSearch && matchesModulo;
    });
  }, [permissoes, searchTerm, filterModulo]);

  const paginatedPermissoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPermissoes.slice(start, start + itemsPerPage);
  }, [filteredPermissoes, currentPage]);

  const totalPages = Math.ceil(filteredPermissoes.length / itemsPerPage);

  const handleSave = () => {
    if (editingPermissao) {
      setPermissoes(prev => prev.map(p => p.id === editingPermissao.id ? { ...formData, id: editingPermissao.id } : p));
    } else {
      const newId = Math.max(...permissoes.map(p => p.id), 0) + 1;
      setPermissoes(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingPermissao(null);
    setFormData({ nome: '', descricao: '', modulo: 'Frota', ativo: true });
  };

  const handleEdit = (permissao: Permissao) => {
    setEditingPermissao(permissao);
    setFormData({ nome: permissao.nome, descricao: permissao.descricao, modulo: permissao.modulo, ativo: permissao.ativo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setPermissoes(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
  };

  const handleAdd = () => {
    setEditingPermissao(null);
    setFormData({ nome: '', descricao: '', modulo: 'Frota', ativo: true });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">T.I.</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Permissões</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Permissões</h1>
        <p className="text-[#555f70] text-sm">Gerenciamento de permissões e acessos do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar permissão"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterModulo}
              onChange={(e) => setFilterModulo(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Módulos</option>
              <option value="Frota">Frota</option>
              <option value="Suprimentos">Suprimentos</option>
              <option value="T.I.">T.I.</option>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Módulo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedPermissoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedPermissoes.map(permissao => (
                  <tr key={permissao.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{permissao.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{permissao.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{permissao.descricao}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-[#555f70] bg-[#f3f4f5] px-3 py-1 rounded-full">{permissao.modulo}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${permissao.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {permissao.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(permissao)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(permissao.id)} className={`p-1.5 transition-colors ${permissao.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{permissao.ativo ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedPermissoes.length} de {filteredPermissoes.length} registros</span>
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
              <h2 className="text-lg font-bold text-[#191c1d]">{editingPermissao ? 'Editar Permissão' : 'Nova Permissão'}</h2>
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
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Descrição</label>
                <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" rows={2} required />
              </div>
              <div>
                <Select
                  label="Módulo"
                  value={formData.modulo}
                  onChange={(e) => setFormData({ ...formData, modulo: e.target.value })}
                >
                  <option value="Frota">Frota</option>
                  <option value="Suprimentos">Suprimentos</option>
                  <option value="T.I.">T.I.</option>
                </Select>
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