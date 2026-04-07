import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const TiposUsuarioPage: React.FC<TiposUsuarioProps> = () => {
  const [tipos, setTipos] = useState<TipoUsuario[]>(initialTiposUsuario);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoUsuario | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', nivelAcesso: 3 });
  const itemsPerPage = 5;

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
      setTipos(prev => prev.map(t => t.id === editingTipo.id ? { ...formData, id: editingTipo.id, ativo: editingTipo.ativo } : t));
    } else {
      const newId = Math.max(...tipos.map(t => t.id), 0) + 1;
      setTipos(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingTipo(null);
    setFormData({ nome: '', descricao: '', nivelAcesso: 3 });
  };

  const handleEdit = (tipo: TipoUsuario) => {
    setEditingTipo(tipo);
    setFormData({ nome: tipo.nome, descricao: tipo.descricao, nivelAcesso: tipo.nivelAcesso });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setTipos(prev => prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t));
  };

  const handleAdd = () => {
    setEditingTipo(null);
    setFormData({ nome: '', descricao: '', nivelAcesso: 3 });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">T.I.</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Tipos de Usuário</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Tipos de Usuário</h1>
        <p className="text-slate-500 text-sm">Cadastro e gerenciamento de tipos de usuário do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar tipo de usuário"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors"
        >
          <MaterialIcon name="add" size={20} />
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Nível</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTipos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedTipos.map(tipo => (
                  <tr key={tipo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{tipo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{tipo.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{tipo.descricao}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-slate-900">Nível {tipo.nivelAcesso}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${tipo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {tipo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(tipo)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(tipo.id)} className={`p-1.5 transition-colors ${tipo.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={tipo.ativo ? 'block' : 'check'} size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedTipos.length} de {filteredTipos.length} registros</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 rounded hover:bg-slate-200 text-slate-500">
              <MaterialIcon name="arrow_left" size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-slate-200 text-slate-500">
              <MaterialIcon name="arrow_right" size={20} />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>{editingTipo ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
              <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" rows={2} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nível de Acesso</label>
              <input type="number" min="1" max="10" value={formData.nivelAcesso} onChange={(e) => setFormData({ ...formData, nivelAcesso: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">Salvar</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );

  return <>{content}</>;
};
