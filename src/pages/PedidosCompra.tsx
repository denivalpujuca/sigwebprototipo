import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';

interface Pedido {
  id: number;
  empresa: string;
  cnpj: string;
  data: Date;
  itens: number;
  total: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

const initialPedidos: Pedido[] = [
  { id: 1001, empresa: 'Gestão Urbana S/A', cnpj: '12.345.678/0001-90', data: new Date('2026-03-15'), itens: 3, total: 450, status: 'pendente' },
  { id: 1002, empresa: 'Serviços Metropolitanos Ltda', cnpj: '23.456.789/0001-01', data: new Date('2026-03-14'), itens: 2, total: 1200, status: 'aprovado' },
  { id: 1003, empresa: 'Ambiental Norte S/A', cnpj: '34.567.890/0001-12', data: new Date('2026-03-13'), itens: 3, total: 850, status: 'rejeitado' },
];

interface PedidosCompraProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const PedidosCompraPage: React.FC<PedidosCompraProps> = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(pedido => 
      pedido.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id.toString().includes(searchTerm)
    );
  }, [pedidos, searchTerm]);

  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPedidos.slice(start, start + itemsPerPage);
  }, [filteredPedidos, currentPage]);

  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);

  const handleToggle = (id: number) => {
    setPedidos(prev => prev.map(p => {
      if (p.id === id) {
        const statusOrder: Pedido['status'][] = ['pendente', 'aprovado', 'rejeitado'];
        const currentIndex = statusOrder.indexOf(p.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Pedidos de Compra</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Pedidos de Compra</h1>
        <p className="text-slate-500 text-sm">Gerencie e acompanhe os pedidos de compra realizados.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar pedido"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pedido</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Valor Total</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedPedidos.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">#{pedido.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{pedido.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{pedido.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{pedido.itens} itens</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-slate-900">R$ {pedido.total.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : pedido.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(pedido.id)} className={`p-1.5 transition-colors ${pedido.status === 'pendente' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                        <MaterialIcon name={pedido.status === 'pendente' ? 'block' : 'check'} size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedPedidos.length} de {filteredPedidos.length} registros</span>
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