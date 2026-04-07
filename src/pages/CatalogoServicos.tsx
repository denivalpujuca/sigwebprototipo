import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  valorUnitario: number;
  unidade: string;
  ativo: boolean;
}

const initialServicos: Servico[] = [
  { id: 1, nome: 'Frete', descricao: 'Serviço de transporte de cargas', categoria: 'Transporte', valorUnitario: 1500, unidade: 'viagem', ativo: true },
  { id: 2, nome: 'Locação de Máquina', descricao: 'Locação de máquinas pesadas', categoria: 'Locação', valorUnitario: 500, unidade: 'dia', ativo: true },
  { id: 3, nome: 'Manutenção Veicular', descricao: 'Serviço de manutenção de veículos', categoria: 'Serviços', valorUnitario: 300, unidade: 'serviço', ativo: true },
  { id: 4, nome: 'Aluguel de Empilhadeira', descricao: 'Aluguel de empilhadeira para movimentação', categoria: 'Locação', valorUnitario: 200, unidade: 'dia', ativo: true },
  { id: 5, nome: 'Seguro', descricao: 'Cobertura securitária para cargas', categoria: 'Seguros', valorUnitario: 5000, unidade: 'ano', ativo: true },
];

interface CatalogoServicosProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const CatalogoServicosPage: React.FC<CatalogoServicosProps> = () => {
  const [servicos, setServicos] = useState<Servico[]>(initialServicos);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredServicos = useMemo(() => {
    return servicos.filter(servico => 
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [servicos, searchTerm]);

  const paginatedServicos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServicos.slice(start, start + itemsPerPage);
  }, [filteredServicos, currentPage]);

  const totalPages = Math.ceil(filteredServicos.length / itemsPerPage);

  const handleToggle = (id: number) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Vendas</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Catálogo de Serviços</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Catálogo de Serviços</h1>
        <p className="text-slate-500 text-sm">Cadastro e gerenciamento de serviços.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar serviço"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedServicos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedServicos.map(servico => (
                  <tr key={servico.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{servico.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{servico.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{servico.categoria}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-slate-900">R$ {servico.valorUnitario.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${servico.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {servico.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleToggle(servico.id)} className={`p-1.5 transition-colors ${servico.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                        <MaterialIcon name={servico.ativo ? 'block' : 'check'} size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedServicos.length} de {filteredServicos.length} registros</span>
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