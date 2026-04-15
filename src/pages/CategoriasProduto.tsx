import React, { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface CategoriaProduto {
	id: number;
	nome: string;
	descricao: string;
	ativo: boolean;
}

function mapCategoria(r: Record<string, unknown>): CategoriaProduto {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		descricao: String(r.descricao ?? ''),
		ativo: ativoFromDb(r.ativo),
	};
}

export const CategoriasProdutoPage: React.FC = () => {
	const { toast } = useAppFeedback();
	const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const raw = await api.list<Record<string, unknown>>('categorias_produto');
			setCategorias(raw.map(mapCategoria));
		} catch (e) {
			setCategorias([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategoria, setEditingCategoria] = useState<CategoriaProduto | null>(null);
	const [formData, setFormData] = useState({ nome: '', descricao: '' });
	const itemsPerPage = 10;

	const filtered = categorias.filter(c => 
		c.nome.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

	const handleSave = async () => {
		try {
			if (editingCategoria) {
				await api.update<Record<string, unknown>>('categorias_produto', editingCategoria.id, {
					nome: formData.nome,
					descricao: formData.descricao,
					ativo: ativoToDb(editingCategoria.ativo),
				});
				setCategorias(prev => prev.map(c => c.id === editingCategoria.id ? { ...c, ...formData } : c));
			} else {
				const created = await api.create<Record<string, unknown>>('categorias_produto', { ...formData, ativo: 1 });
				setCategorias(prev => [...prev, mapCategoria(created)]);
			}
			setIsModalOpen(false);
			setEditingCategoria(null);
			setFormData({ nome: '', descricao: '' });
			toast.success(editingCategoria ? 'Categoria atualizada.' : 'Categoria criada.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleEdit = (c: CategoriaProduto) => {
		setEditingCategoria(c);
		setFormData({ nome: c.nome, descricao: c.descricao });
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const c = categorias.find(x => x.id === id);
		if (!c) return;
		try {
			await api.update<Record<string, unknown>>('categorias_produto', id, { ativo: ativoToDb(!c.ativo) });
			setCategorias(prev => prev.map(x => x.id === id ? { ...x, ativo: !c.ativo } : x));
			toast.success('Status atualizado.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleAdd = () => {
		setEditingCategoria(null);
		setFormData({ nome: '', descricao: '' });
		setIsModalOpen(true);
	};

	return (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Categorias de Produto</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Categorias de Produto</h1>
				<p className="text-slate-500 text-sm">Gerencie as categorias dos produtos.</p>
			</div>

			<div className="flex gap-4 mb-6 items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
					<input
						type="text"
						placeholder="Pesquisar categoria"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
				<button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2">
					<MaterialIcon name="add" size={20} />
					Adicionar
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<table className="w-full text-left">
					<thead>
						<tr className="bg-[#f5f5f5]">
							<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase w-16">ID</th>
							<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Nome</th>
							<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Descrição</th>
							<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase w-24">Status</th>
							<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase w-24">Ações</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{loading ? (
							<tr><td colSpan={5} className="px-4 py-8 text-center">Carregando...</td></tr>
						) : paginated.length === 0 ? (
							<tr><td colSpan={5} className="px-4 py-8 text-center">Nenhum registro</td></tr>
						) : (
							paginated.map(cat => (
								<tr key={cat.id} className="hover:bg-slate-50">
									<td className="px-4 py-3 text-sm text-slate-500">{cat.id}</td>
									<td className="px-4 py-3 text-sm font-bold text-slate-900">{cat.nome}</td>
									<td className="px-4 py-3 text-sm text-slate-500">{cat.descricao || '—'}</td>
									<td className="px-4 py-3">
										<span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${cat.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
											{cat.ativo ? 'Ativo' : 'Inativo'}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex gap-1">
											<button onClick={() => handleEdit(cat)} className="p-1.5 text-slate-500 hover:text-emerald-600">
												<MaterialIcon name="edit" size={18} />
											</button>
											<button onClick={() => void handleToggle(cat.id)} className={`p-1.5 ${cat.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600'}`}>
												<MaterialIcon name={cat.ativo ? 'block' : 'check'} size={18} />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
				<div className="px-4 py-3 flex items-center justify-between bg-[#f5f5f5]">
					<span className="text-xs text-slate-500">{paginated.length} de {filtered.length}</span>
					<div className="flex gap-1">
						<button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 rounded hover:bg-slate-200"><MaterialIcon name="chevron_left" size={18} /></button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
							<button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded ${currentPage === p ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200'}`}>{p}</button>
						))}
						<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-slate-200"><MaterialIcon name="chevron_right" size={18} /></button>
					</div>
				</div>
			</div>

			<Sheet open={isModalOpen} onOpenChange={open => !open && setIsModalOpen(false)}>
				<SheetContent className="sm:max-w-[400px]">
					<SheetHeader>
						<SheetTitle>{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</SheetTitle>
					</SheetHeader>
					<form onSubmit={e => { e.preventDefault(); void handleSave(); }} className="mt-6 space-y-4">
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
							<input
								type="text"
								value={formData.nome}
								onChange={e => setFormData({ ...formData, nome: e.target.value })}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
							<input
								type="text"
								value={formData.descricao}
								onChange={e => setFormData({ ...formData, descricao: e.target.value })}
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
							/>
						</div>
						<div className="flex gap-3 pt-2">
							<button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">Cancelar</button>
							<button type="submit" className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">Salvar</button>
						</div>
					</form>
				</SheetContent>
			</Sheet>
		</>
	);
};