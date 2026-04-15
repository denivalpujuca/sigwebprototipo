import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../components/Icon';
import { Search, Plus, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Funcionario {
	id: number;
	nome: string;
	cpf: string;
	email: string;
	telefone: string;
	foto?: string;
	ativo: boolean;
	admissaoId?: number;
	empresaId?: number | null;
	empresaNome?: string;
	cargoId?: number | null;
	cargoNome?: string;
	dataAdmissao?: string;
	dataDemissao?: string;
	admissaoStatus?: string;
}

function mapFuncionario(r: Record<string, unknown>): Funcionario {
	const status = String(r.admissao_status ?? 'ATIVO');
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		cpf: r.cpf ? String(r.cpf) : '',
		email: r.email ? String(r.email) : '',
		telefone: r.telefone ? String(r.telefone) : '',
		foto: r.foto ? String(r.foto) : undefined,
		ativo: r.ativo === 1 || r.ativo === true || String(r.ativo).toLowerCase() === 'true',
		empresaId: r.empresa_id ? Number(r.empresa_id) : null,
		empresaNome: r.empresa_nome ? String(r.empresa_nome) : '',
		cargoId: r.cargo_id ? Number(r.cargo_id) : null,
		cargoNome: r.cargo_nome ? String(r.cargo_nome) : '',
		dataAdmissao: r.data_admissao ? String(r.data_admissao).slice(0, 10) : '',
		admissaoStatus: ['ATIVO', 'FERIAS', 'LICENCA', 'DEMITIDO', 'PROMOVIDO'].includes(status) ? status : 'ATIVO',
		dataDemissao: r.data_demissao ? String(r.data_demissao).slice(0, 10) : undefined,
	};
}

