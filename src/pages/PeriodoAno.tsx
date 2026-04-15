import { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface PeriodoAno {
  id: number;
  periodoAno: string;
  mes: number;
  ano: number;
  diasUteisSemana: number;
  sabadosUteis: number;
  status: 'ABERTO' | 'FECHADO';
  ativo: boolean;
}

function mapPeriodo(r: Record<string, unknown>): PeriodoAno {
  return {
    id: Number(r.id),
    periodoAno: String(r.periodo_ano ?? r.periodoAno ?? ''),
    mes: Number(r.mes ?? 0),
    ano: Number(r.ano ?? 0),
    diasUteisSemana: Number(r.dias_uteis_semana ?? 0),
    sabadosUteis: Number(r.sabados_uteis ?? 0),
    status: (String(r.status ?? 'ABERTO') as PeriodoAno['status']),
    ativo: ativoFromDb(r.ativo),
  };
}

export const PeriodoAnoPage = () => {
  const { toast } = useAppFeedback();
  const [periodos, setPeriodos] = useState<PeriodoAno[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoAno | null>(null);
  const [formData, setFormData] = useState({ mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4 });
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await api.list<Record<string, unknown>>('periodos_ano');
      setPeriodos(raw.map(mapPeriodo));
    } catch (e) {
      setPeriodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredPeriodos = useMemo(() => {
    return periodos.filter(periodo => 
      periodo.periodoAno.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [periodos, searchTerm]);

  const paginatedPeriodos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPeriodos.slice(start, start + itemsPerPage);
  }, [filteredPeriodos, currentPage]);

  const totalPages = Math.ceil(filteredPeriodos.length / itemsPerPage);

  const handleSave = async () => {
    const periodoAnoStr = `${String(formData.mes).padStart(2, '0')}/${formData.ano}`;
    const payload = {
      periodo_ano: periodoAnoStr,
      mes: formData.mes,
      ano: formData.ano,
      dias_uteis_semana: formData.diasUteisSemana,
      sabados_uteis: formData.sabadosUteis,
    };
    
    try {
      if (editingPeriodo) {
        const updated = await api.update<Record<string, unknown>>('periodos_ano', editingPeriodo.id, {
          ...payload,
          ativo: ativoToDb(editingPeriodo.ativo),
        });
        setPeriodos(prev => prev.map(p => p.id === editingPeriodo.id ? mapPeriodo(updated) : p));
        toast.success('Período atualizado.');
      } else {
        const created = await api.create<Record<string, unknown>>('periodos_ano', { ...payload, status: 'ABERTO', ativo: 1 });
        setPeriodos(prev => [...prev, mapPeriodo(created)]);
        toast.success('Período cadastrado.');
      }
      setIsModalOpen(false);
      setEditingPeriodo(null);
      setFormData({ mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  };

  const handleEdit = (periodo: PeriodoAno) => {
    setEditingPeriodo(periodo);
    setFormData({ mes: periodo.mes, ano: periodo.ano, diasUteisSemana: periodo.diasUteisSemana, sabadosUteis: periodo.sabadosUteis });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setPeriodos(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
  };

  const handleAdd = () => {
    setEditingPeriodo(null);
    setFormData({ mes: 1, ano: 2026, diasUteisSemana: 22, sabadosUteis: 4 });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO': return 'bg-emerald-100 text-emerald-700';
      case 'FECHADO': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Período Ano</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Período Ano</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de períodos do ano.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar período (MM/AAAA)"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Período</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Dias Úteis Semana</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Sábados Úteis</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPeriodos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedPeriodos.map(periodo => (
                  <tr key={periodo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{periodo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold font-mono text-slate-900">{periodo.periodoAno}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-slate-900">{periodo.diasUteisSemana}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-slate-900">{periodo.sabadosUteis}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(periodo.status)}`}>
                        {periodo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(periodo)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(periodo.id)} className={`p-1.5 transition-colors ${periodo.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={periodo.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedPeriodos.length} de {filteredPeriodos.length} registros</span>
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
            <SheetTitle>{editingPeriodo ? 'Editar Período' : 'Novo Período'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mês</label>
                <Select value={String(formData.mes)} onValueChange={(value) => setFormData({ ...formData, mes: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Janeiro</SelectItem>
                    <SelectItem value="2">Fevereiro</SelectItem>
                    <SelectItem value="3">Março</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Maio</SelectItem>
                    <SelectItem value="6">Junho</SelectItem>
                    <SelectItem value="7">Julho</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ano</label>
                <Select value={String(formData.ano)} onValueChange={(value) => setFormData({ ...formData, ano: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dias Úteis Semana</label>
                <input type="number" min="0" max="31" value={formData.diasUteisSemana} onChange={(e) => setFormData({ ...formData, diasUteisSemana: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sábados Úteis</label>
                <input type="number" min="0" max="5" value={formData.sabadosUteis} onChange={(e) => setFormData({ ...formData, sabadosUteis: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
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
};
