import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Residuo {
  id: number;
  tipo: string;
  descricao: string;
  origem: string;
  volume: number;
  unidade: string;
  dataColeta: string;
  status: 'COLETADO' | 'PENDENTE' | 'ATRASADO';
}

function mapResiduo(r: Record<string, unknown>): Residuo {
  return {
    id: Number(r.id),
    tipo: String(r.tipo ?? ''),
    descricao: String(r.descricao ?? ''),
    origem: String(r.origem ?? ''),
    volume: Number(r.volume ?? 0),
    unidade: String(r.unidade ?? 'kg'),
    dataColeta: String(r.data_coleta ?? r.dataColeta ?? ''),
    status: (String(r.status ?? 'PENDENTE') as Residuo['status']),
  };
}

interface ResiduosUrbanoProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const ResiduosUrbanoPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await api.list<Record<string, unknown>>('residuos_urbano');
      setResiduos(raw.map(mapResiduo));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar resíduos');
      setResiduos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredResiduos = useMemo(() => {
    return residuos.filter(residuo => 
      residuo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residuo.origem.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [residuos, searchTerm]);

  const paginatedResiduos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResiduos.slice(start, start + itemsPerPage);
  }, [filteredResiduos, currentPage]);

  const totalPages = Math.ceil(filteredResiduos.length / itemsPerPage);

  const handleToggle = async (id: number) => {
    const r = residuos.find(x => x.id === id);
    if (!r) return;
    const statusOrder: Residuo['status'][] = ['PENDENTE', 'COLETADO', 'ATRASADO'];
    const currentIndex = statusOrder.indexOf(r.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    try {
      const updated = await api.update<Record<string, unknown>>('residuos_urbano', id, { status: nextStatus });
      setResiduos(prev => prev.map(x => x.id === id ? mapResiduo(updated) : x));
      toast.success('Status atualizado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Resíduos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Resíduos Urbano</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Resíduos Urbano</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de resíduos urbanos.</p>
        {loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar resíduo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Origem</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Volume</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Carregando...</td>
                </tr>
              ) : paginatedResiduos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedResiduos.map(residuo => (
                  <tr key={residuo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{residuo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{residuo.tipo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{residuo.descricao}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{residuo.origem}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-slate-900">{residuo.volume} {residuo.unidade}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${residuo.status === 'COLETADO' ? 'bg-emerald-100 text-emerald-700' : residuo.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {residuo.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(residuo.id)} className={`p-1.5 transition-colors ${residuo.status === 'PENDENTE' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                        <MaterialIcon name={residuo.status === 'PENDENTE' ? 'block' : 'check'} size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedResiduos.length} de {filteredResiduos.length} registros</span>
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
    </>
  );

  return <>{content}</>;
};