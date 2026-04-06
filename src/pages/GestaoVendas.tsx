import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface VendasProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  valorUnitario: number;
  unidade: string;
  ativo: boolean;
}

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  status: 'ativa' | 'inativa';
}

interface ItemVenda {
  servico: Servico;
  quantidade: number;
  preco: number;
}

interface Venda {
  id: number;
  empresa: Empresa;
  itens: ItemVenda[];
  data: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'finalizada';
}

const empresas: Empresa[] = [
  { id: 1, nome: 'Gestão Urbana S/A', cnpj: '12.345.678/0001-90', status: 'ativa' },
  { id: 2, nome: 'Serviços Metropolitanos Ltda', cnpj: '23.456.789/0001-01', status: 'ativa' },
  { id: 3, nome: 'Ambiental Norte S/A', cnpj: '34.567.890/0001-12', status: 'ativa' },
  { id: 4, nome: 'Transporte Público Municipal', cnpj: '45.678.901/0001-23', status: 'ativa' },
  { id: 5, nome: 'Saneamento Básico S/A', cnpj: '56.789.012/0001-34', status: 'inativa' },
];

const gerarVendasMock = (): Venda[] => {
  return [
    {
      id: 1,
      empresa: empresas[0],
      data: new Date('2026-04-05'),
      status: 'finalizada',
      itens: [
        { servico: { id: 1, nome: 'Frete', descricao: 'Serviço de transporte', categoria: 'Transporte', valorUnitario: 1500, unidade: 'viagem', ativo: true }, quantidade: 2, preco: 1500 },
        { servico: { id: 3, nome: 'Manutenção Veicular', descricao: 'Manutenção', categoria: 'Serviços', valorUnitario: 300, unidade: 'serviço', ativo: true }, quantidade: 1, preco: 300 },
      ]
    },
    {
      id: 2,
      empresa: empresas[1],
      data: new Date('2026-04-04'),
      status: 'pendente',
      itens: [
        { servico: { id: 2, nome: 'Locação de Máquina', descricao: 'Locação', categoria: 'Locação', valorUnitario: 500, unidade: 'dia', ativo: true }, quantidade: 5, preco: 500 },
      ]
    },
    {
      id: 3,
      empresa: empresas[2],
      data: new Date('2026-04-03'),
      status: 'aprovado',
      itens: [
        { servico: { id: 4, nome: 'Aluguel de Empilhadeira', descricao: 'Aluguel', categoria: 'Locação', valorUnitario: 200, unidade: 'dia', ativo: true }, quantidade: 3, preco: 200 },
        { servico: { id: 6, nome: 'Acompanhamento', descricao: 'Acompanhamento', categoria: 'Serviços', valorUnitario: 100, unidade: 'hora', ativo: true }, quantidade: 8, preco: 100 },
      ]
    },
  ];
};

const itemsPerPage = 5;

export const GestaoVendasPage: React.FC<VendasProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('vendas');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [vendas, _setVendas] = useState<Venda[]>(gerarVendasMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado' | 'finalizada'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  const filteredVendas = useMemo(() => {
    return vendas.filter(venda => {
      const matchesSearch = searchTerm === '' || 
        venda.empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.id.toString().includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || venda.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [vendas, searchTerm, filterStatus]);

  const paginatedVendas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendas.slice(start, start + itemsPerPage);
  }, [filteredVendas, currentPage]);

  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-[#fff3cd] text-[#856404]';
      case 'aprovado': return 'bg-[#7ffc97] text-[#002109]';
      case 'rejeitado': return 'bg-[#ffdad6] text-[#93000a]';
      case 'finalizada': return 'bg-[#006e2d] text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getTotalVenda = (venda: Venda) => {
    return venda.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  };

  const viewDetails = (venda: Venda) => {
    setSelectedVenda(venda);
    setShowDetailsModal(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Vendas</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Gestão de Vendas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Gestão de Vendas</h1>
        <p className="text-[#555f70] text-sm">Acompanhe e gerencie as vendas de serviços.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#006e2d]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#006e2d]">receipt_long</span>
            </div>
            <div>
              <p className="text-xs text-[#555f70] font-medium">Total de Vendas</p>
              <p className="text-2xl font-bold text-[#191c1d]">{vendas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#fff3cd] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#856404]">schedule</span>
            </div>
            <div>
              <p className="text-xs text-[#555f70] font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-[#191c1d]">{vendas.filter(v => v.status === 'pendente').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#7ffc97] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#002109]">check_circle</span>
            </div>
            <div>
              <p className="text-xs text-[#555f70] font-medium">Finalizadas</p>
              <p className="text-2xl font-bold text-[#191c1d]">{vendas.filter(v => v.status === 'finalizada').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="p-4 border-b border-[#bccbb9]/10 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Buscar por ID ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
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
              className="pl-10 pr-8 py-2.5 bg-white border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
            >
              <option value="all">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="finalizada">Finalizada</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Total</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedVendas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555f70]">Nenhuma venda encontrada</td>
                </tr>
              ) : (
                paginatedVendas.map(venda => (
                  <tr key={venda.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">#{venda.id}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{venda.empresa.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{venda.itens.length} itens</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">R$ {getTotalVenda(venda).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{venda.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${getStatusColor(venda.status)}`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => viewDetails(venda)}
                        className="p-2 text-[#555f70] hover:text-[#006e2d] hover:bg-[#f3f4f5]/50 rounded-md transition-colors"
                        title="Ver detalhes"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedVendas.length} de {filteredVendas.length} registros</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span className="text-sm text-[#555f70]">
              {currentPage} de {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedVenda && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Detalhes da Venda #{selectedVenda.id}</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Empresa</h4>
                <p className="text-sm font-bold text-[#191c1d]">{selectedVenda.empresa.nome}</p>
                <p className="text-xs text-[#555f70]">{selectedVenda.empresa.cnpj}</p>
              </div>

              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Data</h4>
                <p className="text-sm text-[#191c1d]">{selectedVenda.data.toLocaleDateString('pt-BR')}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Itens</h4>
                <div className="space-y-2">
                  {selectedVenda.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-[#f8f9fa] p-2 rounded">
                      <span className="text-[#191c1d]">{item.quantidade}x {item.servico.nome}</span>
                      <span className="font-bold text-[#191c1d]">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-[#bccbb9]/20 pt-4 flex justify-between">
                <span className="font-bold text-[#191c1d]">Total</span>
                <span className="text-xl font-bold text-[#006e2d]">R$ {getTotalVenda(selectedVenda).toFixed(2)}</span>
              </div>

              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Status</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${getStatusColor(selectedVenda.status)}`}>
                  {selectedVenda.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={() => setShowLogoutModal(true)} showLogoutModal={showLogoutModal} onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} onCancelLogout={() => setShowLogoutModal(false)}>
      {content}
    </MainLayout>
  );
};
