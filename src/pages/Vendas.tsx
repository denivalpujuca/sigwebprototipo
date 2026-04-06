import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface VendasProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  unidade: string;
  preco: number;
  imagem: string;
  categoriaId: number;
  empresaId: number;
  estoques: { empresaId: number; quantidade: number }[];
}

interface Categoria {
  id: number;
  nome: string;
  icone: string;
  produtosCount: number;
}

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  status: 'ativa' | 'inativa';
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  preco: number;
}

interface Venda {
  id: number;
  empresa: Empresa;
  itens: ItemCarrinho[];
  data: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'finalizada';
}

const empresas: Empresa[] = [
  { id: 1, nome: 'Gestão Urbana S/A', cnpj: '12.345.678/0001-90', status: 'ativa' },
  { id: 2, nome: 'Serviços Metropolitanos Ltda', cnpj: '23.456.789/0001-01', status: 'ativa' },
  { id: 3, nome: 'Ambiental Norte S/A', cnpj: '34.567.890/0001-12', status: 'ativa' },
  { id: 4, nome: 'Transporte Público Municipal', cnpj: '45.678.901/0001-23', status: 'ativa' },
  { id: 5, nome: 'Saneamento Básico S/A', cnpj: '56.789.012/0001-34', status: 'inativa' },
];

const categorias: Categoria[] = [
  { id: 1, nome: 'Material de Escritório', icone: 'edit', produtosCount: 12 },
  { id: 2, nome: 'Produtos de Limpeza', icone: 'cleaning_services', produtosCount: 8 },
  { id: 3, nome: 'Ferramentas', icone: 'build', produtosCount: 15 },
  { id: 4, nome: 'EPIs e Segurança', icone: 'health_and_safety', produtosCount: 10 },
  { id: 5, nome: 'Insumos Médicos', icone: 'medical_services', produtosCount: 6 },
  { id: 6, nome: 'Peças e Autopeças', icone: 'car_repair', produtosCount: 20 },
];

const produtos: Produto[] = [
  { id: 1, nome: 'Caneta esferográfica azul', descricao: 'Caneta esferográfica 0.7mm azul cx/50', unidade: 'Caixa', preco: 25.90, imagem: 'edit', categoriaId: 1, empresaId: 1, estoques: [{ empresaId: 1, quantidade: 150 }, { empresaId: 2, quantidade: 80 }] },
  { id: 2, nome: 'Papel A4', descricao: 'Papel sulfite A4 75g cx/500', unidade: 'Caixa', preco: 42.50, imagem: 'description', categoriaId: 1, empresaId: 1, estoques: [{ empresaId: 1, quantidade: 200 }, { empresaId: 2, quantidade: 120 }] },
  { id: 3, nome: 'Clipe aço médio', descricao: 'Clipe de aço n° 2 cx/500', unidade: 'Caixa', preco: 8.90, imagem: 'link', categoriaId: 1, empresaId: 1, estoques: [{ empresaId: 1, quantidade: 500 }, { empresaId: 2, quantidade: 300 }] },
  { id: 4, nome: 'Detergente líquido', descricao: 'Detergente líquido 500ml', unidade: 'Unidade', preco: 3.50, imagem: 'water_drop', categoriaId: 2, empresaId: 1, estoques: [{ empresaId: 1, quantidade: 300 }] },
  { id: 5, nome: 'Desinfetante 5L', descricao: 'Desinfetante pino líquido 5L', unidade: 'Galão', preco: 28.90, imagem: 'cleaning_services', categoriaId: 2, empresaId: 2, estoques: [{ empresaId: 1, quantidade: 50 }, { empresaId: 2, quantidade: 80 }] },
  { id: 6, nome: 'Luva descartável', descricao: 'Luva descartável latex cx/100', unidade: 'Caixa', preco: 45.00, imagem: 'handyman', categoriaId: 4, empresaId: 2, estoques: [{ empresaId: 1, quantidade: 100 }, { empresaId: 2, quantidade: 60 }] },
  { id: 7, nome: 'Capacete segurança', descricao: 'Capacete de segurança branco', unidade: 'Unidade', preco: 35.90, imagem: 'sports_motorsports', categoriaId: 4, empresaId: 3, estoques: [{ empresaId: 3, quantidade: 25 }] },
  { id: 8, nome: 'Chave Philips', descricao: 'Chave Phillips profissional conjunto 6pc', unidade: 'Conjunto', preco: 42.00, imagem: 'build', categoriaId: 3, empresaId: 3, estoques: [{ empresaId: 3, quantidade: 40 }] },
  { id: 9, nome: 'Fita Isolante', descricao: 'Fita isolante 19mmx20m preta', unidade: 'Rolo', preco: 12.90, imagem: 'electric_bolt', categoriaId: 3, empresaId: 3, estoques: [{ empresaId: 3, quantidade: 150 }] },
  { id: 10, nome: 'Álcool gel 70%', descricao: 'Álcool gel antisséptico 1L', unidade: 'Unidade', preco: 18.90, imagem: 'spa', categoriaId: 5, empresaId: 4, estoques: [{ empresaId: 4, quantidade: 80 }] },
  { id: 11, nome: 'Óleo lubrificante', descricao: 'Óleo lubrificante multiuso 500ml', unidade: 'Unidade', preco: 22.50, imagem: 'oil_barrel', categoriaId: 6, empresaId: 4, estoques: [{ empresaId: 4, quantidade: 60 }] },
  { id: 12, nome: 'Filtro de óleo', descricao: 'Filtro de óleo para caminhão', unidade: 'Unidade', preco: 85.00, imagem: 'car_repair', categoriaId: 6, empresaId: 4, estoques: [{ empresaId: 4, quantidade: 15 }] },
];

