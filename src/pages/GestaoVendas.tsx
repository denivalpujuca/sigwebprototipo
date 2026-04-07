import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Venda {
  id: number;
  empresa: string;
  cnpj: string;
  data: Date;
  itens: number;
  total: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'finalizada';
}

const initialVendas: Venda[] = [
  { id: 1, empresa: 'Gestão Urbana S/A', cnpj: '12.345.678/0001-90', data: new Date('2026-04-05'), itens: 2, total: 3300, status: 'finalizada' },
  { id: 2, empresa: 'Serviços Metropolitanos Ltda', cnpj: '23.456.789/0001-01', data: new Date('2026-04-04'), itens: 1, total: 2500, status: 'pendente' },
  { id: 3, empresa: 'Ambiental Norte S/A', cnpj: '34.567.890/0001-12', data: new Date('2026-04-03'), itens: 2, total: 1000, status: 'aprovado' },
];

interface GestaoVendasProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const GestaoVendasPage: React.FC<GestaoVendasProps> = () => {
  const [vendas, setVendas] = useState<Venda[]>(initialVendas);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [formData, setFormData] = useState<{ empresa: string; cnpj: string; data: string; itens: number; total: number; status: 'pendente' | 'aprovado' | 'rejeitado' | 'finalizada' }>({ empresa: '', cnpj: '', data: '', itens: 1, total: 0, status: 'pendente' });
  const itemsPerPage = 5;

  const filteredVendas = useMemo(() => {
    return vendas.filter(venda => 
      venda.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.id.toString().includes(searchTerm)
    );
  }, [vendas, searchTerm]);

  const paginatedVendas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendas.slice(start, start + itemsPerPage);
  }, [filteredVendas, currentPage]);

  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);

  const handleSave = () => {
    if (editingVenda) {
      setVendas(prev => prev.map(v => v.id === editingVenda.id ? { ...formData, id: editingVenda.id, data: new Date(formData.data) } as Venda : v));
    } else {
      const newId = Math.max(...vendas.map(v => v.id), 0) + 1;
      setVendas(prev => [...prev, { ...formData, id: newId, data: new Date(formData.data) } as Venda]);
    }
    setIsModalOpen(false);
    setEditingVenda(null);
    setFormData({ empresa: '', cnpj: '', data: '', itens: 1, total: 0, status: 'pendente' });
  };

  const handleEdit = (venda: Venda) => {
    setEditingVenda(venda);
    setFormData({ empresa: venda.empresa, cnpj: venda.cnpj, data: venda.data.toISOString().split('T')[0], itens: venda.itens, total: venda.total, status: venda.status });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setVendas(prev => prev.map(v => {
      if (v.id === id) {
        const statusOrder: Venda['status'][] = ['pendente', 'aprovado', 'finalizada'];
        const currentIndex = statusOrder.indexOf(v.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...v, status: nextStatus };
      }
      return v;
    }));
  };

  const handleAdd = () => {
    setEditingVenda(null);
    setFormData({ empresa: '', cnpj: '', data: new Date().toISOString().split('T')[0], itens: 1, total: 0, status: 'pendente' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Vendas</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Gestão de Vendas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Gestão de Vendas</h1>
        <p className="text-slate-500 text-sm">Acompanhe e gerencie as vendas de serviços.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar venda"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVendas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedVendas.map(venda => (
                  <tr key={venda.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">#{venda.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{venda.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{venda.itens} itens</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-slate-900">R$ {venda.total.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{venda.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${venda.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : venda.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : venda.status === 'finalizada' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(venda)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(venda.id)} className={`p-1.5 transition-colors ${venda.status === 'pendente' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={venda.status === 'pendente' ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedVendas.length} de {filteredVendas.length} registros</span>
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
            <SheetTitle>{editingVenda ? 'Editar Venda' : 'Nova Venda'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
              <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CNPJ</label>
              <input type="text" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
                <input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Total</label>
                <input type="number" value={formData.total} onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
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