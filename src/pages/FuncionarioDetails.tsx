import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MaterialIcon } from '../components/Icon';
import { Building2, UserMinus, History, User, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiBase, api } from '../lib/api';
import { ativoFromDb } from '../lib/d1Utils';
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
	empresaId?: number;
	empresaNome?: string;
	cargoId?: number;
	cargoNome?: string;
	dataAdmissao?: string;
	dataDemissao?: string;
	admissaoStatus?: string;
}

interface AdmissaoHistorico {
	id: number;
	empresaId: number;
	empresaNome: string;
	cargoId: number | null;
	cargoNome: string;
	dataAdmissao: string;
	dataDemissao: string | null;
	status: string;
}

function mapFuncionario(r: Record<string, unknown>): Funcionario {
	const status = String(r.admissao_status ?? 'ATIVO');
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		cpf: String(r.cpf ?? ''),
		email: String(r.email ?? ''),
		telefone: String(r.telefone ?? ''),
		foto: r.foto ? String(r.foto) : undefined,
		ativo: ativoFromDb(r.ativo),
		admissaoId: r.admissao_id ? Number(r.admissao_id) : undefined,
		empresaId: r.empresa_id ? Number(r.empresa_id) : undefined,
		empresaNome: r.empresa_nome ? String(r.empresa_nome) : undefined,
		cargoId: r.cargo_id ? Number(r.cargo_id) : undefined,
		cargoNome: r.cargo_nome ? String(r.cargo_nome) : undefined,
		dataAdmissao: r.data_admissao ? String(r.data_admissao).slice(0, 10) : undefined,
		dataDemissao: r.data_demissao ? String(r.data_demissao).slice(0, 10) : undefined,
		admissaoStatus: ['ATIVO', 'FERIAS', 'LICENCA', 'DEMITIDO', 'PROMOVIDO'].includes(status) ? status : 'ATIVO',
	};
}

function mapAdmissao(r: Record<string, unknown>, empresas: { id: number; nome: string }[], cargos: { id: number; nome: string }[]): AdmissaoHistorico {
	const empresaId = Number(r.empresa_id);
	const cargoId = r.cargo_id ? Number(r.cargo_id) : null;
	const empresa = empresas.find(e => e.id === empresaId);
	const cargo = cargos.find(c => c.id === cargoId);
	
	return {
		id: Number(r.id),
		empresaId,
		empresaNome: empresa?.nome || '—',
		cargoId,
		cargoNome: cargo?.nome || '—',
		dataAdmissao: r.data_admissao ? String(r.data_admissao).slice(0, 10) : '',
		dataDemissao: r.data_demissao ? String(r.data_demissao).slice(0, 10) : null,
		status: String(r.status ?? 'ATIVO'),
	};
}

