import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';
import { useNotificacoes } from '@/context/NotificacaoContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Requisicao {
  id: number;
  empresa: string;
  departamento: string;
  solicitante: string;
  solicitante_id: number | null;
  data: string;
  itens: number;
  status: 'pendente' | 'separado' | 'aprovado' | 'rejeitado' | 'entregue';
}

interface ItemRequisicao {
  id: number;
  requisicao_id: number;
  produto_nome: string;
  quantidade: number;
  separado: number;
  verificado: number;
  observacao: string | null;
}

function mapRequisicao(r: Record<string, unknown>): Requisicao {
  return {
    id: Number(r.id),
    empresa: String(r.empresa ?? ''),
    departamento: String(r.departamento ?? ''),
    solicitante: String(r.solicitante ?? ''),
    solicitante_id: r.solicitante_id ? Number(r.solicitante_id) : null,
    data: String(r.data ?? ''),
    itens: Number(r.itens ?? 0),
    status: (String(r.status ?? 'pendente') as Requisicao['status']),
  };
}

export const RequisicaoDepartamentoPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const { createNotification } = useNotificacoes();
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [itensRequisicao, setItensRequisicao] = useState<ItemRequisicao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isItensModalOpen, setIsItensModalOpen] = useState(false);
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    try {
      const raw = await api.list<Record<string, unknown>>('requisicoes_departamento');
      setRequisicoes(raw.map(mapRequisicao));
    } catch (e) {
      setRequisicoes([]);
    }
  }, []);

  const loadItens = useCallback(async (requisicaoId: number) => {
    try {
      const data = await api.getUrl<ItemRequisicao>(`/api/requisicoes_departamento/${requisicaoId}/itens`);
      setItensRequisicao(Array.isArray(data) ? data : []);
    } catch (e) {
      setItensRequisicao([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(req => {
      const matchesStatus = statusFilter === 'todos' || req.status === statusFilter;
      const matchesSearch = 
        req.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [requisicoes, searchTerm, statusFilter]);

  const paginatedRequisicoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequisicoes.slice(start, start + itemsPerPage);
  }, [filteredRequisicoes, currentPage]);

  const totalPages = Math.ceil(filteredRequisicoes.length / itemsPerPage);

  const handleViewItens = async (req: Requisicao) => {
    setSelectedRequisicao(req);
    await loadItens(req.id);
    setItensRequisicao(prev => prev.map(item => ({ ...item, separado: 0 })));
    setIsItensModalOpen(true);
  };

  const handleToggleSeparar = async (item: ItemRequisicao) => {
    try {
      const novoValor = item.separado ? 0 : 1;
      await api.update('itens_requisicao', item.id, { separado: novoValor });
      setItensRequisicao(prev => prev.map(i => 
        i.id === item.id ? { ...i, separado: novoValor } : i
      ));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar item');
    }
  };

  const handleFecharSeparacao = async () => {
    if (!selectedRequisicao) return;
    try {
      await api.update('requisicoes_departamento', selectedRequisicao.id, { status: 'separado' });
      setRequisicoes(prev => prev.map(r => 
        r.id === selectedRequisicao.id ? { ...r, status: 'separado' as const } : r
      ));
      
      if (selectedRequisicao.solicitante_id) {
        await createNotification({
          usuario_id: selectedRequisicao.solicitante_id,
          titulo: 'Separação Finalizada',
          mensagem: `Os itens da requisição #${selectedRequisicao.id} foram separados e estão prontos para retirada.`,
          tipo: 'success',
          link: '/requisicao-departamento',
        });
      }
      
      toast.success('Separação fechada com sucesso!');
      setIsItensModalOpen(false);
      setSelectedRequisicao(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao fechar separação');
    }
  };

  const gerarPDFRequisicao = () => {
    if (!selectedRequisicao) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REQUISIÇÃO DE MATERIAIS', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Requisição #: ${selectedRequisicao.id}`, 15, 35);
    doc.text(`Data: ${selectedRequisicao.data ? new Date(selectedRequisicao.data).toLocaleDateString('pt-BR') : '-'}`, 15, 42);
    doc.text(`Empresa: ${selectedRequisicao.empresa}`, 15, 49);
    doc.text(`Departamento: ${selectedRequisicao.departamento}`, 15, 56);
    doc.text(`Solicitante: ${selectedRequisicao.solicitante}`, 15, 63);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS REQUISITADOS', 15, 75);
    
    const tableData = itensRequisicao.map(item => [
      item.quantidade.toString(),
      item.produto_nome,
      item.observacao || '-'
    ]);
    
    (doc as jsPDF & { autoTable: Function }).autoTable({
      startY: 80,
      head: [['Qtd', 'Produto', 'Observação']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 'auto' }
      }
    });
    
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ASSINATURAS', 15, finalY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text('Responsável pelo Almoxarifado:', 15, finalY + 25);
    doc.line(15, finalY + 40, 90, finalY + 40);
    doc.text('Nome:', 15, finalY + 46);
    doc.text('Data:', 70, finalY + 46);
    
    doc.text('Solicitante:', 110, finalY + 25);
    doc.line(110, finalY + 40, 185, finalY + 40);
    doc.text('Nome:', 110, finalY + 46);
    doc.text('Data:', 165, finalY + 46);
    
    doc.save(`requisicao_${selectedRequisicao.id}.pdf`);
  };

  const handleConfirmarEntrega = async () => {
    if (!selectedRequisicao) return;
    try {
      await api.update('requisicoes_departamento', selectedRequisicao.id, { status: 'entregue' });
      setRequisicoes(prev => prev.map(r => 
        r.id === selectedRequisicao.id ? { ...r, status: 'entregue' as const } : r
      ));
      
      gerarPDFRequisicao();
      
      setIsConfirmDialogOpen(false);
      setIsItensModalOpen(false);
      setSelectedRequisicao(null);
      toast.success('Entrega realizada com sucesso! PDF gerado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao realizar entrega');
    }
  };

  const handleAbrirConfirmacao = () => {
    setIsConfirmDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-700',
      separado: 'bg-blue-100 text-blue-700',
      aprovado: 'bg-emerald-100 text-emerald-700',
      rejeitado: 'bg-red-100 text-red-700',
      entregue: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const itensSeparadosCount = itensRequisicao.filter(i => i.separado === 1).length;
  const todosSeparados = itensRequisicao.length > 0 && itensSeparadosCount === itensRequisicao.length;

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Requisição por Departamento</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Requisição por Departamento</h1>
        <p className="text-slate-500 text-sm">Solicitação de produtos pelos departamentos da empresa.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="todos">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="separado">Separado</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="entregue">Entregue</option>
        </select>
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar requisição"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Departamento</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Solicitante</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRequisicoes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedRequisicoes.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{req.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.departamento}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.solicitante}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{req.data ? new Date(req.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 text-center">{req.itens}</td>
                    <td className="px-4 py-4 text-center">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => {
                          if (req.status === 'separado') {
                            handleViewItens(req);
                          } else {
                            handleViewItens(req);
                          }
                        }} 
                        className={`px-3 py-1.5 text-white text-xs font-semibold rounded transition-colors ${
                          req.status === 'separado' 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {req.status === 'separado' ? 'Entregar' : 'Separar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedRequisicoes.length} de {filteredRequisicoes.length} registros</span>
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

      <Sheet open={isItensModalOpen} onOpenChange={(open) => { if (!open) { setIsItensModalOpen(false); setSelectedRequisicao(null); } }}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Separação de Itens</SheetTitle>
            <p className="text-sm text-slate-500 mt-1">
              Requisição #{selectedRequisicao?.id} • {selectedRequisicao?.solicitante}
            </p>
          </SheetHeader>
          
          <div className="mt-4 bg-slate-100 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {itensSeparadosCount} de {itensRequisicao.length} itens separados
            </span>
            <span className={`text-sm font-bold ${itensSeparadosCount === itensRequisicao.length && itensRequisicao.length > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {itensSeparadosCount === itensRequisicao.length && itensRequisicao.length > 0 ? '✓ Completo' : 'Pendente'}
            </span>
          </div>

          <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {itensRequisicao.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhum item nesta requisição</p>
            ) : (
              itensRequisicao.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    item.separado 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      <span className="text-slate-400 mr-1">{item.quantidade}x</span>
                      {item.produto_nome}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSeparar(item)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      item.separado ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                        item.separado ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t flex gap-3">
            {selectedRequisicao?.status === 'separado' ? (
              <button 
                onClick={handleAbrirConfirmacao}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors"
              >
                Confirmar Entrega
              </button>
            ) : todosSeparados ? (
              <button 
                onClick={handleFecharSeparacao}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md transition-colors"
              >
                Fechar Separação
              </button>
            ) : (
              <button 
                onClick={() => { setIsItensModalOpen(false); setSelectedRequisicao(null); }}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md"
              >
                Fechar
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
            <DialogDescription>
              Deseja realmente finalizar esta requisição #{selectedRequisicao?.id}? Um PDF será gerado com os dados para assinatura.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setIsConfirmDialogOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarEntrega}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md"
            >
              Confirmar e Gerar PDF
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
