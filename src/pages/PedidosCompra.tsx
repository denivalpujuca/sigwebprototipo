import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  status: 'ativa' | 'inativa';
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  unidade: string;
  preco: number;
  imagem: string;
  categoriaId: number;
  empresaId: number;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface Pedido {
  id: number;
  empresa: Empresa;
  itens: ItemCarrinho[];
  data: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

const empresas: Empresa[] = [
  { id: 1, nome: 'Gestão Urbana S/A', cnpj: '12.345.678/0001-90', status: 'ativa' },
  { id: 2, nome: 'Serviços Metropolitanos Ltda', cnpj: '23.456.789/0001-01', status: 'ativa' },
  { id: 3, nome: 'Ambiental Norte S/A', cnpj: '34.567.890/0001-12', status: 'ativa' },
  { id: 4, nome: 'Transporte Público Municipal', cnpj: '45.678.901/0001-23', status: 'ativa' },
  { id: 5, nome: 'Saneamento Básico S/A', cnpj: '56.789.012/0001-34', status: 'inativa' },
];

const produtos: Produto[] = [
  { id: 1, nome: 'Caneta esferográfica azul', descricao: 'Caneta esferográfica 0.7mm azul cx/50', unidade: 'Caixa', preco: 25.90, imagem: 'pen', categoriaId: 1, empresaId: 1 },
  { id: 2, nome: 'Papel A4', descricao: 'Papel sulfite A4 75g cx/500', unidade: 'Caixa', preco: 42.50, imagem: 'description', categoriaId: 8, empresaId: 1 },
  { id: 3, nome: 'Clipe aço médio', descricao: 'Clipe de aço n° 2 cx/500', unidade: 'Caixa', preco: 8.90, imagem: 'paperclip', categoriaId: 1, empresaId: 1 },
  { id: 4, nome: 'Detergente líquido', descricao: 'Detergente líquido 500ml', unidade: 'Unidade', preco: 3.50, imagem: 'water_drop', categoriaId: 2, empresaId: 1 },
  { id: 5, nome: 'Desinfetante 5L', descricao: 'Desinfetante pino líquido 5L', unidade: 'Galão', preco: 28.90, imagem: 'sanitizer', categoriaId: 2, empresaId: 2 },
  { id: 6, nome: 'Luva descartável', descricao: 'Luva descartávellatex cx/100', unidade: 'Caixa', preco: 45.00, imagem: 'handyman', categoriaId: 4, empresaId: 2 },
  { id: 7, nome: 'Capacete segurança', descricao: 'Capacete de segurança branco', unidade: 'Unidade', preco: 35.90, imagem: 'sports_motorsports', categoriaId: 4, empresaId: 3 },
  { id: 8, nome: 'Chave Philips', descricao: 'Chave Phillips profissional conjunto 6pc', unidade: 'Conjunto', preco: 42.00, imagem: 'construction', categoriaId: 3, empresaId: 3 },
  { id: 9, nome: 'Fita Isolante', descricao: 'Fita isolante 19mmx20m preta', unidade: 'Rolo', preco: 12.90, imagem: 'electric_bolt', categoriaId: 3, empresaId: 3 },
  { id: 10, nome: 'Álcool gel 70%', descricao: 'Álcool gel antisséptico 1L', unidade: 'Unidade', preco: 18.90, imagem: 'spa', categoriaId: 5, empresaId: 4 },
  { id: 11, nome: 'Óleo lubrificante', descricao: 'Óleo lubricantemultiuso 500ml', unidade: 'Unidade', preco: 22.50, imagem: 'oil_barrel', categoriaId: 6, empresaId: 4 },
  { id: 12, nome: 'Filtro de óleo', descricao: 'Filtro de óleo para caminhão', unidade: 'Unidade', preco: 85.00, imagem: 'filter_alt', categoriaId: 6, empresaId: 4 },
];

const gerarPedidosMock = (): Pedido[] => {
  return [
    {
      id: 1001,
      empresa: empresas[0],
      itens: [
        { produto: produtos[0], quantidade: 5 },
        { produto: produtos[1], quantidade: 10 },
        { produto: produtos[2], quantidade: 20 },
      ],
      data: new Date('2026-03-15'),
      status: 'pendente'
    },
    {
      id: 1002,
      empresa: empresas[1],
      itens: [
        { produto: produtos[4], quantidade: 15 },
        { produto: produtos[5], quantidade: 50 },
      ],
      data: new Date('2026-03-14'),
      status: 'aprovado'
    },
    {
      id: 1003,
      empresa: empresas[2],
      itens: [
        { produto: produtos[6], quantidade: 10 },
        { produto: produtos[7], quantidade: 5 },
        { produto: produtos[8], quantidade: 30 },
      ],
      data: new Date('2026-03-13'),
      status: 'rejeitado'
    },
    {
      id: 1004,
      empresa: empresas[3],
      itens: [
        { produto: produtos[9], quantidade: 25 },
        { produto: produtos[10], quantidade: 8 },
      ],
      data: new Date('2026-03-12'),
      status: 'aprovado'
    },
    {
      id: 1005,
      empresa: empresas[0],
      itens: [
        { produto: produtos[3], quantidade: 100 },
      ],
      data: new Date('2026-03-10'),
      status: 'pendente'
    },
  ];
};

interface PedidosCompraProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const PedidosCompraPage: React.FC<PedidosCompraProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [pedidos, setPedidos] = useState<Pedido[]>(gerarPedidosMock);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      const matchesStatus = filterStatus === 'all' || pedido.status === filterStatus;
      return matchesStatus;
    });
  }, [pedidos, filterStatus]);

  const totalCarrinho = (itens: ItemCarrinho[]) => {
    return itens.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
  };

  const atualizarStatus = (pedidoId: number, novoStatus: 'pendente' | 'aprovado' | 'rejeitado') => {
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'aprovado':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'rejeitado':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Suprimentos</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Pedidos de Compra</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Pedidos de Compra</h1>
        <p className="text-[#555f70] text-sm">Gerencie e acompanhe os pedidos de compra realizados.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">TOTAL</span>
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{pedidos.length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Pedidos</div>
          </div>
        </div>
        <div className="bg-[#005ac2] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#005ac2]/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">PENDENTES</span>
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{pedidos.filter(p => p.status === 'pendente').length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Aprovação</div>
          </div>
        </div>
        <div className="bg-[#ba1a1a] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#ba1a1a]/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">APROVADOS</span>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{pedidos.filter(p => p.status === 'aprovado').length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Confirmados</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filterStatus === 'all' ? 'bg-[#006e2d] text-white' : 'bg-white text-[#555f70] border border-[#bccbb9]/20'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterStatus('pendente')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filterStatus === 'pendente' ? 'bg-[#ffc107] text-[#856404]' : 'bg-white text-[#555f70] border border-[#bccbb9]/20'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilterStatus('aprovado')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filterStatus === 'aprovado' ? 'bg-[#006e2d] text-white' : 'bg-white text-[#555f70] border border-[#bccbb9]/20'
          }`}
        >
          Aprovados
        </button>
        <button
          onClick={() => setFilterStatus('rejeitado')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filterStatus === 'rejeitado' ? 'bg-[#ba1a1a] text-white' : 'bg-white text-[#555f70] border border-[#bccbb9]/20'
          }`}
        >
          Rejeitados
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Pedido</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Valor Total</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555f70]">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido: Pedido) => (
                  <tr key={pedido.id} className="hover:bg-[#f3f4f5]/50 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-[#191c1d]">#{pedido.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#191c1d]">{pedido.empresa.nome}</span>
                        <span className="text-[11px] text-[#555f70]">{pedido.empresa.cnpj}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-[#191c1d]">{formatarData(pedido.data)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-[#191c1d]">{pedido.itens.reduce((acc, item) => acc + item.quantidade, 0)} itens</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-[#191c1d]">R$ {totalCarrinho(pedido.itens).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(pedido.status)}`}>
                        {pedido.status === 'pendente' ? 'Pendente' : pedido.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setPedidoSelecionado(pedido)}
                          className="p-1.5 text-[#005ac2] hover:bg-[#d8e2ff] rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        {pedido.status === 'pendente' && (
                          <>
                            <button 
                              onClick={() => atualizarStatus(pedido.id, 'aprovado')}
                              className="p-1.5 text-[#006e2d] hover:bg-[#d4edda] rounded transition-colors"
                              title="Aprovar"
                            >
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </button>
                            <button 
                              onClick={() => atualizarStatus(pedido.id, 'rejeitado')}
                              className="p-1.5 text-[#ba1a1a] hover:bg-[#f8d7da] rounded transition-colors"
                              title="Rejeitar"
                            >
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Detalhes do Pedido #{pedidoSelecionado.id}</h2>
              <button onClick={() => setPedidoSelecionado(null)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <h4 className="text-xs font-bold text-[#555f70] uppercase mb-2">Empresa</h4>
                <p className="text-sm font-bold text-[#191c1d]">{pedidoSelecionado.empresa.nome}</p>
                <p className="text-xs text-[#555f70]">{pedidoSelecionado.empresa.cnpj}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#555f70] uppercase mb-1">Data do Pedido</h4>
                  <p className="text-sm text-[#191c1d]">{formatarData(pedidoSelecionado.data)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#555f70] uppercase mb-1">Status</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(pedidoSelecionado.status)}`}>
                    {pedidoSelecionado.status === 'pendente' ? 'Pendente' : pedidoSelecionado.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-[#555f70] uppercase mb-2">Itens do Pedido</h4>
                <div className="space-y-2 bg-[#f8f9fa] rounded-lg p-3 max-h-40 overflow-y-auto">
                  {pedidoSelecionado.itens.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-[#191c1d]">
                        {item.quantidade}x {item.produto.nome}
                      </span>
                      <span className="font-bold text-[#191c1d]">
                        R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-[#bccbb9]/20 pt-4 flex justify-between">
                <span className="font-bold text-[#191c1d]">Total do Pedido</span>
                <span className="text-xl font-bold text-[#006e2d]">R$ {totalCarrinho(pedidoSelecionado.itens).toFixed(2)}</span>
              </div>
            </div>

            {pedidoSelecionado.status === 'pendente' && (
              <div className="px-6 py-4 border-t border-[#bccbb9]/10 flex gap-3">
                <button
                  onClick={() => { atualizarStatus(pedidoSelecionado.id, 'rejeitado'); setPedidoSelecionado(null); }}
                  className="flex-1 px-4 py-2.5 bg-[#ba1a1a] hover:opacity-90 text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">close</span>
                  Rejeitar
                </button>
                <button
                  onClick={() => { atualizarStatus(pedidoSelecionado.id, 'aprovado'); setPedidoSelecionado(null); }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check</span>
                  Aprovar
                </button>
              </div>
            )}
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