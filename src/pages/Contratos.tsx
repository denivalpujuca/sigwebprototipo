import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Contrato {
  id: number;
  numero: string;
  cliente: string;
  empresa: string;
  tipo: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  status: 'ATIVO' | 'EXPIRADO' | 'CANCELADO';
}

function mapContrato(r: Record<string, unknown>): Contrato {
  return {
    id: Number(r.id),
    numero: String(r.numero ?? ''),
    cliente: String(r.cliente ?? ''),
    empresa: String(r.empresa ?? ''),
    tipo: String(r.tipo ?? ''),
    valor: Number(r.valor ?? 0),
    dataInicio: String(r.data_inicio ?? r.dataInicio ?? ''),
    dataFim: String(r.data_fim ?? r.dataFim ?? ''),
    status: (String(r.status ?? 'ATIVO') as Contrato['status']),
  };
}

export const ContratosPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [formData, setFormData] = useState<{ numero: string; cliente: string; empresa: string; tipo: string; valor: number; dataInicio: string; dataFim: string; status: 'ATIVO' | 'EXPIRADO' | 'CANCELADO' }>({ numero: '', cliente: '', empresa: '', tipo: '', valor: 0, dataInicio: '', dataFim: '', status: 'ATIVO' });
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await api.list<Record<string, unknown>>('contratos');
      setContratos(raw.map(mapContrato));
    } catch (e) {
      setContratos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredContratos = useMemo(() => {
    return contratos.filter(contrato => 
      contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contratos, searchTerm]);

  const paginatedContratos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContratos.slice(start, start + itemsPerPage);
  }, [filteredContratos, currentPage]);

  const totalPages = Math.ceil(filteredContratos.length / itemsPerPage);

  const handleSave = async () => {
    try {
      const payload = {
        numero: formData.numero,
        cliente: formData.cliente,
        empresa: formData.empresa,
        tipo: formData.tipo,
        valor: formData.valor,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim,
        status: formData.status,
      };
      if (editingContrato) {
        const updated = await api.update<Record<string, unknown>>('contratos', editingContrato.id, payload);
        setContratos(prev => prev.map(c => c.id === editingContrato.id ? mapContrato(updated) : c));
        toast.success('Contrato atualizado.');
      } else {
        const created = await api.create<Record<string, unknown>>('contratos', payload);
        setContratos(prev => [...prev, mapContrato(created)]);
        toast.success('Contrato cadastrado.');
      }
      setIsModalOpen(false);
      setEditingContrato(null);
      setFormData({ numero: '', cliente: '', empresa: '', tipo: '', valor: 0, dataInicio: '', dataFim: '', status: 'ATIVO' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setFormData({ numero: contrato.numero, cliente: contrato.cliente, empresa: contrato.empresa, tipo: contrato.tipo, valor: contrato.valor, dataInicio: contrato.dataInicio, dataFim: contrato.dataFim, status: contrato.status });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: number) => {
    const c = contratos.find(x => x.id === id);
    if (!c) return;
    const newStatus = c.status === 'ATIVO' ? 'CANCELADO' : 'ATIVO';
    try {
      const updated = await api.update<Record<string, unknown>>('contratos', id, { status: newStatus });
      setContratos(prev => prev.map(x => x.id === id ? mapContrato(updated) : x));
      toast.success('Status atualizado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  const handleAdd = () => {
    setEditingContrato(null);
    setFormData({ numero: '', cliente: '', empresa: '', tipo: '', valor: 0, dataInicio: '', dataFim: '', status: 'ATIVO' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Contratos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Contratos</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de contratos e acordos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar contrato"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Número</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Vigência</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Carregando...</td>
                </tr>
              ) : paginatedContratos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedContratos.map(contrato => (
                  <tr key={contrato.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold font-mono text-slate-900">{contrato.numero}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{contrato.cliente}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{contrato.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{contrato.tipo}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-slate-900">R$ {contrato.valor.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')} - {new Date(contrato.dataFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${contrato.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : contrato.status === 'EXPIRADO' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {contrato.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(contrato)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(contrato.id)} className={`p-1.5 transition-colors ${contrato.status === 'ATIVO' ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={contrato.status === 'ATIVO' ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedContratos.length} de {filteredContratos.length} registros</span>
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
            <SheetTitle>{editingContrato ? 'Editar Contrato' : 'Novo Contrato'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Número</label>
              <input type="text" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente</label>
                <input type="text" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
                <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                    <SelectItem value="Locação">Locação</SelectItem>
                    <SelectItem value="Frete">Frete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="EXPIRADO">Expirado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data Início</label>
                <input type="date" value={formData.dataInicio} onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data Fim</label>
                <input type="date" value={formData.dataFim} onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
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