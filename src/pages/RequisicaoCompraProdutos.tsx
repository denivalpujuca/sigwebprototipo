import { useState, useMemo, useRef, useEffect } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Almoxarifado {
  id: number;
  nome: string;
  empresa: string;
}

interface Produto {
  id: number;
  nome: string;
  unidade: string;
}

interface ProdutoItem {
  produto?: Produto;
  nomeNovo?: string;
  quantidade: number;
  unidade: string;
  justificativa: string;
}

interface Requisicao {
  id: number;
  setor: string;
  almoxarifado: string;
  data: Date;
  justificativaGeral: string;
  itens: ProdutoItem[];
  dataPrevista: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'comprado';
}

const almoxarifados: Almoxarifado[] = [
  { id: 1, nome: 'Almoxarifado Central', empresa: 'Gestão Urbana S/A' },
  { id: 2, nome: 'Almoxarifado Norte', empresa: 'Serviços Metropolitanos Ltda' },
  { id: 3, nome: 'Almoxarifado Sul', empresa: 'Ambiental Norte S/A' },
  { id: 4, nome: 'Almoxarifado Zona Leste', empresa: 'Transporte Público Municipal' },
];

const setores = [
  'Recursos Humanos',
  'Financeiro',
  'Operações',
  'Manutenção',
  'TI',
  'Compras',
  'Jurídico',
  'Contabilidade',
  'Logística',
  'Gestão de Frota'
];

const produtosCadastrados: Produto[] = [
  { id: 1, nome: 'Caneta esferográfica azul', unidade: 'Caixa' },
  { id: 2, nome: 'Papel A4', unidade: 'Caixa' },
  { id: 3, nome: 'Clipe aço médio', unidade: 'Caixa' },
  { id: 4, nome: 'Detergente líquido', unidade: 'Unidade' },
  { id: 5, nome: 'Desinfetante 5L', unidade: 'Galão' },
  { id: 6, nome: 'Luva descartável', unidade: 'Caixa' },
  { id: 7, nome: 'Capacete segurança', unidade: 'Unidade' },
  { id: 8, nome: 'Chave Philips', unidade: 'Conjunto' },
  { id: 9, nome: 'Fita Isolante', unidade: 'Rolo' },
  { id: 10, nome: 'Álcool gel 70%', unidade: 'Unidade' },
  { id: 11, nome: 'Resma papel A4', unidade: 'Resma' },
  { id: 12, nome: 'Borracha escolar', unidade: 'Unidade' },
  { id: 13, nome: 'Óleo lubrificante multiuso', unidade: 'Unidade' },
  { id: 14, nome: 'Filtro de óleo', unidade: 'Unidade' },
  { id: 15, nome: 'Bateria 12V', unidade: 'Unidade' },
];

const unidades = ['Unidade', 'Caixa', 'Kit', 'Par', 'Litro', 'Kg', 'Rolo', 'Metro', 'Galão', 'Resma', 'Conjunto'];

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string) => void;
  options: { id: number; nome: string }[];
  placeholder: string;
  selectedId?: string;
}

function SearchInput({ value, onChange, onSelect, options, placeholder, selectedId }: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = value
    ? options.filter(o => o.nome.toLowerCase().includes(value.toLowerCase()))
    : options;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c] flex items-center pointer-events-none z-10">
        <span className="material-symbols-outlined text-[18px]">search</span>
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-10 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
      />
      {selectedId && (
        <button
          type="button"
          onClick={() => { onChange(''); onSelect('', ''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] hover:text-[#191c1d] z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#e2e8f0] rounded-lg shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 max-h-60 overflow-y-auto mt-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(o => (
              <div
                key={o.id}
                onClick={() => { onSelect(String(o.id), o.nome); setIsOpen(false); }}
                className={`px-4 py-3 cursor-pointer text-sm border-b border-[#f1f5f9] hover:bg-[#f8fafc] ${String(o.id) === selectedId ? 'bg-[#006e2d]/10 text-[#006e2d] font-semibold' : 'text-[#191c1d]'}`}
              >
                {o.nome}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-[#94a3b8] text-center">Nenhum resultado encontrado</div>
          )}
        </div>
      )}
    </div>
  );
}

interface RequisicaoCompraProdutosProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const RequisicaoCompraProdutosPage: React.FC<RequisicaoCompraProdutosProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('suprimentos');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [setorSelecionado, setSetorSelecionado] = useState('');
  const [almoxarifadoSelecionado, setAlmoxarifadoSelecionado] = useState('');
  const [justificativaGeral, setJustificativaGeral] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [itens, setItens] = useState<ProdutoItem[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoBusca, setProdutoBusca] = useState('');
  const [produtoSelecionadoNome, setProdutoSelecionadoNome] = useState('');
  const [itemForm, setItemForm] = useState({ produtoId: '', quantidade: 1, unidade: 'Unidade', justificativa: '' });
  const [mostrarProdutoNovo, setMostrarProdutoNovo] = useState(false);
  const [novoProdutoForm, setNovoProdutoForm] = useState({ nome: '', quantidade: 1, unidade: 'Unidade', justificativa: '' });
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>(() => {
    const stored = localStorage.getItem('requisicoesCompra');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((r: Requisicao) => ({
        ...r,
        data: new Date(r.data)
      }));
    }
    return [];
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado' | 'comprado'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  const adicionarItem = () => {
    if (!mostrarProdutoNovo) {
      if (!itemForm.produtoId || itemForm.quantidade <= 0) {
        alert('Selecione um produto e quantidade');
        return;
      }
      const produto = produtosCadastrados.find(p => p.id === parseInt(itemForm.produtoId));
      if (produto) {
        setItens(prev => [...prev, { 
          produto, 
          quantidade: itemForm.quantidade, 
          unidade: produto.unidade,
          justificativa: itemForm.justificativa 
        }]);
      }
    } else {
      if (!novoProdutoForm.nome || novoProdutoForm.quantidade <= 0) {
        alert('Preencha o nome do produto e quantidade');
        return;
      }
      setItens(prev => [...prev, { 
        nomeNovo: novoProdutoForm.nome, 
        quantidade: novoProdutoForm.quantidade, 
        unidade: novoProdutoForm.unidade,
        justificativa: novoProdutoForm.justificativa 
      }]);
    }
    setItemForm({ produtoId: '', quantidade: itemForm.quantidade, unidade: 'Unidade', justificativa: '' });
    setProdutoBusca('');
    setProdutoSelecionadoNome('');
  };

  const removerItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const criarRequisicao = () => {
    if (!setorSelecionado || !almoxarifadoSelecionado || !justificativaGeral || !dataPrevista || itens.length === 0) {
      alert('Preencha todos os campos e adicione pelo menos um produto');
      return;
    }
    
    const novaRequisicao: Requisicao = {
      id: requisicoes.length > 0 ? Math.max(...requisicoes.map(r => r.id)) + 1 : 1,
      setor: setorSelecionado,
      almoxarifado: almoxarifadoSelecionado,
      data: new Date(),
      justificativaGeral,
      dataPrevista,
      itens: [...itens],
      status: 'pendente'
    };
    
    setRequisicoes(prev => [...prev, novaRequisicao]);
    
    const requisicaoParaSalvar = {
      ...novaRequisicao,
      data: novaRequisicao.data.toISOString()
    };
    const requisicoesArmazenadas = JSON.parse(localStorage.getItem('requisicoesCompra') || '[]');
    localStorage.setItem('requisicoesCompra', JSON.stringify([...requisicoesArmazenadas, requisicaoParaSalvar]));
    
    setItens([]);
    setSetorSelecionado('');
    setAlmoxarifadoSelecionado('');
    setJustificativaGeral('');
    setDataPrevista('');
    setMostrarModal(false);
    alert(`Requisição #${novaRequisicao.id} criada com sucesso!`);
  };

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(r => {
      const matchesSearch = searchTerm === '' || 
        r.setor.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.almoxarifado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requisicoes, searchTerm, filterStatus]);

  const paginatedRequisicoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequisicoes.slice(start, start + itemsPerPage);
  }, [filteredRequisicoes, currentPage]);

  const totalPages = Math.ceil(filteredRequisicoes.length / itemsPerPage);

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-[#fff3cd] text-[#856404]';
      case 'aprovado': return 'bg-[#7ffc97] text-[#002109]';
      case 'rejeitado': return 'bg-[#ffdad6] text-[#93000a]';
      case 'comprado': return 'bg-[#006e2d] text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Suprimentos</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Requisição de Compra</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Requisição de Compra</h1>
        <p className="text-[#555f70] text-sm">Solicitação de compra de produtos para almoxarifados.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
          <input
            type="text"
            placeholder="Pesquisar por ID, setor ou almoxarifado..."
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
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">filter_list</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
            className="pl-10 pr-8 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
          >
            <option value="all">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="comprado">Comprado</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Requisição
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Setor</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Almoxarifado</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedRequisicoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#555f70]">Nenhuma requisição encontrada</td>
                </tr>
              ) : (
                paginatedRequisicoes.map(req => (
                  <tr key={req.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">#{req.id}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.setor}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.almoxarifado}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.itens.length} itens</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.data.toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedRequisicoes.length} de {filteredRequisicoes.length} registros</span>
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

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Nova Requisição de Compra</h2>
              <button onClick={() => setMostrarModal(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Data Prevista</label>
                  <input 
                    type="date" 
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Setor Solicitante</label>
                  <select 
                    value={setorSelecionado} 
                    onChange={(e) => setSetorSelecionado(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  >
                    <option value="">Selecione</option>
                    {setores.map(setor => (
                      <option key={setor} value={setor}>{setor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Almoxarifado</label>
                  <select 
                    value={almoxarifadoSelecionado} 
                    onChange={(e) => setAlmoxarifadoSelecionado(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  >
                    <option value="">Selecione</option>
                    {almoxarifados.map(alm => (
                      <option key={alm.id} value={alm.nome}>{alm.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Justificativa Geral</label>
                <textarea 
                  value={justificativaGeral}
                  onChange={(e) => setJustificativaGeral(e.target.value)}
                  placeholder="Ex: Reposição de estoque, itens com falta, etc."
                  className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm h-20 resize-none"
                />
              </div>

              <div className="border-t border-[#bccbb9]/20 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#555f70] uppercase">Adicionar Produtos</h3>
                  <button 
                    onClick={() => setMostrarProdutoNovo(!mostrarProdutoNovo)}
                    className="text-xs text-[#006e2d] hover:underline"
                  >
                    {mostrarProdutoNovo ? 'Selecionar produto cadastrado' : 'Adicionar produto não cadastrado'}
                  </button>
                </div>

                {mostrarProdutoNovo ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Nome do produto"
                      value={novoProdutoForm.nome}
                      onChange={(e) => setNovoProdutoForm({ ...novoProdutoForm, nome: e.target.value })}
                      className="md:col-span-2 px-3 py-2 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      value={novoProdutoForm.quantidade}
                      onChange={(e) => setNovoProdutoForm({ ...novoProdutoForm, quantidade: parseInt(e.target.value) || 1 })}
                      className="px-3 py-2 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    />
                    <select
                      value={novoProdutoForm.unidade}
                      onChange={(e) => setNovoProdutoForm({ ...novoProdutoForm, unidade: e.target.value })}
                      className="px-3 py-2 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    >
                      {unidades.map(u => (<option key={u} value={u}>{u}</option>))}
                    </select>
                    <input
                      type="text"
                      placeholder="Justificativa (ex: estoque baixo)"
                      value={novoProdutoForm.justificativa}
                      onChange={(e) => setNovoProdutoForm({ ...novoProdutoForm, justificativa: e.target.value })}
                      className="md:col-span-3 px-3 py-2 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    />
                    <button
                      onClick={adicionarItem}
                      className="px-3 py-2 bg-[#006e2d] text-white text-sm font-bold rounded-md hover:bg-[#005a26]"
                    >
                      Adicionar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchInput
                          value={produtoSelecionadoNome || produtoBusca}
                          onChange={(val) => { setProdutoBusca(val); if (itemForm.produtoId) { setItemForm({ ...itemForm, produtoId: '' }); setProdutoSelecionadoNome(''); } }}
                          onSelect={(id, name) => { setItemForm({ ...itemForm, produtoId: id }); setProdutoSelecionadoNome(name); setProdutoBusca(name); }}
                          options={produtosCadastrados.map(p => ({ id: p.id, nome: p.nome }))}
                          placeholder="Buscar produto..."
                          selectedId={itemForm.produtoId}
                        />
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={itemForm.quantidade}
                        onChange={(e) => setItemForm({ ...itemForm, quantidade: parseInt(e.target.value) || 1 })}
                        className="w-20 px-3 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm text-center"
                      />
                      <button
                        onClick={adicionarItem}
                        disabled={!itemForm.produtoId}
                        className="px-4 py-2.5 bg-[#006e2d] text-white text-sm font-bold rounded-md hover:bg-[#005a26] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    </div>
                )}
              </div>

              {itens.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-[#555f70] uppercase mb-2">Itens da Requisição ({itens.length})</h3>
                  <div className="bg-[#f8f9fa] rounded-lg divide-y divide-[#bccbb9]/20">
                    {itens.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <span className="text-sm text-[#191c1d] font-medium">
                            {item.produto ? item.produto.nome : item.nomeNovo}
                          </span>
                          <span className="text-xs text-[#555f70] ml-2">
                            x{item.quantidade} {item.unidade}
                          </span>
                          {item.justificativa && (
                            <p className="text-[10px] text-[#555f70] italic">{item.justificativa}</p>
                          )}
                        </div>
                        <button onClick={() => removerItem(index)} className="text-[#ba1a1a] hover:opacity-70 p-1">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {itens.length > 0 && (
              <div className="px-6 py-4 border-t border-[#bccbb9]/10 bg-[#f8f9fa]">
                <button
                  onClick={criarRequisicao}
                  className="w-full bg-gradient-to-br from-[#006e2d] to-[#44c365] px-4 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined">send</span>
                  Enviar Requisição
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