export const VendasPage: React.FC<VendasProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('vendas');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [_vendas, setVendas] = useState<Venda[]>([]);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [buscaProduto, setBuscaProduto] = useState('');

  const getEstoqueTotal = (produto: Produto) => {
    return produto.estoques.reduce((acc, e) => acc + e.quantidade, 0);
  };

  const getEstoqueEmpresa = (produto: Produto, empresaId: number) => {
    const estoque = produto.estoques.find(e => e.empresaId === empresaId);
    return estoque?.quantidade || 0;
  };

  const produtosFiltrados = useMemo(() => {
    let filtered = produtos;
    
    if (empresaSelecionada) {
      filtered = filtered.filter(p => getEstoqueEmpresa(p, empresaSelecionada.id) > 0);
    }
    
    if (categoriaSelecionada.length > 0) {
      filtered = filtered.filter(p => p.categoriaId && categoriaSelecionada.some(c => c.id === p.categoriaId));
    }

    if (buscaProduto) {
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
        p.descricao.toLowerCase().includes(buscaProduto.toLowerCase())
      );
    }
    
    return filtered;
  }, [empresaSelecionada, categoriaSelecionada, buscaProduto]);

  const categoriasComEstoque = useMemo(() => {
    return categorias.map(cat => ({
      ...cat,
      produtosCount: produtos.filter(p => {
        const temEstoque = empresaSelecionada ? getEstoqueEmpresa(p, empresaSelecionada.id) > 0 : getEstoqueTotal(p) > 0;
        return p.categoriaId === cat.id && temEstoque;
      }).length
    })).filter(cat => cat.produtosCount > 0);
  }, [categorias, empresaSelecionada]);

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }, [carrinho]);

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
      setCarrinho(prev => [...prev, { produto, quantidade: qtd, preco: produto.preco }]);
    }
    
    setQuantidades(prev => ({ ...prev, [produto.id]: 1 }));
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const atualizarQuantidade = (produtoId: number, novaQtd: number) => {
    if (novaQtd <= 0) {
      removerDoCarrinho(produtoId);
    } else {
      setCarrinho(prev => prev.map(item => 
        item.produto.id === produtoId 
          ? { ...item, quantidade: novaQtd }
          : item
      ));
    }
  };

  const criarVenda = () => {
    if (!empresaSelecionada || carrinho.length === 0) return;
    
    const novaVenda: Venda = {
      id: Date.now(),
      empresa: empresaSelecionada,
      itens: [...carrinho],
      data: new Date(),
      status: 'finalizada'
    };
    
    setVendas(prev => [...prev, novaVenda]);
    setCarrinho([]);
    setMostrarCheckout(false);
    setMostrarCarrinho(false);
    alert(`Venda #${novaVenda.id} criada com sucesso!`);
  };

  const isSuprimentos = activeSection === 'catalogo-produtos';

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">{isSuprimentos ? 'Suprimentos' : 'Vendas'}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Catálogo de Produtos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Catálogo de Produtos</h1>
        <p className="text-[#555f70] text-sm">{isSuprimentos ? 'Selecione produtos para requisição de compra.' : 'Selecione uma empresa, categoria e adicione produtos ao carrinho.'}</p>
      </div>

      <div className="flex gap-6">
        <div className="w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
            <div className="px-4 py-3 bg-[#f3f4f5] border-b border-[#bccbb9]/10">
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
                className="w-full px-4 py-2.5 bg-white border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
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

          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
            <div className="px-4 py-3 bg-[#f3f4f5] border-b border-[#bccbb9]/10">
              <h3 className="text-sm font-bold text-[#555f70] uppercase tracking-wider">Categorias</h3>
            </div>
            <div className="divide-y divide-[#bccbb9]/10 max-h-64 overflow-y-auto">
              <label
                className={`w-full px-4 py-3 text-left hover:bg-[#f3f4f5]/50 transition-colors flex items-center justify-between cursor-pointer ${
                  categoriaSelecionada.length === 0 ? 'bg-[#006e2d]/5 border-l-2 border-[#006e2d]' : ''
                }`}
              >
                <span className="text-sm text-[#191c1d]">Todas</span>
                <input
                  type="checkbox"
                  checked={categoriaSelecionada.length === 0}
                  onChange={() => setCategoriaSelecionada([])}
                  className="w-4 h-4 text-[#006e2d]"
                />
              </label>
              {categoriasComEstoque.map(categoria => (
                <label
                  key={categoria.id}
                  className={`w-full px-4 py-3 text-left hover:bg-[#f3f4f5]/50 transition-colors flex items-center justify-between cursor-pointer ${
                    categoriaSelecionada.some(c => c.id === categoria.id) ? 'bg-[#006e2d]/5 border-l-2 border-[#006e2d]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#555f70]">{categoria.icone}</span>
                    <span className="text-sm text-[#191c1d]">{categoria.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#555f70]">{categoria.produtosCount}</span>
                    <input
                      type="checkbox"
                      checked={categoriaSelecionada.some(c => c.id === categoria.id)}
                      onChange={() => {
                        if (categoriaSelecionada.some(c => c.id === categoria.id)) {
                          setCategoriaSelecionada(prev => prev.filter(c => c.id !== categoria.id));
                        } else {
                          setCategoriaSelecionada(prev => [...prev, categoria]);
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
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
            <div className="px-4 py-3 bg-[#f3f4f5] border-b border-[#bccbb9]/10 flex items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-[#555f70] uppercase tracking-wider shrink-0">
                Produtos {empresaSelecionada ? `- ${empresaSelecionada.nome}` : ''}
              </h3>
              <div className="flex-1 max-w-xs relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                  placeholder="Buscar produto..."
                  value={buscaProduto}
                  onChange={e => setBuscaProduto(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y divide-[#e7e8e9]">
              {produtosFiltrados.length === 0 ? (
                <div className="py-8 text-center text-[#555f70]">
                  Selecione uma empresa para ver os produtos disponíveis
                </div>
              ) : (
                produtosFiltrados.map(produto => {
                  const estoque = empresaSelecionada ? getEstoqueEmpresa(produto, empresaSelecionada.id) : getEstoqueTotal(produto);
                  return (
                    <div key={produto.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fa] transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#191c1d]">{produto.nome}</h4>
                        <p className="text-xs text-[#555f70]">{produto.descricao}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold text-[#191c1d]">R$ {produto.preco.toFixed(2)}</span>
                        <span className="text-xs text-[#555f70] ml-1">/{produto.unidade}</span>
                        <div className={`text-xs ${estoque > 10 ? 'text-[#006e2d]' : estoque > 0 ? 'text-[#856404]' : 'text-[#ba1a1a]'}`}>
                          Estoque: {estoque}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min="1"
                          max={estoque}
                          value={quantidades[produto.id] || 1}
                          onChange={(e) => setQuantidades(prev => ({ ...prev, [produto.id]: parseInt(e.target.value) || 1 }))}
                          className="w-14 px-2 py-1.5 text-sm border border-[#bccbb9]/30 rounded text-center bg-white"
                        />
                        <button
                          onClick={() => adicionarAoCarrinho(produto)}
                          disabled={estoque === 0}
                          className="w-8 h-8 bg-[#006e2d] text-white rounded-md hover:bg-[#005a26] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

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
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Carrinho de Compras</h2>
              <button onClick={() => setMostrarCarrinho(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
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
                    <div key={item.produto.id} className="flex items-center gap-4 p-3 bg-[#f8f9fa] rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#191c1d]">{item.produto.nome}</h4>
                        <p className="text-xs text-[#555f70]">R$ {item.preco.toFixed(2)}/{item.produto.unidade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
                          className="w-6 h-6 rounded-full bg-[#e7e8e9] hover:bg-[#d0d1d2] flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantidade}</span>
                        <button
                          onClick={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                          className="w-6 h-6 rounded-full bg-[#e7e8e9] hover:bg-[#d0d1d2] flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#191c1d]">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                      </div>
                      <button onClick={() => removerDoCarrinho(item.produto.id)} className="text-[#ba1a1a] hover:opacity-70">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrinho.length > 0 && (
              <div className="px-6 py-4 border-t border-[#bccbb9]/10 bg-[#f8f9fa]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#555f70]">Total ({carrinho.reduce((acc, item) => acc + item.quantidade, 0)} itens)</span>
                  <span className="text-xl font-bold text-[#191c1d]">R$ {totalCarrinho.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { 
                    if (!empresaSelecionada) {
                      alert('Selecione uma empresa primeiro');
                      return;
                    }
                    setMostrarCheckout(true); 
                  }}
                  className="w-full bg-gradient-to-br from-[#006e2d] to-[#44c365] px-4 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
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
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">Confirmar Venda</h2>
              <button onClick={() => setMostrarCheckout(false)} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Empresa</h4>
                <p className="text-sm font-bold text-[#191c1d]">{empresaSelecionada?.nome}</p>
                <p className="text-xs text-[#555f70]">{empresaSelecionada?.cnpj}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-[#555f70] uppercase mb-2">Itens da Venda</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {carrinho.map(item => (
                    <div key={item.produto.id} className="flex justify-between text-sm">
                      <span className="text-[#191c1d]">{item.quantidade}x {item.produto.nome}</span>
                      <span className="font-bold text-[#191c1d]">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-[#bccbb9]/20 pt-4 flex justify-between">
                <span className="font-bold text-[#191c1d]">Total da Venda</span>
                <span className="text-xl font-bold text-[#006e2d]">R$ {totalCarrinho.toFixed(2)}</span>
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
                onClick={criarVenda}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined">check</span>
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={() => setShowLogoutModal(true)} showLogoutModal={showLogoutModal} onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} onCancelLogout={() => setShowLogoutModal(false)}>
      {content}
    </MainLayout>
  );
};
