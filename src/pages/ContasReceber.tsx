import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';

interface Conta {
  id: number;
  descricao: string;
  cliente: string;
  valor: number;
  dataRecebimento: string;
  status: 'recebido' | 'pendente' | 'atrasado';
}

const initialContas: Conta[] = [
  { id: 1, descricao: 'Serviços Prestados', cliente: 'Tech Solutions', valor: 8000, dataRecebimento: '2026-04-10', status: 'recebido' },
  { id: 2, descricao: 'Locação', cliente: 'Imobiliária XYZ', valor: 15000, dataRecebimento: '2026-04-20', status: 'pendente' },
];

interface ContasReceberProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const ContasReceberPage: React.FC<ContasReceberProps> = () => {
  const [contas, setContas] = useState<Conta[]>(initialContas);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredContas = useMemo(() => {
    return contas.filter(conta => 
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contas, searchTerm]);

  const paginatedContas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContas.slice(start, start + itemsPerPage);
  }, [filteredContas, currentPage]);

  const totalPages = Math.ceil(filteredContas.length / itemsPerPage);

  const handleToggle = (id: number) => {
    setContas(prev => prev.map(c => {
      if (c.id === id) {
        const statusOrder: Conta['status'][] = ['pendente', 'recebido', 'atrasado'];
        const currentIndex = statusOrder.indexOf(c.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Financeiro</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Contas a Receber</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Contas a Receber</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de contas a receber.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar conta"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recebimento</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedContas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedContas.map(conta => (
                  <tr key={conta.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{conta.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{conta.descricao}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{conta.cliente}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-slate-900">R$ {conta.valor.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{new Date(conta.dataRecebimento).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${conta.status === 'recebido' ? 'bg-emerald-100 text-emerald-700' : conta.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {conta.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(conta.id)} className={`p-1.5 transition-colors ${conta.status === 'pendente' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                        <MaterialIcon name={conta.status === 'pendente' ? 'block' : 'check'} size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedContas.length} de {filteredContas.length} registros</span>
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