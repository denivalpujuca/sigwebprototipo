import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';

interface Marca {
	id: number;
	nome: string;
	ativo: boolean;
}

function mapMarca(r: Record<string, unknown>): Marca {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		ativo: ativoFromDb(r.ativo),
	};
}

interface MarcasPageProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const MarcasPage: React.FC<MarcasPageProps> = () => {
	const [marcas, setMarcas] = useState<Marca[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('marcas');
			setMarcas(raw.map(mapMarca));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar marcas');
			setMarcas([]);
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
	const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
	const [formData, setFormData] = useState({ nome: '' });
	const itemsPerPage = 5;

	const filteredMarcas = useMemo(() => {
		return marcas.filter((marca) => marca.nome.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [marcas, searchTerm]);

	const paginatedMarcas = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredMarcas.slice(start, start + itemsPerPage);
	}, [filteredMarcas, currentPage]);

	const totalPages = Math.ceil(filteredMarcas.length / itemsPerPage) || 1;

	const handleSave = async () => {
		try {
			if (editingMarca) {
				const updated = await api.update<Record<string, unknown>>('marcas', editingMarca.id, {
					nome: formData.nome,
					ativo: ativoToDb(editingMarca.ativo),
				});
				setMarcas((prev) => prev.map((m) => (m.id === editingMarca.id ? mapMarca(updated) : m)));
			} else {
				const created = await api.create<Record<string, unknown>>('marcas', { nome: formData.nome, ativo: 1 });
				setMarcas((prev) => [...prev, mapMarca(created)]);
			}
			setIsModalOpen(false);
			setEditingMarca(null);
			setFormData({ nome: '' });
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao salvar marca');
		}
	};

	const handleEdit = (marca: Marca) => {
		setEditingMarca(marca);
		setFormData({ nome: marca.nome });
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const m = marcas.find((x) => x.id === id);
		if (!m) return;
		try {
			const updated = await api.update<Record<string, unknown>>('marcas', id, { ativo: ativoToDb(!m.ativo) });
			setMarcas((prev) => prev.map((x) => (x.id === id ? mapMarca(updated) : x)));
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleAdd = () => {
		setEditingMarca(null);
		setFormData({ nome: '' });
		setIsModalOpen(true);
	};

	return (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Frota</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Marcas</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Marcas
				</h1>
				<p className="text-slate-500 text-sm">Cadastro e gerenciamento de marcas (D1).</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar marca"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
						/>
					</div>
				</div>
				<button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors">
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={4} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedMarcas.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedMarcas.map((marca) => (
									<tr key={marca.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{marca.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{marca.nome}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${marca.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{marca.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => handleEdit(marca)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(marca.id)}
													className={`p-1.5 transition-colors ${marca.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={marca.ativo ? 'block' : 'check'} size={20} />
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
					<span className="text-xs text-slate-500 font-medium">
						Exibindo {paginatedMarcas.length} de {filteredMarcas.length} registros
					</span>
					<div className="flex items-center gap-2">
						<button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-1 rounded hover:bg-slate-200 text-slate-500">
							<MaterialIcon name="arrow_left" size={20} />
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200'}`}
							>
								{page}
							</button>
						))}
						<button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-slate-200 text-slate-500">
							<MaterialIcon name="arrow_right" size={20} />
						</button>
					</div>
				</div>
			</div>

			<Sheet open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
				<SheetContent className="sm:max-w-[540px]">
					<SheetHeader>
						<SheetTitle>{editingMarca ? 'Editar Marca' : 'Nova Marca'}</SheetTitle>
					</SheetHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSave();
						}}
						className="mt-6 space-y-4"
					>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
							<input
								type="text"
								value={formData.nome}
								onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div className="flex gap-3 pt-4">
							<button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">
								Cancelar
							</button>
							<button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">
								Salvar
							</button>
						</div>
					</form>
				</SheetContent>
			</Sheet>
		</>
	);
};
