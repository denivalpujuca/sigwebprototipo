import { useState, useMemo, useEffect } from 'react';

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  valorUnitario: number;
  unidade: string;
  ativo: boolean;
}

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  status: 'ativa' | 'inativa';
}

interface ItemCarrinho {
  servico: Servico;
  quantidade: number;
  preco: number;
}

interface VendaServico {
  id: number;
  empresa: Empresa;
  itens: ItemCarrinho[];
  data: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'finalizada';
}

interface CatalogoServicosSimplesProps {
  onLogout?: () => void;
}

const empresas: Empresa[] = [
  { id: 1, nome: 'Gestão Urbana S/A', cnpj: '12.345.678/0001-90', status: 'ativa' },
  { id: 2, nome: 'Serviços Metropolitanos Ltda', cnpj: '23.456.789/0001-01', status: 'ativa' },
  { id: 3, nome: 'Ambiental Norte S/A', cnpj: '34.567.890/0001-12', status: 'ativa' },
  { id: 4, nome: 'Transporte Público Municipal', cnpj: '45.678.901/0001-23', status: 'ativa' },
  { id: 5, nome: 'Saneamento Básico S/A', cnpj: '56.789.012/0001-34', status: 'inativa' },
];

const servicos: Servico[] = [
  { id: 1, nome: 'Frete', descricao: 'Serviço de transporte de cargas', categoria: 'Transporte', valorUnitario: 1500, unidade: 'viagem', ativo: true },
  { id: 2, nome: 'Locação de Máquina', descricao: 'Locação de máquinas pesadas', categoria: 'Locação', valorUnitario: 500, unidade: 'dia', ativo: true },
  { id: 3, nome: 'Manutenção Veicular', descricao: 'Serviço de manutenção de veículos', categoria: 'Serviços', valorUnitario: 300, unidade: 'serviço', ativo: true },
  { id: 4, nome: 'Aluguel de Empilhadeira', descricao: 'Aluguel de empilhadeira para movimentação', categoria: 'Locação', valorUnitario: 200, unidade: 'dia', ativo: true },
  { id: 5, nome: 'Seguro', descricao: 'Cobertura securitária para cargas', categoria: 'Seguros', valorUnitario: 5000, unidade: 'ano', ativo: true },
  { id: 6, nome: 'Acompanhamento', descricao: 'Serviço de acompanhamento de carga', categoria: 'Serviços', valorUnitario: 100, unidade: 'hora', ativo: true },
  { id: 7, nome: 'Concerto de Máquinas', descricao: 'Serviço de concerto de máquinas pesadas', categoria: 'Manutenção', valorUnitario: 450, unidade: 'serviço', ativo: true },
  { id: 8, nome: 'Transporte Emergencial', descricao: 'Serviço de transporte com urgência', categoria: 'Transporte', valorUnitario: 2500, unidade: 'viagem', ativo: true },
  { id: 9, nome: 'Consultoria', descricao: 'Serviço de consultoria técnica', categoria: 'Serviços', valorUnitario: 800, unidade: 'hora', ativo: true },
  { id: 10, nome: 'Aluguel de Caminhão', descricao: 'Aluguel de caminhão para carga', categoria: 'Locação', valorUnitario: 600, unidade: 'dia', ativo: true },
];

const categorias = [...new Set(servicos.map(s => s.categoria))];

