import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  modulo: string;
  ativo: boolean;
}

function mapPermissao(r: Record<string, unknown>): Permissao {
  return {
    id: Number(r.id),
    nome: String(r.nome ?? ''),
    descricao: String(r.descricao ?? ''),
    modulo: String(r.modulo ?? ''),
    ativo: ativoFromDb(r.ativo),
  };
}

const modulos = ['Frota', 'Suprimentos', 'T.I.'];

export const PermissoesPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState<Permissao | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', modulo: 'Frota' });
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await api.list<Record<string, unknown>>('permissoes');
      setPermissoes(raw.map(mapPermissao));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar permissões');
      setPermissoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredPermissoes = useMemo(() => {
    return permissoes.filter(permissao => 
      permissao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permissao.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissoes, searchTerm]);

  const paginatedPermissoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPermissoes.slice(start, start + itemsPerPage);
  }, [filteredPermissoes, currentPage]);

  const totalPages = Math.ceil(filteredPermissoes.length / itemsPerPage);

  const handleSave = async () => {
    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        modulo: formData.modulo,
      };
      if (editingPermissao) {
        const updated = await api.update<Record<string, unknown>>('permissoes', editingPermissao.id, {
          ...payload,
          ativo: ativoToDb(editingPermissao.ativo),
        });
        setPermissoes(prev => prev.map(p => p.id === editingPermissao.id ? mapPermissao(updated) : p));
      } else {
        const created = await api.create<Record<string, unknown>>('permissoes', { ...payload, ativo: 1 });
        setPermissoes(prev => [...prev, mapPermissao(created)]);
      }
      setIsModalOpen(false);
      setEditingPermissao(null);
      setFormData({ nome: '', descricao: '', modulo: 'Frota' });
      toast.success(editingPermissao ? 'Permissão atualizada.' : 'Permissão cadastrada.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  };

  const handleEdit = (permissao: Permissao) => {
    setEditingPermissao(permissao);
    setFormData({ nome: permissao.nome, descricao: permissao.descricao, modulo: permissao.modulo });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: number) => {
    const p = permissoes.find(x => x.id === id);
    if (!p) return;
    try {
      const updated = await api.update<Record<string, unknown>>('permissoes', id, { ativo: ativoToDb(!p.ativo) });
      setPermissoes(prev => prev.map(x => x.id === id ? mapPermissao(updated) : x));
      toast.success('Status atualizado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  const handleAdd = () => {
    setEditingPermissao(null);
    setFormData({ nome: '', descricao: '', modulo: 'Frota' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">T.I.</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Permissões</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Permissões</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de permissões e acessos do sistema.</p>
        {loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar permissão"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-20">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Módulo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Carregando...</td>
                </tr>
              ) : paginatedPermissoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedPermissoes.map(permissao => (
                  <tr key={permissao.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{permissao.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{permissao.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{permissao.descricao}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{permissao.modulo}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${permissao.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {permissao.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(permissao)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(permissao.id)} className={`p-1.5 transition-colors ${permissao.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={permissao.ativo ? 'block' : 'check'} size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedPermissoes.length} de {filteredPermissoes.length} registros</span>
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
            <SheetTitle>{editingPermissao ? 'Editar Permissão' : 'Nova Permissão'}</SheetTitle>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Módulo</label>
              <Select value={formData.modulo} onValueChange={(value) => setFormData({ ...formData, modulo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {modulos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
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