export const FuncionarioDetailsPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast, confirm } = useAppFeedback();
	
	const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
	const [historico, setHistorico] = useState<AdmissaoHistorico[]>([]);
	const [loading, setLoading] = useState(true);
	const [empresas, setEmpresas] = useState<{ id: number; nome: string }[]>([]);
	const [cargos, setCargos] = useState<{ id: number; nome: string }[]>([]);

	const [isAdmissaoModalOpen, setIsAdmissaoModalOpen] = useState(false);
	const [isPromoverModalOpen, setIsPromoverModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		nome: '',
		cpf: '',
		email: '',
		telefone: '',
		foto: '',
	});

	const [formAdmissao, setFormAdmissao] = useState({
		empresaId: '',
		cargoId: '',
		dataAdmissao: '',
		status: 'ATIVO' as string,
	});

	const [formPromocao, setFormPromocao] = useState({
		empresaId: '',
		cargoId: '',
	});

	const [activeTab, setActiveTab] = useState('dados');

	const loadData = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		try {
			const [funcRaw, empresasRaw, cargosRaw, historicoRaw] = await Promise.all([
				fetch(`${getApiBase()}/api/funcionarios/${id}`),
				api.list<Record<string, unknown>>('empresas'),
				api.list<Record<string, unknown>>('cargos'),
				api.list<Record<string, unknown>>('funcionarios_admissoes'),
			]);
			
			const funcData = funcRaw.ok ? await funcRaw.json() : null;
			
			if (funcData && !funcData.error) {
				const func = mapFuncionario(funcData as Record<string, unknown>);
				setFuncionario(func);
				setFormData({ nome: func.nome, cpf: func.cpf, email: func.email, telefone: func.telefone, foto: func.foto || '' });
				setFormAdmissao({
					empresaId: func.empresaId ? String(func.empresaId) : '',
					cargoId: func.cargoId ? String(func.cargoId) : '',
					dataAdmissao: func.dataAdmissao || '',
					status: func.admissaoStatus || 'ATIVO',
				});
			}
			
			const empresasList = empresasRaw.map(e => ({ id: Number(e.id), nome: String(e.nome) }));
			const cargosList = cargosRaw.map(c => ({ id: Number(c.id), nome: String(c.nome) }));
			setEmpresas(empresasList);
			setCargos(cargosList);
			
			const filtered = historicoRaw.filter(r => r.funcionario_id === Number(id));
			console.log('DEBUG historico:', { historicoRaw, filtered, id });
			setHistorico(filtered.map(r => mapAdmissao(r, empresasList, cargosList)).sort((a, b) => 
				new Date(b.dataAdmissao).getTime() - new Date(a.dataAdmissao).getTime()
			));
		} catch (e) {
			console.error('Erro ao carregar dados:', e);
			toast.error('Erro ao carregar dados do funcionário');
		} finally {
			setLoading(false);
		}
	}, [id, toast]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const getStatusBadge = (status?: string, ativo?: boolean) => {
		if (ativo === false) return 'bg-red-100 text-red-700';
		switch (status) {
			case 'ATIVO': return 'bg-emerald-100 text-emerald-700';
			case 'FERIAS': return 'bg-blue-100 text-blue-700';
			case 'LICENCA': return 'bg-amber-100 text-amber-700';
			case 'DEMITIDO': return 'bg-red-100 text-red-700';
			case 'PROMOVIDO': return 'bg-purple-100 text-purple-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	};

	const handleSaveFuncionario = async () => {
		if (!funcionario) return;
		try {
			await api.update<Record<string, unknown>>('funcionarios', funcionario.id, {
				nome: formData.nome,
				cpf: formData.cpf,
				email: formData.email,
				telefone: formData.telefone,
				foto: formData.foto || null,
			});
			void loadData();
			toast.success('Funcionário atualizado com sucesso.');
			navigate('/funcionarios');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleSaveAdmissao = async () => {
		if (!funcionario) return;
		try {
			const admissaoData = {
				funcionario_id: Number(id),
				empresa_id: Number(formAdmissao.empresaId),
				cargo_id: formAdmissao.cargoId ? Number(formAdmissao.cargoId) : null,
				data_admissao: formAdmissao.dataAdmissao,
				status: formAdmissao.status,
			};

			if (funcionario.admissaoId) {
				await api.update<Record<string, unknown>>('funcionarios_admissoes', funcionario.admissaoId, admissaoData);
			} else {
				await api.create<Record<string, unknown>>('funcionarios_admissoes', {
					...admissaoData,
					ativo: 1,
				});
			}
			setIsAdmissaoModalOpen(false);
			void loadData();
			toast.success(funcionario.admissaoId ? 'Admissão atualizada com sucesso.' : 'Funcionário admitido com sucesso.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar admissão');
		}
	};

	const handleDemitir = async () => {
		if (!funcionario?.admissaoId) return;
		const ok = await confirm({
			title: 'Demitir funcionário?',
			description: `Deseja registrar a demissão de ${funcionario.nome}?`,
		});
		if (!ok) return;

		try {
			await api.update<Record<string, unknown>>('funcionarios_admissoes', funcionario.admissaoId, {
				status: 'DEMITIDO',
				data_demissao: new Date().toISOString().split('T')[0],
				ativo: 0,
			});
			toast.success('Funcionário demitido.');
			void loadData();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao registrar demissão');
		}
	};

	const handlePromover = () => {
		if (!funcionario?.admissaoId) return;
		setFormPromocao({
			empresaId: String(funcionario.empresaId || ''),
			cargoId: String(funcionario.cargoId || ''),
		});
		setIsPromoverModalOpen(true);
	};

	const handleSalvarPromocao = async () => {
		if (!funcionario?.admissaoId) return;

		try {
			await api.update<Record<string, unknown>>('funcionarios_admissoes', funcionario.admissaoId, {
				status: 'PROMOVIDO',
				data_demissao: new Date().toISOString().split('T')[0],
				ativo: 0,
			});
			
			await api.create<Record<string, unknown>>('funcionarios_admissoes', {
				funcionario_id: Number(id),
				empresa_id: formPromocao.empresaId ? Number(formPromocao.empresaId) : null,
				cargo_id: formPromocao.cargoId ? Number(formPromocao.cargoId) : null,
				data_admissao: new Date().toISOString().split('T')[0],
				status: 'ATIVO',
				ativo: 1,
			});
			setIsPromoverModalOpen(false);
			toast.success('Promoção/Transferência registrada.');
			void loadData();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao registrar promoção');
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-slate-500">Carregando...</div>
			</div>
		);
	}

	if (!funcionario) {
		return (
			<div className="text-center py-8">
				<p className="text-slate-500">Funcionário não encontrado</p>
				<button onClick={() => navigate('/funcionarios')} className="text-emerald-600 hover:underline mt-2">
					Voltar para funcionários
				</button>
			</div>
		);
	}

	return (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span onClick={() => navigate('/funcionarios')} className="hover:text-emerald-600 cursor-pointer">Funcionários</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">{funcionario.nome}</span>
			</nav>

			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ letterSpacing: '-0.02em' }}>
						{funcionario.nome}
					</h1>
					<p className="text-slate-500 text-sm">Detalhes do funcionário</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => navigate('/funcionarios')}
						className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
					>
						<MaterialIcon name="arrow_back" size={18} />
						Voltar
					</button>
					<button
						onClick={() => void handleSaveFuncionario()}
						className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium"
					>
						<Save size={18} />
						Salvar
					</button>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
				<div className="flex gap-6">
					<div className="w-48 shrink-0 space-y-1 p-2 rounded-lg border border-slate-100">
						<button
							onClick={() => setActiveTab('dados')}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
								activeTab === 'dados'
									? 'bg-[#e8f5e9] text-[#006e2d] font-medium'
									: 'text-[#555f70] hover:bg-[#f3f4f5]'
							}`}
						>
							<User size={18} />
							Dados Pessoais
						</button>
						<button
							onClick={() => setActiveTab('historico')}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
								activeTab === 'historico'
									? 'bg-[#e8f5e9] text-[#006e2d] font-medium'
									: 'text-[#555f70] hover:bg-[#f3f4f5]'
							}`}
						>
							<History size={18} />
							Histórico
						</button>
					</div>

					<div className="flex-1">
						{activeTab === 'dados' && (
							<div className="flex gap-6">
								<div className="flex-1 max-w-2xl">
									<h2 className="text-lg font-semibold text-slate-900 mb-4">Dados Pessoais</h2>
									
									<form onSubmit={(e) => { e.preventDefault(); void handleSaveFuncionario(); }} className="space-y-4">
										<div className="flex items-center gap-6">
											<div className="shrink-0">
												{formData.foto ? (
													<img src={formData.foto} alt="Foto" className="w-24 h-24 rounded-full object-cover border-2 border-slate-200" />
												) : (
													<div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
														<User size={32} className="text-slate-400" />
													</div>
												)}
											</div>
											<div className="flex-1 flex flex-col justify-center">
												<label className="block text-sm font-semibold text-slate-700 mb-1">Foto</label>
												<input
													type="file"
													accept="image/*"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) {
															const reader = new FileReader();
															reader.onloadend = () => {
																setFormData({ ...formData, foto: reader.result as string });
															};
															reader.readAsDataURL(file);
														}
													}}
													className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
												/>
												{formData.foto && (
													<button
														type="button"
														onClick={() => setFormData({ ...formData, foto: '' })}
														className="text-xs text-red-600 hover:underline mt-1"
													>
														Remover foto
													</button>
												)}
											</div>
										</div>
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
									</form>
								</div>

								<div className="w-80 border-l border-slate-200 pl-6 space-y-6">
									<div>
										<h3 className="text-sm font-semibold text-slate-700 mb-3">Ações</h3>
										<div className="flex gap-2">
											{!funcionario.admissaoId ? (
												<button
													onClick={() => setIsAdmissaoModalOpen(true)}
													className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md flex items-center gap-2"
												>
													<Building2 size={16} />
													Registrar Admissão
												</button>
											) : (
												<>
													<button
														onClick={handlePromover}
														className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md flex items-center gap-2"
													>
														<Building2 size={16} />
														Promover/Transferir
													</button>
													{funcionario.admissaoStatus === 'ATIVO' && (
														<button
															onClick={handleDemitir}
															className="flex-1 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md flex items-center gap-2"
														>
															<UserMinus size={16} />
															Demitir
														</button>
													)}
												</>
											)}
										</div>
									</div>

									{funcionario.admissaoId && (
										<div>
											<h3 className="text-sm font-semibold text-slate-700 mb-3">Admissão Atual</h3>
											<div className="space-y-2 text-sm">
												<div>
													<span className="text-slate-500">Empresa:</span>
													<span className="ml-2 font-medium text-slate-900">{funcionario.empresaNome || '—'}</span>
												</div>
												<div>
													<span className="text-slate-500">Cargo:</span>
													<span className="ml-2 font-medium text-slate-900">{funcionario.cargoNome || '—'}</span>
												</div>
												<div>
													<span className="text-slate-500">Admissão:</span>
													<span className="ml-2 font-medium text-slate-900">{funcionario.dataAdmissao || '—'}</span>
												</div>
												<div>
													<span className="text-slate-500">Status:</span>
													<span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
														funcionario.admissaoStatus === 'ATIVO' ? 'bg-green-100 text-green-700' :
														funcionario.admissaoStatus === 'FERIAS' ? 'bg-amber-100 text-amber-700' :
														funcionario.admissaoStatus === 'DEMITIDO' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
													}`}>
														{funcionario.admissaoStatus || 'Sem vínculo'}
													</span>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === 'historico' && (
							<div className="max-w-2xl">
								<h2 className="text-lg font-semibold text-slate-900 mb-4">Histórico de Admissões</h2>
								
								{historico.length === 0 ? (
									<p className="text-slate-500 text-center py-8">Nenhum histórico encontrado</p>
								) : (
									<div className="space-y-3">
										{historico.map((h) => (
											<div key={h.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
												<div className="flex items-center justify-between mb-3">
													<span className="font-semibold text-slate-900">{h.empresaNome}</span>
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(h.status)}`}>
														{h.status}
													</span>
												</div>
												<div className="grid grid-cols-3 gap-4 text-sm">
													<div>
														<span className="text-slate-500 text-xs">Cargo</span>
														<p className="font-medium text-slate-700">{h.cargoNome}</p>
													</div>
													<div>
														<span className="text-slate-500 text-xs">Admissão</span>
														<p className="font-medium text-slate-700">{h.dataAdmissao}</p>
													</div>
													<div>
														<span className="text-slate-500 text-xs">Demissão</span>
														<p className="font-medium text-slate-700">{h.dataDemissao || '—'}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<Dialog open={isAdmissaoModalOpen} onOpenChange={(open) => !open && setIsAdmissaoModalOpen(false)}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Registrar Admissão</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => { e.preventDefault(); void handleSaveAdmissao(); }}
						className="space-y-4 mt-4"
					>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Empresa *</label>
							<Select value={formAdmissao.empresaId} onValueChange={(value) => setFormAdmissao({ ...formAdmissao, empresaId: value })} required>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
									<SelectValue placeholder="Selecione uma empresa" />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-auto">
									{empresas.length === 0 ? (
										<div className="p-2 text-sm text-slate-500">Nenhuma empresa encontrada</div>
									) : (
										empresas.map((emp) => (
											<SelectItem key={emp.id} value={String(emp.id)}>{emp.nome}</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Cargo</label>
							<Select value={formAdmissao.cargoId} onValueChange={(value) => setFormAdmissao({ ...formAdmissao, cargoId: value })}>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
									<SelectValue placeholder="Selecione um cargo" />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-auto">
									{cargos.length === 0 ? (
										<div className="p-2 text-sm text-slate-500">Nenhum cargo encontrado</div>
									) : (
										cargos.map((cargo) => (
											<SelectItem key={cargo.id} value={String(cargo.id)}>{cargo.nome}</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Data de Admissão *</label>
								<input
									type="date"
									value={formAdmissao.dataAdmissao}
									onChange={(e) => setFormAdmissao({ ...formAdmissao, dataAdmissao: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
								<Select value={formAdmissao.status} onValueChange={(value) => setFormAdmissao({ ...formAdmissao, status: value })}>
									<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ATIVO">Ativo</SelectItem>
										<SelectItem value="FERIAS">Férias</SelectItem>
										<SelectItem value="LICENCA">Licença</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex justify-end gap-3 pt-4">
							<button
								type="button"
								onClick={() => setIsAdmissaoModalOpen(false)}
								className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md"
							>
								Cancelar
							</button>
							<button type="submit" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md flex items-center gap-2">
								<Save size={16} />
								Salvar
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={isPromoverModalOpen} onOpenChange={(open) => !open && setIsPromoverModalOpen(false)}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Promover/Transferir Funcionário</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 mt-4">
						<div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
							<p className="text-xs text-slate-500 mb-1">Cargo Atual</p>
							<p className="text-sm font-medium text-slate-900">{funcionario?.cargoNome || '—'}</p>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Nova Empresa *</label>
							<Select value={formPromocao.empresaId} onValueChange={(value) => setFormPromocao({ ...formPromocao, empresaId: value })} required>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
									<SelectValue placeholder="Selecione uma empresa" />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-auto">
									{empresas.map((emp) => (
										<SelectItem key={emp.id} value={String(emp.id)}>{emp.nome}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Novo Cargo</label>
							<Select value={formPromocao.cargoId} onValueChange={(value) => setFormPromocao({ ...formPromocao, cargoId: value })}>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
									<SelectValue placeholder="Selecione um cargo" />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-auto">
									{cargos.map((cargo) => (
										<SelectItem key={cargo.id} value={String(cargo.id)}>{cargo.nome}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex justify-end gap-3 pt-4">
							<button
								type="button"
								onClick={() => setIsPromoverModalOpen(false)}
								className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md"
							>
								Cancelar
							</button>
							<button
								onClick={() => void handleSalvarPromocao()}
								className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md flex items-center gap-2"
							>
								<Save size={16} />
								Confirmar
							</button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};