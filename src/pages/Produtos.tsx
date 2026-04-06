import { useState, useMemo, useRef } from 'react';
import { MainLayout } from '../components/PageLayout';
import { Select } from '../components/Select';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  unidade: string;
  fotos: string[];
  status: 'ativo' | 'inativo';
}

const initialProdutos: Produto[] = [
  { id: 1, nome: 'Caneta esferográfica azul', descricao: 'Caneta esferográfica 0.7mm azul cx/50', categoria: 'Material de Escritório', subcategoria: 'Canetas', unidade: 'Caixa', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Caneta'] },
  { id: 2, nome: 'Papel A4', descricao: 'Papel sulfite A4 75g cx/500', categoria: 'Papelaria e Impressão', subcategoria: 'Papéis', unidade: 'Caixa', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Papel+A4'] },
  { id: 3, nome: 'Clipe aço médio', descricao: 'Clipe de aço n° 2 cx/500', categoria: 'Material de Escritório', subcategoria: 'Acessórios', unidade: 'Caixa', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Clipe'] },
  { id: 4, nome: 'Detergente líquido', descricao: 'Detergente líquido 500ml', categoria: 'Produtos de Limpeza', subcategoria: 'Detergentes', unidade: 'Unidade', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Detergente'] },
  { id: 5, nome: 'Desinfetante 5L', descricao: 'Desinfetante pino líquido 5L', categoria: 'Produtos de Limpeza', subcategoria: 'Desinfetantes', unidade: 'Galão', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Desinfetante'] },
  { id: 6, nome: 'Luva descartável', descricao: 'Luva descartável latex cx/100', categoria: 'EPIs e Segurança', subcategoria: 'Luvas', unidade: 'Caixa', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Luva'] },
  { id: 7, nome: 'Capacete segurança', descricao: 'Capacete de segurança branco', categoria: 'EPIs e Segurança', subcategoria: 'Proteção Cabeça', unidade: 'Unidade', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Capacete'] },
  { id: 8, nome: 'Chave Philips', descricao: 'Chave Phillips profissional conjunto 6pc', categoria: 'Ferramentas', subcategoria: 'Chaves', unidade: 'Conjunto', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Chave'] },
  { id: 9, nome: 'Fita Isolante', descricao: 'Fita isolante 19mmx20m preta', categoria: 'Ferramentas', subcategoria: 'Fitas', unidade: 'Rolo', status: 'inativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Fita'] },
  { id: 10, nome: 'Álcool gel 70%', descricao: 'Álcool gel antisséptico 1L', categoria: 'Insumos Médicos', subcategoria: 'Antissépticos', unidade: 'Unidade', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Alcool'] },
  { id: 11, nome: 'Óleo lubrificante', descricao: 'Óleo lubricantemultiuso 500ml', categoria: 'Peças e Autopeças', subcategoria: 'Lubrificantes', unidade: 'Unidade', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Oleo'] },
  { id: 12, nome: 'Filtro de óleo', descricao: 'Filtro de óleo para caminhão', categoria: 'Peças e Autopeças', subcategoria: 'Filtros', unidade: 'Unidade', status: 'ativo', fotos: ['https://placehold.co/100x100/006e2d/white?text=Filtro'] },
];

const categorias = ['Material de Escritório', 'Produtos de Limpeza', 'Ferramentas', 'EPIs e Segurança', 'Insumos Médicos', 'Peças e Autopeças', 'Combustíveis', 'Papelaria e Impressão'];
const subcategorias: Record<string, string[]> = {
  'Material de Escritório': ['Canetas', 'Cadernos', 'Acessórios', 'Papéis'],
  'Produtos de Limpeza': ['Detergentes', 'Desinfetantes', 'Saboarias', 'Limpeza Geral'],
  'Ferramentas': ['Chaves', 'Alicates', 'Fitas', 'Iluminação'],
  'EPIs e Segurança': ['Luvas', 'Proteção Cabeça', 'Proteção Corporal', 'Calçados'],
  'Insumos Médicos': ['Antissépticos', 'Curativos', 'Medicamentos', 'Descartáveis'],
  'Peças e Autopeças': ['Lubrificantes', 'Filtros', 'Pneus', 'Baterias'],
  'Combustíveis': ['Gasolina', 'Diesel', 'Etanol', 'Lubrificantes'],
  'Papelaria e Impressão': ['Papéis', 'Impressão', 'Encadernação', 'Folders'],
};
const unidades = ['Unidade', 'Caixa', 'Galão', 'Rolo', 'Litro', 'Kg', 'Conjunto', 'Pack'];

interface ProdutosProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const ProdutosPage: React.FC<ProdutosProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [novaFoto, setNovaFoto] = useState('');
  const [isAddingFoto, setIsAddingFoto] = useState(false);
  const [selectedFotoIndex, setSelectedFotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ 
    nome: '', 
    descricao: '', 
    categoria: '', 
    subcategoria: '',
    unidade: '', 
    status: 'ativo' as 'ativo' | 'inativo',
    fotos: [] as string[]
  });
  const itemsPerPage = 5;

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Produtos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #191c1d; margin-bottom: 10px; }
            p { color: #555f70; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f5; }
          </style>
        </head>
        <body>
          <h1>Relatório de Produtos</h1>
          <p>Total de registros: ${filteredProdutos.length}</p>
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>Descrição</th><th>Categoria</th><th>Subcategoria</th><th>Unidade</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProdutos.map(p => `
                <tr>
                  <td>${p.nome}</td><td>${p.descricao}</td><td>${p.categoria}</td><td>${p.subcategoria}</td><td>${p.unidade}</td><td>${p.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    printFrame.contentWindow?.document.write(content);
    printFrame.contentWindow?.document.close();
  };

  const availableSubcategorias = formData.categoria ? subcategorias[formData.categoria] || [] : [];

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || produto.status === filterStatus;
      const matchesCategoria = filterCategoria === 'all' || produto.categoria === filterCategoria;
      return matchesSearch && matchesStatus && matchesCategoria;
    });
  }, [produtos, searchTerm, filterStatus, filterCategoria]);

  const paginatedProdutos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProdutos.slice(start, start + itemsPerPage);
  }, [filteredProdutos, currentPage]);

  const totalPages = Math.ceil(filteredProdutos.length / itemsPerPage);

  const handleSave = () => {
    if (editingProduto) {
      setProdutos(prev => prev.map(p => p.id === editingProduto.id ? { ...formData, id: editingProduto.id } : p));
    } else {
      const newId = Math.max(...produtos.map(p => p.id), 0) + 1;
      setProdutos(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingProduto(null);
    setFormData({ nome: '', descricao: '', categoria: '', subcategoria: '', unidade: '', status: 'ativo', fotos: [] });
    setNovaFoto('');
    setSelectedFotoIndex(0);
    setIsAddingFoto(false);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({ 
      nome: produto.nome, 
      descricao: produto.descricao, 
      categoria: produto.categoria, 
      subcategoria: produto.subcategoria,
      unidade: produto.unidade, 
      status: produto.status,
      fotos: [...produto.fotos]
    });
    setSelectedFotoIndex(0);
    setIsAddingFoto(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const handleAdd = () => {
    setEditingProduto(null);
    setFormData({ nome: '', descricao: '', categoria: '', subcategoria: '', unidade: '', status: 'ativo', fotos: [] });
    setNovaFoto('');
    setSelectedFotoIndex(0);
    setIsAddingFoto(false);
    setIsModalOpen(true);
  };

  const handleAddFoto = () => {
    if (novaFoto.trim()) {
      setFormData(prev => {
        const newFotos = [...prev.fotos, novaFoto.trim()];
        setSelectedFotoIndex(newFotos.length - 1);
        return { ...prev, fotos: newFotos };
      });
      setNovaFoto('');
      setIsAddingFoto(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const newFotos = [...prev.fotos, reader.result as string];
          setSelectedFotoIndex(newFotos.length - 1);
          return { ...prev, fotos: newFotos };
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleRemoveFoto = (index: number) => {
    const newFotos = formData.fotos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, fotos: newFotos }));
    if (selectedFotoIndex >= newFotos.length && newFotos.length > 0) {
      setSelectedFotoIndex(newFotos.length - 1);
    } else if (newFotos.length === 0) {
      setSelectedFotoIndex(0);
    }
  };

  const handleMoveFoto = (index: number, direction: 'left' | 'right') => {
    const newFotos = [...formData.fotos];
    if (direction === 'left' && index > 0) {
      [newFotos[index - 1], newFotos[index]] = [newFotos[index], newFotos[index - 1]];
      setSelectedFotoIndex(index - 1);
    } else if (direction === 'right' && index < newFotos.length - 1) {
      [newFotos[index], newFotos[index + 1]] = [newFotos[index + 1], newFotos[index]];
      setSelectedFotoIndex(index + 1);
    }
    setFormData(prev => ({ ...prev, fotos: newFotos }));
  };

  const handleCategoriaChange = (categoria: string) => {
    setFormData(prev => ({ ...prev, categoria, subcategoria: '' }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'inativo':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Suprimentos</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Produtos</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Produtos</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de produtos.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 flex-1 max-w-2xl">
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ATIVOS</span>
                <span className="material-symbols-outlined">inventory</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {produtos.filter(p => p.status === 'ativo').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Ativos</div>
              </div>
            </div>
            <div className="bg-[#555f70] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#555f70]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">INATIVOS</span>
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {produtos.filter(p => p.status === 'inativo').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Inativos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar produto"
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
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-white border border-gray-300 text-[#555f70] rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Gerar PDF
        </button>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest w-20">Foto</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Categoria</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Subcategoria</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Unidade</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedProdutos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedProdutos.map(produto => (
                  <tr key={produto.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4">
                      {produto.fotos.length > 0 ? (
                        <img src={produto.fotos[0]} alt="Foto" className="w-10 h-10 rounded object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#f3f4f5] flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-sm">image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{produto.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70] max-w-xs truncate">{produto.descricao}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{produto.categoria}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{produto.subcategoria}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{produto.unidade}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(produto.status)}`}>
                        {produto.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(produto)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(produto.id)} className="p-1.5 text-[#555f70] hover:text-[#ba1a1a] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedProdutos.length} de {filteredProdutos.length} registros</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingProduto ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#bccbb9]/20">
                    {formData.fotos.length > 0 ? (
                      <>
                        <div className="w-full h-80 rounded-lg overflow-hidden bg-white mb-4 flex items-center justify-center border border-gray-200">
                          <img src={formData.fotos[selectedFotoIndex]} alt="Foto principal" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 items-center">
                          {formData.fotos.map((foto, index) => (
                            <div key={index} className="relative flex flex-col items-center">
                              <button
                                type="button"
                                onClick={() => setSelectedFotoIndex(index)}
                                className={`relative group flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedFotoIndex === index ? 'border-[#006e2d]' : 'border-transparent hover:border-gray-300'}`}
                              >
                                <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFoto(index); }}
                                  className="absolute -top-2 -right-2 bg-[#ba1a1a] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </button>
                              {formData.fotos.length > 1 && (
                                <div className="flex gap-0.5 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveFoto(index, 'left')}
                                    disabled={index === 0}
                                    className="p-0.5 text-gray-400 hover:text-[#006e2d] disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveFoto(index, 'right')}
                                    disabled={index === formData.fotos.length - 1}
                                    className="p-0.5 text-gray-400 hover:text-[#006e2d] disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#006e2d] flex items-center justify-center text-gray-400 hover:text-[#006e2d] transition-colors bg-white"
                          >
                            <span className="material-symbols-outlined text-3xl">add</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-80 rounded-lg bg-white mb-4 flex items-center justify-center border border-gray-200">
                          <div className="text-center text-[#555f70]">
                            <span className="material-symbols-outlined text-6xl mb-2">image</span>
                            <p className="text-sm">Nenhuma foto adicionada</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#555f70] hover:border-[#006e2d] hover:text-[#006e2d] transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">add_photo_alternate</span>
                          Adicionar fotos
                        </button>
                      </>
                    )}
                  </div>
                  {isAddingFoto && (
                    <div className="flex gap-2 p-4 bg-white rounded-lg border border-[#bccbb9]/20">
                      <input 
                        type="text" 
                        value={novaFoto} 
                        onChange={(e) => setNovaFoto(e.target.value)} 
                        placeholder="URL da imagem"
                        className="flex-1 px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
                        autoFocus
                      />
                      <button type="button" onClick={() => { handleAddFoto(); setSelectedFotoIndex(formData.fotos.length); }} className="px-4 py-2.5 bg-[#006e2d] text-white font-semibold rounded-md hover:bg-[#005524] flex items-center gap-1">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                      <button type="button" onClick={() => setIsAddingFoto(false)} className="px-4 py-2.5 bg-[#f3f4f5] text-[#555f70] font-semibold rounded-md hover:bg-[#e7e8e9]">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome</label>
                    <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191c1d] mb-1">Descrição</label>
                    <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" rows={3} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Categoria"
                      value={formData.categoria}
                      onChange={(e) => handleCategoriaChange(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Select
                      label="Subcategoria"
                      value={formData.subcategoria}
                      onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                      disabled={!formData.categoria}
                    >
                      <option value="">Selecione</option>
                      {availableSubcategorias.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Unidade"
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    >
                      <option value="">Selecione</option>
                      {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">save</span>
                  Salvar
                </button>
              </div>
            </form>
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