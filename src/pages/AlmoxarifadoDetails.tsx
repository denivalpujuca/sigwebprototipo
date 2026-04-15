import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MaterialIcon } from '../components/Icon';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api, getApiBase } from '../lib/api';
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
		empresaNome: r.empresa_nome ? String(r.empresa_nome) : '',
		responsavelId: r.responsavel_id ? Number(r.responsavel_id) : null,
		responsavelNome: r.responsavel_nome ? String(r.responsavel_nome) : '',
		ativo: ativoFromDb(r.ativo),
	};
}

interface EstoqueItem {
	id: number;
	almoxarifado_id: number;
	produto_id: number;
	produto_nome: string;
	produto_codigo: string;
	produto_unidade: string;
	quantidade_total: number;
	quantidade_reservada: number;
	estoque_minimo: number;
	necessita_gerenciar_minimo: boolean;
	valor_venda: number | null;
	ativo: boolean;
}

function mapEstoque(r: Record<string, unknown>): EstoqueItem {
	return {
		id: Number(r.id),
		almoxarifado_id: Number(r.almoxarifado_id),
		produto_id: Number(r.produto_id),
		produto_nome: String(r.produto_nome ?? ''),
		produto_codigo: String(r.produto_codigo ?? ''),
		produto_unidade: String(r.produto_unidade ?? 'un'),
		quantidade_total: Number(r.quantidade_total ?? 0),
		quantidade_reservada: Number(r.quantidade_reservada ?? 0),
		estoque_minimo: Number(r.estoque_minimo ?? 0),
		necessita_gerenciar_minimo: Boolean(r.necessita_gerenciar_minimo),
		valor_venda: r.valor_venda ? Number(r.valor_venda) : null,
		ativo: ativoFromDb(r.ativo),
	};
}

interface Produto {
	id: number;
	nome: string;
	codigo: string;
	unidade: string;
	ativo: boolean;
}

function mapProduto(r: Record<string, unknown>): Produto {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		codigo: String(r.codigo ?? ''),
		unidade: String(r.unidade ?? 'un'),
		ativo: ativoFromDb(r.ativo),
	};
}

export const AlmoxarifadoDetailsPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { toast, confirm } = useAppFeedback();
	const { hasAccess, isAdmin } = useEmpresa();

	const [almoxarifado, setAlmoxarifado] = useState<Almoxarifado | null>(null);
	const [estoqueItens, setEstoqueItens] = useState<EstoqueItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [accessDenied, setAccessDenied] = useState(false);
	const [empresas, setEmpresas] = useState<{ id: number; nome: string }[]>([]);
	const [responsaveis, setResponsaveis] = useState<{ id: number; nome: string }[]>([]);
	const [produtos, setProdutos] = useState<Produto[]>([]);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({ nome: '', localizacao: '', empresaId: '', responsavelId: '' });

	const [isAddProductOpen, setIsAddProductOpen] = useState(false);
	const [selectedProdutoId, setSelectedProdutoId] = useState<string>('');
	const [novaQuantidade, setNovaQuantidade] = useState<number>(1);
	const [estoqueMinimo, setEstoqueMinimo] = useState<number>(0);
	const [gerenciarMinimo, setGerenciarMinimo] = useState<boolean>(false);
	const [valorVenda, setValorVenda] = useState<string>('');
	const [searchEstoque, setSearchEstoque] = useState('');

	const [activeTab, setActiveTab] = useState('dados');

	const loadData = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		setAccessDenied(false);
		try {
			const [almoxRaw, empresasRaw, funcionariosRaw, produtosRaw, estoqueRaw] = await Promise.all([
				fetch(`${getApiBase()}/api/almoxarifados/${id}`),
				api.list<Record<string, unknown>>('empresas'),
				api.list<Record<string, unknown>>('funcionarios'),
				api.list<Record<string, unknown>>('produtos'),
				api.getUrl<Record<string, unknown>>(`/api/almoxarifados/${id}/estoque`),
			]);

			const almoxData = almoxRaw.ok ? await almoxRaw.json() : null;

			if (almoxData && !almoxData.error) {
				const almox = mapAlmox(almoxData as Record<string, unknown>);
				
				if (!isAdmin && !hasAccess(almox.id, 'leitura')) {
					setAccessDenied(true);
					setLoading(false);
					return;
				}
				
				setAlmoxarifado(almox);
				setFormData({
					nome: almox.nome,
					localizacao: almox.localizacao,
					empresaId: almox.empresaId ? String(almox.empresaId) : '',
					responsavelId: almox.responsavelId ? String(almox.responsavelId) : '',
				});
			}

			setEmpresas(empresasRaw.map(e => ({ id: Number(e.id), nome: String(e.nome) })));
			setResponsaveis(funcionariosRaw.map(f => ({ id: Number(f.id), nome: String(f.nome) })));
			setProdutos(produtosRaw.filter((p: Record<string, unknown>) => p.ativo === 1).map(mapProduto));
			setEstoqueItens(estoqueRaw.map(mapEstoque));
		} catch (e) {
			console.error('Erro ao carregar dados:', e);
			toast.error('Erro ao carregar dados do almoxarifado');
		} finally {
			setLoading(false);
		}
	}, [id, toast]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleSaveAlmoxarifado = async () => {
		if (!almoxarifado) return;
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

			await api.update<Record<string, unknown>>('almoxarifados', almoxarifado.id, {
				...data,
				ativo: ativoToDb(almoxarifado.ativo),
			});
			void loadData();
			toast.success('Almoxarifado atualizado com sucesso.');
			navigate('/almoxarifados');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleAddProduto = async () => {
		if (!selectedProdutoId) return;
		try {
			await api.create<Record<string, unknown>>('almoxarifado_produto', {
				almoxarifado_id: Number(id),
				produto_id: Number(selectedProdutoId),
				quantidade_total: novaQuantidade,
				estoque_minimo: estoqueMinimo,
				necessita_gerenciar_minimo: gerenciarMinimo ? 1 : 0,
				valor_venda: valorVenda ? Number(valorVenda) : null,
			});
			setIsAddProductOpen(false);
			setSelectedProdutoId('');
			setNovaQuantidade(1);
			setEstoqueMinimo(0);
			setGerenciarMinimo(false);
			setValorVenda('');
			void loadData();
			toast.success('Produto adicionado ao estoque.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao adicionar');
		}
	};

	const handleRemoveEstoque = async (estoqueId: number) => {
		const item = estoqueItens.find(i => i.id === estoqueId);
		if (!item) return;
		const ok = await confirm({
			title: item.ativo ? 'Inativar produto no estoque?' : 'Ativar produto no estoque?',
			description: `Deseja realmente ${item.ativo ? 'inativar' : 'ativar'} este produto no estoque?`,
			confirmLabel: item.ativo ? 'Sim, inativar' : 'Sim, ativar',
		});
		if (!ok) return;
		try {
			await api.update<Record<string, unknown>>('almoxarifado_produto', estoqueId, {
				ativo: ativoToDb(!item.ativo),
			});
			setEstoqueItens(prev => prev.map(i => 
				i.id === estoqueId ? { ...i, ativo: !i.ativo } : i
			));
			toast.success(`Produto ${item.ativo ? 'inativado' : 'ativado'} no estoque.`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const filteredEstoque = useMemo(() => {
		if (!searchEstoque) return estoqueItens;
		const term = searchEstoque.toLowerCase();
		return estoqueItens.filter(item => 
			item.produto_nome.toLowerCase().includes(term) ||
			item.produto_codigo.toLowerCase().includes(term)
		);
	}, [estoqueItens, searchEstoque]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-slate-500">Carregando...</div>
			</div>
		);
	}

	if (accessDenied) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<MaterialIcon name="block" size={48} className="text-red-500" />
				<div className="text-slate-500 text-center">
					<p className="font-semibold text-lg">Acesso Negado</p>
					<p className="text-sm mt-2">Você não tem permissão para visualizar este almoxarifado.</p>
				</div>
				<button onClick={() => navigate('/almoxarifados')} className="text-emerald-600 hover:underline">
					Voltar para Almoxarifados
				</button>
			</div>
		);
	}

	if (!almoxarifado) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<div className="text-slate-500">Almoxarifado não encontrado</div>
				<button onClick={() => navigate('/almoxarifados')} className="text-emerald-600 hover:underline">
					Voltar para Almoxarifados
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span onClick={() => navigate('/')} className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span onClick={() => navigate('/almoxarifados')} className="hover:text-emerald-600 cursor-pointer">Almoxarifados</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">{almoxarifado.nome}</span>
			</nav>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{almoxarifado.nome}</h1>
					<p className="text-slate-500 text-sm mt-1">{almoxarifado.localizacao || 'Sem localização'}</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => navigate('/almoxarifados')}
						className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md flex items-center gap-2 transition-colors"
					>
						<MaterialIcon name="arrow_back" size={18} />
						Voltar
					</button>
					<button
						onClick={() => setIsModalOpen(true)}
						className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md flex items-center gap-2 transition-colors"
					>
						<MaterialIcon name="edit" size={18} />
						Editar
					</button>
				</div>
			</div>

			<div className="flex gap-6">
				<div className="w-64 shrink-0">
					<div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
						<div>
							<span className="text-xs text-slate-500 uppercase tracking-wider">Empresa</span>
							<p className="text-sm font-medium text-slate-900">{almoxarifado.empresaNome || '—'}</p>
						</div>
						<div>
							<span className="text-xs text-slate-500 uppercase tracking-wider">Responsável</span>
							<p className="text-sm font-medium text-slate-900">{almoxarifado.responsavelNome || '—'}</p>
						</div>
						<div>
							<span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
							<p className="mt-1">
								<span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
									almoxarifado.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
								}`}>
									{almoxarifado.ativo ? 'Ativo' : 'Inativo'}
								</span>
							</p>
						</div>
					</div>
				</div>

				<div className="flex-1">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList>
							<TabsTrigger value="dados">Dados</TabsTrigger>
							<TabsTrigger value="estoque">Estoque ({estoqueItens.length})</TabsTrigger>
						</TabsList>

						<TabsContent value="dados">
							<div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
								{isModalOpen ? (
									<form onSubmit={(e) => { e.preventDefault(); void handleSaveAlmoxarifado(); }} className="max-w-xl space-y-4">
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
											<Select value={formData.empresaId} onValueChange={(v) => setFormData({ ...formData, empresaId: v })}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecione uma empresa" />
												</SelectTrigger>
												<SelectContent>
													{empresas.map(e => (
														<SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-1">Responsável</label>
											<Select value={formData.responsavelId} onValueChange={(v) => setFormData({ ...formData, responsavelId: v })}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecione um responsável" />
												</SelectTrigger>
												<SelectContent>
													{responsaveis.map(f => (
														<SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="flex gap-3">
											<button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors">
												Cancelar
											</button>
											<button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-md transition-colors">
												Salvar
											</button>
										</div>
									</form>
								) : (
									<div className="max-w-xl">
										<dl className="grid grid-cols-1 gap-4">
											<div>
												<dt className="text-xs text-slate-500 uppercase tracking-wider">Nome</dt>
												<dd className="text-sm font-medium text-slate-900">{almoxarifado.nome}</dd>
											</div>
											<div>
												<dt className="text-xs text-slate-500 uppercase tracking-wider">Localização</dt>
												<dd className="text-sm font-medium text-slate-900">{almoxarifado.localizacao || '—'}</dd>
											</div>
											<div>
												<dt className="text-xs text-slate-500 uppercase tracking-wider">Empresa</dt>
												<dd className="text-sm font-medium text-slate-900">{almoxarifado.empresaNome || '—'}</dd>
											</div>
											<div>
												<dt className="text-xs text-slate-500 uppercase tracking-wider">Responsável</dt>
												<dd className="text-sm font-medium text-slate-900">{almoxarifado.responsavelNome || '—'}</dd>
											</div>
										</dl>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="estoque">
							<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
								<div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
									<h2 className="text-lg font-semibold text-slate-900">Produtos em Estoque</h2>
									<div className="flex items-center gap-2">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
											<input
												type="text"
												placeholder="Buscar produto..."
												value={searchEstoque}
												onChange={(e) => setSearchEstoque(e.target.value)}
												className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
											/>
										</div>
										<button
											onClick={() => setIsAddProductOpen(true)}
											className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white font-semibold rounded-md flex items-center gap-2 transition-colors"
										>
											<Plus size={18} />
											Adicionar
										</button>
									</div>
								</div>
								<table className="w-full text-left">
									<thead>
										<tr className="bg-[#f5f5f5]">
											<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Produto</th>
											<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Qtd</th>
											<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Mín</th>
											<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
											<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
											<th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Ações</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{filteredEstoque.length === 0 ? (
											<tr>
												<td colSpan={6} className="px-6 py-8 text-center text-slate-500">
													{searchEstoque ? 'Nenhum produto encontrado' : 'Nenhum produto em estoque'}
												</td>
											</tr>
										) : (
											filteredEstoque.map((item) => (
										<tr key={item.id} className="hover:bg-slate-50">
													<td className="px-4 py-3 text-sm font-medium text-slate-900">{item.produto_nome}</td>
													<td className="px-4 py-3 text-center">
														<span className="text-sm font-medium text-slate-900">{item.quantidade_total}</span>
														<span className="text-xs text-slate-500 ml-1">{item.produto_unidade}</span>
													</td>
													<td className="px-4 py-3 text-center text-sm text-slate-500">
														{item.necessita_gerenciar_minimo ? item.estoque_minimo : '—'}
													</td>
													<td className="px-4 py-3 text-right text-sm text-slate-500">
														{item.valor_venda ? `R$ ${item.valor_venda.toFixed(2)}` : '—'}
													</td>
													<td className="px-4 py-3 text-center">
														<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
															item.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
														}`}>
															{item.ativo ? 'Ativo' : 'Inativo'}
									</span>
													</td>
													<td className="px-4 py-3 text-center">
														<button
															onClick={() => handleRemoveEstoque(item.id)}
															className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
														>
															<MaterialIcon name="block" size={20} />
														</button>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>

			<Dialog open={isAddProductOpen} onOpenChange={(open) => !open && setIsAddProductOpen(false)}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Adicionar Produto ao Estoque</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Produto</label>
							<Select value={selectedProdutoId} onValueChange={setSelectedProdutoId}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Selecione um produto" />
								</SelectTrigger>
								<SelectContent>
									{produtos.filter(p => !estoqueItens.some(e => e.produto_id === p.id)).map(p => (
										<SelectItem key={p.id} value={String(p.id)}>{p.nome} ({p.codigo})</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Quantidade</label>
							<input
								type="number"
								min="1"
								value={novaQuantidade}
								onChange={(e) => setNovaQuantidade(Number(e.target.value))}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Valor de Venda (R$)</label>
							<input
								type="number"
								step="0.01"
								value={valorVenda}
								onChange={(e) => setValorVenda(e.target.value)}
								placeholder="Deixe vazio para usar preço do produto"
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
							/>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="gerenciarMinimo"
								checked={gerenciarMinimo}
								onChange={(e) => setGerenciarMinimo(e.target.checked)}
								className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
							/>
							<label htmlFor="gerenciarMinimo" className="text-sm text-slate-700">Gerenciar estoque mínimo</label>
						</div>
						{gerenciarMinimo && (
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Estoque Mínimo</label>
								<input
									type="number"
									min="0"
									value={estoqueMinimo}
									onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								/>
							</div>
						)}
						<button
							onClick={handleAddProduto}
							disabled={!selectedProdutoId}
							className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-md transition-colors"
						>
							Adicionar
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
