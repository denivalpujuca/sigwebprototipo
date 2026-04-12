import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';

interface MarcaOpt {
	id: number;
	nome: string;
}

interface Modelo {
	id: number;
	marcaId: number;
	marca: string;
	nome: string;
	ativo: boolean;
}

function mapModelo(r: Record<string, unknown>, marcasById: Map<number, string>): Modelo {
	const marcaId = r.marca_id != null ? Number(r.marca_id) : 0;
	return {
		id: Number(r.id),
		marcaId,
		marca: marcasById.get(marcaId) ?? '—',
		nome: String(r.nome ?? ''),
		ativo: ativoFromDb(r.ativo),
	};
}

interface ModelosPageProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const ModelosPage: React.FC<ModelosPageProps> = () => {
	const [modelos, setModelos] = useState<Modelo[]>([]);
	const [marcasOpts, setMarcasOpts] = useState<MarcaOpt[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const marcasRaw = await api.list<Record<string, unknown>>('marcas');
			const opts: MarcaOpt[] = marcasRaw.map((m) => ({ id: Number(m.id), nome: String(m.nome ?? '') }));
			setMarcasOpts(opts);
			const marcasById = new Map(opts.map((m) => [m.id, m.nome]));
			const modRaw = await api.list<Record<string, unknown>>('modelos');
			setModelos(modRaw.map((r) => mapModelo(r, marcasById)));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar modelos');
			setModelos([]);
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
	const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
	const [formData, setFormData] = useState({ marcaId: 0, nome: '' });
	const itemsPerPage = 5;

	const filteredModelos = useMemo(() => {
		return modelos.filter(
			(modelo) =>
				modelo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				modelo.marca.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [modelos, searchTerm]);

	const paginatedModelos = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredModelos.slice(start, start + itemsPerPage);
	}, [filteredModelos, currentPage]);

	const totalPages = Math.ceil(filteredModelos.length / itemsPerPage) || 1;

	const handleSave = async () => {
		if (!formData.nome.trim()) {
			alert('Preencha o nome do modelo');
			return;
		}
		if (!formData.marcaId) {
			alert('Selecione uma marca');
			return;
		}
		try {
			if (editingModelo) {
				const updated = await api.update<Record<string, unknown>>('modelos', editingModelo.id, {
					nome: formData.nome,
					marca_id: formData.marcaId,
					ativo: ativoToDb(editingModelo.ativo),
				});
				const marcasById = new Map(marcasOpts.map((m) => [m.id, m.nome]));
				setModelos((prev) => prev.map((m) => (m.id === editingModelo.id ? mapModelo(updated, marcasById) : m)));
			} else {
				const created = await api.create<Record<string, unknown>>('modelos', {
					nome: formData.nome,
					marca_id: formData.marcaId,
					ativo: 1,
				});
				const marcasById = new Map(marcasOpts.map((m) => [m.id, m.nome]));
				setModelos((prev) => [...prev, mapModelo(created, marcasById)]);
			}
			setIsModalOpen(false);
			setEditingModelo(null);
			setFormData({ marcaId: marcasOpts[0]?.id ?? 0, nome: '' });
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao salvar modelo');
		}
	};

	const handleEdit = (modelo: Modelo) => {
		setEditingModelo(modelo);
		setFormData({ marcaId: modelo.marcaId || marcasOpts[0]?.id || 0, nome: modelo.nome });
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const m = modelos.find((x) => x.id === id);
		if (!m) return;
		try {
			const updated = await api.update<Record<string, unknown>>('modelos', id, { ativo: ativoToDb(!m.ativo) });
			const marcasById = new Map(marcasOpts.map((x) => [x.id, x.nome]));
			setModelos((prev) => prev.map((x) => (x.id === id ? mapModelo(updated, marcasById) : x)));
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleAdd = () => {
		setEditingModelo(null);
		setFormData({ marcaId: marcasOpts[0]?.id ?? 0, nome: '' });
		setIsModalOpen(true);
	};

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Frota</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Modelos</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Modelos
				</h1>
				<p className="text-slate-500 text-sm">Gerenciamento de modelos (tabela modelos + marcas).</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar modelo"
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Marca</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Modelo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={5} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedModelos.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedModelos.map((modelo) => (
									<tr key={modelo.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{modelo.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{modelo.marca}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{modelo.nome}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${modelo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{modelo.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => handleEdit(modelo)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(modelo.id)}
													className={`p-1.5 transition-colors ${modelo.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={modelo.ativo ? 'block' : 'check'} size={20} />
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
						Exibindo {paginatedModelos.length} de {filteredModelos.length} registros
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
						<SheetTitle>{editingModelo ? 'Editar Modelo' : 'Novo Modelo'}</SheetTitle>
					</SheetHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSave();
						}}
						className="mt-6 space-y-4"
					>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Marca</label>
							<Select value={String(formData.marcaId)} onValueChange={(value) => setFormData({ ...formData, marcaId: Number(value) })}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione..." />
								</SelectTrigger>
								<SelectContent>
									{marcasOpts.map((m) => (
										<SelectItem key={m.id} value={String(m.id)}>
											{m.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Modelo</label>
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

	return <>{content}</>;
};
