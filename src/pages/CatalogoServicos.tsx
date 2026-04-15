import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Wrench, ChevronRight, CheckCircle2, Plus, ShoppingCart, ArrowLeft, X, User, Mail, Phone, Calendar, FileText, Percent, CreditCard, QrCode, Banknote, Receipt } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb } from '../lib/d1Utils';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoria: string;
}

function mapServico(r: Record<string, unknown>): Servico {
  return {
    id: Number(r.id),
    nome: String(r.nome ?? ''),
    descricao: String(r.descricao ?? ''),
    preco: Number(r.preco ?? 0),
    ativo: ativoFromDb(r.ativo),
    categoria: String(r.categoria ?? 'outros'),
  };
}

const categorias = [
  { id: 'todas', nome: 'Todas as Categorias', icon: Wrench },
  { id: 'manutencao', nome: 'Manutenção', icon: Wrench },
  { id: 'instalacao', nome: 'Instalação', icon: Wrench },
  { id: 'limpeza', nome: 'Limpeza', icon: Wrench },
  { id: 'consultoria', nome: 'Consultoria', icon: Wrench },
  { id: 'outros', nome: 'Outros', icon: Wrench },
];

// interface CartItem {
//   servico: Servico;
//   quantidade: number;
// }

const formasPagamento = [
  { id: 'credito', nome: 'Cartão Crédito', icon: CreditCard, parcelas: 'Até 12x' },
  { id: 'debito', nome: 'Cartão Débito', icon: CreditCard, parcelas: 'À vista' },
  { id: 'pix', nome: 'PIX', icon: QrCode, parcelas: 'À vista' },
  { id: 'boleto', nome: 'Boleto', icon: Banknote, parcelas: '3 dias' },
  { id: 'transferencia', nome: 'Transferência', icon: Receipt, parcelas: 'À vista' },
];

interface CatalogoServicosProps {
  onVoltar?: () => void;
  onSalvar?: (pedido: any) => void;
}

