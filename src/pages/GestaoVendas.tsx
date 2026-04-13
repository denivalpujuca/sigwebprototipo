import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Download,
  Printer,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAppFeedback } from '@/context/AppFeedbackContext';
import { api } from '../lib/api';

interface ItemOrcamento {
  servico: string;
  quantidade: number;
  valorUnitario: number;
}

interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  email: string;
  telefone: string;
  empresa: string;
  dataCriacao: Date;
  dataValidade: Date;
  itens: ItemOrcamento[];
  subtotal: number;
  desconto: number;
  total: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado' | 'convertido';
  observacoes: string;
  tabelaPreco?: string;
  formaPagamento?: string;
}

function mapOrcamento(r: Record<string, unknown>): Orcamento {
  return {
    id: Number(r.id),
    numero: String(r.numero ?? ''),
    cliente: String(r.cliente ?? ''),
    email: String(r.email ?? ''),
    telefone: String(r.telefone ?? ''),
    empresa: String(r.empresa ?? ''),
    dataCriacao: r.data_criacao ? new Date(String(r.data_criacao)) : new Date(),
    dataValidade: r.data_validade ? new Date(String(r.data_validade)) : new Date(),
    itens: typeof r.itens === 'string' ? JSON.parse(r.itens) : (r.itens as ItemOrcamento[] || []),
    subtotal: Number(r.subtotal ?? 0),
    desconto: Number(r.desconto ?? 0),
    total: Number(r.total ?? 0),
    status: (String(r.status ?? 'rascunho') as Orcamento['status']),
    observacoes: String(r.observacoes ?? ''),
    tabelaPreco: String(r.tabela_preco ?? r.tabelaPreco ?? ''),
    formaPagamento: String(r.forma_pagamento ?? r.formaPagamento ?? ''),
  };
}

