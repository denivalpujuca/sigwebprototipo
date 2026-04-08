import React, { useState, useMemo } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  unidade: string;
  ativo: boolean;
}

const initialProdutos: Produto[] = [
  { id: 1, nome: 'Caneta esferográfica azul', descricao: 'Caneta esferográfica 0.7mm azul cx/50', categoria: 'Material de Escritório', subcategoria: 'Canetas', unidade: 'Caixa', ativo: true },
  { id: 2, nome: 'Papel A4', descricao: 'Papel sulfite A4 75g cx/500', categoria: 'Papelaria e Impressão', subcategoria: 'Papéis', unidade: 'Caixa', ativo: true },
  { id: 3, nome: 'Clipe aço médio', descricao: 'Clipe de aço n° 2 cx/500', categoria: 'Material de Escritório', subcategoria: 'Acessórios', unidade: 'Caixa', ativo: true },
  { id: 4, nome: 'Detergente líquido', descricao: 'Detergente líquido 500ml', categoria: 'Produtos de Limpeza', subcategoria: 'Detergentes', unidade: 'Unidade', ativo: true },
  { id: 5, nome: 'Desinfetante 5L', descricao: 'Desinfetante pino líquido 5L', categoria: 'Produtos de Limpeza', subcategoria: 'Desinfetantes', unidade: 'Galão', ativo: true },
  { id: 6, nome: 'Luva descartável', descricao: 'Luva descartável latex cx/100', categoria: 'EPIs e Segurança', subcategoria: 'Luvas', unidade: 'Caixa', ativo: true },
  { id: 7, nome: 'Capacete segurança', descricao: 'Capacete de segurança branco', categoria: 'EPIs e Segurança', subcategoria: 'Proteção Cabeça', unidade: 'Unidade', ativo: true },
  { id: 8, nome: 'Chave Philips', descricao: 'Chave Phillips profissional conjunto 6pc', categoria: 'Ferramentas', subcategoria: 'Chaves', unidade: 'Conjunto', ativo: true },
  { id: 9, nome: 'Fita Isolante', descricao: 'Fita isolante 19mmx20m preta', categoria: 'Ferramentas', subcategoria: 'Fitas', unidade: 'Rolo', ativo: false },
  { id: 10, nome: 'Álcool gel 70%', descricao: 'Álcool gel antisséptico 1L', categoria: 'Insumos Médicos', subcategoria: 'Antissépticos', unidade: 'Unidade', ativo: true },
  { id: 11, nome: 'Óleo lubrificante', descricao: 'Óleo lubricantemultiuso 500ml', categoria: 'Peças e Autopeças', subcategoria: 'Lubrificantes', unidade: 'Unidade', ativo: true },
  { id: 12, nome: 'Filtro de óleo', descricao: 'Filtro de óleo para caminhão', categoria: 'Peças e Autopeças', subcategoria: 'Filtros', unidade: 'Unidade', ativo: true },
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
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const ProdutosPage: React.FC<ProdutosProps> = () => {
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', categoria: '', subcategoria: '', unidade: '' });
  const itemsPerPage = 5;

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produtos, searchTerm]);

  const paginatedProdutos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProdutos.slice(start, start + itemsPerPage);
  }, [filteredProdutos, currentPage]);

  const totalPages = Math.ceil(filteredProdutos.length / itemsPerPage);

  const availableSubcategorias = formData.categoria ? subcategorias[formData.categoria] || [] : [];

  const handleSave = () => {
    if (editingProduto) {
      setProdutos(prev => prev.map(p => p.id === editingProduto.id ? { ...formData, id: editingProduto.id, ativo: editingProduto.ativo } : p));
    } else {
      const newId = Math.max(...produtos.map(p => p.id), 0) + 1;
      setProdutos(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingProduto(null);
    setFormData({ nome: '', descricao: '', categoria: '', subcategoria: '', unidade: '' });
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({ 
      nome: produto.nome, 
      descricao: produto.descricao, 
      categoria: produto.categoria, 
      subcategoria: produto.subcategoria,
      unidade: produto.unidade
    });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
  };

  const handleAdd = () => {
    setEditingProduto(null);
    setFormData({ nome: '', descricao: '', categoria: '', subcategoria: '', unidade: '' });
    setIsModalOpen(true);
  };

  const handleCategoriaChange = (categoria: string) => {
    setFormData(prev => ({ ...prev, categoria, subcategoria: '' }));
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        <span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
        <MaterialIcon name="arrow_right" size={14} />
        <span className="text-slate-900">Produtos</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Produtos</h1>
        <p className="text-slate-500 text-sm">Gerenciamento de produtos.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar produto"
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
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Unidade</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProdutos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedProdutos.map(produto => (
                  <tr key={produto.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{produto.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{produto.nome}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate">{produto.descricao}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{produto.categoria}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{produto.unidade}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${produto.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(produto)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
                          <MaterialIcon name="edit" size={20} />
                        </button>
                        <button onClick={() => handleToggle(produto.id)} className={`p-1.5 transition-colors ${produto.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}>
                          <MaterialIcon name={produto.ativo ? 'block' : 'check'} size={20} />
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
          <span className="text-xs text-slate-500 font-medium">Exibindo {paginatedProdutos.length} de {filteredProdutos.length} registros</span>
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
            <SheetTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
              <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
              <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
                <Select value={formData.categoria} onValueChange={handleCategoriaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subcategoria</label>
                <Select value={formData.subcategoria} onValueChange={(value) => setFormData({ ...formData, subcategoria: value })} disabled={!formData.categoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategorias.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Unidade</label>
              <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
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
