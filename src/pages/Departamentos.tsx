import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Departamento {
  id: number;
  nome: string;
  empresa: string;
  responsavel: string;
  email: string;
  telefone: string;
  ativo: boolean;
}

function mapDepartamento(r: Record<string, unknown>): Departamento {
  return {
    id: Number(r.id),
    nome: String(r.nome ?? ''),
    empresa: String(r.empresa ?? ''),
    responsavel: String(r.responsavel ?? ''),
    email: String(r.email ?? ''),
    telefone: String(r.telefone ?? ''),
    ativo: Boolean(r.ativo),
  };
}

export const DepartamentosPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [empresas, setEmpresas] = useState<{id: number, nome: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null);
  const [formData, setFormData] = useState({ nome: '', empresa: '', responsavel: '', email: '', telefone: '' });
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    try {
      console.log('Carregando departamentos e empresas...');
      const [deps, emas] = await Promise.all([
        api.list<Record<string, unknown>>('departamentos'),
        api.list<Record<string, unknown>>('empresas'),
      ]);
      console.log('Departamentos:', deps);
      console.log('Empresas:', emas);
      setDepartamentos(deps.map(mapDepartamento));
      setEmpresas(emas.map(e => ({ id: Number(e.id), nome: String(e.nome) })));
    } catch (e) {
      console.error('Erro ao carregar:', e);
      setDepartamentos([]);
      setEmpresas([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredDepartamentos = useMemo(() => {
    return departamentos.filter(dep => 
      dep.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departamentos, searchTerm]);

  const paginatedDepartamentos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDepartamentos.slice(start, start + itemsPerPage);
  }, [filteredDepartamentos, currentPage]);

  const totalPages = Math.ceil(filteredDepartamentos.length / itemsPerPage);

  const handleSave = async () => {
    try {
      if (editingDepartamento) {
        const updated = await api.update<Record<string, unknown>>('departamentos', editingDepartamento.id, {
          nome: formData.nome,
          empresa: formData.empresa,
          responsavel: formData.responsavel,
          email: formData.email,
          telefone: formData.telefone,
        });
        setDepartamentos(prev => prev.map(d => d.id === editingDepartamento.id ? mapDepartamento(updated) : d));
        toast.success('Departamento atualizado.');
      } else {
        const created = await api.create<Record<string, unknown>>('departamentos', { ...formData, ativo: 1 });
        setDepartamentos(prev => [...prev, mapDepartamento(created)]);
        toast.success('Departamento cadastrado.');
      }
      setIsModalOpen(false);
      setEditingDepartamento(null);
      setFormData({ nome: '', empresa: '', responsavel: '', email: '', telefone: '' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  };

  const handleEdit = (dep: Departamento) => {
    setEditingDepartamento(dep);
    setFormData({ nome: dep.nome, empresa: dep.empresa, responsavel: dep.responsavel, email: dep.email, telefone: dep.telefone });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: number) => {
    const d = departamentos.find(x => x.id === id);
    if (!d) return;
    try {
      const updated = await api.update<Record<string, unknown>>('departamentos', id, { ativo: !d.ativo });
      setDepartamentos(prev => prev.map(x => x.id === id ? mapDepartamento(updated) : x));
      toast.success('Status atualizado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  const handleAdd = () => {
    setEditingDepartamento(null);
    setFormData({ nome: '', empresa: '', responsavel: '', email: '', telefone: '' });
    setIsModalOpen(true);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Departamentos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Departamentos</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de departamentos por empresa.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar departamento..."
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
          Novo Departamento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-20">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Responsável</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Email</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Telefone</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDepartamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedDepartamentos.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-500 text-center">{dep.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{dep.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{dep.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{dep.responsavel}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{dep.email}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{dep.telefone}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dep.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {dep.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(dep)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(dep.id)} className={`p-1.5 transition-colors ${dep.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={dep.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedDepartamentos.length} de {filteredDepartamentos.length} registros</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MaterialIcon name="chevron_left" size={20} />
            </button>
            <span className="text-sm text-slate-600">Página {currentPage} de {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MaterialIcon name="chevron_right" size={20} />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>{editingDepartamento ? 'Editar Departamento' : 'Novo Departamento'}</SheetTitle>
            <SheetDescription>Preencha os dados do departamento.</SheetDescription>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
              <Select value={formData.empresa} onValueChange={(v) => setFormData({ ...formData, empresa: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(e => (
                    <SelectItem key={e.id} value={e.nome}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Responsável</label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">
                Cancelar
              </button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">
                Salvar
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};