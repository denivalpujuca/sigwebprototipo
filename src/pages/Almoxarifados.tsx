import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';
import { useEmpresa } from '@/context/EmpresaContext';

interface Almoxarifado {
	id: number;
	nome: string;
	localizacao: string;
	empresaId: number | null;
	empresaNome: string;
	responsavelId: number | null;
	responsavelNome: string;
	ativo: boolean;
}

function mapAlmox(r: Record<string, unknown>): Almoxarifado {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		localizacao: String(r.localizacao ?? ''),
		empresaId: r.empresa_id ? Number(r.empresa_id) : null,
		empresaNome: String(r.empresa_nome ?? ''),
		responsavelId: r.responsavel_id ? Number(r.responsavel_id) : null,
		responsavelNome: String(r.responsavel_nome ?? ''),
		ativo: ativoFromDb(r.ativo),
	};
}

interface AlmoxarifadosProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const AlmoxarifadosPage: React.FC<AlmoxarifadosProps> = () => {
	const navigate = useNavigate();
	const { toast, confirm } = useAppFeedback();
	useEmpresa();
	const [lista, setLista] = useState<Almoxarifado[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [empresas, setEmpresas] = useState<{ id: number; nome: string }[]>([]);
	const [responsaveis, setResponsaveis] = useState<{ id: number; nome: string }[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const [almoxRaw, empresasRaw, funcionariosRaw] = await Promise.all([
				api.list<Record<string, unknown>>('almoxarifados'),
				api.list<Record<string, unknown>>('empresas'),
				api.list<Record<string, unknown>>('funcionarios'),
			]);
			
			const allAlmox = almoxRaw.map(mapAlmox);
			
			setLista(allAlmox);
			setEmpresas(empresasRaw.map(e => ({ id: Number(e.id), nome: String(e.nome) })));
			setResponsaveis(funcionariosRaw.map(f => ({ id: Number(f.id), nome: String(f.nome) })));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar');
			setLista([]);
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
	const [editing, setEditing] = useState<Almoxarifado | null>(null);
	const [formData, setFormData] = useState({ nome: '', localizacao: '', empresaId: '', responsavelId: '' });
	const itemsPerPage = 5;

	const filtered = useMemo(() => {
		return lista.filter(
			(a) =>
				a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				a.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
				a.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				a.responsavelNome.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [lista, searchTerm]);

	const paginated = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filtered.slice(start, start + itemsPerPage);
	}, [filtered, currentPage]);

	const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

	const handleSave = async () => {
		try {
			const data: Record<string, unknown> = {
				nome: formData.nome,
				localizacao: formData.localizacao,
			};
			
			if (formData.empresaId) {
				data.empresa_id = Number(formData.empresaId);
			}
			if (formData.responsavelId) {
				data.responsavel_id = Number(formData.responsavelId);
			}

			if (editing) {
				const updated = await api.update<Record<string, unknown>>('almoxarifados', editing.id, {
					...data,
					ativo: ativoToDb(editing.ativo),
				});
				setLista((prev) => prev.map((a) => (a.id === editing.id ? mapAlmox(updated) : a)));
			} else {
				const created = await api.create<Record<string, unknown>>('almoxarifados', {
					...data,
					ativo: 1,
				});
				setLista((prev) => [...prev, mapAlmox(created)]);
			}
			setIsModalOpen(false);
			setEditing(null);
			setFormData({ nome: '', localizacao: '', empresaId: '', responsavelId: '' });
			toast.success(editing ? 'Almoxarifado atualizado com sucesso.' : 'Almoxarifado cadastrado com sucesso.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleToggle = async (id: number) => {
		const a = lista.find((x) => x.id === id);
		if (!a) return;
		const ok = await confirm({
			title: a.ativo ? 'Inativar almoxarifado?' : 'Ativar almoxarifado?',
			description: `Deseja realmente ${a.ativo ? 'inativar' : 'ativar'} este almoxarifado?`,
			confirmLabel: a.ativo ? 'Sim, inativar' : 'Sim, ativar',
		});
		if (!ok) return;
		try {
			const updated = await api.update<Record<string, unknown>>('almoxarifados', id, { ativo: ativoToDb(!a.ativo) });
			setLista((prev) => prev.map((x) => (x.id === id ? mapAlmox(updated) : x)));
			toast.success('Status do almoxarifado atualizado.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleAdd = () => {
		setEditing(null);
		setFormData({ nome: '', localizacao: '', empresaId: '', responsavelId: '' });
		setIsModalOpen(true);
	};

	return (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Almoxarifados</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Almoxarifados
				</h1>
				<p className="text-slate-500 text-sm">Tabela almoxarifados no D1.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Pesquisar"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-16">ID</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Localização</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Responsável</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={7} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginated.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginated.map((a) => (
									<tr key={a.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm text-slate-500 text-center">{a.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{a.nome}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{a.empresaNome || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{a.localizacao || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{a.responsavelNome || '—'}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${a.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{a.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => navigate(`/almoxarifados/${a.id}`)} className="p-1.5 text-emerald-600 hover:text-emerald-700 transition-colors" title="Ver detalhes">
													<MaterialIcon name="visibility" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(a.id)}
													className={`p-1.5 transition-colors ${a.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={a.ativo ? 'block' : 'check'} size={20} />
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
						Exibindo {paginated.length} de {filtered.length} registros
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
						<SheetTitle>{editing ? 'Editar' : 'Novo'} almoxarifado</SheetTitle>
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
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Localização</label>
							<input
								type="text"
								value={formData.localizacao}
								onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
							<Select
								value={formData.empresaId}
								onValueChange={(value) => setFormData({ ...formData, empresaId: value })}
							>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500">
									<SelectValue placeholder="Selecione uma empresa" />
								</SelectTrigger>
								<SelectContent>
									{empresas.map((emp) => (
										<SelectItem key={emp.id} value={String(emp.id)}>
											{emp.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Responsável</label>
							<Select
								value={formData.responsavelId}
								onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
							>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500">
									<SelectValue placeholder={responsaveis.length === 0 ? "Nenhum funcionário cadastrado" : "Selecione um responsável"} />
								</SelectTrigger>
								<SelectContent>
									{responsaveis.length === 0 ? (
										<div className="px-2 py-1.5 text-sm text-slate-500">Nenhum funcionário cadastrado</div>
									) : (
										responsaveis.map((resp) => (
											<SelectItem key={resp.id} value={String(resp.id)}>
												{resp.nome}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
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
