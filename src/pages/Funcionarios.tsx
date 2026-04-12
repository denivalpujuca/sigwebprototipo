import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb, formatDbDate } from '../lib/d1Utils';

interface Funcionario {
	id: number;
	nome: string;
	cpf: string;
	email: string;
	telefone: string;
	cargo: string;
	empresa: string;
	dataAdmissao: string;
	status: 'ATIVO' | 'FERIAS' | 'LICENCA' | 'DEMITIDO';
	ativo: boolean;
}

function mapFuncionario(r: Record<string, unknown>): Funcionario {
	const st = String(r.status ?? 'ATIVO');
	const status = (['ATIVO', 'FERIAS', 'LICENCA', 'DEMITIDO'].includes(st) ? st : 'ATIVO') as Funcionario['status'];
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		cpf: String(r.cpf ?? ''),
		email: String(r.email ?? ''),
		telefone: String(r.telefone ?? ''),
		cargo: String(r.cargo ?? ''),
		empresa: String(r.empresa ?? ''),
		dataAdmissao: String(r.data_admissao ?? '').slice(0, 10),
		status,
		ativo: ativoFromDb(r.ativo),
	};
}

interface FuncionariosProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const FuncionariosPage: React.FC<FuncionariosProps> = () => {
	const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('funcionarios');
			setFuncionarios(raw.map(mapFuncionario));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar funcionários');
			setFuncionarios([]);
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
	const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
	const [formData, setFormData] = useState({
		nome: '',
		cpf: '',
		email: '',
		telefone: '',
		cargo: '',
		empresa: '',
		dataAdmissao: '',
		status: 'ATIVO' as Funcionario['status'],
	});
	const itemsPerPage = 5;

	const filteredFuncionarios = useMemo(() => {
		return funcionarios.filter(
			(f) =>
				f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				f.cpf.includes(searchTerm) ||
				f.cargo.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [funcionarios, searchTerm]);

	const paginatedFuncionarios = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredFuncionarios.slice(start, start + itemsPerPage);
	}, [filteredFuncionarios, currentPage]);

	const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage) || 1;

	const getStatusBadge = (status: string, ativo: boolean) => {
		if (!ativo) return 'bg-red-100 text-red-700';
		switch (status) {
			case 'ATIVO':
				return 'bg-emerald-100 text-emerald-700';
			case 'FERIAS':
				return 'bg-blue-100 text-blue-700';
			case 'LICENCA':
				return 'bg-amber-100 text-amber-700';
			case 'DEMITIDO':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	const handleSave = async () => {
		try {
			const payload = {
				nome: formData.nome,
				cpf: formData.cpf,
				email: formData.email,
				telefone: formData.telefone,
				cargo: formData.cargo,
				empresa: formData.empresa,
				data_admissao: formData.dataAdmissao,
				status: formData.status,
			};
			if (editingFuncionario) {
				const updated = await api.update<Record<string, unknown>>('funcionarios', editingFuncionario.id, {
					...payload,
					ativo: ativoToDb(editingFuncionario.ativo),
				});
				setFuncionarios((prev) => prev.map((f) => (f.id === editingFuncionario.id ? mapFuncionario(updated) : f)));
			} else {
				const created = await api.create<Record<string, unknown>>('funcionarios', { ...payload, ativo: 1 });
				setFuncionarios((prev) => [...prev, mapFuncionario(created)]);
			}
			setIsModalOpen(false);
			setEditingFuncionario(null);
			setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO' });
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleEdit = (f: Funcionario) => {
		setEditingFuncionario(f);
		setFormData({
			nome: f.nome,
			cpf: f.cpf,
			email: f.email,
			telefone: f.telefone,
			cargo: f.cargo,
			empresa: f.empresa,
			dataAdmissao: f.dataAdmissao,
			status: f.status,
		});
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const f = funcionarios.find((x) => x.id === id);
		if (!f) return;
		try {
			const updated = await api.update<Record<string, unknown>>('funcionarios', id, { ativo: ativoToDb(!f.ativo) });
			setFuncionarios((prev) => prev.map((x) => (x.id === id ? mapFuncionario(updated) : x)));
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleAdd = () => {
		setEditingFuncionario(null);
		setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO' });
		setIsModalOpen(true);
	};

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Funcionários</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Funcionários
				</h1>
				<p className="text-slate-500 text-sm">Dados da tabela funcionarios (D1).</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar funcionário"
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cargo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Admissão</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Situação</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedFuncionarios.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedFuncionarios.map((func) => (
									<tr key={func.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4">
											<div className="flex flex-col">
												<span className="text-sm font-bold text-slate-900">{func.nome}</span>
												<span className="text-[11px] text-slate-500">{func.email}</span>
											</div>
										</td>
										<td className="px-4 py-4 text-sm text-slate-500">{func.cargo}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{func.empresa}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{formatDbDate(func.dataAdmissao)}</td>
										<td className="px-4 py-4 text-center">
											<span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(func.status, func.ativo)}`}>
												{func.status}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => handleEdit(func)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(func.id)}
													className={`p-1.5 transition-colors ${func.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={func.ativo ? 'block' : 'check'} size={20} />
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
						Exibindo {paginatedFuncionarios.length} de {filteredFuncionarios.length} registros
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
						<SheetTitle>{editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</SheetTitle>
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
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">CPF</label>
								<input
									type="text"
									value={formData.cpf}
									onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
								<input
									type="text"
									value={formData.telefone}
									onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Cargo</label>
								<input
									type="text"
									value={formData.cargo}
									onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
								<input
									type="text"
									value={formData.empresa}
									onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Data de admissão</label>
							<input
								type="date"
								value={formData.dataAdmissao}
								onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Status RH</label>
							<Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Funcionario['status'] })}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ATIVO">Ativo</SelectItem>
									<SelectItem value="FERIAS">Férias</SelectItem>
									<SelectItem value="LICENCA">Licença</SelectItem>
									<SelectItem value="DEMITIDO">Demitido</SelectItem>
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

	return <>{content}</>;
};
