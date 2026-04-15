import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { api } from '../lib/api';

interface Registro {
  id: number;
  data: string;
  usuario: string;
  acao: string;
  modulo: string;
  detalhe: string;
}

function mapAuditoria(r: Record<string, unknown>): Registro {
  return {
    id: Number(r.id),
    data: String(r.created_at ?? r.data ?? ''),
    usuario: String(r.usuario ?? ''),
    acao: String(r.acao ?? ''),
    modulo: String(r.tabela ?? r.modulo ?? ''),
    detalhe: String(r.detalhes ?? r.detalhe ?? ''),
  };
}

export const AuditoriaPage: React.FC = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    try {
      const raw = await api.list<Record<string, unknown>>('auditoria');
      setRegistros(raw.map(mapAuditoria));
    } catch (e) {
      setRegistros([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRegistros = useMemo(() => {
    return registros.filter(registro => 
      registro.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.detalhe.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [registros, searchTerm]);

  const paginatedRegistros = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegistros.slice(start, start + itemsPerPage);
  }, [filteredRegistros, currentPage]);

  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Auditoria</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Auditoria</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Auditoria</h1>
        <p className="text-slate-500 text-sm">Registro de atividades do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ação</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Módulo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedRegistros.map(registro => (
                  <tr key={registro.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-500 font-mono">{registro.data}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{registro.usuario}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${registro.acao === 'Criação' ? 'bg-emerald-100 text-emerald-700' : registro.acao === 'Edição' ? 'bg-blue-100 text-blue-700' : registro.acao === 'Exclusão' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {registro.acao}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{registro.modulo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate">{registro.detalhe}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedRegistros.length} de {filteredRegistros.length} registros</span>
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