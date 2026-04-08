import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Cargo {
  id: number;
  nome: string;
  descricao: string;
  nivel: number;
  ativo: boolean;
}

const initialCargos: Cargo[] = [
  { id: 1, nome: 'Diretor', descricao: 'Responsável pela direção geral da empresa', nivel: 1, ativo: true },
  { id: 2, nome: 'Gerente', descricao: 'Responsável por área específica', nivel: 2, ativo: true },
  { id: 3, nome: 'Motorista', descricao: 'Motorista de veículos da frota', nivel: 4, ativo: true },
  { id: 4, nome: 'Mecânico', descricao: 'Manutenção de veículos e máquinas', nivel: 4, ativo: true },
  { id: 5, nome: 'Assistente', descricao: 'Auxilio administrativo', nivel: 3, ativo: true },
  { id: 6, nome: 'Técnico T.I.', descricao: 'Suporte técnico em tecnologia', nivel: 3, ativo: true },
];

interface CargosProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const CargosPage: React.FC<CargosProps> = () => {
  const [cargos, setCargos] = useState<Cargo[]>(initialCargos);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', nivel: 3 });
  const itemsPerPage = 5;

  const filteredCargos = useMemo(() => {
    return cargos.filter(cargo => 
      cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cargos, searchTerm]);

  const paginatedCargos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCargos.slice(start, start + itemsPerPage);
  }, [filteredCargos, currentPage]);

  const totalPages = Math.ceil(filteredCargos.length / itemsPerPage);

  const handleSave = () => {
    if (editingCargo) {
      setCargos(prev => prev.map(c => c.id === editingCargo.id ? { ...formData, id: editingCargo.id, ativo: editingCargo.ativo } : c));
    } else {
      const newId = Math.max(...cargos.map(c => c.id), 0) + 1;
      setCargos(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingCargo(null);
    setFormData({ nome: '', descricao: '', nivel: 3 });
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({ nome: cargo.nome, descricao: cargo.descricao, nivel: cargo.nivel });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setCargos(prev => prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
  };

  const handleAdd = () => {
    setEditingCargo(null);
    setFormData({ nome: '', descricao: '', nivel: 3 });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Gente e Gestão</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Cargos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Cargos</h1>
        <p className="text-slate-500 text-sm">Cadastro e gerenciamento de cargos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar cargo"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Nível</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCargos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedCargos.map(cargo => (
                  <tr key={cargo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{cargo.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{cargo.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{cargo.descricao}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-slate-900">Nível {cargo.nivel}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${cargo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {cargo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(cargo)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(cargo.id)} className={`p-1.5 transition-colors ${cargo.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={cargo.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedCargos.length} de {filteredCargos.length} registros</span>
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
            <SheetTitle>{editingCargo ? 'Editar Cargo' : 'Novo Cargo'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
              <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nível</label>
              <Select value={String(formData.nivel)} onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nível 1 - Direção</SelectItem>
                  <SelectItem value="2">Nível 2 - Gerência</SelectItem>
                  <SelectItem value="3">Nível 3 - Coordenação</SelectItem>
                  <SelectItem value="4">Nível 4 - Operação</SelectItem>
                </SelectContent>
              </Select>
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