import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface OS {
  id: number;
  veiculo: string;
  placa: string;
  servico: string;
  status: 'aberta' | 'andamento' | 'esperando' | 'concluida';
  data: string;
  valor: number;
  ativo: boolean;
}

const initialOS: OS[] = [
  { id: 1, veiculo: 'Volkswagen Constellation', placa: 'ABC-1234', servico: 'Troca de óleo e filtros', status: 'andamento', data: '05/04/2026', valor: 450, ativo: true },
  { id: 2, veiculo: 'Mercedes-Benz Axor', placa: 'XYZ-9876', servico: 'Revisão geral', status: 'esperando', data: '04/04/2026', valor: 1200, ativo: true },
  { id: 3, veiculo: 'Ford Cargo', placa: 'DEF-5678', servico: 'Reparo freios', status: 'aberta', data: '05/04/2026', valor: 380, ativo: true },
  { id: 4, veiculo: 'Scania R500', placa: 'GHI-4321', servico: 'Troca de pneus', status: 'concluida', data: '03/04/2026', valor: 2800, ativo: true },
  { id: 5, veiculo: 'Volvo FH', placa: 'JKL-8765', servico: 'Diagnóstico motor', status: 'andamento', data: '04/04/2026', valor: 650, ativo: true },
];

interface OrdemServicoProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const OrdemServicoPage: React.FC<OrdemServicoProps> = () => {
  const [osList, setOsList] = useState<OS[]>(initialOS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OS | null>(null);
  const [formData, setFormData] = useState({ veiculo: '', placa: '', servico: '', status: 'aberta' as OS['status'] });
  const itemsPerPage = 5;

  const filteredOS = useMemo(() => {
    return osList.filter(os => 
      os.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.placa.includes(searchTerm) ||
      os.servico.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [osList, searchTerm]);

  const paginatedOS = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOS.slice(start, start + itemsPerPage);
  }, [filteredOS, currentPage]);

  const totalPages = Math.ceil(filteredOS.length / itemsPerPage);

  const getStatusBadge = (status: OS['status']) => {
    switch (status) {
      case 'aberta': return 'bg-blue-100 text-blue-700';
      case 'andamento': return 'bg-yellow-100 text-yellow-700';
      case 'esperando': return 'bg-orange-100 text-orange-700';
      case 'concluida': return 'bg-emerald-100 text-emerald-700';
    }
  };

  const getStatusLabel = (status: OS['status']) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'andamento': return 'Em Andamento';
      case 'esperando': return 'Aguardando Peças';
      case 'concluida': return 'Concluída';
    }
  };

  const handleAdd = () => {
    setEditingOS(null);
    setFormData({ veiculo: '', placa: '', servico: '', status: 'aberta' });
    setIsModalOpen(true);
  };

  const handleEdit = (os: OS) => {
    setEditingOS(os);
    setFormData({ veiculo: os.veiculo, placa: os.placa, servico: os.servico, status: os.status });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setOsList(prev => prev.map(os => os.id === id ? { ...os, ativo: !os.ativo } : os));
  };

  const handleSave = () => {
    if (!formData.veiculo || !formData.placa || !formData.servico) {
      alert('Preencha todos os campos');
      return;
    }

    if (editingOS) {
      setOsList(prev => prev.map(os => os.id === editingOS.id ? { ...os, ...formData, ativo: editingOS.ativo } : os));
    } else {
      const newOS: OS = {
        id: Date.now(),
        ...formData,
        data: new Date().toLocaleDateString('pt-BR'),
        valor: 0,
        ativo: true
      };
      setOsList(prev => [newOS, ...prev]);
    }
    setIsModalOpen(false);
    setEditingOS(null);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Frota</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Ordem de Serviço</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Ordens de Serviço</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de ordens de serviço da oficina.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar OS"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors"
        >
          <MaterialIcon name="add" size={20} />
          Nova OS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Veículo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Placa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Serviço</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOS.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedOS.map(os => (
                  <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">#{os.id}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{os.veiculo}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 font-mono">{os.placa}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{os.servico}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(os.status)}`}>
                        {getStatusLabel(os.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{os.data}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(os)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(os.id)} className={`p-1.5 transition-colors ${os.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={os.ativo ? 'block' : 'check'} size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedOS.length} de {filteredOS.length} registros</span>
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
            <SheetTitle>{editingOS ? 'Editar OS' : 'Nova OS'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Veículo</label>
              <input type="text" value={formData.veiculo} onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Placa</label>
              <input type="text" value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Serviço</label>
              <input type="text" value={formData.servico} onChange={(e) => setFormData({ ...formData, servico: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as OS['status'] })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="aberta">Aberta</option>
                <option value="andamento">Em Andamento</option>
                <option value="esperando">Aguardando Peças</option>
                <option value="concluida">Concluída</option>
              </select>
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