export const GestaoVendasPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, confirm } = useAppFeedback();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalDetalhes, setModalDetalhes] = useState<Orcamento | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await api.list<Record<string, unknown>>('orcamentos');
      setOrcamentos(raw.map(mapOrcamento));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar orçamentos');
      setOrcamentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleOrcamentoSalvo = () => {
      const dados = localStorage.getItem('novoOrcamento');
      if (dados) {
        const parsed = JSON.parse(dados);
        const novoId = Math.max(...orcamentos.map(o => o.id), 0) + 1;
        const seq = String(novoId).padStart(6, '0');
        const novoOrcamento: Orcamento = {
          id: novoId,
          numero: `ORC-${seq}/2026`,
          cliente: parsed.cliente,
          email: parsed.email,
          telefone: parsed.telefone,
          empresa: parsed.empresa,
          dataCriacao: new Date(),
          dataValidade: new Date(parsed.validade),
          itens: parsed.itens,
          subtotal: parsed.subtotal,
          desconto: parsed.desconto,
          total: parsed.total,
          status: 'rascunho',
          observacoes: parsed.observacoes,
          tabelaPreco: parsed.tabelaPreco,
          formaPagamento: parsed.formaPagamento,
        };
        setOrcamentos(prev => [...prev, novoOrcamento]);
        localStorage.removeItem('novoOrcamento');
      }
    };

    window.addEventListener('orcamentoSalvo', handleOrcamentoSalvo);
    return () => window.removeEventListener('orcamentoSalvo', handleOrcamentoSalvo);
  }, [orcamentos]);

  const itemsPerPage = 5;

  const filteredOrcamentos = useMemo(() => {
    return orcamentos.filter(orc => {
      const matchSearch = orc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          orc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          orc.empresa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'todos' || orc.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orcamentos, searchTerm, statusFilter]);

  const paginatedOrcamentos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrcamentos.slice(start, start + itemsPerPage);
  }, [filteredOrcamentos, currentPage]);

  const totalPages = Math.ceil(filteredOrcamentos.length / itemsPerPage);

  const stats = useMemo(() => {
    const total = orcamentos.reduce((s, o) => s + o.total, 0);
    const aprovados = orcamentos.filter(o => o.status === 'aprovado').reduce((s, o) => s + o.total, 0);
    const pendentes = orcamentos.filter(o => o.status === 'enviado' || o.status === 'rascunho').length;
    const expirados = orcamentos.filter(o => o.status === 'expirado').length;
    return { total, aprovados, pendentes, expirados, count: orcamentos.length };
  }, [orcamentos]);

  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    rascunho: { label: 'Rascunho', bg: 'bg-slate-100', text: 'text-slate-600', icon: FileText },
    enviado: { label: 'Enviado', bg: 'bg-blue-100', text: 'text-blue-700', icon: Send },
    aprovado: { label: 'Aprovado', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    recusado: { label: 'Recusado', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    expirado: { label: 'Expirado', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    convertido: { label: 'Convertido', bg: 'bg-purple-100', text: 'text-purple-700', icon: TrendingUp },
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Excluir orçamento?',
      description: 'Deseja realmente excluir este registro? Esta ação não pode ser desfeita.',
    });
    if (!ok) return;
    try {
      await api.delete('orcamentos', id);
      setOrcamentos((prev) => prev.filter((o) => o.id !== id));
      toast.destructive('Orçamento excluído.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  };

  const handleChangeStatus = async (id: number, newStatus: Orcamento['status']) => {
    try {
      const updated = await api.update<Record<string, unknown>>('orcamentos', id, { status: newStatus });
      setOrcamentos(prev => prev.map(o => o.id === id ? mapOrcamento(updated) : o));
      if (modalDetalhes && modalDetalhes.id === id) {
        setModalDetalhes(prev => prev ? mapOrcamento(updated) : null);
      }
      toast.success('Status atualizado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-emerald-600 cursor-pointer">Vendas</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900">Gestão de Orçamentos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Gestão de Orçamentos</h1>
        <p className="text-slate-500 text-sm">Gerencie orçamentos e acompanhe o funil de vendas</p>
        {loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
            <span className="text-xs font-medium text-slate-500">Total Orçamentos</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.count}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center"><DollarSign className="w-5 h-5 text-gray-600" /></div>
            <span className="text-xs font-medium text-slate-500">Valor Aprovado</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{formatarMoeda(stats.aprovados)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
            <span className="text-xs font-medium text-slate-500">Pendentes</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.pendentes}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            <span className="text-xs font-medium text-slate-500">Expirados</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.expirados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, número ou empresa..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="recusado">Recusado</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
              <SelectItem value="convertido">Convertido</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => navigate('/gestao-vendas/novo-orcamento')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nº</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Validade</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Carregando...</td></tr>
              ) : paginatedOrcamentos.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum orçamento encontrado</td></tr>
              ) : (
                paginatedOrcamentos.map(orc => {
                  const StatusIcon = statusConfig[orc.status]?.icon || FileText;
                  return (
                    <tr key={orc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">{orc.numero}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{orc.cliente}</p>
                        <p className="text-xs text-slate-400">{orc.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{orc.empresa}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{orc.dataValidade.toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">{formatarMoeda(orc.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig[orc.status]?.bg || 'bg-slate-100'} ${statusConfig[orc.status]?.text || 'text-slate-600'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[orc.status]?.label || orc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setModalDetalhes(orc)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Detalhes">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate('/gestao-vendas/novo-orcamento')} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors" title="Novo">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => void handleDelete(orc.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Paginação */}
        <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-500">Exibindo {paginatedOrcamentos.length} de {filteredOrcamentos.length} registros</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {modalDetalhes && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalDetalhes(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{modalDetalhes.numero}</h2>
                <p className="text-sm text-slate-500">{modalDetalhes.empresa}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusConfig[modalDetalhes.status] && (() => {
                  const SIcon = statusConfig[modalDetalhes.status].icon;
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig[modalDetalhes.status].bg} ${statusConfig[modalDetalhes.status].text}`}>
                      <SIcon className="w-3 h-3" />
                      {statusConfig[modalDetalhes.status].label}
                    </span>
                  );
                })()}
                <button onClick={() => setModalDetalhes(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Info do Cliente */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Cliente</p>
                  <p className="text-sm font-semibold text-slate-900">{modalDetalhes.cliente}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">E-mail</p>
                  <p className="text-sm text-slate-900">{modalDetalhes.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Telefone</p>
                  <p className="text-sm text-slate-900">{modalDetalhes.telefone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Data de Criação</p>
                  <p className="text-sm text-slate-900">{modalDetalhes.dataCriacao.toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Validade</p>
                  <p className="text-sm text-slate-900">{modalDetalhes.dataValidade.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Itens */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Itens do Orçamento</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Serviço</th>
                        <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">Qtd</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">Valor Unit.</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {modalDetalhes.itens.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 text-slate-900 font-medium">{item.servico}</td>
                          <td className="px-4 py-2.5 text-center text-slate-500">{item.quantidade}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{formatarMoeda(item.valorUnitario)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatarMoeda(item.quantidade * item.valorUnitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totais */}
              <div className="bg-[#f5f5f5] rounded-lg p-4 mb-6">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatarMoeda(modalDetalhes.subtotal)}</span>
                  </div>
                  {modalDetalhes.desconto > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Desconto</span>
                      <span>- {formatarMoeda(modalDetalhes.desconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-extrabold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-emerald-700">{formatarMoeda(modalDetalhes.total)}</span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {modalDetalhes.observacoes && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Observações</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{modalDetalhes.observacoes}</p>
                </div>
              )}

              {/* Ações de Status */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Alterar Status</h3>
                <div className="flex flex-wrap gap-2">
                  {modalDetalhes.status !== 'enviado' && (
                    <button onClick={() => handleChangeStatus(modalDetalhes.id, 'enviado')} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Enviar
                    </button>
                  )}
                  {modalDetalhes.status !== 'aprovado' && (
                    <button onClick={() => handleChangeStatus(modalDetalhes.id, 'aprovado')} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                    </button>
                  )}
                  {modalDetalhes.status !== 'recusado' && (
                    <button onClick={() => handleChangeStatus(modalDetalhes.id, 'recusado')} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Recusar
                    </button>
                  )}
                  {modalDetalhes.status !== 'convertido' && (
                    <button onClick={() => handleChangeStatus(modalDetalhes.id, 'convertido')} className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Converter em Venda
                    </button>
                  )}
                  <button className="px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" /> Imprimir
                  </button>
                  <button className="px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
