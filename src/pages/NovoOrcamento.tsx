import React, { useState, useMemo, useEffect } from 'react';
import {
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
  X,
  BaggageClaim,
  ShoppingCart,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Percent,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

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

const categorias = [
  { id: 'todas', nome: 'Todas as Categorias', icon: BaggageClaim },
  { id: 'transporte', nome: 'Transporte', icon: Truck },
  { id: 'locacao', nome: 'Locação', icon: Building },
  { id: 'manutencao', nome: 'Manutenção', icon: Wrench },
  { id: 'servicos', nome: 'Serviços Gerais', icon: PenTool },
  { id: 'seguros', nome: 'Seguros', icon: Shield },
  { id: 'energia', nome: 'Energia', icon: Zap },
];

const tabelasPreco = [
  { id: 'padrao', nome: 'Tabela Padrão', desconto: 0 },
  { id: 'premium', nome: 'Tabela Premium', desconto: 10 },
  { id: 'corporativa', nome: 'Tabela Corporativa', desconto: 20 },
];

const formasPagamento = [
  { id: 'credito', nome: 'Cartão Crédito', icon: CreditCard, parcelas: 'Até 12x' },
  { id: 'debito', nome: 'Cartão Débito', icon: CreditCard, parcelas: 'À vista' },
  { id: 'pix', nome: 'PIX', icon: QrCode, parcelas: 'À vista' },
  { id: 'boleto', nome: 'Boleto', icon: Banknote, parcelas: '3 dias' },
  { id: 'transferencia', nome: 'Transferência', icon: Receipt, parcelas: 'À vista' },
];

const servicosDisponiveis: Servico[] = [
  { id: 1, nome: 'Frete Rodoviário', descricao: 'Serviço de transporte de cargas para médias e longas distâncias', categoria: 'transporte', valorUnitario: 1500, unidade: 'viagem', ativo: true, popular: true },
  { id: 2, nome: 'Locação de Retroescavadeira', descricao: 'Locação de máquina pesada com operador incluso', categoria: 'locacao', valorUnitario: 800, unidade: 'dia', ativo: true },
  { id: 3, nome: 'Manutenção Preventiva', descricao: 'Revisão completa do veículo incluindo freios e suspensão', categoria: 'manutencao', valorUnitario: 350, unidade: 'serviço', ativo: true, popular: true },
  { id: 4, nome: 'Aluguel de Empilhadeira', descricao: 'Empilhadeira elétrica para movimentação interna', categoria: 'locacao', valorUnitario: 200, unidade: 'dia', ativo: true },
  { id: 5, nome: 'Seguro de Cargas', descricao: 'Cobertura completa para transporte de mercadorias', categoria: 'seguros', valorUnitario: 5000, unidade: 'ano', ativo: true },
  { id: 6, nome: 'Troca de Pneus', descricao: 'Substituição de pneus com balanceamento e alinhamento', categoria: 'manutencao', valorUnitario: 180, unidade: 'serviço', ativo: true },
  { id: 7, nome: 'Instalação Elétrica', descricao: 'Instalação e manutenção de sistemas elétricos prediais', categoria: 'energia', valorUnitario: 450, unidade: 'serviço', ativo: true },
  { id: 8, nome: 'Limpeza Industrial', descricao: 'Serviço de limpeza especializada para galpões', categoria: 'servicos', valorUnitario: 600, unidade: 'serviço', ativo: true },
  { id: 9, nome: 'Transporte Expresso', descricao: 'Entrega urgente em até 24 horas na região metropolitana', categoria: 'transporte', valorUnitario: 2200, unidade: 'viagem', ativo: true, popular: true },
  { id: 10, nome: 'Locação de Gerador', descricao: 'Gerador de energia 50kVA para eventos e obras', categoria: 'energia', valorUnitario: 350, unidade: 'dia', ativo: true },
  { id: 11, nome: 'Pintura Veicular', descricao: 'Pintura completa ou parcial com acabamento profissional', categoria: 'manutencao', valorUnitario: 1200, unidade: 'serviço', ativo: true },
  { id: 12, nome: 'Seguro de Equipamentos', descricao: 'Proteção contra danos e roubo de equipamentos', categoria: 'seguros', valorUnitario: 3200, unidade: 'ano', ativo: false },
];

interface CartItem {
  servico: Servico;
  quantidade: number;
}

interface NovoOrcamentoProps {
  onVoltar: () => void;
  onSalvar: (orcamento: any) => void;
}

export const NovoOrcamentoPage: React.FC<NovoOrcamentoProps> = ({ onVoltar, onSalvar }) => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [tabelaSelecionada, setTabelaSelecionada] = useState('padrao');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  // Dados do cliente
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

  const clientesCadastrados = [
    { id: 1, nome: 'Transportadora Silva LTDA', email: 'contato@silva.com.br', telefone: '(11) 98765-4321', empresa: 'Silva Transportes' },
    { id: 2, nome: 'João Oliveira', email: 'joao@email.com', telefone: '(21) 97654-3210', empresa: '' },
    { id: 3, nome: 'LogTech Logística S/A', email: 'compras@logtech.com', telefone: '(31) 96543-2109', empresa: 'LogTech' },
    { id: 4, nome: 'Maria Santos', email: 'maria.santos@email.com', telefone: '(41) 95432-1098', empresa: '' },
    { id: 5, nome: 'Construtora Horizonte', email: 'financeiro@horizonte.com', telefone: '(51) 94321-0987', empresa: 'Horizonte Constr.' },
  ];

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientesCadastrados;
    return clientesCadastrados.filter(c =>
      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.empresa.toLowerCase().includes(buscaCliente.toLowerCase())
    );
  }, [buscaCliente]);

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

  const filteredServicos = useMemo(() => {
    return servicosDisponiveis.filter(servico => {
      const matchCategoria = categoriaSelecionada === 'todas' || servico.categoria === categoriaSelecionada;
      const matchSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          servico.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategoria && matchSearch;
    });
  }, [categoriaSelecionada, searchTerm]);

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

  const itensCarrinho: CartItem[] = Object.entries(carrinho).map(([id, quantidade]) => ({
    servico: servicosDisponiveis.find(s => s.id === Number(id))!,
    quantidade,
  })).filter(item => item.servico);

  const totalItens = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0);

  const subtotal = itensCarrinho.reduce((sum, item) => {
    return sum + (item.quantidade * calcularValor(item.servico.valorUnitario));
  }, 0);

  const valorDesconto = subtotal * (desconto / 100);
  const total = subtotal - valorDesconto;

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-wide">
        <span onClick={onVoltar} className="hover:text-emerald-600 cursor-pointer">Gestão de Orçamentos</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900">Novo Orçamento</span>
      </nav>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Novo Orçamento</h1>
          <p className="text-slate-500 text-sm">Selecione os serviços e configure o orçamento</p>
        </div>

        <button
          onClick={() => setCheckoutAberto(true)}
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

          {/* Categoria */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Categoria</h3>
            <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => {
                  const Icon = cat.icon;
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

          {/* Resumo */}
          {totalItens > 0 && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <h3 className="text-sm font-bold text-emerald-900 mb-2">Resumo</h3>
              <div className="space-y-1.5 text-sm text-emerald-700">
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
                const Icon = categorias.find(c => c.id === servico.categoria)?.icon || Wrench;
                const qtdCarrinho = carrinho[servico.id] || 0;

                return (
                  <div
                    key={servico.id}
                    className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all hover:shadow-md ${
                      servico.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    {/* Ícone */}
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
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
                        {formatarMoeda(calcularValor(servico.valorUnitario))}
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

      {/* Modal de Checkout / Finalização */}
      {checkoutAberto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setCheckoutAberto(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 p-6 flex items-center gap-3">
              <button onClick={() => setCheckoutAberto(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">Finalizar Orçamento</h2>
              <button onClick={() => setCheckoutAberto(false)} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
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
                      <label className="block text-xs font-medium text-slate-600 mb-1">Validade do Orçamento *</label>
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
                    Itens do Orçamento
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden mb-4 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold text-slate-500">Serviço</th>
                          <th className="px-3 py-2 text-center font-bold text-slate-500">Qtd</th>
                          <th className="px-3 py-2 text-right font-bold text-slate-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {itensCarrinho.map(item => (
                          <tr key={item.servico.id}>
                            <td className="px-3 py-2 font-medium text-slate-900 truncate max-w-[150px]">{item.servico.nome}</td>
                            <td className="px-3 py-2 text-center text-slate-500">{item.quantidade}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatarMoeda(calcularValor(item.servico.valorUnitario) * item.quantidade)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Desconto */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Desconto (%)
                    </label>
                    <input type="number" min="0" max="100" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>

                  {/* Forma de Pagamento */}
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
                              <Icon className={`w-3.5 h-3.5 ${formaPagamento === fp.id ? 'text-emerald-600' : 'text-slate-500'}`} />
                            </div>
                            <span className={`font-medium leading-tight text-[10px] ${formaPagamento === fp.id ? 'text-emerald-700' : 'text-slate-700'}`}>{fp.nome}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Condições de pagamento, prazos, etc." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" />
                  </div>

                  {/* Totais */}
                  <div className="bg-slate-50 rounded-lg p-4">
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
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button onClick={() => setCheckoutAberto(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Voltar
              </button>
              <button
                onClick={() => {
                  if (!clienteNome || !clienteEmail || !validade) return;
                  onSalvar({
                    cliente: clienteNome,
                    email: clienteEmail,
                    telefone: clienteTelefone,
                    empresa: clienteEmpresa,
                    validade: new Date(validade),
                    itens: itensCarrinho.map(i => ({ servico: i.servico.nome, quantidade: i.quantidade, valorUnitario: calcularValor(i.servico.valorUnitario) })),
                    subtotal,
                    desconto: valorDesconto,
                    total,
                    observacoes,
                    tabelaPreco: tabelaSelecionada,
                    formaPagamento,
                  });
                }}
                disabled={!clienteSelecionado || !formaPagamento || !validade}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  (clienteSelecionado || clienteNome) && formaPagamento && validade
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Salvar Orçamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
