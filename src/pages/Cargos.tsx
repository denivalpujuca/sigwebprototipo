import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Cargo {
	id: number;
	nome: string;
	ativo: boolean;
}

function mapCargo(r: Record<string, unknown>): Cargo {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		ativo: ativoFromDb(r.ativo),
	};
}

interface CargosProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const CargosPage: React.FC<CargosProps> = () => {
	const { toast, confirm } = useAppFeedback();
	const [cargos, setCargos] = useState<Cargo[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('cargos');
			setCargos(raw.map(mapCargo));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar cargos');
			setCargos([]);
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
	const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
	const [formData, setFormData] = useState({ nome: '' });
	const itemsPerPage = 5;

	const filteredCargos = useMemo(() => {
		return cargos.filter((c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));
	}, [cargos, searchTerm]);

	const paginatedCargos = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredCargos.slice(start, start + itemsPerPage);
	}, [filteredCargos, currentPage]);

	const totalPages = Math.ceil(filteredCargos.length / itemsPerPage) || 1;

	const handleSave = async () => {
		try {
			if (editingCargo) {
				const updated = await api.update<Record<string, unknown>>('cargos', editingCargo.id, {
					nome: formData.nome,
					ativo: ativoToDb(editingCargo.ativo),
				});
				setCargos((prev) => prev.map((c) => (c.id === editingCargo.id ? mapCargo(updated) : c)));
			} else {
				const created = await api.create<Record<string, unknown>>('cargos', { nome: formData.nome, ativo: 1 });
				setCargos((prev) => [...prev, mapCargo(created)]);
			}
			setIsModalOpen(false);
			setEditingCargo(null);
			setFormData({ nome: '' });
			toast.success(editingCargo ? 'Cargo atualizado com sucesso.' : 'Cargo cadastrado com sucesso.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar cargo');
		}
	};

	const handleEdit = (c: Cargo) => {
		setEditingCargo(c);
		setFormData({ nome: c.nome });
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const c = cargos.find((x) => x.id === id);
		if (!c) return;
		try {
			const updated = await api.update<Record<string, unknown>>('cargos', id, { ativo: ativoToDb(!c.ativo) });
			setCargos((prev) => prev.map((x) => (x.id === id ? mapCargo(updated) : x)));
			toast.success('Status do cargo atualizado.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleDelete = async (id: number) => {
		const ok = await confirm({
			title: 'Excluir cargo?',
			description: 'Deseja realmente excluir este registro? Esta ação não pode ser desfeita.',
		});
		if (!ok) return;
		try {
			await api.delete('cargos', id);
			setCargos((prev) => prev.filter((x) => x.id !== id));
			toast.destructive('Cargo excluído.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
		}
	};

	const handleAdd = () => {
		setEditingCargo(null);
		setFormData({ nome: '' });
		setIsModalOpen(true);
	};

	return (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Cargos</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Cargos
				</h1>
				<p className="text-slate-500 text-sm">Cargos cadastrados no D1.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar cargo"
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
							) : paginatedCargos.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedCargos.map((cargo) => (
									<tr key={cargo.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{cargo.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{cargo.nome}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${cargo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{cargo.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => handleEdit(cargo)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(cargo.id)}
													className={`p-1.5 transition-colors ${cargo.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={cargo.ativo ? 'block' : 'check'} size={20} />
												</button>
												<button
													type="button"
													onClick={() => void handleDelete(cargo.id)}
													className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
													title="Excluir"
												>
													<MaterialIcon name="delete" size={20} />
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
						Exibindo {paginatedCargos.length} de {filteredCargos.length} registros
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
						<SheetTitle>{editingCargo ? 'Editar Cargo' : 'Novo Cargo'}</SheetTitle>
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
