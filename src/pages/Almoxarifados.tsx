import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Almoxarifado {
  id: number;
  nome: string;
  endereco: string;
  responsavel: string;
  empresa: string;
  ativo: boolean;
}

const initialAlmoxarifados: Almoxarifado[] = [
  { id: 1, nome: 'Almoxarifado Central', endereco: 'Av. Principal, 1000 - Centro', responsavel: 'João Silva', empresa: 'Gestão Urbana S/A', ativo: true },
  { id: 2, nome: 'Almoxarifado Norte', endereco: 'Rua das Indústrias, 250 - Zona Norte', responsavel: 'Maria Santos', empresa: 'Serviços Metropolitanos Ltda', ativo: true },
  { id: 3, nome: 'Almoxarifado Sul', endereco: 'Estrada dos Hangares, 500 - Zona Sul', responsavel: 'Pedro Oliveira', empresa: 'Ambiental Norte S/A', ativo: true },
  { id: 4, nome: 'Almoxarifado Zona Leste', endereco: 'Av. Brasil, 800 - Zona Leste', responsavel: 'Ana Costa', empresa: 'Transporte Público Municipal', ativo: false },
];

const empresas = ['Gestão Urbana S/A', 'Serviços Metropolitanos Ltda', 'Ambiental Norte S/A', 'Transporte Público Municipal', 'Saneamento Básico S/A'];

interface AlmoxarifadosPageProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const AlmoxarifadosPage: React.FC<AlmoxarifadosPageProps> = () => {
  const [almoxarifados, setAlmoxarifados] = useState<Almoxarifado[]>(initialAlmoxarifados);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlmoxarifado, setEditingAlmoxarifado] = useState<Almoxarifado | null>(null);
  const [formData, setFormData] = useState({ nome: '', endereco: '', responsavel: '', empresa: '' });
  const itemsPerPage = 5;

  const filteredAlmoxarifados = useMemo(() => {
    return almoxarifados.filter(alm => 
      alm.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      alm.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alm.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alm.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [almoxarifados, searchTerm]);

  const paginatedAlmoxarifados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlmoxarifados.slice(start, start + itemsPerPage);
  }, [filteredAlmoxarifados, currentPage]);

  const totalPages = Math.ceil(filteredAlmoxarifados.length / itemsPerPage);

  const handleSave = () => {
    if (!formData.nome || !formData.endereco || !formData.responsavel || !formData.empresa) {
      alert('Preencha todos os campos');
      return;
    }
    if (editingAlmoxarifado) {
      setAlmoxarifados(prev => prev.map(a => a.id === editingAlmoxarifado.id ? { ...formData, id: editingAlmoxarifado.id, ativo: editingAlmoxarifado.ativo } : a));
    } else {
      const newId = Math.max(...almoxarifados.map(a => a.id), 0) + 1;
      setAlmoxarifados(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingAlmoxarifado(null);
    setFormData({ nome: '', endereco: '', responsavel: '', empresa: '' });
  };

  const handleEdit = (almoxarifado: Almoxarifado) => {
    setEditingAlmoxarifado(almoxarifado);
    setFormData({ nome: almoxarifado.nome, endereco: almoxarifado.endereco, responsavel: almoxarifado.responsavel, empresa: almoxarifado.empresa });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setAlmoxarifados(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  const handleAdd = () => {
    setEditingAlmoxarifado(null);
    setFormData({ nome: '', endereco: '', responsavel: '', empresa: '' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Almoxarifados</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Almoxarifados</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de almoxarifados e depósitos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar almoxarifado"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Endereço</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Responsável</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAlmoxarifados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedAlmoxarifados.map(alm => (
                  <tr key={alm.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{alm.id}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{alm.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{alm.endereco}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{alm.responsavel}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{alm.empresa}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${alm.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {alm.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(alm)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(alm.id)} className={`p-1.5 transition-colors ${alm.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={alm.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedAlmoxarifados.length} de {filteredAlmoxarifados.length} registros</span>
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
            <SheetTitle>{editingAlmoxarifado ? 'Editar Almoxarifado' : 'Novo Almoxarifado'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço</label>
              <input type="text" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Responsável</label>
              <input type="text" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
              <Select value={formData.empresa} onValueChange={(value) => setFormData({ ...formData, empresa: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(emp => (
                    <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                  ))}
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
