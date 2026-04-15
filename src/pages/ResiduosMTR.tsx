import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface MTR {
  id: number;
  codigo: string;
  residuo: string;
  classe: string;
  quantidade: number;
  unidade: string;
  transportador: string;
  dataEmissao: string;
  status: 'EMITIDO' | 'TRANSPORTADO' | 'RECEBIDO' | 'CANCELADO';
}

function mapMTR(r: Record<string, unknown>): MTR {
  return {
    id: Number(r.id),
    codigo: String(r.codigo ?? ''),
    residuo: String(r.residuo ?? ''),
    classe: String(r.classe ?? ''),
    quantidade: Number(r.quantidade ?? 0),
    unidade: String(r.unidade ?? 'kg'),
    transportador: String(r.transportador ?? ''),
    dataEmissao: String(r.data_emissao ?? r.dataEmissao ?? ''),
    status: (String(r.status ?? 'EMITIDO') as MTR['status']),
  };
}

export const ResiduosMTRPage: React.FC = () => {
  const { toast } = useAppFeedback();
  const [mtrs, setMtrs] = useState<MTR[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMtr, setEditingMtr] = useState<MTR | null>(null);
  const [formData, setFormData] = useState<{ codigo: string; residuo: string; classe: string; quantidade: number; unidade: string; transportador: string; dataEmissao: string; status: 'EMITIDO' | 'TRANSPORTADO' | 'RECEBIDO' | 'CANCELADO' }>({ codigo: '', residuo: '', classe: '', quantidade: 0, unidade: 'kg', transportador: '', dataEmissao: '', status: 'EMITIDO' });
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    try {
      const raw = await api.list<Record<string, unknown>>('residuos_mtr');
      setMtrs(raw.map(mapMTR));
    } catch (e) {
      setMtrs([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredMtrs = useMemo(() => {
    return mtrs.filter(mtr => 
      mtr.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mtr.residuo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mtrs, searchTerm]);

  const paginatedMtrs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMtrs.slice(start, start + itemsPerPage);
  }, [filteredMtrs, currentPage]);

  const totalPages = Math.ceil(filteredMtrs.length / itemsPerPage);

  const handleSave = async () => {
    try {
      const payload = {
        codigo: formData.codigo || `MTR-${String(Date.now()).slice(-6)}/2026`,
        residuo: formData.residuo,
        classe: formData.classe,
        quantidade: formData.quantidade,
        unidade: formData.unidade,
        transportador: formData.transportador,
        data_emissao: formData.dataEmissao,
        status: formData.status,
      };
      if (editingMtr) {
        const updated = await api.update<Record<string, unknown>>('residuos_mtr', editingMtr.id, payload);
        setMtrs(prev => prev.map(m => m.id === editingMtr.id ? mapMTR(updated) : m));
      } else {
        const created = await api.create<Record<string, unknown>>('residuos_mtr', payload);
        setMtrs(prev => [...prev, mapMTR(created)]);
      }
      setIsModalOpen(false);
      setEditingMtr(null);
      setFormData({ codigo: '', residuo: '', classe: '', quantidade: 0, unidade: 'kg', transportador: '', dataEmissao: '', status: 'EMITIDO' });
      toast.success(editingMtr ? 'MTR atualizado.' : 'MTR cadastrado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  };

  const handleEdit = (mtr: MTR) => {
    setEditingMtr(mtr);
    setFormData({ codigo: mtr.codigo, residuo: mtr.residuo, classe: mtr.classe, quantidade: mtr.quantidade, unidade: mtr.unidade, transportador: mtr.transportador, dataEmissao: mtr.dataEmissao, status: mtr.status });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: number) => {
    const m = mtrs.find(x => x.id === id);
    if (!m) return;
    const statusOrder: MTR['status'][] = ['EMITIDO', 'TRANSPORTADO', 'RECEBIDO'];
    const currentIndex = statusOrder.indexOf(m.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    try {
      const updated = await api.update<Record<string, unknown>>('residuos_mtr', id, { status: nextStatus });
      setMtrs(prev => prev.map(x => x.id === id ? mapMTR(updated) : x));
      toast.success('Status atualizado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  };

  const handleAdd = () => {
    setEditingMtr(null);
    setFormData({ codigo: '', residuo: '', classe: '', quantidade: 0, unidade: 'kg', transportador: '', dataEmissao: '', status: 'EMITIDO' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Resíduos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Resíduos MTR</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Resíduos MTR</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de Manifesto de Transporte de Resíduos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar MTR"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors"
        >
          <MaterialIcon name="add" size={20} />
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Código</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Resíduo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Classe</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Quantidade</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Transportador</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMtrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedMtrs.map(mtr => (
                  <tr key={mtr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold font-mono text-slate-900">{mtr.codigo}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{mtr.residuo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{mtr.classe}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-slate-900">{mtr.quantidade} {mtr.unidade}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{mtr.transportador}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${mtr.status === 'EMITIDO' ? 'bg-blue-100 text-blue-700' : mtr.status === 'TRANSPORTADO' ? 'bg-yellow-100 text-yellow-700' : mtr.status === 'RECEBIDO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {mtr.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(mtr)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(mtr.id)} className={`p-1.5 transition-colors ${mtr.status === 'EMITIDO' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={mtr.status === 'EMITIDO' ? 'block' : 'check'} size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedMtrs.length} de {filteredMtrs.length} registros</span>
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

      <Sheet open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>{editingMtr ? 'Editar MTR' : 'Novo MTR'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Resíduo</label>
              <input type="text" value={formData.residuo} onChange={(e) => setFormData({ ...formData, residuo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Classe</label>
                <Select value={formData.classe} onValueChange={(value) => setFormData({ ...formData, classe: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classe I">Classe I - Perigoso</SelectItem>
                    <SelectItem value="Classe II">Classe II - Não Perigoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Quantidade</label>
                <input type="number" value={formData.quantidade} onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Transportador</label>
              <input type="text" value={formData.transportador} onChange={(e) => setFormData({ ...formData, transportador: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data Emissão</label>
              <input type="date" value={formData.dataEmissao} onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">Salvar</button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );

  return <>{content}</>;
};