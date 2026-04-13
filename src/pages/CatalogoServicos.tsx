import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  ChevronRight,
  Star,
  Shield,
  Wrench,
  Truck,
  Building,
  Zap,
  PenTool,
  CheckCircle2,
  Plus,
  Minus,
  X,
  Trash2,
  BaggageClaim,
  User,
  Mail,
  Phone,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  ArrowLeft,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  valorUnitario: number;
  unidade: string;
  ativo: boolean;
  popular?: boolean;
}

function mapServico(r: Record<string, unknown>): Servico {
  return {
    id: Number(r.id),
    nome: String(r.nome ?? ''),
    descricao: String(r.descricao ?? ''),
    categoria: String(r.categoria ?? ''),
    valorUnitario: Number(r.valor_unitario ?? r.valorUnitario ?? 0),
    unidade: String(r.unidade ?? ''),
    ativo: ativoFromDb(r.ativo),
    popular: Boolean(r.popular),
  };
}

const tabelasPreco = [
  { id: 'padrao', nome: 'Tabela Padrão', desconto: 0 },
  { id: 'premium', nome: 'Tabela Premium', desconto: 10 },
  { id: 'corporativa', nome: 'Tabela Corporativa', desconto: 20 },
];

const categorias = [
  { id: 'todas', nome: 'Todas', icon: BaggageClaim },
  { id: 'transporte', nome: 'Transporte', icon: Truck },
  { id: 'locacao', nome: 'Locação', icon: Building },
  { id: 'manutencao', nome: 'Manutenção', icon: Wrench },
  { id: 'servicos', nome: 'Serviços Gerais', icon: PenTool },
  { id: 'seguros', nome: 'Seguros', icon: Shield },
  { id: 'energia', nome: 'Energia', icon: Zap },
];

const getCategoriaIcon = (categoriaId: string) => {
  const cat = categorias.find(c => c.id === categoriaId);
  return cat ? cat.icon : Wrench;
};

