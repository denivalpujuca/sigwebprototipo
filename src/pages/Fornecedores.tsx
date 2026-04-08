import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  ativo: boolean;
}

const initialFornecedores: Fornecedor[] = [
  { id: 1, nome: 'Distribuidora ABC Ltda', cnpj: '12.345.678/0001-90', email: 'contato@abc.com', telefone: '(11) 1234-5678', endereco: 'Rua das Flores, 100', ativo: true },
  { id: 2, nome: 'Comercial XYZ S/A', cnpj: '23.456.789/0001-01', email: 'vendas@xyz.com', telefone: '(11) 2345-6789', endereco: 'Av. Paulista, 500', ativo: true },
  { id: 3, nome: 'Fornecedor Norte Ltda', cnpj: '34.567.890/0001-12', email: 'norte@fornecedor.com', telefone: '(21) 3456-7890', endereco: 'Rua Nova, 200', ativo: true },
  { id: 4, nome: 'Madeireira Sul', cnpj: '45.678.901/0001-23', email: 'contato@madeireira.com', telefone: '(51) 4567-8901', endereco: 'Rodovia BR-101, km 50', ativo: false },
];

interface FornecedoresProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const FornecedoresPage: React.FC<FornecedoresProps> = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialFornecedores);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [formData, setFormData] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });
  const itemsPerPage = 5;

  const filteredFornecedores = useMemo(() => {
    return fornecedores.filter(fornecedor => 
      fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      fornecedor.cnpj.includes(searchTerm)
    );
  }, [fornecedores, searchTerm]);

  const paginatedFornecedores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFornecedores.slice(start, start + itemsPerPage);
  }, [filteredFornecedores, currentPage]);

  const totalPages = Math.ceil(filteredFornecedores.length / itemsPerPage);

  const handleSave = () => {
    if (editingFornecedor) {
      setFornecedores(prev => prev.map(f => f.id === editingFornecedor.id ? { ...formData, id: editingFornecedor.id, ativo: editingFornecedor.ativo } : f));
    } else {
      const newId = Math.max(...fornecedores.map(f => f.id), 0) + 1;
      setFornecedores(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingFornecedor(null);
    setFormData({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData({ nome: fornecedor.nome, cnpj: fornecedor.cnpj, email: fornecedor.email, telefone: fornecedor.telefone, endereco: fornecedor.endereco });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f));
  };

  const handleAdd = () => {
    setEditingFornecedor(null);
    setFormData({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Compras</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Fornecedores</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Fornecedores</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de fornecedores.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar fornecedor"
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
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CNPJ</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Telefone</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Endereço</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFornecedores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedFornecedores.map(fornecedor => (
                  <tr key={fornecedor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{fornecedor.nome}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-500">{fornecedor.cnpj}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{fornecedor.email}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{fornecedor.telefone}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate">{fornecedor.endereco}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${fornecedor.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(fornecedor)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(fornecedor.id)} className={`p-1.5 transition-colors ${fornecedor.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={fornecedor.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedFornecedores.length} de {filteredFornecedores.length} registros</span>
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
            <SheetTitle>{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CNPJ</label>
              <input type="text" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
                <input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço</label>
              <textarea value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" rows={2} required />
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