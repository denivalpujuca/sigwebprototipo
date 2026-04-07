import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Empresa {
  id: number;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  segmento: string;
  ativo: boolean;
}

const initialEmpresas: Empresa[] = [
  { id: 1, nomeFantasia: 'Tech Solutions', razaoSocial: 'Tech Solutions Tecnologia Ltda', cnpj: '12.345.678/0001-90', email: 'contato@techsolutions.com.br', telefone: '(11) 3333-3333', endereco: 'Av. Paulista, 1000', segmento: 'Tecnologia', ativo: true },
  { id: 2, nomeFantasia: 'Auto Peças Delta', razaoSocial: 'Delta Auto Peças Ltda', cnpj: '23.456.789/0001-01', email: 'vendas@deltapecas.com.br', telefone: '(11) 4444-4444', endereco: 'Rua das Peças, 200', segmento: 'Automotivo', ativo: true },
  { id: 3, nomeFantasia: 'Serviços ABC', razaoSocial: 'ABC Serviços Gerais Ltda', cnpj: '34.567.890/0001-12', email: 'contato@abcservicos.com.br', telefone: '(21) 5555-5555', endereco: 'Av. Rio Branco, 300', segmento: 'Serviços', ativo: true },
  { id: 4, nomeFantasia: 'Logística XYZ', razaoSocial: 'XYZ Logística Ltda', cnpj: '45.678.901/0001-23', email: 'operacao@xyzlog.com.br', telefone: '(31) 6666-6666', endereco: 'Av. Getúlio Vargas, 400', segmento: 'Logística', ativo: false },
  { id: 5, nomeFantasia: 'Construtora Mega', razaoSocial: 'Mega Construções Ltda', cnpj: '56.789.012/0001-34', email: 'projetos@megaconstrucoes.com.br', telefone: '(41) 7777-7777', endereco: 'Rua das Obras, 500', segmento: 'Construção Civil', ativo: true },
];

interface EmpresasProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const EmpresasPage: React.FC<EmpresasProps> = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({ nomeFantasia: '', razaoSocial: '', cnpj: '', email: '', telefone: '', endereco: '', segmento: '' });
  const itemsPerPage = 5;

  const filteredEmpresas = useMemo(() => {
    return empresas.filter(empresa => 
      empresa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.cnpj.includes(searchTerm) ||
      empresa.segmento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [empresas, searchTerm]);

  const paginatedEmpresas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmpresas.slice(start, start + itemsPerPage);
  }, [filteredEmpresas, currentPage]);

  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);

  const handleSave = () => {
    if (editingEmpresa) {
      setEmpresas(prev => prev.map(e => e.id === editingEmpresa.id ? { ...formData, id: editingEmpresa.id, ativo: editingEmpresa.ativo } : e));
    } else {
      const newId = Math.max(...empresas.map(e => e.id), 0) + 1;
      setEmpresas(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingEmpresa(null);
    setFormData({ nomeFantasia: '', razaoSocial: '', cnpj: '', email: '', telefone: '', endereco: '', segmento: '' });
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({ nomeFantasia: empresa.nomeFantasia, razaoSocial: empresa.razaoSocial, cnpj: empresa.cnpj, email: empresa.email, telefone: empresa.telefone, endereco: empresa.endereco, segmento: empresa.segmento });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ativo: !e.ativo } : e));
  };

  const handleAdd = () => {
    setEditingEmpresa(null);
    setFormData({ nomeFantasia: '', razaoSocial: '', cnpj: '', email: '', telefone: '', endereco: '', segmento: '' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Empresas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Empresas</h1>
        <p className="text-slate-500 text-sm">Cadastro e gerenciamento de empresas parceiras.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar empresa"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome Fantasia</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Razão Social</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CNPJ</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Segmento</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedEmpresas.map(empresa => (
                  <tr key={empresa.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{empresa.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{empresa.nomeFantasia}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{empresa.razaoSocial}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-500">{empresa.cnpj}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{empresa.segmento}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${empresa.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {empresa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(empresa)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(empresa.id)} className={`p-1.5 transition-colors ${empresa.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={empresa.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedEmpresas.length} de {filteredEmpresas.length} registros</span>
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
            <SheetTitle>{editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Fantasia</label>
              <input type="text" value={formData.nomeFantasia} onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Razão Social</label>
              <input type="text" value={formData.razaoSocial} onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CNPJ</label>
              <input type="text" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Segmento</label>
              <input type="text" value={formData.segmento} onChange={(e) => setFormData({ ...formData, segmento: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
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