export const CatalogoServicosSimples: React.FC<CatalogoServicosSimplesProps> = ({ onLogout }) => {
  const [horaAtual, setHoraAtual] = useState(() => new Date().toLocaleTimeString('pt-BR'));

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [buscaServico, setBuscaServico] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'valor' | 'categoria'>('categoria');

  const servicosFiltrados = useMemo(() => {
    let filtered = servicos.filter(s => s.ativo);
    
    if (categoriaSelecionada.length > 0) {
      filtered = filtered.filter(s => categoriaSelecionada.includes(s.categoria));
    }

    if (buscaServico) {
      filtered = filtered.filter(s => 
        s.nome.toLowerCase().includes(buscaServico.toLowerCase()) ||
        s.descricao.toLowerCase().includes(buscaServico.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'valor':
          return a.valorUnitario - b.valorUnitario;
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        default:
          return 0;
      }
    });
  }, [categoriaSelecionada, buscaServico, ordenacao]);

  const categoriasComServico = useMemo(() => {
    return categorias.map(cat => ({
      nome: cat,
      servicosCount: servicos.filter(s => s.categoria === cat && s.ativo).length
    })).filter(cat => cat.servicosCount > 0);
  }, []);

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }, [carrinho]);

  const adicionarAoCarrinho = (servico: Servico) => {
    const qtd = quantidades[servico.id] || 1;
    const existingItem = carrinho.find(item => item.servico.id === servico.id);
    
    if (existingItem) {
      setCarrinho(prev => prev.map(item => 
        item.servico.id === servico.id 
          ? { ...item, quantidade: item.quantidade + qtd }
          : item
      ));
    } else {
      setCarrinho(prev => [...prev, { servico, quantidade: qtd, preco: servico.valorUnitario }]);
    }
    
    setQuantidades(prev => ({ ...prev, [servico.id]: 1 }));
  };

  const removerDoCarrinho = (servicoId: number) => {
    setCarrinho(prev => prev.filter(item => item.servico.id !== servicoId));
  };

  const atualizarQuantidade = (servicoId: number, novaQtd: number) => {
    if (novaQtd <= 0) {
      removerDoCarrinho(servicoId);
    } else {
      setCarrinho(prev => prev.map(item => 
        item.servico.id === servicoId 
          ? { ...item, quantidade: novaQtd }
          : item
      ));
    }
  };

  const criarVenda = () => {
    if (!empresaSelecionada || carrinho.length === 0) return;
    
    const novaVenda: VendaServico = {
      id: Date.now(),
      empresa: empresaSelecionada,
      itens: [...carrinho],
      data: new Date(),
      status: 'finalizada'
    };
    
    alert(`Venda de Serviços #${novaVenda.id} criada com sucesso!`);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#006e2d] to-[#44c365] rounded flex items-center justify-center text-white font-bold text-sm">SW</div>
          <div>
            <span className="font-bold text-[#1C1C1E]">SigWeb Prototipo</span>
            <span className="text-xs text-[#555f70] ml-2">Catálogo de Serviços</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-[#1C1C1E]">{horaAtual}</div>
            <div className="text-xs text-[#555f70]">{new Date().toLocaleDateString('pt-BR')}</div>
          </div>
          <button onClick={onLogout} className="p-2 text-[#8E8E93] hover:bg-gray-100 rounded-lg">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1C1C1E] mb-1">Catálogo de Serviços</h1>
          <p className="text-sm text-[#555f70]">Selecione uma empresa, categoria e adicione serviços ao carrinho.</p>
        </div>

        <div className="flex gap-6">
          <div className="w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#555f70] uppercase tracking-wider">Empresa</h3>
              </div>
              <div className="p-4">
                <select
                  value={empresaSelecionada?.id || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) {
                      setEmpresaSelecionada(null);
                    } else {
                      const empresa = empresas.find(emp => emp.id === parseInt(id));
                      setEmpresaSelecionada(empresa || null);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm"
                >
                  <option value="">Selecione uma empresa...</option>
                  {empresas.filter(e => e.status === 'ativa').map(empresa => (
                    <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                  ))}
                </select>
                {empresaSelecionada && (
                  <div className="mt-2 text-xs text-[#555f70]">{empresaSelecionada.cnpj}</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#555f70] uppercase tracking-wider">Categorias</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <label
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer ${
                    categoriaSelecionada.length === 0 ? 'bg-green-50 border-l-4 border-[#006e2d]' : ''
                  }`}
                >
                  <span className="text-sm text-[#1C1C1E]">Todas</span>
                  <input
                    type="checkbox"
                    checked={categoriaSelecionada.length === 0}
                    onChange={() => setCategoriaSelecionada([])}
                    className="w-4 h-4 text-[#006e2d]"
                  />
                </label>
                {categoriasComServico.map(cat => (
                  <label
                    key={cat.nome}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer ${
                      categoriaSelecionada.includes(cat.nome) ? 'bg-green-50 border-l-4 border-[#006e2d]' : ''
                    }`}
                  >
                    <span className="text-sm text-[#1C1C1E]">{cat.nome}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#555f70]">{cat.servicosCount}</span>
                      <input
                        type="checkbox"
                        checked={categoriaSelecionada.includes(cat.nome)}
                        onChange={() => {
                          if (categoriaSelecionada.includes(cat.nome)) {
                            setCategoriaSelecionada(prev => prev.filter(c => c !== cat.nome));
                          } else {
                            setCategoriaSelecionada(prev => [...prev, cat.nome]);
                          }
                        }}
                        className="w-4 h-4 text-[#006e2d]"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-[#555f70] uppercase tracking-wider shrink-0">
                  Serviços
                </h3>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="relative w-48">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]">search</span>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm"
                      placeholder="Buscar serviço..."
                      value={buscaServico}
                      onChange={e => setBuscaServico(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={ordenacao}
                      onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
                      className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
                    >
                      <option value="nome">Nome</option>
                      <option value="valor">Valor</option>
                      <option value="categoria">Categoria</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {servicosFiltrados.length === 0 ? (
                  <div className="py-8 text-center text-[#555f70]">
                    Nenhum serviço encontrado
                  </div>
                ) : (
                  servicosFiltrados.map(servico => (
                    <div key={servico.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#1C1C1E]">{servico.nome}</h4>
                        <p className="text-xs text-[#555f70]">{servico.descricao}</p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-gray-100 text-[#555f70] rounded">{servico.categoria}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold text-[#1C1C1E]">R$ {servico.valorUnitario.toFixed(2)}</span>
                        <span className="text-xs text-[#555f70] ml-1">/{servico.unidade}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min="1"
                          value={quantidades[servico.id] || 1}
                          onChange={(e) => setQuantidades(prev => ({ ...prev, [servico.id]: parseInt(e.target.value) || 1 }))}
                          className="w-14 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center bg-white"
                        />
                        <button
                          onClick={() => adicionarAoCarrinho(servico)}
                          className="w-8 h-8 bg-[#006e2d] text-white rounded-lg hover:bg-[#005a26] transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => setMostrarCarrinho(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white px-6 py-3 rounded-full shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity z-40"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        <span className="font-bold">{carrinho.length}</span>
        {carrinho.length > 0 && (
          <span className="text-xs opacity-80">R$ {totalCarrinho.toFixed(2)}</span>
        )}
      </button>

      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Carrinho de Serviços</h2>
              <button onClick={() => setMostrarCarrinho(false)} className="text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {carrinho.length === 0 ? (
                <div className="text-center py-8 text-[#555f70]">
                  <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrinho.map(item => (
                    <div key={item.servico.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#1C1C1E]">{item.servico.nome}</h4>
                        <p className="text-xs text-[#555f70]">R$ {item.preco.toFixed(2)}/{item.servico.unidade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => atualizarQuantidade(item.servico.id, item.quantidade - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantidade}</span>
                        <button
                          onClick={() => atualizarQuantidade(item.servico.id, item.quantidade + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#1C1C1E]">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                      </div>
                      <button onClick={() => removerDoCarrinho(item.servico.id)} className="text-[#ba1a1a] hover:opacity-70">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#555f70]">Total ({carrinho.reduce((acc, item) => acc + item.quantidade, 0)} serviços)</span>
                  <span className="text-xl font-bold text-[#1C1C1E]">R$ {totalCarrinho.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { 
                    if (!empresaSelecionada) {
                      alert('Selecione uma empresa primeiro');
                      return;
                    }
                    setMostrarCheckout(true); 
                  }}
                  className="w-full bg-gradient-to-br from-[#006e2d] to-[#44c365] px-4 py-2.5 text-white font-bold rounded-lg shadow-lg shadow-[#006e2d]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined">receipt_long</span>
                  Finalizar Venda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {mostrarCheckout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Confirmar Venda de Serviços</h2>
              <button onClick={() => setMostrarCheckout(false)} className="text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Empresa</h4>
                <p className="text-sm font-bold text-[#1C1C1E]">{empresaSelecionada?.nome}</p>
                <p className="text-xs text-[#555f70]">{empresaSelecionada?.cnpj}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Itens da Venda</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {carrinho.map(item => (
                    <div key={item.servico.id} className="flex justify-between text-sm">
                      <span className="text-[#1C1C1E]">{item.quantidade}x {item.servico.nome}</span>
                      <span className="font-bold text-[#1C1C1E]">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-bold text-[#1C1C1E]">Total da Venda</span>
                <span className="text-xl font-bold text-[#006e2d]">R$ {totalCarrinho.toFixed(2)}</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setMostrarCheckout(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1C1C1E] text-sm font-semibold rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={criarVenda}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-lg shadow-lg shadow-[#006e2d]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined">check</span>
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
