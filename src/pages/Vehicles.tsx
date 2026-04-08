import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Vehicle {
  id: number;
  nome: string;
  placa: string;
  chassi: string;
  volume: number;
  marca: string;
  modelo: string;
  tipo: string;
  ativo: boolean;
}

const initialVehicles: Vehicle[] = [
  { id: 106, nome: "SCANIA R 420A6X4", placa: "OEH8629", chassi: "9BSR6X400C3699158", volume: 21000, marca: "CATERPILLAR", modelo: "140B", tipo: "Caminhão Traçado", ativo: true },
  { id: 112, nome: "MERCEDES BENZ AXOR 3344", placa: "PXI1A22", chassi: "9BSR6X411B2238472", volume: 18000, marca: "VOLVO", modelo: "FMX 460", tipo: "Basculante", ativo: false },
  { id: 94, nome: "VOLKSWAGEN CONSTELLATION 24.280", placa: "QOE9481", chassi: "9BSR6X499A1122847", volume: 15000, marca: "FORD", modelo: "CARGO 2428", tipo: "Tanque Pipa", ativo: false },
  { id: 201, nome: "IVECO TECTOR 240E28", placa: "RKY5F11", chassi: "9BSR6X400L9938812", volume: 12500, marca: "SCANIA", modelo: "P310", tipo: "Carga Geral", ativo: true },
  { id: 107, nome: "VOLVO FH 440", placa: "OEH8630", chassi: "9BSR6X400C3699159", volume: 20000, marca: "VOLVO", modelo: "FH 440", tipo: "Caminhão", ativo: true },
  { id: 108, nome: "MERCEDES AXOR", placa: "OEH8631", chassi: "9BSR6X400C3699160", volume: 18000, marca: "MERCEDES", modelo: "AXOR 1844", tipo: "Caminhão", ativo: true },
];

interface VehiclesPageProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '' });
  const itemsPerPage = 5;

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => 
      vehicle.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const handleSave = () => {
    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...formData, id: editingVehicle.id, ativo: editingVehicle.ativo } : v));
    } else {
      const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
      setVehicles(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormData({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '' });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ nome: vehicle.nome, placa: vehicle.placa, chassi: vehicle.chassi, volume: vehicle.volume, marca: vehicle.marca, modelo: vehicle.modelo, tipo: vehicle.tipo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ativo: !v.ativo } : v));
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Frota</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Veículos e Máquinas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Veículos e Máquinas</h1>
        <p className="text-slate-500 text-sm">Cadastro e gerenciamento de veículos e máquinas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar veículo"
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
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Placa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Veículo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Chassi</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Volume</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Marca/Modelo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{vehicle.id}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-900">{vehicle.placa}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{vehicle.nome}</span>
                        <span className="text-[11px] text-slate-500">{vehicle.tipo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{vehicle.chassi}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-slate-900">{vehicle.volume.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{vehicle.marca} {vehicle.modelo}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${vehicle.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {vehicle.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(vehicle)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(vehicle.id)} className={`p-1.5 transition-colors ${vehicle.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={vehicle.ativo ? 'block' : 'check'} size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedVehicles.length} de {filteredVehicles.length} registros</span>
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
            <SheetTitle>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Placa</label>
                <input type="text" value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Volume (M³)</label>
                <input type="number" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chassi</label>
              <input type="text" value={formData.chassi} onChange={(e) => setFormData({ ...formData, chassi: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Marca</label>
                <input type="text" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Modelo</label>
                <input type="text" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
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