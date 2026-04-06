import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface TipoUsuario {
  id: number;
  nome: string;
  descricao: string;
  nivelAcesso: number;
  ativo: boolean;
}

const initialTiposUsuario: TipoUsuario[] = [
  { id: 1, nome: 'Administrador', descricao: 'Acesso total ao sistema', nivelAcesso: 1, ativo: true },
  { id: 2, nome: 'Gerente', descricao: 'Acesso gerencial com permissões avançadas', nivelAcesso: 2, ativo: true },
  { id: 3, nome: 'Operador', descricao: 'Acesso básico para operações do dia a dia', nivelAcesso: 3, ativo: true },
  { id: 4, nome: 'Visualizador', descricao: 'Apenas visualização sem alterações', nivelAcesso: 4, ativo: true },
  { id: 5, nome: 'Auditor', descricao: 'Acesso apenas para relatórios e auditoria', nivelAcesso: 5, ativo: false },
];

interface TiposUsuarioProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const TiposUsuarioPage: React.FC<TiposUsuarioProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [tipos, setTipos] = useState<TipoUsuario[]>(initialTiposUsuario);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoUsuario | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', nivelAcesso: 3, ativo: true });
  const itemsPerPage = 4;

  const filteredTipos = useMemo(() => {
    return tipos.filter(tipo => 
      tipo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tipos, searchTerm]);

  const paginatedTipos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTipos.slice(start, start + itemsPerPage);
  }, [filteredTipos, currentPage]);

  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);

  const handleSave = () => {
    if (editingTipo) {
      setTipos(prev => prev.map(t => t.id === editingTipo.id ? { ...formData, id: editingTipo.id } : t));
    } else {
      const newId = Math.max(...tipos.map(t => t.id), 0) + 1;
      setTipos(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingTipo(null);
    setFormData({ nome: '', descricao: '', nivelAcesso: 3, ativo: true });
  };

  const handleEdit = (tipo: TipoUsuario) => {
    setEditingTipo(tipo);
    setFormData({ nome: tipo.nome, descricao: tipo.descricao, nivelAcesso: tipo.nivelAcesso, ativo: tipo.ativo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setTipos(prev => prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t));
  };

  const handleAdd = () => {
    setEditingTipo(null);
    setFormData({ nome: '', descricao: '', nivelAcesso: 3, ativo: true });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">T.I.</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Tipos de Usuário</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Tipos de Usuário</h1>
        <p className="text-[#555f70] text-sm">Cadastro e gerenciamento de tipos de usuário do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar tipo de usuário"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Nível</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedTipos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedTipos.map(tipo => (
                  <tr key={tipo.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{tipo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{tipo.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{tipo.descricao}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-[#191c1d]">Nível {tipo.nivelAcesso}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${tipo.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {tipo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(tipo)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(tipo.id)} className={`p-1.5 transition-colors ${tipo.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{tipo.ativo ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedTipos.length} de {filteredTipos.length} registros</span>
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
              <h2 className="text-lg font-bold text-[#191c1d]">{editingTipo ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário'}</h2>
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
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nível de Acesso</label>
                <input type="number" min="1" max="10" value={formData.nivelAcesso} onChange={(e) => setFormData({ ...formData, nivelAcesso: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
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