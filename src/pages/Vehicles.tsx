import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';
import { StatusBadge } from '../components/StatusBadge';
import { Select } from '../components/Select';

interface Vehicle {
  id: number;
  nome: string;
  placa: string;
  chassi: string;
  volume: number;
  marca: string;
  modelo: string;
  tipo: string;
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'INATIVO';
}

const initialVehicles: Vehicle[] = [
  { id: 106, nome: "SCANIA R 420A6X4", placa: "OEH8629", chassi: "9BSR6X400C3699158", volume: 21000, marca: "CATERPILLAR", modelo: "140B", tipo: "Caminhão Traçado", status: "DISPONIVEL" },
  { id: 112, nome: "MERCEDES BENZ AXOR 3344", placa: "PXI1A22", chassi: "9BSR6X411B2238472", volume: 18000, marca: "VOLVO", modelo: "FMX 460", tipo: "Basculante", status: "MANUTENCAO" },
  { id: 94, nome: "VOLKSWAGEN CONSTELLATION 24.280", placa: "QOE9481", chassi: "9BSR6X499A1122847", volume: 15000, marca: "FORD", modelo: "CARGO 2428", tipo: "Tanque Pipa", status: "INATIVO" },
  { id: 201, nome: "IVECO TECTOR 240E28", placa: "RKY5F11", chassi: "9BSR6X400L9938812", volume: 12500, marca: "SCANIA", modelo: "P310", tipo: "Carga Geral", status: "DISPONIVEL" },
  { id: 107, nome: "VOLVO FH 440", placa: "OEH8630", chassi: "9BSR6X400C3699159", volume: 20000, marca: "VOLVO", modelo: "FH 440", tipo: "Caminhão", status: "DISPONIVEL" },
  { id: 108, nome: "MERCEDES AXOR", placa: "OEH8631", chassi: "9BSR6X400C3699160", volume: 18000, marca: "MERCEDES", modelo: "AXOR 1844", tipo: "Caminhão", status: "MANUTENCAO" },
  { id: 109, nome: "FORD CARGO", placa: "OEH8632", chassi: "9BSR6X400C3699161", volume: 15000, marca: "FORD", modelo: "Cargo 2629", tipo: "Caminhão", status: "DISPONIVEL" },
  { id: 110, nome: "IVECO STRALIS", placa: "OEH8633", chassi: "9BSR6X400C3699162", volume: 19000, marca: "IVECO", modelo: "Stralis AS440", tipo: "Caminhão", status: "DISPONIVEL" },
  { id: 111, nome: "DAF CF85", placa: "OEH8634", chassi: "9BSR6X400C3699163", volume: 20500, marca: "DAF", modelo: "CF85 410", tipo: "Caminhão", status: "INATIVO" },
  { id: 69, nome: "CATERPILLAR 140B", placa: "OEH8635", chassi: "CAT0140B123456789", volume: 2500, marca: "CATERPILLAR", modelo: "140B", tipo: "Escavadeira", status: "DISPONIVEL" },
  { id: 70, nome: "KOMATSU WA380", placa: "OEH8636", chassi: "KOMWA38012345678", volume: 3200, marca: "KOMATSU", modelo: "WA380-8", tipo: "Carregadeira", status: "DISPONIVEL" },
  { id: 71, nome: "VOLVO L150H", placa: "OEH8637", chassi: "VNL150H123456789", volume: 4500, marca: "VOLVO", modelo: "L150H", tipo: "Carregadeira", status: "MANUTENCAO" },
  { id: 72, nome: "CATERPILLAR 950M", placa: "OEH8638", chassi: "CAT0950M98765432", volume: 5200, marca: "CATERPILLAR", modelo: "950M", tipo: "Carregadeira", status: "DISPONIVEL" },
  { id: 73, nome: "HYUNDAI HL770", placa: "OEH8639", chassi: "HYUHL77011223344", volume: 4800, marca: "HYUNDAI", modelo: "HL770-9A", tipo: "Carregadeira", status: "DISPONIVEL" },
  { id: 74, nome: "JCB 3CX", placa: "OEH8640", chassi: "JCB3CX1234567890", volume: 600, marca: "JCB", modelo: "3CX", tipo: "Escavadeira", status: "DISPONIVEL" },
  { id: 75, nome: "CASE CX210", placa: "OEH8641", chassi: "CASE2101234567890", volume: 900, marca: "CASE", modelo: "CX210D", tipo: "Escavadeira", status: "INATIVO" },
  { id: 76, nome: "NEW HOLLAND B110", placa: "OEH8642", chassi: "NHB1109876543210", volume: 1100, marca: "NEW HOLLAND", modelo: "B110B", tipo: "Trator", status: "DISPONIVEL" },
  { id: 77, nome: "KUBOTA M7-172", placa: "OEH8643", chassi: "KUBM717212345678", volume: 800, marca: "KUBOTA", modelo: "M7-172", tipo: "Trator", status: "DISPONIVEL" },
  { id: 78, nome: "JOHN DEERE 644K", placa: "OEH8644", chassi: "JD644K1234567890", volume: 3600, marca: "JOHN DEERE", modelo: "644K", tipo: "Carregadeira", status: "MANUTENCAO" },
  { id: 79, nome: "LIEBHERR LTM 1100", placa: "OEH8645", chassi: "LH1100X123456789", volume: 40000, marca: "LIEBHERR", modelo: "LTM 1100-4.2", tipo: "Guindaste", status: "DISPONIVEL" },
  { id: 80, nome: "GROVE GMK5150L", placa: "OEH8646", chassi: "GRVMK51501234567", volume: 45000, marca: "GROVE", modelo: "GMK5150L", tipo: "Guindaste", status: "DISPONIVEL" },
  { id: 81, nome: "TADANO ATF70G", placa: "OEH8647", chassi: "TAD70G12345678901", volume: 42000, marca: "TADANO", modelo: "ATF70G-4", tipo: "Guindaste", status: "DISPONIVEL" },
  { id: 82, nome: "TEREX AC 100/10L", placa: "OEH8648", chassi: "TRXAC10012345678", volume: 38000, marca: "TEREX", modelo: "AC 100/10L", tipo: "Guindaste", status: "INATIVO" },
];