export const CatalogoServicosPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await api.list<Record<string, unknown>>('servicos');
      setServicos(raw.map(mapServico));
    } catch (e) {
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

interface CartItem {
  servico: Servico;
  quantidade: number;
}

export const CatalogoServicosPage: React.FC = () => {
  const [tabelaSelecionada, setTabelaSelecionada] = useState('padrao');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(false);

  // Dados do cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEmpresa, setClienteEmpresa] = useState('');

  // Forma de pagamento
  const [formaPagamento, setFormaPagamento] = useState('');

  // Busca de cliente
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [modalNovoClienteAberto, setModalNovoClienteAberto] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownAberto(false);
    if (dropdownAberto) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownAberto]);

  const tabelaAtual = tabelasPreco.find(t => t.id === tabelaSelecionada)!;

  const filteredServicos = useMemo(() => {
    return servicos
      .filter(servico => {
        const matchCategoria = categoriaSelecionada === 'todas' || servico.categoria === categoriaSelecionada;
        const matchSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            servico.descricao.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategoria && matchSearch;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [servicos, categoriaSelecionada, searchTerm]);

  const calcularValor = (valorOriginal: number) => {
    return valorOriginal * (1 - tabelaAtual.desconto / 100);
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const adicionarCarrinho = (id: number) => {
    setCarrinho(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const alterarQuantidade = (id: number, delta: number) => {
    setCarrinho(prev => {
      const novaQtd = (prev[id] || 0) + delta;
      if (novaQtd <= 0) {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      }
      return { ...prev, [id]: novaQtd };
    });
  };

  const removerItem = (id: number) => {
    setCarrinho(prev => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
  };

  const limparCarrinho = () => setCarrinho({});

  const handleFinalizarCarrinho = () => {
    setCarrinhoAberto(false);
    setCheckoutAberto(true);
    setPedidoFinalizado(false);
  };

  const handleConfirmarPedido = () => {
    const clienteValido = clienteSelecionado || (clienteNome && clienteEmail);
    if (!clienteValido || !formaPagamento) return;
    setPedidoFinalizado(true);
    setCarrinho({});
    setClienteSelecionado(null);
    setClienteNome('');
    setClienteEmail('');
    setClienteTelefone('');
    setClienteEmpresa('');
    setFormaPagamento('');
    setBuscaCliente('');
    setMostrarFormNovo(false);
  };

  const handleNovoPedido = () => {
    setCheckoutAberto(false);
    setPedidoFinalizado(false);
    setClienteSelecionado(null);
    setBuscaCliente('');
    setMostrarFormNovo(false);
  };

  const selecionarCliente = (cliente: typeof clientesCadastrados[0]) => {
    setClienteSelecionado(cliente.id);
    setClienteNome(cliente.nome);
    setClienteEmail(cliente.email);
    setClienteTelefone(cliente.telefone);
    setClienteEmpresa(cliente.empresa);
    setMostrarFormNovo(false);
    setBuscaCliente('');
  };

  const formasPagamento = [
    { id: 'credito', nome: 'Cartão de Crédito', icon: CreditCard, parcelas: 'Até 12x' },
    { id: 'debito', nome: 'Cartão de Débito', icon: CreditCard, parcelas: 'À vista' },
    { id: 'pix', nome: 'PIX', icon: QrCode, parcelas: 'À vista' },
    { id: 'boleto', nome: 'Boleto Bancário', icon: Banknote, parcelas: 'Venc. 3 dias' },
    { id: 'transferencia', nome: 'Transferência', icon: Receipt, parcelas: 'À vista' },
  ];

  const [clientesCadastrados, setClientesCadastrados] = useState<{ id: number; nome: string; email: string; telefone: string; empresa: string }[]>([]);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const raw = await api.list<Record<string, unknown>>('clientes');
        setClientesCadastrados(raw.map(r => ({
          id: Number(r.id),
          nome: String(r.nome ?? ''),
          email: String(r.email ?? ''),
          telefone: String(r.telefone ?? ''),
          empresa: String(r.empresa ?? ''),
        })));
      } catch (e) {
        setClientesCadastrados([]);
      }
    };
    loadClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientesCadastrados;
    return clientesCadastrados.filter(c =>
      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.empresa.toLowerCase().includes(buscaCliente.toLowerCase())
    );
  }, [clientesCadastrados, buscaCliente]);

  const itensCarrinho: CartItem[] = Object.entries(carrinho).map(([id, quantidade]) => ({
    servico: servicos.find(s => s.id === Number(id))!,
    quantidade,
  })).filter(item => item.servico);

  const totalItens = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0);

  const totalCarrinho = itensCarrinho.reduce((sum, item) => {
    return sum + (item.quantidade * calcularValor(item.servico.valorUnitario));
  }, 0);

  const CarrinhoConteudo = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold text-slate-900">Carrinho</span>
        </div>
        {totalItens > 0 && (
          <button
            onClick={limparCarrinho}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {itensCarrinho.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ShoppingCart className="w-12 h-12 mb-3" />
            <p className="text-sm">Carrinho vazio</p>
            <p className="text-xs mt-1">Adicione serviços do catálogo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itensCarrinho.map(item => {
              const valorUnitario = calcularValor(item.servico.valorUnitario);
              const subtotal = valorUnitario * item.quantidade;
              return (
                <div key={item.servico.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.servico.nome}</p>
                      <p className="text-xs text-slate-500">{formatarMoeda(valorUnitario)} / {item.servico.unidade}</p>
                    </div>
                    <button
                      onClick={() => removerItem(item.servico.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Controle de quantidade */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => alterarQuantidade(item.servico.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantidade}</span>
                      <button
                        onClick={() => alterarQuantidade(item.servico.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-sm font-bold text-emerald-700">{formatarMoeda(subtotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {itensCarrinho.length > 0 && (
        <div className="border-t pt-4 px-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Subtotal</span>
            <span className="text-sm font-medium text-slate-900">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-2xl font-extrabold text-emerald-700">{formatarMoeda(totalCarrinho)}</span>
          </div>
          <button
            onClick={handleFinalizarCarrinho}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Finalizar Pedido
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-emerald-600 cursor-pointer">Vendas</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900">Catálogo de Serviços</span>
      </nav>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Catálogo de Serviços</h1>
          <p className="text-slate-500 text-sm">Selecione os serviços desejados e adicione ao carrinho</p>
        </div>

        {/* Botão do carrinho no header */}
        <button
          onClick={() => setCarrinhoAberto(true)}
          className="relative p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItens > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {totalItens}
            </span>
          )}
        </button>

        {/* Modal do Carrinho */}
        {carrinhoAberto && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setCarrinhoAberto(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho
                </h2>
                <button onClick={() => setCarrinhoAberto(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {CarrinhoConteudo}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Checkout */}
        {checkoutAberto && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setCheckoutAberto(false); setPedidoFinalizado(false); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {pedidoFinalizado ? (
                <div className="flex flex-col h-full">
                  <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" />
                      Pedido Confirmado!
                    </h2>
                    <button onClick={() => { setCheckoutAberto(false); setPedidoFinalizado(false); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Pedido #{Date.now().toString().slice(-6)}</h3>
                    <p className="text-sm text-slate-500 text-center mb-6">Seu pedido foi recebido com sucesso. Entraremos em contato em breve.</p>
                    <div className="bg-[#f5f5f5] rounded-lg p-4 w-full mb-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cliente:</span>
                          <span className="font-medium text-slate-900">{clienteNome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pagamento:</span>
                          <span className="font-medium text-slate-900">{formasPagamento.find(f => f.id === formaPagamento)?.nome}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleNovoPedido} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors">
                      Novo Pedido
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="border-b border-slate-200 p-6 flex items-center gap-3">
                    <button onClick={() => { setCheckoutAberto(false); setCarrinhoAberto(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    <h2 className="text-lg font-semibold text-slate-900">Finalizar Pedido</h2>
                    <button onClick={() => { setCheckoutAberto(false); setPedidoFinalizado(false); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Dados do Cliente */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Dados do Cliente
                        </h3>
                        <button
                          onClick={() => setModalNovoClienteAberto(true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          + Novo Cliente
                        </button>
                      </div>
                      {/* Select customizado de cliente */}
                          <div className="relative mb-3">
                            {clienteSelecionado ? (
                              <div
                                onClick={() => { setClienteSelecionado(null); setBuscaCliente(''); setDropdownAberto(true); }}
                                className="flex items-center justify-between px-3 py-2.5 border border-emerald-300 bg-emerald-50 rounded-lg cursor-pointer"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{clientesCadastrados.find(c => c.id === clienteSelecionado)?.nome}</p>
                                  {clientesCadastrados.find(c => c.id === clienteSelecionado)?.empresa && (
                                    <p className="text-xs text-slate-500">{clientesCadastrados.find(c => c.id === clienteSelecionado)?.empresa}</p>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                              </div>
                            ) : (
                              <>
                                <div
                                  onClick={(e) => { e.stopPropagation(); setDropdownAberto(!dropdownAberto); }}
                                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors"
                                >
                                  {buscaCliente ? (
                                    <span className="text-sm text-slate-900">{buscaCliente}</span>
                                  ) : (
                                    <span className="text-sm text-slate-400">Selecionar cliente...</span>
                                  )}
                                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${dropdownAberto ? 'rotate-90' : ''}`} />
                                </div>
                                {dropdownAberto && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                  >
                                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                                      <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                          type="text"
                                          value={buscaCliente}
                                          onChange={(e) => setBuscaCliente(e.target.value)}
                                          placeholder="Buscar..."
                                          className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                          autoFocus
                                        />
                                      </div>
                                    </div>
                                    {clientesFiltrados.length === 0 ? (
                                      <p className="text-xs text-slate-400 text-center py-3">Nenhum cliente encontrado</p>
                                    ) : (
                                      clientesFiltrados.map(cliente => (
                                        <button
                                          key={cliente.id}
                                          onClick={() => { selecionarCliente(cliente); setDropdownAberto(false); }}
                                          className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-b-0"
                                        >
                                          <p className="text-sm font-medium text-slate-900">{cliente.nome}</p>
                                          {cliente.empresa && <p className="text-xs text-slate-400">{cliente.empresa}</p>}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                    </div>
                    {/* Forma de Pagamento */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Forma de Pagamento
                      </h3>
                      <div className="grid grid-cols-5 gap-2">
                        {formasPagamento.map(fp => {
                          const Icon = fp.icon;
                          return (
                            <button key={fp.id} onClick={() => setFormaPagamento(fp.id)} className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-center text-xs transition-colors ${formaPagamento === fp.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formaPagamento === fp.id ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                <Icon className={`w-4 h-4 ${formaPagamento === fp.id ? 'text-emerald-600' : 'text-slate-500'}`} />
                              </div>
                              <span className={`font-medium leading-tight ${formaPagamento === fp.id ? 'text-emerald-700' : 'text-slate-700'}`}>{fp.nome}</span>
                              <span className="text-[10px] text-slate-400">{fp.parcelas}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Resumo */}
                    <div className="bg-[#f5f5f5] rounded-lg p-4">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Resumo</h3>
                      <div className="space-y-1.5 text-sm">
                        {itensCarrinho.map(item => (
                          <div key={item.servico.id} className="flex justify-between text-slate-600">
                            <span>{item.quantidade}x {item.servico.nome}</span>
                            <span className="font-medium">{formatarMoeda(calcularValor(item.servico.valorUnitario) * item.quantidade)}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-slate-900">Total</span>
                          <span className="font-extrabold text-lg text-emerald-700">{formatarMoeda(totalCarrinho)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 p-6">
                    <button onClick={handleConfirmarPedido} disabled={!clienteSelecionado || !formaPagamento || (!mostrarFormNovo && !clienteNome)} className={`w-full py-3 rounded-lg text-sm font-bold transition-colors ${(clienteSelecionado || (clienteNome && clienteEmail)) && formaPagamento ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                      Confirmar Pedido
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Novo Cliente */}
        {modalNovoClienteAberto && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setModalNovoClienteAberto(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Novo Cliente
                </h2>
                <button onClick={() => setModalNovoClienteAberto(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nome Completo *</label>
                  <input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Seu nome completo" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} placeholder="(00) 00000-0000" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Empresa</label>
                  <input type="text" value={clienteEmpresa} onChange={(e) => setClienteEmpresa(e.target.value)} placeholder="Nome da empresa" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div className="border-t border-slate-200 p-6 flex gap-3">
                <button onClick={() => setModalNovoClienteAberto(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (clienteNome && clienteEmail) {
                      setClienteSelecionado(Date.now());
                      setModalNovoClienteAberto(false);
                    }
                  }}
                  disabled={!clienteNome || !clienteEmail}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    clienteNome && clienteEmail
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Salvar e Selecionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Esquerda */}
        <div className="w-72 shrink-0 space-y-6">
          {/* Tabela de Preços */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Tabela de Preços</h3>
            <Select value={tabelaSelecionada} onValueChange={setTabelaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a tabela" />
              </SelectTrigger>
              <SelectContent>
                {tabelasPreco.map(tabela => (
                  <SelectItem key={tabela.id} value={tabela.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{tabela.nome}</span>
                      {tabela.desconto > 0 && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                          -{tabela.desconto}%
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categorias */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Categorias</h3>
            <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => {
                  const Icon = getCategoriaIcon(cat.id);
                  return (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{cat.nome}</span>
                    </div>
                  </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Área Principal - Serviços */}
        <div className="flex-1">
          {/* Barra de busca */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grid de Serviços */}
          {filteredServicos.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServicos.map(servico => {
                const Icon = getCategoriaIcon(servico.categoria);
                const valorComDesconto = calcularValor(servico.valorUnitario);
                const qtdCarrinho = carrinho[servico.id] || 0;

                return (
                  <div
                    key={servico.id}
                    className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all hover:shadow-md ${
                      servico.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    {/* Ícone */}
                    <div className="w-12 h-12 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900">{servico.nome}</h3>
                        {servico.popular && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                            <Star className="w-3 h-3 fill-amber-500 mr-1" />
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{servico.descricao}</p>
                    </div>

                    {/* Preço */}
                    <div className="text-right shrink-0">
                      {tabelaAtual.desconto > 0 && (
                        <p className="text-xs text-slate-400 line-through">
                          {formatarMoeda(servico.valorUnitario)}
                        </p>
                      )}
                      <p className="text-xl font-extrabold text-slate-900">
                        {formatarMoeda(valorComDesconto)}
                      </p>
                      <p className="text-xs text-slate-500">/{servico.unidade}</p>
                    </div>

                    {/* Botão */}
                    <div className="shrink-0">
                      {servico.ativo ? (
                        <button
                          onClick={() => adicionarCarrinho(servico.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                            qtdCarrinho > 0
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {qtdCarrinho > 0 ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              {qtdCarrinho}
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Add
                            </>
                          )}
                        </button>
                      ) : (
                        <button disabled className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
                          Indisponível
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
