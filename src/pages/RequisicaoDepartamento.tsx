import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Requisicao {
  id: number;
  empresa: string;
  departamento: string;
  solicitante: string;
  data: Date;
  itens: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'entregue';
}

const initialRequisicoes: Requisicao[] = [
  { id: 1, empresa: 'Gestão Urbana S/A', departamento: 'Recursos Humanos', solicitante: 'Maria Santos', data: new Date('2026-04-01'), itens: 2, status: 'aprovado' },
  { id: 2, empresa: 'Serviços Metropolitanos Ltda', departamento: 'Manutenção', solicitante: 'Pedro Oliveira', data: new Date('2026-04-02'), itens: 2, status: 'pendente' },
];

interface RequisicaoDepartamentoProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const RequisicaoDepartamentoPage: React.FC<RequisicaoDepartamentoProps> = () => {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>(initialRequisicoes);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequisicao, setEditingRequisicao] = useState<Requisicao | null>(null);
  const [formData, setFormData] = useState<{ empresa: string; departamento: string; solicitante: string; itens: number; status: 'pendente' | 'aprovado' | 'rejeitado' | 'entregue' }>({ empresa: '', departamento: '', solicitante: '', itens: 1, status: 'pendente' });
  const itemsPerPage = 5;

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(req => 
      req.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requisicoes, searchTerm]);

  const paginatedRequisicoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequisicoes.slice(start, start + itemsPerPage);
  }, [filteredRequisicoes, currentPage]);

  const totalPages = Math.ceil(filteredRequisicoes.length / itemsPerPage);

  const handleSave = () => {
    if (editingRequisicao) {
      setRequisicoes(prev => prev.map(r => r.id === editingRequisicao.id ? { ...formData, id: editingRequisicao.id } as Requisicao : r));
    } else {
      const newId = Math.max(...requisicoes.map(r => r.id), 0) + 1;
      setRequisicoes(prev => [...prev, { ...formData, id: newId, data: new Date() } as Requisicao]);
    }
    setIsModalOpen(false);
    setEditingRequisicao(null);
    setFormData({ empresa: '', departamento: '', solicitante: '', itens: 1, status: 'pendente' });
  };

  const handleEdit = (req: Requisicao) => {
    setEditingRequisicao(req);
    setFormData({ empresa: req.empresa, departamento: req.departamento, solicitante: req.solicitante, itens: req.itens, status: req.status });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setRequisicoes(prev => prev.map(r => {
      if (r.id === id) {
        const statusOrder: Requisicao['status'][] = ['pendente', 'aprovado', 'entregue'];
        const currentIndex = statusOrder.indexOf(r.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const handleAdd = () => {
    setEditingRequisicao(null);
    setFormData({ empresa: '', departamento: '', solicitante: '', itens: 1, status: 'pendente' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Requisição por Departamento</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Requisição por Departamento</h1>
        <p className="text-slate-500 text-sm">Solicitação de produtos pelos departamentos da empresa.</p>
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
              <tr className="bg-slate-50">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Departamento</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Solicitante</th>
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
                    <td className="px-4 py-4 text-sm text-slate-500">{req.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.departamento}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.solicitante}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${req.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : req.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : req.status === 'entregue' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(req)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(req.id)} className={`p-1.5 transition-colors ${req.status === 'pendente' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={req.status === 'pendente' ? 'block' : 'check'} size={20} />
                        </button>
                      </div>
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

      <Sheet open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>{editingRequisicao ? 'Editar Requisição' : 'Nova Requisição'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
              <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Departamento</label>
                <input type="text" value={formData.departamento} onChange={(e) => setFormData({ ...formData, departamento: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Solicitante</label>
                <input type="text" value={formData.solicitante} onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
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