import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  ChevronRight,
  Star,
  Package,
  CheckCircle2,
  Plus,
  Minus,
  ArrowLeft,
  X,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb } from '../lib/d1Utils';
import { useEmpresa } from '@/context/EmpresaContext';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria_id: number | string;
  precoUnitario: number;
  unidade: string;
  foto?: string;
  ativo: boolean;
  popular?: boolean;
  quantidade_total?: number;
  quantidade_reservada?: number;
  quantidade_disponivel?: number;
  estoque_minimo?: number;
  necessita_gerenciar_minimo?: boolean;
}

function mapProduto(r: Record<string, unknown>): Produto {
  return {
    id: Number(r.id),
    nome: String(r.nome ?? ''),
    descricao: String(r.descricao ?? ''),
    categoria_id: r.categoria_id ? Number(r.categoria_id) : 0,
    precoUnitario: Number(r.preco ?? r.preco_unitario ?? r.precoUnitario ?? 0),
    unidade: String(r.unidade ?? 'un'),
    foto: r.foto ? String(r.foto) : undefined,
    ativo: ativoFromDb(r.ativo),
    popular: Boolean(r.popular),
    quantidade_total: r.quantidade_total ? Number(r.quantidade_total) : undefined,
    quantidade_reservada: r.quantidade_reservada ? Number(r.quantidade_reservada) : undefined,
    quantidade_disponivel: r.quantidade_disponivel ? Number(r.quantidade_disponivel) : undefined,
    estoque_minimo: r.estoque_minimo ? Number(r.estoque_minimo) : undefined,
    necessita_gerenciar_minimo: r.necessita_gerenciar_minimo ? Boolean(r.necessita_gerenciar_minimo) : undefined,
  };
}

const categoriasDefault = [
  { id: 'todas', nome: 'Todas as Categorias', icon: Package },
];

interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface NovoPedidoProps {
  onVoltar: () => void;
  onSalvar?: (pedido: any) => void;
}