interface FuncionariosProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const FuncionariosPage: React.FC<FuncionariosProps> = () => {
	const navigate = useNavigate();
	const { toast } = useAppFeedback();
	const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [empresas, setEmpresas] = useState<{ id: number; nome: string }[]>([]);
	const [cargos, setCargos] = useState<{ id: number; nome: string }[]>([]);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const [raw, empresasRaw, cargosRaw] = await Promise.all([
				api.list<Record<string, unknown>>('funcionarios'),
				api.list<Record<string, unknown>>('empresas'),
				api.list<Record<string, unknown>>('cargos'),
			]);
			setFuncionarios(raw.map(mapFuncionario));
			setEmpresas(empresasRaw.map(e => ({ id: Number(e.id), nome: String(e.nome) })));
			setCargos(cargosRaw.map(c => ({ id: Number(c.id), nome: String(c.nome) })));
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
	});

	const [isAdmissaoOpen, setIsAdmissaoOpen] = useState(false);
	const [editingAdmissao, setEditingAdmissao] = useState<Funcionario | null>(null);
	const [formAdmissao, setFormAdmissao] = useState({
		empresaId: '',
		cargoId: '',
		dataAdmissao: '',
		status: 'ATIVO' as string,
	});

	const itemsPerPage = 5;

	const filteredFuncionarios = useMemo(() => {
		return funcionarios.filter(
			(f) =>
				f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				f.cpf.includes(searchTerm) ||
				(f.empresaNome && f.empresaNome.toLowerCase().includes(searchTerm.toLowerCase())),
		);
	}, [funcionarios, searchTerm]);

	const paginatedFuncionarios = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredFuncionarios.slice(start, start + itemsPerPage);
	}, [filteredFuncionarios, currentPage]);

	const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage) || 1;

	const getStatusBadge = (status?: string, ativo?: boolean) => {
		if (ativo === false) return 'bg-red-100 text-red-700';
		switch (status) {
			case 'ATIVO':
				return 'bg-emerald-100 text-emerald-700';
			case 'FERIAS':
				return 'bg-blue-100 text-blue-700';
			case 'LICENCA':
				return 'bg-amber-100 text-amber-700';
			case 'DEMITIDO':
				return 'bg-red-100 text-red-700';
			case 'PROMOVIDO':
				return 'bg-purple-100 text-purple-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	const handleSaveFuncionario = async () => {
		try {
			if (editingFuncionario) {
				await api.update<Record<string, unknown>>('funcionarios', editingFuncionario.id, {
					nome: formData.nome,
					cpf: formData.cpf,
					email: formData.email,
					telefone: formData.telefone,
					ativo: ativoToDb(editingFuncionario.ativo),
				});
			} else {
				await api.create<Record<string, unknown>>('funcionarios', {
					nome: formData.nome,
					cpf: formData.cpf,
					email: formData.email,
					telefone: formData.telefone,
					ativo: 1,
				});
			}
			setIsModalOpen(false);
			setEditingFuncionario(null);
			setFormData({ nome: '', cpf: '', email: '', telefone: '' });
			void load();
			toast.success(editingFuncionario ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleSaveAdmissao = async () => {
		try {
			const admissaoData = {
				funcionario_id: editingAdmissao?.id,
				empresa_id: Number(formAdmissao.empresaId),
				cargo_id: formAdmissao.cargoId ? Number(formAdmissao.cargoId) : null,
				data_admissao: formAdmissao.dataAdmissao,
				status: formAdmissao.status,
			};

			if (editingAdmissao?.admissaoId) {
				await api.update<Record<string, unknown>>('funcionarios_admissoes', editingAdmissao.admissaoId, admissaoData);
				toast.success('Admissão atualizada com sucesso.');
			} else {
				await api.create<Record<string, unknown>>('funcionarios_admissoes', {
					...admissaoData,
					ativo: 1,
				});
				toast.success('Admissão registrada com sucesso.');
			}

			setIsAdmissaoOpen(false);
			setEditingAdmissao(null);
			setFormAdmissao({ empresaId: '', cargoId: '', dataAdmissao: '', status: 'ATIVO' });
			void load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar admissão');
		}
	};

	const handleAddFuncionario = () => {
		setEditingFuncionario(null);
		setFormData({ nome: '', cpf: '', email: '', telefone: '' });
		setIsModalOpen(true);
	};

	const handleViewDetails = (f: Funcionario) => {
		navigate(`/funcionarios/${f.id}`);
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
				<p className="text-slate-500 text-sm">Gerenciamento de funcionários e admissões.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Pesquisar funcionário"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>
				<button onClick={handleAddFuncionario} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors">
					<Plus size={20} />
					Novo Funcionário
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-[#f5f5f5]">
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-16">ID</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-20">Foto</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Empresa</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cargo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Admissão</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={8} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedFuncionarios.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedFuncionarios.map((func) => (
									<tr key={func.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm text-slate-500 text-center">{func.id}</td>
										<td className="px-4 py-4">
											{func.foto ? (
												<img src={func.foto} alt={func.nome} className="w-10 h-10 rounded-full object-cover" />
											) : (
												<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
													<User size={18} className="text-slate-400" />
												</div>
											)}
										</td>
										<td className="px-4 py-4">
											<div className="flex flex-col">
												<span className="text-sm font-bold text-slate-900">{func.nome}</span>
												<span className="text-[11px] text-slate-500">{func.cpf}</span>
											</div>
										</td>
										<td className="px-4 py-4 text-sm text-slate-500">{func.empresaNome || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{func.cargoNome || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{func.dataAdmissao || '—'}</td>
										<td className="px-4 py-4 text-center">
											<span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(func.admissaoStatus, func.ativo)}`}>
												{func.admissaoStatus || 'Sem vínculo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-1">
												<button onClick={() => handleViewDetails(func)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors" title="Ver detalhes">
													<MaterialIcon name="visibility" size={18} />
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

			<Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
				<DialogContent className="sm:max-w-[540px]">
					<DialogHeader>
						<DialogTitle>{editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSaveFuncionario();
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
						<div className="flex gap-3 pt-4">
							<button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">
								Cancelar
							</button>
							<button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">
								Salvar
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={isAdmissaoOpen} onOpenChange={(open) => !open && setIsAdmissaoOpen(false)}>
				<DialogContent className="sm:max-w-[540px]">
					<DialogHeader>
						<DialogTitle>Admitir Funcionário</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSaveAdmissao();
						}}
						className="mt-6 space-y-4"
					>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Empresa</label>
							<Select value={formAdmissao.empresaId} onValueChange={(value) => setFormAdmissao({ ...formAdmissao, empresaId: value })}>
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
							<label className="block text-sm font-semibold text-slate-700 mb-1">Cargo</label>
							<Select value={formAdmissao.cargoId} onValueChange={(value) => setFormAdmissao({ ...formAdmissao, cargoId: value })}>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500">
									<SelectValue placeholder="Selecione um cargo" />
								</SelectTrigger>
								<SelectContent>
									{cargos.map((cargo) => (
										<SelectItem key={cargo.id} value={String(cargo.id)}>
											{cargo.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Data de Admissão</label>
							<input
								type="date"
								value={formAdmissao.dataAdmissao}
								onChange={(e) => setFormAdmissao({ ...formAdmissao, dataAdmissao: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
							<Select value={formAdmissao.status} onValueChange={(value) => setFormAdmissao({ ...formAdmissao, status: value })}>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ATIVO">Ativo</SelectItem>
									<SelectItem value="FERIAS">Férias</SelectItem>
									<SelectItem value="LICENCA">Licença</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-3 pt-4">
							<button type="button" onClick={() => setIsAdmissaoOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">
								Cancelar
							</button>
							<button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md">
								Salvar
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);

	return <>{content}</>;
};