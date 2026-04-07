import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  tipo: 'PF' | 'PJ';
  ativo: boolean;
}

const initialClientes: Cliente[] = [
  { id: 1, nome: 'João Silva', cpfCnpj: '123.456.789-00', email: 'joao@email.com', telefone: '(11) 99999-9999', endereco: 'Rua A, 123', tipo: 'PF', ativo: true },
  { id: 2, nome: 'Empresa ABC Ltda', cpfCnpj: '12.345.678/0001-90', email: 'contato@abc.com.br', telefone: '(11) 3333-3333', endereco: 'Av. B, 456', tipo: 'PJ', ativo: true },
  { id: 3, nome: 'Maria Santos', cpfCnpj: '987.654.321-00', email: 'maria@email.com', telefone: '(21) 88888-8888', endereco: 'Rua C, 789', tipo: 'PF', ativo: true },
  { id: 4, nome: 'XYZ Comercial', cpfCnpj: '98.765.432/0001-10', email: 'vendas@xyz.com.br', telefone: '(31) 4444-4444', endereco: 'Av. D, 101', tipo: 'PJ', ativo: false },
  { id: 5, nome: 'Pedro Oliveira', cpfCnpj: '111.222.333-44', email: 'pedro@email.com', telefone: '(41) 7777-7777', endereco: 'Rua E, 202', tipo: 'PF', ativo: true },
];

interface ClientesProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const ClientesPage: React.FC<ClientesProps> = () => {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '', tipo: 'PF' as 'PF' | 'PJ' });
  const itemsPerPage = 5;

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cliente.cpfCnpj.includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClientes.slice(start, start + itemsPerPage);
  }, [filteredClientes, currentPage]);

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  const handleSave = () => {
    if (editingCliente) {
      setClientes(prev => prev.map(c => c.id === editingCliente.id ? { ...formData, id: editingCliente.id, ativo: editingCliente.ativo } : c));
    } else {
      const newId = Math.max(...clientes.map(c => c.id), 0) + 1;
      setClientes(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingCliente(null);
    setFormData({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '', tipo: 'PF' });
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({ nome: cliente.nome, cpfCnpj: cliente.cpfCnpj, email: cliente.email, telefone: cliente.telefone, endereco: cliente.endereco, tipo: cliente.tipo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
  };

  const handleAdd = () => {
    setEditingCliente(null);
    setFormData({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '', tipo: 'PF' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Clientes</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Clientes</h1>
        <p className="text-slate-500 text-sm">Cadastro e gerenciamento de clientes.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar cliente"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CPF/CNPJ</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Telefone</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedClientes.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{cliente.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{cliente.nome}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-500">{cliente.cpfCnpj}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{cliente.email}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{cliente.telefone}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${cliente.tipo === 'PF' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {cliente.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${cliente.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(cliente)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(cliente.id)} className={`p-1.5 transition-colors ${cliente.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={cliente.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedClientes.length} de {filteredClientes.length} registros</span>
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
            <SheetTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CPF/CNPJ</label>
              <input type="text" value={formData.cpfCnpj} onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
              <input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço</label>
              <input type="text" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
              <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'PF' | 'PJ' })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
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