export const CatalogoProdutosPage: React.FC<NovoPedidoProps> = ({ onVoltar }) => {
  const { almoxarifadosPermitidos, empresaSelecionada } = useEmpresa();
  const { toast } = useAppFeedback();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState<number | null>(null);
  const [categoriasList, setCategoriasList] = useState<{ id: number; nome: string }[]>([]);
  const [precisaSelecionar, setPrecisaSelecionar] = useState(true);

  const load = useCallback(async () => {
    if (!almoxarifadoSelecionado) return;
    
    try {
      const [raw, cats] = await Promise.all([
        api.getUrl<Record<string, unknown>>(`/api/almoxarifados/${almoxarifadoSelecionado}/produtos`),
        api.list<Record<string, unknown>>('categorias_produto'),
      ]);
      setProdutos(raw.map(mapProduto));
      setCategoriasList(cats.map(c => ({ id: Number(c.id), nome: String(c.nome) })));
    } catch (e) {
      setProdutos([]);
    }
  }, [almoxarifadoSelecionado]);

  useEffect(() => {
    if (almoxarifadoSelecionado) {
      setPrecisaSelecionar(false);
      void load();
    } else {
      setPrecisaSelecionar(true);
      setProdutos([]);
    }
  }, [almoxarifadoSelecionado, load]);
  
  useEffect(() => {
    if (empresaSelecionada) {
      setClienteEmpresa(empresaSelecionada.nome);
    }
  }, [empresaSelecionada]);
  
  const handleSelecionarAlmoxarifado = (id: string) => {
    setAlmoxarifadoSelecionado(Number(id));
    setCarrinho({});
    setCategoriaSelecionada('todas');
    setSearchTerm('');
  };

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | number>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  // Dados do cliente (usuário atual)
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEmpresa, setClienteEmpresa] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [clientesCadastrados, setClientesCadastrados] = useState<{ id: number; nome: string; email: string; telefone: string; empresa: string }[]>([]);

  useEffect(() => {
    const loadDadosIniciais = async () => {
      try {
        // Carregar clientes
        const raw = await api.list<Record<string, unknown>>('clientes');
        setClientesCadastrados(raw.map(r => ({
          id: Number(r.id),
          nome: String(r.nome ?? ''),
          email: String(r.email ?? ''),
          telefone: String(r.telefone ?? ''),
          empresa: String(r.empresa ?? ''),
        })));

        // Carregar dados do usuário atual
        const usuarioId = localStorage.getItem('usuario_id');
        const usuarioNome = localStorage.getItem('usuario_nome');
        if (usuarioId) {
          const usuario = await api.get<Record<string, unknown>>('usuarios', Number(usuarioId));
          if (usuario) {
            setClienteNome(String(usuario.nome || usuarioNome || ''));
            setClienteEmail(String(usuario.email || ''));
            setClienteEmpresa(empresaSelecionada?.nome || '');
            setClienteSelecionado(Number(usuarioId));
          }
        } else if (usuarioNome) {
          setClienteNome(usuarioNome);
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
        setClientesCadastrados([]);
      }
    };
    loadDadosIniciais();
  }, [empresaSelecionada]);

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientesCadastrados;
    return clientesCadastrados.filter(c =>
      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.empresa.toLowerCase().includes(buscaCliente.toLowerCase())
    );
  }, [clientesCadastrados, buscaCliente]);

  const selecionarCliente = (cliente: typeof clientesCadastrados[0]) => {
    setClienteSelecionado(cliente.id);
    setClienteNome(cliente.nome);
    setClienteEmail(cliente.email);
    setClienteTelefone(cliente.telefone);
    setClienteEmpresa(cliente.empresa);
    setDropdownAberto(false);
    setBuscaCliente('');
  };

  useEffect(() => {
    const handleClickOutside = () => setDropdownAberto(false);
    if (dropdownAberto) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownAberto]);

  const filteredProdutos = useMemo(() => {
    return produtos
      .filter(produto => {
        const matchCategoria = categoriaSelecionada === 'todas' || String(produto.categoria_id) === String(categoriaSelecionada);
        const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategoria && matchSearch;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, categoriaSelecionada, searchTerm]);

  const [quantidades, setQuantidades] = useState<Record<number, number>>({});

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const adicionarCarrinho = (id: number, qtd: number = 1) => {
    setCarrinho(prev => ({ ...prev, [id]: (prev[id] || 0) + qtd }));
    setQuantidades(prev => ({ ...prev, [id]: 0 }));
  };

  const atualizarQuantidade = (id: number, qtd: number) => {
    setQuantidades(prev => ({ ...prev, [id]: Math.max(0, qtd) }));
  };

  const itensCarrinho: CartItem[] = Object.entries(carrinho).map(([id, quantidade]) => ({
    produto: produtos.find(p => p.id === Number(id))!,
    quantidade,
  })).filter(item => item.produto);

  const subtotal = itensCarrinho.reduce((sum, item) => {
    return sum + (item.quantidade * item.produto.precoUnitario);
  }, 0);

  const totalItens = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0);

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium tracking-wide">
        <span onClick={onVoltar} className="hover:text-emerald-600 cursor-pointer">Catálogo de Produtos</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900">Catálogo de Produtos</span>
      </nav>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Catálogo de Produtos</h1>
          {almoxarifadoSelecionado ? (
            <p className="text-gray-500 text-sm">Selecione os produtos e configure o pedido</p>
          ) : (
            <p className="text-gray-500 text-sm">Selecione um almoxarifado para ver os produtos</p>
          )}
        </div>

        <button
          onClick={() => itensCarrinho.length > 0 && setCheckoutAberto(true)}
          className="relative p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItens > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {totalItens}
            </span>
          )}
        </button>
      </div>

      {/* Mensagem para selecionar almoxarifado */}
      {precisaSelecionar && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Package size={64} className="text-slate-300 mb-4" />
          <p className="text-slate-500 mb-6 text-center">
            Selecione um almoxarifado para ver os produtos disponíveis
          </p>
          <Select onValueChange={handleSelecionarAlmoxarifado}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Selecione o almoxarifado" />
            </SelectTrigger>
            <SelectContent>
              {almoxarifadosPermitidos.map((alm) => (
                <SelectItem key={alm.id} value={String(alm.id)}>
                  {alm.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Conteúdo principal - só mostra se almoxarifado selecionado */}
      {!precisaSelecionar && (
      <div className="flex gap-6">
        {/* Sidebar Esquerda */}
        <div className="w-72 shrink-0 space-y-6">
          {/* Almoxarifado Selecionado */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-800 mb-1">Almoxarifado</h3>
                <p className="text-sm text-emerald-700">
                  {almoxarifadosPermitidos.find(a => a.id === almoxarifadoSelecionado)?.nome}
                </p>
              </div>
              <button
                onClick={() => setAlmoxarifadoSelecionado(null)}
                className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
              >
                Alterar
              </button>
            </div>
          </div>

          {/* Categorias */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Categorias</h3>
            <div className="space-y-1">
              {categoriasDefault.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSelecionada(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    categoriaSelecionada === cat.id
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <cat.icon className={`w-4 h-4 ${categoriaSelecionada === cat.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{cat.nome}</span>
                  <span className="text-xs text-slate-400">{produtos.filter(p => p.ativo).length}</span>
                </button>
              ))}
              {categoriasList.map(cat => {
                const count = produtos.filter(p => p.categoria_id === cat.id && p.ativo).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSelecionada(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      categoriaSelecionada === cat.id
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Package className={`w-4 h-4 ${categoriaSelecionada === cat.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{cat.nome}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumo */}
          {totalItens > 0 && (
            <div className="bg-[#f5f5f5] rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Resumo</h3>
              <div className="space-y-1.5 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Itens:</span>
                  <span className="font-semibold">{totalItens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatarMoeda(subtotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área Principal */}
        <div className="flex-1">
          {/* Busca */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grid de Produtos */}
          {filteredProdutos.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProdutos.map(produto => {
                const Icon = Package;

                return (
                  <div
                    key={produto.id}
                    className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                      produto.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        {produto.foto ? (
                          <img src={produto.foto} alt={produto.nome} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
                            <Icon className="w-7 h-7 text-emerald-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{produto.nome}</h3>
                          {produto.popular && (
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>Popular</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{produto.descricao}</p>

                      {produto.quantidade_disponivel !== undefined && (
                        <div className="text-sm font-medium text-slate-600 mb-4">
                          Estoque: {produto.quantidade_disponivel} {produto.unidade}
                        </div>
                      )}

                      {produto.ativo ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg">
                            <button
                              onClick={() => atualizarQuantidade(produto.id, (quantidades[produto.id] || 0) - 1)}
                              className="p-2 hover:bg-slate-100 rounded-l-lg"
                              disabled={!quantidades[produto.id]}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={produto.quantidade_disponivel}
                              value={quantidades[produto.id] || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const max = Number(produto.quantidade_disponivel) || val;
                                atualizarQuantidade(produto.id, Math.min(val, max));
                              }}
                              className="w-12 text-center text-sm font-medium border-none focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const max = Number(produto.quantidade_disponivel) || 0;
                                const atual = Number(quantidades[produto.id]) || 0;
                                if (max === 0 || atual < max) {
                                  atualizarQuantidade(produto.id, atual + 1);
                                }
                              }}
                              className="p-2 hover:bg-slate-100 rounded-r-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => adicionarCarrinho(produto.id, quantidades[produto.id] || 1)}
                            disabled={!quantidades[produto.id]}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                              (quantidades[produto.id] || 0) > 0
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {(quantidades[produto.id] || 0) > 0 ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Adicionar ({quantidades[produto.id]})
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Adicionar
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <button disabled className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
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
      )}

      {/* Modal de Finalização */}
      {checkoutAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setCheckoutAberto(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 p-6 flex items-center gap-3">
              <button onClick={() => setCheckoutAberto(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">Finalizar Pedido</h2>
              <button onClick={() => setCheckoutAberto(false)} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Dados do Cliente */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dados do Cliente
                  </h3>
                  <div className="space-y-3">
                    {/* Select de cliente */}
                    <div className="relative">
                      {clienteSelecionado ? (
                        <div
                          onClick={() => { setClienteSelecionado(null); setBuscaCliente(''); setDropdownAberto(true); }}
                          className="flex items-center justify-between px-3 py-2.5 border border-emerald-300 bg-emerald-50 rounded-lg cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{clientesCadastrados.find(c => c.id === clienteSelecionado)?.nome}</p>
                            {clientesCadastrados.find(c => c.id === clienteSelecionado)?.empresa && (
                              <p className="text-xs text-gray-500">{clientesCadastrados.find(c => c.id === clienteSelecionado)?.empresa}</p>
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
                                    onClick={() => selecionarCliente(cliente)}
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

                    {clienteSelecionado && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="tel" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Empresa</label>
                          <input type="text" value={clienteEmpresa} onChange={(e) => setClienteEmpresa(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Observacoes</label>
                      <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Condicoes de entrega, prazos, etc." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" />
                    </div>
                  </div>
                </div>

                {/* Itens e Totais */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Itens do Pedido
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden mb-4 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#f5f5f5]">
                        <tr>
                          <th className="px-3 py-2 text-center font-bold text-gray-500">Qtd</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-500">Produto</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Valor Unit.</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {itensCarrinho.map(item => (
                          <tr key={item.produto.id}>
                            <td className="px-3 py-2 text-center text-gray-500">{item.quantidade}</td>
                            <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[150px]">{item.produto.nome}</td>
                            <td className="px-3 py-2 text-right text-gray-500">{formatarMoeda(item.produto.precoUnitario)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatarMoeda(item.produto.precoUnitario * item.quantidade)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totais */}
                  <div className="bg-[#f5f5f5] rounded-lg p-4">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Total</span>
                        <span className="text-lg font-extrabold text-emerald-700">{formatarMoeda(subtotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button onClick={() => setCheckoutAberto(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Voltar
              </button>
              <button
                onClick={async () => {
                  if (!clienteSelecionado || itensCarrinho.length === 0) return;
                  
                  try {
                    const usuarioId = localStorage.getItem('usuario_id');
                    
                    const payload = {
                      empresa: empresaSelecionada?.nome || '',
                      departamento: 'Compras',
                      solicitante: clienteNome || '',
                      solicitante_id: usuarioId ? Number(usuarioId) : null,
                      almoxarifado_id: almoxarifadoSelecionado,
                      data: new Date().toISOString().split('T')[0],
                      itens: itensCarrinho.length,
                      status: 'pendente',
                    };

                    const requisicao = await api.create<{ id: number }>('requisicoes_departamento', payload);
                    
                    for (const item of itensCarrinho) {
                      await api.create('itens_requisicao_departamento', {
                        requisicao_id: requisicao.id,
                        produto_nome: item.produto.nome,
                        quantidade: item.quantidade,
                      });
                    }
                    
                    toast.success('Requisição criada com sucesso!');
                    setCheckoutAberto(false);
                    setCarrinho({});
                    setObservacoes('');
                    onVoltar();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Erro ao criar requisição');
                  }
                }}
                disabled={!clienteSelecionado || itensCarrinho.length === 0}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  clienteSelecionado && itensCarrinho.length > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Salvar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
