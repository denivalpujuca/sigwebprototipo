import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  empresa: string;
  dataAdmissao: string;
  status: 'ATIVO' | 'FERIAS' | 'LICENCA' | 'DEMITIDO';
  ativo: boolean;
}

const initialFuncionarios: Funcionario[] = [
  { id: 1, nome: 'Ricardo Mendes', cpf: '123.456.789-00', email: 'ricardo@empresa.com', telefone: '(11) 99999-9999', cargo: 'Diretor', empresa: 'Gestão Urbana S/A', dataAdmissao: '2020-01-15', status: 'ATIVO', ativo: true },
  { id: 2, nome: 'João Silva', cpf: '234.567.890-11', email: 'joao@empresa.com', telefone: '(11) 88888-8888', cargo: 'Motorista', empresa: 'Serviços Metropolitanos', dataAdmissao: '2021-03-20', status: 'ATIVO', ativo: true },
  { id: 3, nome: 'Maria Santos', cpf: '345.678.901-22', email: 'maria@empresa.com', telefone: '(21) 77777-7777', cargo: 'Assistente', empresa: 'Ambiental Norte S/A', dataAdmissao: '2022-06-10', status: 'ATIVO', ativo: true },
  { id: 4, nome: 'Pedro Oliveira', cpf: '456.789.012-33', email: 'pedro@empresa.com', telefone: '(31) 66666-6666', cargo: 'Mecânico', empresa: 'Transporte Público', dataAdmissao: '2021-09-05', status: 'FERIAS', ativo: true },
  { id: 5, nome: 'Ana Costa', cpf: '567.890.123-44', email: 'ana@empresa.com', telefone: '(41) 55555-5555', cargo: 'Técnica T.I.', empresa: 'Saneamento Básico S/A', dataAdmissao: '2023-01-15', status: 'ATIVO', ativo: true },
];

interface FuncionariosProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const FuncionariosPage: React.FC<FuncionariosProps> = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(initialFuncionarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO' as Funcionario['status'] });
  const itemsPerPage = 5;

  const filteredFuncionarios = useMemo(() => {
    return funcionarios.filter(func => 
      func.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.cpf.includes(searchTerm) ||
      func.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [funcionarios, searchTerm]);

  const paginatedFuncionarios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFuncionarios.slice(start, start + itemsPerPage);
  }, [filteredFuncionarios, currentPage]);

  const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage);

  const handleSave = () => {
    if (editingFuncionario) {
      setFuncionarios(prev => prev.map(f => f.id === editingFuncionario.id ? { ...formData, id: editingFuncionario.id, ativo: editingFuncionario.ativo } : f));
    } else {
      const newId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
      setFuncionarios(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingFuncionario(null);
    setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO' });
  };

  const handleEdit = (func: Funcionario) => {
    setEditingFuncionario(func);
    setFormData({ nome: func.nome, cpf: func.cpf, email: func.email, telefone: func.telefone, cargo: func.cargo, empresa: func.empresa, dataAdmissao: func.dataAdmissao, status: func.status });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setFuncionarios(prev => prev.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f));
  };

  const handleAdd = () => {
    setEditingFuncionario(null);
    setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO' });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string, ativo: boolean) => {
    if (!ativo) return 'bg-red-100 text-red-700';
    switch (status) {
      case 'ATIVO':
        return 'bg-emerald-100 text-emerald-700';
      case 'FERIAS':
        return 'bg-blue-100 text-blue-700';
      case 'LICENCA':
        return 'bg-amber-100 text-amber-700';
      case 'DEMITIDO':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Gente e Gestão</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Funcionários</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Funcionários</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de funcionários.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar funcionário"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CPF</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cargo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Admissão</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFuncionarios.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedFuncionarios.map(funcionario => (
                  <tr key={funcionario.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{funcionario.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{funcionario.nome}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-500">{funcionario.cpf}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{funcionario.cargo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{funcionario.empresa}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      {new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(funcionario.status, funcionario.ativo)}`}>
                        {funcionario.ativo ? funcionario.status : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(funcionario)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(funcionario.id)} className={`p-1.5 transition-colors ${funcionario.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={funcionario.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedFuncionarios.length} de {filteredFuncionarios.length} registros</span>
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
            <SheetTitle>{editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CPF</label>
                <input type="text" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
                <input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cargo</label>
                <input type="text" value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
                <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Admissão</label>
                <input type="date" value={formData.dataAdmissao} onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Funcionario['status'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="FERIAS">Férias</SelectItem>
                    <SelectItem value="LICENCA">Licença</SelectItem>
                    <SelectItem value="DEMITIDO">Demitido</SelectItem>
                  </SelectContent>
                </Select>
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