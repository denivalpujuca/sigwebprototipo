import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Empresa {
  id: number;
  nome: string;
}

interface Departamento {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  unidade: string;
  imagem: string;
}

interface ItemRequisicao {
  produto: Produto;
  quantidade: number;
}

interface RequisicaoDepartamento {
  id: number;
  empresa: string;
  departamento: string;
  solicitante: string;
  itens: ItemRequisicao[];
  data: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'entregue';
}

const empresas: Empresa[] = [
  { id: 1, nome: 'Gestão Urbana S/A' },
  { id: 2, nome: 'Serviços Metropolitanos Ltda' },
  { id: 3, nome: 'Ambiental Norte S/A' },
  { id: 4, nome: 'Transporte Público Municipal' },
];

const departamentos: Departamento[] = [
  { id: 1, nome: 'Recursos Humanos' },
  { id: 2, nome: 'Financeiro' },
  { id: 3, nome: 'Operações' },
  { id: 4, nome: 'Manutenção' },
  { id: 5, nome: ' TI' },
  { id: 6, nome: 'Compras' },
  { id: 7, nome: 'Jurídico' },
  { id: 8, nome: 'Contabilidade' },
];

const produtos: Produto[] = [
  { id: 1, nome: 'Caneta esferográfica azul', descricao: 'Caneta 0.7mm cx/50', unidade: 'Caixa', imagem: 'pen' },
  { id: 2, nome: 'Papel A4', descricao: 'Papel sulfite 75g cx/500', unidade: 'Caixa', imagem: 'description' },
  { id: 3, nome: 'Clipe aço médio', descricao: 'Clipe n° 2 cx/500', unidade: 'Caixa', imagem: 'paperclip' },
  { id: 4, nome: 'Detergente líquido', descricao: 'Detergente 500ml', unidade: 'Unidade', imagem: 'water_drop' },
  { id: 5, nome: 'Desinfetante 5L', descricao: 'Desinfetante líquido 5L', unidade: 'Galão', imagem: 'sanitizer' },
  { id: 6, nome: 'Luva descartável', descricao: 'Luva latex cx/100', unidade: 'Caixa', imagem: 'handyman' },
  { id: 7, nome: 'Capacete segurança', descricao: 'Capacete branco', unidade: 'Unidade', imagem: 'sports_motorsports' },
  { id: 8, nome: 'Chave Philips', descricao: 'Conjunto 6pc', unidade: 'Conjunto', imagem: 'construction' },
  { id: 9, nome: 'Fita Isolante', descricao: '19mmx20m preta', unidade: 'Rolo', imagem: 'electric_bolt' },
  { id: 10, nome: 'Álcool gel 70%', descricao: 'Álcool 1L', unidade: 'Unidade', imagem: 'spa' },
  { id: 11, nome: 'Resma papel A4', descricao: 'Papel 500 folhas', unidade: 'Resma', imagem: 'article' },
  { id: 12, nome: 'Borracha escolar', descricao: 'Borracha branca', unidade: 'Unidade', imagem: 'eraser' },
];

const initialRequisicoes: RequisicaoDepartamento[] = [
  { id: 1, empresa: 'Gestão Urbana S/A', departamento: 'Recursos Humanos', solicitante: 'Maria Santos', itens: [{ produto: produtos[0], quantidade: 5 }, { produto: produtos[1], quantidade: 10 }], data: new Date('2026-04-01'), status: 'aprovado' },
  { id: 2, empresa: 'Serviços Metropolitanos Ltda', departamento: 'Manutenção', solicitante: 'Pedro Oliveira', itens: [{ produto: produtos[5], quantidade: 20 }, { produto: produtos[6], quantidade: 10 }], data: new Date('2026-04-02'), status: 'pendente' },
  { id: 3, empresa: 'Ambiental Norte S/A', departamento: 'TI', solicitante: 'João Silva', itens: [{ produto: produtos[9], quantidade: 15 }, { produto: produtos[10], quantidade: 5 }], data: new Date('2026-04-03'), status: 'entregue' },
];

interface RequisicaoDepartamentoPageProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const RequisicaoDepartamentoPage: React.FC<RequisicaoDepartamentoPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('suprimentos');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState<string>('');
  const [solicitante, setSolicitante] = useState('');
  const [carrinho, setCarrinho] = useState<ItemRequisicao[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [requisicoes, setRequisicoes] = useState<RequisicaoDepartamento[]>(initialRequisicoes);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado' | 'entregue'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const adicionarAoCarrinho = (produto: Produto) => {
    const qtd = quantidades[produto.id] || 1;
    const existingItem = carrinho.find(item => item.produto.id === produto.id);
    
    if (existingItem) {
      setCarrinho(prev => prev.map(item => 
        item.produto.id === produto.id 
          ? { ...item, quantidade: item.quantidade + qtd }
          : item
      ));
    } else {
      setCarrinho(prev => [...prev, { produto, quantidade: qtd }]);
    }
    
    setQuantidades(prev => ({ ...prev, [produto.id]: 1 }));
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const criarRequisicao = () => {
    if (!empresaSelecionada || !departamentoSelecionado || !solicitante || carrinho.length === 0) {
      alert('Preencha todos os campos e adicione produtos');
      return;
    }
    
    const novaRequisicao: RequisicaoDepartamento = {
      id: Date.now(),
      empresa: empresaSelecionada,
      departamento: departamentoSelecionado,
      solicitante,
      itens: [...carrinho],
      data: new Date(),
      status: 'pendente'
    };
    
    setRequisicoes(prev => [...prev, novaRequisicao]);
    setCarrinho([]);
    setMostrarCheckout(false);
    setMostrarCarrinho(false);
    setEmpresaSelecionada('');
    setDepartamentoSelecionado('');
    setSolicitante('');
    alert(`Requisição #${novaRequisicao.id} criada com sucesso!`);
  };

  const filteredRequisicoes = useMemo(() => {
    return requisicoes.filter(r => 
      filterStatus === 'all' || r.status === filterStatus
    );
  }, [requisicoes, filterStatus]);

  const paginatedRequisicoes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequisicoes.slice(start, start + itemsPerPage);
  }, [filteredRequisicoes, currentPage]);

  const totalPages = Math.ceil(filteredRequisicoes.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-[#fff3cd] text-[#856404]';
      case 'aprovado': return 'bg-[#7ffc97] text-[#002109]';
      case 'rejeitado': return 'bg-[#ffdad6] text-[#93000a]';
      case 'entregue': return 'bg-[#006e2d] text-white';
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
        <span className="text-[#191c1d]">Requisição Departamentos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Requisição por Departamentos</h1>
        <p className="text-[#555f70] text-sm">Solicitação de produtos pelos departamentos da empresa.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
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
            <option value="entregue">Entregue</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
        </div>
        <button
          onClick={() => setMostrarCarrinho(true)}
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Departamento</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Solicitante</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Itens</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedRequisicoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555f70]">Nenhuma requisição encontrada</td>
                </tr>
              ) : (
                paginatedRequisicoes.map(req => (
                  <tr key={req.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">#{req.id}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.empresa}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.departamento}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{req.solicitante}</td>
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

      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Nova Requisição de Departamento</h2>
              <button onClick={() => setMostrarCarrinho(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Empresa</label>
                  <select 
                    value={empresaSelecionada} 
                    onChange={(e) => setEmpresaSelecionada(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  >
                    <option value="">Selecione</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.nome}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Departamento</label>
                  <select 
                    value={departamentoSelecionado} 
                    onChange={(e) => setDepartamentoSelecionado(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  >
                    <option value="">Selecione</option>
                    {departamentos.map(dep => (
                      <option key={dep.id} value={dep.nome}>{dep.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#191c1d] mb-1">Solicitante</label>
                  <input 
                    type="text" 
                    value={solicitante}
                    onChange={(e) => setSolicitante(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                    placeholder="Nome do solicitante"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#555f70] uppercase mb-3">Selecionar Produtos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {produtos.map(produto => (
                  <div key={produto.id} className="border border-[#bccbb9]/20 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <span className="material-symbols-outlined text-2xl text-[#555f70] mb-1 block">{produto.imagem}</span>
                    <h4 className="text-xs font-bold text-[#191c1d] truncate">{produto.nome}</h4>
                    <p className="text-[10px] text-[#555f70]">{produto.unidade}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <input
                        type="number"
                        min="1"
                        value={quantidades[produto.id] || 1}
                        onChange={(e) => setQuantidades(prev => ({ ...prev, [produto.id]: parseInt(e.target.value) || 1 }))}
                        className="w-12 px-1 py-0.5 text-xs border border-[#bccbb9]/20 rounded text-center"
                      />
                      <button
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="flex-1 bg-[#006e2d] text-white text-[10px] font-bold rounded py-0.5"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {carrinho.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-[#555f70] uppercase mb-3">Itens Selecionados</h3>
                  <div className="bg-[#f8f9fa] rounded-lg p-4">
                    {carrinho.map(item => (
                      <div key={item.produto.id} className="flex items-center justify-between py-2 border-b border-[#bccbb9]/10 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-[#555f70]">{item.produto.imagem}</span>
                          <span className="text-sm text-[#191c1d]">{item.produto.nome}</span>
                          <span className="text-xs text-[#555f70]">x{item.quantidade}</span>
                        </div>
                        <button onClick={() => removerDoCarrinho(item.produto.id)} className="text-[#ba1a1a] hover:opacity-70">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="px-6 py-4 border-t border-[#bccbb9]/10 bg-[#f8f9fa]">
                <button
                  onClick={() => { setMostrarCarrinho(false); setMostrarCheckout(true); }}
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

      {mostrarCheckout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Confirmar Requisição</h2>
              <button onClick={() => setMostrarCheckout(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Informações</h4>
                <p className="text-sm font-bold text-[#191c1d]">{empresaSelecionada}</p>
                <p className="text-xs text-[#555f70]">Departamento: {departamentoSelecionado}</p>
                <p className="text-xs text-[#555f70]">Solicitante: {solicitante}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Itens ({carrinho.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {carrinho.map(item => (
                    <div key={item.produto.id} className="flex justify-between text-sm">
                      <span className="text-[#191c1d]">{item.quantidade}x {item.produto.nome}</span>
                      <span className="text-[#555f70]">{item.produto.unidade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#bccbb9]/10 flex gap-3">
              <button
                onClick={() => setMostrarCheckout(false)}
                className="flex-1 px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={criarRequisicao}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined">check</span>
                Confirmar
              </button>
            </div>
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