export const CatalogoServicosPage: React.FC<CatalogoServicosProps> = ({ onVoltar, onSalvar }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await api.list<Record<string, unknown>>('servicos');
      setServicos(raw.map(mapServico));
    } catch (e) {
      setServicos([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [tabelaSelecionada, setTabelaSelecionada] = useState('padrao');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteEmpresa, setClienteEmpresa] = useState('');
  const [validade, setValidade] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

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

  const tabelasPreco = [
    { id: 'padrao', nome: 'Tabela Padrao', desconto: 0 },
    { id: 'premium', nome: 'Tabela Premium', desconto: 10 },
    { id: 'corporativa', nome: 'Tabela Corporativa', desconto: 20 },
  ];

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

  const tabelaAtual = tabelasPreco.find(t => t.id === tabelaSelecionada)!;

  const calcularValor = (valorOriginal: number) => {
    return valorOriginal * (1 - tabelaAtual.desconto / 100);
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const adicionarCarrinho = (id: number) => {
    setCarrinho(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const totalItens = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0);

  return (
    <>
      {onVoltar && (
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium tracking-wide">
          <span onClick={onVoltar} className="hover:text-emerald-600 cursor-pointer">Catálogo de Serviços</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">Catálogo de Serviços</span>
        </nav>
      )}

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Catálogo de Serviços</h1>
          <p className="text-gray-500 text-sm">Visualize os serviços disponíveis</p>
        </div>
        <button
          onClick={() => {
            const itens = Object.entries(carrinho).map(([id, quantidade]) => ({
              servico: servicos.find(s => s.id === Number(id))!,
              quantidade,
            })).filter(item => item.servico);
            if (itens.length > 0) setCheckoutAberto(true);
          }}
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
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
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
            <div className="space-y-1">
              {categorias.map(cat => {
                const Icon = cat.icon;
                const count = cat.id === 'todas'
                  ? servicos.filter(s => s.ativo).length
                  : servicos.filter(s => s.categoria === cat.id && s.ativo).length;
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
                    <Icon className={`w-4 h-4 ${categoriaSelecionada === cat.id ? 'text-emerald-600' : 'text-slate-400'}`} />
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
              <p className="text-gray-500">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServicos.map(servico => {
                const Icon = categorias.find(c => c.id === servico.categoria)?.icon || Wrench;
                const qtdCarrinho = carrinho[servico.id] || 0;

                return (
                  <div
                    key={servico.id}
                    className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                      servico.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{servico.nome}</h3>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{servico.descricao || 'Descrição não disponível'}</p>

                      <div className="mb-4">
                        {tabelaAtual.desconto > 0 && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatarMoeda(servico.preco)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-slate-900">
                            {formatarMoeda(calcularValor(servico.preco))}
                          </span>
                        </div>
                      </div>

                      {servico.ativo ? (
                        <button
                          onClick={() => adicionarCarrinho(servico.id)}
                          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                              qtdCarrinho > 0
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {qtdCarrinho > 0 ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Selecionado ({qtdCarrinho})
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Selecionar
                            </>
                          )}
                        </button>
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

      {/* Modal de Finalizacao */}
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
                      <label className="block text-xs font-medium text-slate-600 mb-1">Validade do Pedido *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                      </div>
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
                          <th className="px-3 py-2 text-left font-bold text-gray-500">Servico</th>
                          <th className="px-3 py-2 text-center font-bold text-gray-500">Qtd</th>
                          <th className="px-3 py-2 text-right font-bold text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(carrinho).map(([id, quantidade]) => {
                          const servico = servicos.find(s => s.id === Number(id));
                          if (!servico) return null;
                          return (
                            <tr key={id}>
                              <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[150px]">{servico.nome}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{quantidade}</td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatarMoeda(calcularValor(servico.preco) * quantidade)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Desconto (%)
                    </label>
                    <input type="number" min="0" max="100" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Forma de Pagamento
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {formasPagamento.map(fp => {
                        const Icon = fp.icon;
                        return (
                          <button key={fp.id} onClick={() => setFormaPagamento(fp.id)} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-center text-xs transition-colors ${formaPagamento === fp.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${formaPagamento === fp.id ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              <Icon className={`w-3.5 h-3.5 ${formaPagamento === fp.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                            </div>
                            <span className={`font-medium leading-tight text-[10px] ${formaPagamento === fp.id ? 'text-emerald-700' : 'text-slate-700'}`}>{fp.nome}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Observacoes</label>
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Condicoes de entrega, prazos, etc." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" />
                  </div>

                  {(() => {
                    const itens = Object.entries(carrinho).map(([id, quantidade]) => {
                      const servico = servicos.find(s => s.id === Number(id));
                      return servico ? { servico, quantidade } : null;
                    }).filter(Boolean) as { servico: Servico; quantidade: number }[];
                    const subtotal = itens.reduce((sum, item) => sum + (calcularValor(item.servico.preco) * item.quantidade), 0);
                    const valorDesconto = subtotal * (desconto / 100);
                    const total = subtotal - valorDesconto;
                    return (
                      <div className="bg-[#f5f5f5] rounded-lg p-4">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>{formatarMoeda(subtotal)}</span>
                          </div>
                          {desconto > 0 && (
                            <div className="flex justify-between text-red-500">
                              <span>Desconto ({desconto}%)</span>
                              <span>- {formatarMoeda(valorDesconto)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-extrabold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                            <span>Total</span>
                            <span className="text-emerald-700">{formatarMoeda(total)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button onClick={() => setCheckoutAberto(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Voltar
              </button>
              <button
                onClick={() => {
                  const itens = Object.entries(carrinho).map(([id, quantidade]) => {
                    const servico = servicos.find(s => s.id === Number(id));
                    return servico ? { servico, quantidade } : null;
                  }).filter(Boolean) as { servico: Servico; quantidade: number }[];
                  const subtotal = itens.reduce((sum, item) => sum + (calcularValor(item.servico.preco) * item.quantidade), 0);
                  const valorDesconto = subtotal * (desconto / 100);
                  const total = subtotal - valorDesconto;
                  if (!clienteSelecionado || !formaPagamento || !validade) return;
                  onSalvar?.({
                    cliente: clienteNome,
                    email: clienteEmail,
                    telefone: clienteTelefone,
                    empresa: clienteEmpresa,
                    validade: new Date(validade),
                    itens: itens.map(i => ({ servico: i.servico.nome, quantidade: i.quantidade, valorUnitario: calcularValor(i.servico.preco) })),
                    subtotal,
                    desconto: valorDesconto,
                    total,
                    observacoes,
                    tabelaPreco: tabelaSelecionada,
                    formaPagamento,
                  });
                  setCheckoutAberto(false);
                  setCarrinho({});
                }}
                disabled={!clienteSelecionado || !formaPagamento || !validade}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  clienteSelecionado && formaPagamento && validade
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