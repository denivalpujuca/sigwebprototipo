import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';

interface Requisicao {
  id: number;
  setor: string;
  almoxarifado: string;
  data: Date;
  itens: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'comprado';
}

const initialRequisicoes: Requisicao[] = [
  { id: 1, setor: 'Recursos Humanos', almoxarifado: 'Almoxarifado Central', data: new Date('2026-04-01'), itens: 5, status: 'pendente' },
  { id: 2, setor: 'Manutenção', almoxarifado: 'Almoxarifado Norte', data: new Date('2026-04-02'), itens: 10, status: 'aprovado' },
  { id: 3, setor: 'TI', almoxarifado: 'Almoxarifado Sul', data: new Date('2026-04-03'), itens: 3, status: 'comprado' },
];

interface SolicitacaoCompraProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const SolicitacaoCompraPage: React.FC<SolicitacaoCompraProps> = () => {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>(initialRequisicoes);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(req => 
      req.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.almoxarifado.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requisicoes, searchTerm]);

  const paginatedRequisicoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequisicoes.slice(start, start + itemsPerPage);
  }, [filteredRequisicoes, currentPage]);

  const totalPages = Math.ceil(filteredRequisicoes.length / itemsPerPage);

  const handleToggle = (id: number) => {
    setRequisicoes(prev => prev.map(r => {
      if (r.id === id) {
        const statusOrder: Requisicao['status'][] = ['pendente', 'aprovado', 'comprado'];
        const currentIndex = statusOrder.indexOf(r.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Solicitação de Compra</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Solicitação de Compra</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de solicitações de compra.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar requisição"
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
              <tr className="bg-slate-50">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Setor</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Almoxarifado</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRequisicoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedRequisicoes.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">#{req.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.setor}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.almoxarifado}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.itens} itens</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${req.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : req.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : req.status === 'comprado' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(req.id)} className={`p-1.5 transition-colors ${req.status === 'pendente' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                        <MaterialIcon name={req.status === 'pendente' ? 'block' : 'check'} size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedRequisicoes.length} de {filteredRequisicoes.length} registros</span>
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