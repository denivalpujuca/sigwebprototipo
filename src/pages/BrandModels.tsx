import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface BrandModel {
  id: number;
  marca: string;
  modelo: string;
  tipo: string;
  ativo: boolean;
}

const initialBrands: BrandModel[] = [
  { id: 1, marca: 'SCANIA', modelo: 'R 420', tipo: 'Caminhão', ativo: true },
  { id: 2, marca: 'SCANIA', modelo: 'G 440', tipo: 'Caminhão', ativo: true },
  { id: 3, marca: 'VOLVO', modelo: 'FH 440', tipo: 'Caminhão', ativo: true },
  { id: 4, marca: 'VOLVO', modelo: 'FMX 460', tipo: 'Caminhão', ativo: true },
  { id: 5, marca: 'MERCEDES', modelo: 'AXOR 1844', tipo: 'Caminhão', ativo: true },
  { id: 6, marca: 'MERCEDES', modelo: 'Atego 1418', tipo: 'Caminhão', ativo: true },
];

interface BrandModelsPageProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const BrandModelsPage: React.FC<BrandModelsPageProps> = () => {
  const [brands, setBrands] = useState<BrandModel[]>(initialBrands);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandModel | null>(null);
  const [formData, setFormData] = useState({ marca: '', modelo: '', tipo: '', ativo: true });
  const itemsPerPage = 5;

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => 
      brand.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, currentPage]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const handleSave = () => {
    if (editingBrand) {
      setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...formData, id: editingBrand.id } : b));
    } else {
      const newId = Math.max(...brands.map(b => b.id), 0) + 1;
      setBrands(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ marca: '', modelo: '', tipo: '', ativo: true });
  };

  const handleEdit = (brand: BrandModel) => {
    setEditingBrand(brand);
    setFormData({ marca: brand.marca, modelo: brand.modelo, tipo: brand.tipo, ativo: brand.ativo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ativo: !b.ativo } : b));
  };

  const handleAdd = () => {
    setEditingBrand(null);
    setFormData({ marca: '', modelo: '', tipo: '', ativo: true });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Frota</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Marcas e Modelos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Marcas e Modelos</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de marcas e modelos de veículos e máquinas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por Marca ou Modelo"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Marca</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Modelo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{brand.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{brand.marca}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{brand.modelo}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{brand.tipo}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${brand.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {brand.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(brand)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(brand.id)} className={`p-1.5 transition-colors ${brand.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={brand.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedBrands.length} de {filteredBrands.length} registros</span>
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
            <SheetTitle>{editingBrand ? 'Editar Marca/Modelo' : 'Nova Marca/Modelo'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Marca</label>
              <input type="text" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Modelo</label>
              <input type="text" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
              <input type="text" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
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