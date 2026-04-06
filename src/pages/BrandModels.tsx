import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

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
  { id: 7, marca: 'FORD', modelo: 'Cargo 2629', tipo: 'Caminhão', ativo: true },
  { id: 8, marca: 'IVECO', modelo: 'Stralis AS440', tipo: 'Caminhão', ativo: true },
  { id: 9, marca: 'DAF', modelo: 'CF85 410', tipo: 'Caminhão', ativo: true },
  { id: 10, marca: 'CATERPILLAR', modelo: '140B', tipo: 'Máquina', ativo: true },
  { id: 11, marca: 'KOMATSU', modelo: 'WA380-8', tipo: 'Máquina', ativo: true },
  { id: 12, marca: 'JCB', modelo: '3CX', tipo: 'Máquina', ativo: true },
  { id: 13, marca: 'HYUNDAI', modelo: 'HL770-9A', tipo: 'Máquina', ativo: true },
  { id: 14, marca: 'JOHN DEERE', modelo: '644K', tipo: 'Máquina', ativo: true },
  { id: 15, marca: 'LIEBHERR', modelo: 'LTM 1100-4.2', tipo: 'Guindaste', ativo: false },
];

interface BrandModelsPageProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const BrandModelsPage: React.FC<BrandModelsPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [brands, setBrands] = useState<BrandModel[]>(initialBrands);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandModel | null>(null);
  const [viewingBrand, setViewingBrand] = useState<BrandModel | null>(null);
  const [formData, setFormData] = useState({ marca: '', modelo: '', tipo: '', ativo: true });
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;
  const itemsPerPage = 4;

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

  const handleDeactivate = (id: number) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ativo: !b.ativo } : b));
  };

  const handleAdd = () => {
    setEditingBrand(null);
    setFormData({ marca: '', modelo: '', tipo: '', ativo: true });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Frota</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Marcas e Modelos</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Marcas e Modelos</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de marcas e modelos de veículos e máquinas.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">TOTAL</span>
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">{brands.length}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Cadastrados</div>
              </div>
            </div>
            <div className="bg-[#005ac2] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#005ac2]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ATIVOS</span>
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">{brands.filter(b => b.ativo).length}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Ativos</div>
              </div>
            </div>
            <div className="bg-[#ba1a1a] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#ba1a1a]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">INATIVOS</span>
                <span className="material-symbols-outlined">cancel</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">{brands.filter(b => !b.ativo).length}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Inativos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar por Marca ou Modelo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <button className="px-5 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] transition-colors text-[#191c1d] text-sm font-semibold rounded-md flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">tune</span>
            Filtrar
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Marca</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Modelo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-[#f3f4f5]/50 transition-colors group">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{brand.id}</td>
                    <td className="px-4 py-4 text-sm text-[#191c1d]">{brand.marca}</td>
                    <td className="px-4 py-4 text-sm text-[#191c1d]">{brand.modelo}</td>
                    <td className="px-4 py-4 text-sm text-[#191c1d]">{brand.tipo}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${brand.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {brand.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(brand)}
                          className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeactivate(brand.id)}
                          className="p-1.5 text-[#555f70] hover:text-[#ba1a1a] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">{brand.ativo ? 'lock_open' : 'lock'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedBrands.length} de {filteredBrands.length} registros</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-[#e7e8e9] transition-colors text-[#555f70]"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded cursor-pointer ${
                  currentPage === page ? 'bg-[#006e2d] text-white' : 'hover:bg-[#e7e8e9]'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-[#e7e8e9] transition-colors text-[#555f70]"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">
                {editingBrand ? 'Editar Marca/Modelo' : 'Nova Marca/Modelo'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Tipo</label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined">save</span>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingBrand && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Detalhes</h2>
              <button onClick={() => setViewingBrand(null)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Código</span>
                  <div className="text-sm font-bold text-[#191c1d]">{viewingBrand.id}</div>
                </div>
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${viewingBrand.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                      {viewingBrand.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Marca</span>
                <div className="text-sm text-[#191c1d]">{viewingBrand.marca}</div>
              </div>
              <div>
                <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Modelo</span>
                <div className="text-sm text-[#191c1d]">{viewingBrand.modelo}</div>
              </div>
              <div>
                <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Tipo</span>
                <div className="text-sm text-[#191c1d]">{viewingBrand.tipo}</div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#bccbb9]/10 flex justify-end">
              <button onClick={() => setViewingBrand(null)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={() => setShowLogoutModal(true)}
      showLogoutModal={showLogoutModal}
      onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })}
      onCancelLogout={() => setShowLogoutModal(false)}
    >
      {content}
    </MainLayout>
  );
};