interface VehiclesPageProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'DISPONIVEL' | 'MANUTENCAO' | 'INATIVO'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '', status: 'DISPONIVEL' as Vehicle['status'] });
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;
  const itemsPerPage = 4;

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const sortedVehicles = [...filteredVehicles].sort((a, b) => a.marca.localeCompare(b.marca));
    const groupedVehicles = sortedVehicles.reduce((acc, v) => {
      if (!acc[v.marca]) acc[v.marca] = [];
      acc[v.marca].push(v);
      return acc;
    }, {} as Record<string, Vehicle[]>);

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Veículos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #191c1d; margin-bottom: 10px; }
            p { color: #555f70; margin-bottom: 20px; }
            .group { margin-bottom: 20px; }
            .group-title { background-color: #006e2d; color: white; padding: 8px 12px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f5; }
          </style>
        </head>
        <body>
          <h1>Relatório de Veículos e Máquinas</h1>
          <p>Total de registros: ${filteredVehicles.length}</p>
          ${Object.entries(groupedVehicles).map(([marca, vehicles]) => `
            <div class="group">
              <div class="group-title">${marca} (${vehicles.length})</div>
              <table>
                <thead>
                  <tr>
                    <th>Cod</th><th>Placa</th><th>Veículo</th><th>Chassi</th><th>Volume</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${vehicles.map(v => `
                    <tr>
                      <td>${v.id}</td><td>${v.placa}</td><td>${v.nome}</td><td>${v.chassi}</td><td>${v.volume}</td><td>${v.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    printFrame.contentWindow?.document.write(content);
    printFrame.contentWindow?.document.close();
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, filterStatus]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  const handleSave = () => {
    if (editingVehicle) {
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...formData, id: editingVehicle.id } : v));
    } else {
      const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
      setVehicles(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormData({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '', status: 'DISPONIVEL' });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ nome: vehicle.nome, placa: vehicle.placa, chassi: vehicle.chassi, volume: vehicle.volume, marca: vehicle.marca, modelo: vehicle.modelo, tipo: vehicle.tipo, status: vehicle.status });
    setIsModalOpen(true);
  };

  const handleDeactivate = (id: number) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'INATIVO' } : v));
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '', status: 'DISPONIVEL' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Frota</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Veículos e Máquinas</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Veículos e Máquinas</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento completo e coreografia da frota operacional.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">DISPONIBILIDADE</span>
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {Math.round((vehicles.filter(v => v.status === 'DISPONIVEL').length / vehicles.length) * 100)}%
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Frota Ativa</div>
              </div>
            </div>
            <div className="bg-[#005ac2] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#005ac2]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">MANUTENÇÃO</span>
                <span className="material-symbols-outlined">engineering</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {vehicles.filter(v => v.status === 'MANUTENCAO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Em Oficina</div>
              </div>
            </div>
            <div className="bg-[#ba1a1a] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#ba1a1a]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ALERTAS</span>
                <span className="material-symbols-outlined">report_problem</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {vehicles.filter(v => v.status === 'INATIVO').length}
                </div>
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
              placeholder="Pesquisar por Veículo e Máquina"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-[#006e2d] text-white rounded-md hover:bg-[#005a26] flex items-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">filter_list</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
            >
              <option value="all">Todos</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-white border border-gray-300 text-[#555f70] rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Gerar PDF
        </button>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Placa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Veículo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Chassi</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Volume</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Marca/Modelo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum veículo encontrado</td>
                </tr>
              ) : (
                paginatedVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-[#f3f4f5]/50 transition-colors group">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{vehicle.id}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#191c1d] font-mono">{vehicle.placa}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#191c1d]">{vehicle.nome}</span>
                        <span className="text-[11px] text-[#555f70]">{vehicle.tipo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#191c1d]">{vehicle.chassi}</td>
                    <td className="px-4 py-4 text-sm text-center font-bold text-[#191c1d]">{vehicle.volume.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-[#191c1d]">{vehicle.marca} {vehicle.modelo}</td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(vehicle)}
                          className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeactivate(vehicle.id)}
                          className={`p-1.5 transition-colors text-[#555f70] hover:text-[#ba1a1a] ${vehicle.status === 'INATIVO' ? 'cursor-not-allowed opacity-50' : ''}`}
                          disabled={vehicle.status === 'INATIVO'}
                        >
                          <span className="material-symbols-outlined text-[20px]">{vehicle.status === 'INATIVO' ? 'lock' : 'block'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedVehicles.length} de {filteredVehicles.length} veículos</span>
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
                {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Placa</label>
                  <input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Volume (M³)</label>
                  <input
                    type="number"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Chassi</label>
                <input
                  type="text"
                  value={formData.chassi}
                  onChange={(e) => setFormData({ ...formData, chassi: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="INATIVO">Inativo</option>
                  </Select>
                </div>
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

      {viewingVehicle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Detalhes do Veículo</h2>
              <button onClick={() => setViewingVehicle(null)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Código</span>
                  <div className="text-sm font-bold text-[#191c1d]">{viewingVehicle.id}</div>
                </div>
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Status</span>
                  <div className="mt-1"><StatusBadge status={viewingVehicle.status} /></div>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Nome</span>
                <div className="text-sm font-bold text-[#191c1d]">{viewingVehicle.nome}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Placa</span>
                  <div className="text-sm font-mono text-[#191c1d]">{viewingVehicle.placa}</div>
                </div>
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Volume</span>
                  <div className="text-sm text-[#191c1d]">{viewingVehicle.volume.toLocaleString()} M³</div>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Chassi</span>
                <div className="text-sm font-mono text-[#191c1d]">{viewingVehicle.chassi}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Marca</span>
                  <div className="text-sm text-[#191c1d]">{viewingVehicle.marca}</div>
                </div>
                <div>
                  <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Modelo</span>
                  <div className="text-sm text-[#191c1d]">{viewingVehicle.modelo}</div>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#555f70] font-medium uppercase tracking-wider">Tipo</span>
                <div className="text-sm text-[#191c1d]">{viewingVehicle.tipo}</div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#bccbb9]/10 flex justify-end">
              <button onClick={() => setViewingVehicle(null)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Fechar</button>
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