import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';

interface OS {
  id: number;
  veiculo: string;
  placa: string;
  data: Date;
  tipo: string;
  status: 'aberta' | 'andamento' | 'concluida';
}

const initialOSs: OS[] = [
  { id: 1, veiculo: 'Scania R420', placa: 'ABC-1234', data: new Date('2026-04-05'), tipo: 'Manutenção', status: 'aberta' },
  { id: 2, veiculo: 'Volvo FH440', placa: 'XYZ-5678', data: new Date('2026-04-04'), tipo: 'Revisão', status: 'andamento' },
  { id: 3, veiculo: 'Mercedes AXOR', placa: 'DEF-9012', data: new Date('2026-04-03'), tipo: 'Reparo', status: 'concluida' },
];

interface OficinaDashboardProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const OficinaDashboardPage: React.FC<OficinaDashboardProps> = () => {
  const [oss, setOss] = useState<OS[]>(initialOSs);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredOSs = useMemo(() => {
    return oss.filter(os => 
      os.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.placa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [oss, searchTerm]);

  const paginatedOSs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOSs.slice(start, start + itemsPerPage);
  }, [filteredOSs, currentPage]);

  const totalPages = Math.ceil(filteredOSs.length / itemsPerPage);

  const handleToggle = (id: number) => {
    setOss(prev => prev.map(os => {
      if (os.id === id) {
        const statusOrder: OS['status'][] = ['aberta', 'andamento', 'concluida'];
        const currentIndex = statusOrder.indexOf(os.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...os, status: nextStatus };
      }
      return os;
    }));
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Oficina</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Dashboard</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-slate-500 text-sm">Visão geral da oficina.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar OS"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">OS</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Veículo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Placa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOSs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedOSs.map(os => (
                  <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{os.id}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{os.veiculo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{os.placa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{os.tipo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{os.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${os.status === 'aberta' ? 'bg-yellow-100 text-yellow-700' : os.status === 'andamento' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {os.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(os.id)} className={`p-1.5 transition-colors ${os.status === 'aberta' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                        <MaterialIcon name={os.status === 'aberta' ? 'block' : 'check'} size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedOSs.length} de {filteredOSs.length} registros</span>
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