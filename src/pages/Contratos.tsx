import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';
import { Select } from '../components/Select';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  valorUnitario: number;
  unidade: string;
}

interface ServicoContrato {
  id: number;
  servicoId: number;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface Contrato {
  id: number;
  numero: string;
  cliente: string;
  empresa: string;
  tipo: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  status: 'ATIVO' | 'EXPIRADO' | 'CANCELADO';
  servicos: ServicoContrato[];
}

const servicosDisponiveis: Servico[] = [
  { id: 1, nome: 'Frete', descricao: 'Serviço de transporte de cargas', categoria: 'Transporte', valorUnitario: 1500, unidade: 'viagem' },
  { id: 2, nome: 'Locação de Máquina', descricao: 'Locação de máquinas pesadas', categoria: 'Locação', valorUnitario: 500, unidade: 'dia' },
  { id: 3, nome: 'Manutenção Veicular', descricao: 'Serviço de manutenção de veículos', categoria: 'Serviços', valorUnitario: 300, unidade: 'serviço' },
  { id: 4, nome: 'Aluguel de Empilhadeira', descricao: 'Aluguel de empilhadeira para movimentação', categoria: 'Locação', valorUnitario: 200, unidade: 'dia' },
  { id: 5, nome: 'Seguro', descricao: 'Cobertura securitária para cargas', categoria: 'Seguros', valorUnitario: 5000, unidade: 'ano' },
  { id: 6, nome: 'Acompanhamento', descricao: 'Serviço de acompanhamento de carga', categoria: 'Serviços', valorUnitario: 100, unidade: 'hora' },
];

const initialContratos: Contrato[] = [
  { 
    id: 1, 
    numero: '0000001/2026', 
    cliente: 'João Silva', 
    empresa: 'Tech Solutions', 
    tipo: 'Serviços', 
    valor: 18000, 
    dataInicio: '2024-01-01', 
    dataFim: '2024-12-31', 
    status: 'ATIVO',
    servicos: [
      { id: 1, servicoId: 1, nome: 'Frete', quantidade: 10, valorUnitario: 1500, valorTotal: 15000 },
      { id: 2, servicoId: 6, nome: 'Acompanhamento', quantidade: 30, valorUnitario: 100, valorTotal: 3000 },
    ]
  },
  { 
    id: 2, 
    numero: '0000002/2026', 
    cliente: 'Empresa ABC Ltda', 
    empresa: 'Auto Peças Delta', 
    tipo: 'Fornecimento', 
    valor: 50000, 
    dataInicio: '2024-02-01', 
    dataFim: '2025-01-31', 
    status: 'ATIVO',
    servicos: [
      { id: 3, servicoId: 2, nome: 'Locação de Máquina', quantidade: 100, valorUnitario: 500, valorTotal: 50000 },
    ]
  },
  { 
    id: 3, 
    numero: '0000003/2026', 
    cliente: 'Maria Santos', 
    empresa: 'Serviços ABC', 
    tipo: 'Locação', 
    valor: 25000, 
    dataInicio: '2023-06-01', 
    dataFim: '2024-05-31', 
    status: 'EXPIRADO',
    servicos: [
      { id: 4, servicoId: 4, nome: 'Aluguel de Empilhadeira', quantidade: 125, valorUnitario: 200, valorTotal: 25000 },
    ]
  },
  { 
    id: 4, 
    numero: '0000004/2026', 
    cliente: 'XYZ Comercial', 
    empresa: 'Logística XYZ', 
    tipo: 'Frete', 
    valor: 80000, 
    dataInicio: '2024-03-01', 
    dataFim: '2025-02-28', 
    status: 'ATIVO',
    servicos: [
      { id: 5, servicoId: 1, nome: 'Frete', quantidade: 40, valorUnitario: 1500, valorTotal: 60000 },
      { id: 6, servicoId: 2, nome: 'Locação de Máquina', quantidade: 20, valorUnitario: 500, valorTotal: 10000 },
      { id: 7, servicoId: 6, nome: 'Acompanhamento', quantidade: 100, valorUnitario: 100, valorTotal: 10000 },
    ]
  },
  { 
    id: 5, 
    numero: '0000005/2026', 
    cliente: 'Pedro Oliveira', 
    empresa: 'Construtora Mega', 
    tipo: 'Serviços', 
    valor: 35000, 
    dataInicio: '2024-04-01', 
    dataFim: '2024-09-30', 
    status: 'CANCELADO',
    servicos: [
      { id: 8, servicoId: 3, nome: 'Manutenção Veicular', quantidade: 50, valorUnitario: 300, valorTotal: 15000 },
      { id: 9, servicoId: 4, nome: 'Aluguel de Empilhadeira', quantidade: 100, valorUnitario: 200, valorTotal: 20000 },
    ]
  },
];

interface ContratosProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const ContratosPage: React.FC<ContratosProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [viewingContrato, setViewingContrato] = useState<Contrato | null>(null);
  const [selectedServicoId, setSelectedServicoId] = useState<number>(0);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [formData, setFormData] = useState({ 
    numero: '', 
    cliente: '', 
    empresa: '', 
    tipo: '', 
    valor: 0, 
    dataInicio: '', 
    dataFim: '', 
    status: 'ATIVO' as 'ATIVO' | 'EXPIRADO' | 'CANCELADO', 
    servicos: [] as ServicoContrato[] 
  });
  const itemsPerPage = 5;

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Contratos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #191c1d; margin-bottom: 10px; }
            p { color: #555f70; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f5; }
          </style>
        </head>
        <body>
          <h1>Relatório de Contratos</h1>
          <p>Total de registros: ${filteredContratos.length}</p>
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Cliente</th><th>Empresa</th><th>Tipo</th><th>Valor</th><th>Vigência</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredContratos.map(c => `
                <tr>
                  <td>${c.numero}</td><td>${c.cliente}</td><td>${c.empresa}</td><td>${c.tipo}</td><td>R$ ${c.valor.toLocaleString('pt-BR')}</td><td>${new Date(c.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(c.dataFim).toLocaleDateString('pt-BR')}</td><td>${c.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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

  const filteredContratos = useMemo(() => {
    return contratos.filter(contrato => {
      const matchesSearch = contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrato.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrato.empresa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || contrato.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [contratos, searchTerm, filterStatus]);

  const paginatedContratos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContratos.slice(start, start + itemsPerPage);
  }, [filteredContratos, currentPage]);

  const totalPages = Math.ceil(filteredContratos.length / itemsPerPage);

  const totalContrato = useMemo(() => {
    return formData.servicos.reduce((sum, s) => sum + s.valorTotal, 0);
  }, [formData.servicos]);

  const handleSave = () => {
    const novoNumero = editingContrato 
      ? editingContrato.numero 
      : `${String(contratos.length + 1).padStart(7, '0')}/2026`;
    
    const contratoData = {
      ...formData,
      numero: novoNumero,
      valor: totalContrato
    };
    
    if (editingContrato) {
      setContratos(prev => prev.map(c => c.id === editingContrato.id ? { ...contratoData, id: editingContrato.id } : c));
    } else {
      const newId = Math.max(...contratos.map(c => c.id), 0) + 1;
      setContratos(prev => [...prev, { ...contratoData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingContrato(null);
    setFormData({ numero: '', cliente: '', empresa: '', tipo: '', valor: 0, dataInicio: '', dataFim: '', status: 'ATIVO', servicos: [] });
    setSelectedServicoId(0);
    setQuantidade(1);
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setFormData({ 
      numero: contrato.numero, 
      cliente: contrato.cliente, 
      empresa: contrato.empresa, 
      tipo: contrato.tipo, 
      valor: contrato.valor, 
      dataInicio: contrato.dataInicio, 
      dataFim: contrato.dataFim, 
      status: contrato.status, 
      servicos: [...contrato.servicos] 
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setContratos(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    setEditingContrato(null);
    setFormData({ numero: '', cliente: '', empresa: '', tipo: '', valor: 0, dataInicio: '', dataFim: '', status: 'ATIVO', servicos: [] });
    setSelectedServicoId(0);
    setQuantidade(1);
    setIsModalOpen(true);
  };

  const handleAddServico = () => {
    if (selectedServicoId === 0) return;
    
    const servico = servicosDisponiveis.find(s => s.id === selectedServicoId);
    if (!servico) return;

    const novoServico: ServicoContrato = {
      id: Date.now(),
      servicoId: servico.id,
      nome: servico.nome,
      quantidade: quantidade,
      valorUnitario: servico.valorUnitario,
      valorTotal: servico.valorUnitario * quantidade
    };

    setFormData(prev => ({
      ...prev,
      servicos: [...prev.servicos, novoServico]
    }));
    setSelectedServicoId(0);
    setQuantidade(1);
  };

  const handleRemoveServico = (id: number) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos.filter(s => s.id !== id)
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'EXPIRADO':
        return 'bg-[#bae3ff] text-[#003366]';
      case 'CANCELADO':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Administrativo</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Contratos</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Contratos</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de contratos e acordos.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            <div className="bg-[#555f70] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#555f70]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">FECHADOS</span>
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {contratos.filter(c => c.status === 'EXPIRADO' || c.status === 'CANCELADO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Fechados</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#ba1a1a] to-[#ff6b6b] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#ba1a1a]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">VENCENDO</span>
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {contratos.filter(c => {
                    const hoje = new Date();
                    const dataFim = new Date(c.dataFim);
                    return c.status === 'ATIVO' && 
                      dataFim.getMonth() === hoje.getMonth() && 
                      dataFim.getFullYear() === hoje.getFullYear();
                  }).length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Vencendo este mês</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ABERTOS</span>
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {contratos.filter(c => c.status === 'ATIVO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Abertos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar contrato"
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="EXPIRADO">Expirado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Número</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-right">Valor</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Vigência</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedContratos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedContratos.map(contrato => (
                  <tr key={contrato.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold font-mono text-[#191c1d]">{contrato.numero}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{contrato.cliente}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{contrato.empresa}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{contrato.tipo}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-[#191c1d]">R$ {contrato.valor.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center text-sm text-[#555f70]">
                      {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')} - {new Date(contrato.dataFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(contrato.status)}`}>
                        {contrato.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(contrato)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(contrato.id)} className="p-1.5 text-[#555f70] hover:text-[#ba1a1a] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedContratos.length} de {filteredContratos.length} registros</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-[#006e2d] text-white' : 'hover:bg-[#e7e8e9]'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {viewingContrato && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Serviços do Contrato {viewingContrato.numero}</h2>
              <button onClick={() => setViewingContrato(null)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              {viewingContrato.servicos.length === 0 ? (
                <p className="text-[#555f70] text-center py-4">Nenhum serviço vinculado a este contrato.</p>
              ) : (
                <div className="space-y-3">
                  {viewingContrato.servicos.map((servico, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#f3f4f5] rounded-lg">
                      <div>
                        <span className="text-sm font-bold text-[#191c1d]">{servico.nome}</span>
                        <div className="text-xs text-[#555f70]">Qtd: {servico.quantidade} × R$ {servico.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <span className="text-sm font-bold text-[#006e2d]">R$ {servico.valorTotal.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-[#006e2d]/10 rounded-lg border border-[#006e2d]/20">
                    <span className="text-sm font-bold text-[#191c1d]">Total do Contrato</span>
                    <span className="text-lg font-bold text-[#006e2d]">R$ {viewingContrato.valor.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#bccbb9]/10 flex justify-end">
              <button onClick={() => setViewingContrato(null)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingContrato ? 'Editar Contrato' : 'Novo Contrato'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              {editingContrato && (
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Número do Contrato</label>
                  <input type="text" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Cliente</label>
                  <input type="text" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Empresa</label>
                  <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Fornecimento">Fornecimento</option>
                    <option value="Locação">Locação</option>
                    <option value="Frete">Frete</option>
                  </Select>
                </div>
                <div>
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ATIVO' | 'EXPIRADO' | 'CANCELADO' })}
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="EXPIRADO">Expirado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Data Início</label>
                  <input type="date" value={formData.dataInicio} onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Data Fim</label>
                  <input type="date" value={formData.dataFim} onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                </div>
              </div>

              <div className="border-t border-[#bccbb9]/20 pt-4 mt-4">
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Serviços do Contrato</label>
                
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <select
                      value={selectedServicoId}
                      onChange={(e) => setSelectedServicoId(Number(e.target.value))}
                      className="w-full px-4 py-2.5 pr-10 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
                    >
                      <option value={0}>Selecione um serviço</option>
                      {servicosDisponiveis.map(s => (
                        <option key={s.id} value={s.id}>{s.nome} - R$ {s.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/{s.unidade}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none">expand_more</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-24 px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    placeholder="Qtd"
                  />
                  <button
                    type="button"
                    onClick={handleAddServico}
                    disabled={selectedServicoId === 0}
                    className="px-4 py-2.5 bg-[#006e2d] text-white font-semibold rounded-md hover:bg-[#005524] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>

                {formData.servicos.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {formData.servicos.map((servico) => (
                      <div key={servico.id} className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg border border-[#bccbb9]/20">
                        <div>
                          <span className="text-sm font-medium text-[#191c1d]">{servico.nome}</span>
                          <div className="text-xs text-[#555f70]">Qtd: {servico.quantidade} × R$ {servico.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#006e2d]">R$ {servico.valorTotal.toLocaleString('pt-BR')}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveServico(servico.id)}
                            className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-[#006e2d]/10 rounded-lg border border-[#006e2d]/20">
                      <span className="text-sm font-bold text-[#191c1d]">Total do Contrato</span>
                      <span className="text-lg font-bold text-[#006e2d]">R$ {totalContrato.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#555f70] text-center py-4 bg-[#f8f9fa] rounded-lg">Nenhum serviço adicionado. Clique em "+" para adicionar.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">save</span>
                  Salvar
                </button>
              </div>
            </form>
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