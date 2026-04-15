import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface ItemRequisicao {
	id: number;
	produto: string;
	unidade: string;
	quantidade: number;
}

interface Requisicao {
	id: number;
	almoxarifadoId: number;
	almoxarifadoNome: string;
	departamentoId: number;
	departamentoNome: string;
	solicitanteId: number;
	solicitanteNome: string;
	data: string;
	justificativa: string;
	status: string;
	itens: ItemRequisicao[];
}

function mapRequisicao(r: Record<string, unknown>, itens: ItemRequisicao[] = []): Requisicao {
	return {
		id: Number(r.id),
		almoxarifadoId: Number(r.almoxarifado_id) || 0,
		almoxarifadoNome: String(r.almoxarifado_nome || ''),
		departamentoId: Number(r.departamento_id) || 0,
		departamentoNome: String(r.departamento_nome || ''),
		solicitanteId: Number(r.solicitante_id) || 0,
		solicitanteNome: String(r.solicitante_nome || ''),
		data: r.data ? String(r.data).slice(0, 10) : '',
		justificativa: String(r.justificativa || ''),
		status: String(r.status || 'pendente'),
		itens,
	};
}

export const RequisicaoCompraProdutosPage: React.FC = () => {
	const { toast } = useAppFeedback();
	const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
	const [almoxarifados, setAlmoxarifados] = useState<{ id: number; nome: string }[]>([]);
	const [departamentos, setDepartamentos] = useState<{ id: number; nome: string }[]>([]);
	const [funcionarios, setFuncionarios] = useState<{ id: number; nome: string }[]>([]);
	const [produtos, setProdutos] = useState<{ id: number; nome: string; unidade: string }[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRequisicao, setEditingRequisicao] = useState<Requisicao | null>(null);
	const [produtoSearchTerm, setProdutoSearchTerm] = useState<string[]>([]);

	const [formData, setFormData] = useState({
		almoxarifadoId: '',
		departamentoId: '',
		solicitanteId: '',
		justificativa: '',
	});
	const [itens, setItens] = useState<{ produto: string; produtoId?: number; unidade: string; quantidade: string }[]>([]);

	const itemsPerPage = 5;

	const load = useCallback(async () => {
		try {
			const [raw, almoxRaw, deptRaw, funcRaw, prodRaw] = await Promise.all([
				api.list<Record<string, unknown>>('requisicoes_compra_produtos'),
				api.list<Record<string, unknown>>('almoxarifados'),
				api.list<Record<string, unknown>>('departamentos'),
				api.list<Record<string, unknown>>('funcionarios'),
				api.list<Record<string, unknown>>('produtos'),
			]);

			setAlmoxarifados(almoxRaw.map((a: Record<string, unknown>) => ({ id: Number(a.id), nome: String(a.nome) })));
			setDepartamentos(deptRaw.map((d: Record<string, unknown>) => ({ id: Number(d.id), nome: String(d.nome) })));
			setFuncionarios(funcRaw.map((f: Record<string, unknown>) => ({ id: Number(f.id), nome: String(f.nome) })));
			setProdutos(prodRaw.map((p: Record<string, unknown>) => ({ id: Number(p.id), nome: String(p.nome), unidade: String(p.unidade || '') })));

			const mappedRequisicoes = raw.map((r: Record<string, unknown>) => mapRequisicao(r));
			setRequisicoes(mappedRequisicoes);
		} catch (e) {
			setRequisicoes([]);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const filteredRequisicoes = useMemo(() => {
		return requisicoes.filter(req =>
			req.almoxarifadoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
			req.departamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
			req.solicitanteNome.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [requisicoes, searchTerm]);

	const paginatedRequisicoes = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredRequisicoes.slice(start, start + itemsPerPage);
	}, [filteredRequisicoes, currentPage]);

	const totalPages = Math.ceil(filteredRequisicoes.length / itemsPerPage) || 1;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pendente': return 'bg-amber-100 text-amber-700';
			case 'aprovado': return 'bg-blue-100 text-blue-700';
			case 'rejeitado': return 'bg-red-100 text-red-700';
			case 'comprado': return 'bg-green-100 text-green-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	};

	const handleAddItem = () => {
		setItens([...itens, { produto: '', unidade: '', quantidade: '' }]);
		setProdutoSearchTerm([...produtoSearchTerm, '']);
	};

	const handleRemoveItem = (index: number) => {
		setItens(itens.filter((_, i) => i !== index));
		setProdutoSearchTerm(produtoSearchTerm.filter((_, i) => i !== index));
	};

	const handleItemChange = (index: number, field: string, value: string) => {
		const newItens = [...itens];
		newItens[index] = { ...newItens[index], [field]: value };
		setItens(newItens);
	};

	const handleProdutoSelect = (index: number, produtoId: string, produtoNome: string, produtoUnidade: string) => {
		const newItens = [...itens];
		newItens[index] = { 
			...newItens[index], 
			produtoId: produtoId ? Number(produtoId) : undefined,
			produto: produtoNome,
			unidade: produtoUnidade || newItens[index].unidade
		};
		setItens(newItens);
		
		const newSearch = [...produtoSearchTerm];
		newSearch[index] = '';
		setProdutoSearchTerm(newSearch);
	};

	const handleNovoProduto = async (index: number, nome: string, unidade: string) => {
		try {
			const created = await api.create<Record<string, unknown>>('produtos', { nome, unidade, ativo: 1 });
			const novoProduto = (created as Record<string, unknown>);
			const prodId = Number(novoProduto.id);
			setProdutos([...produtos, { id: prodId, nome, unidade }]);
			const newItens = [...itens];
			newItens[index] = { ...newItens[index], produtoId: prodId, produto: nome, unidade };
			setItens(newItens);
			
			const newSearch = [...produtoSearchTerm];
			newSearch[index] = '';
			setProdutoSearchTerm(newSearch);
			
			toast.success('Produto adicionado ao catálogo');
		} catch (e) {
			toast.error('Erro ao criar produto');
		}
	};

	const handleOpenModal = (req?: Requisicao) => {
		if (req) {
			setEditingRequisicao(req);
			setFormData({
				almoxarifadoId: String(req.almoxarifadoId),
				departamentoId: String(req.departamentoId),
				solicitanteId: String(req.solicitanteId),
				justificativa: req.justificativa,
			});
			setItens(req.itens.map((i: ItemRequisicao) => ({ produto: i.produto, unidade: i.unidade, quantidade: String(i.quantidade) })));
			setProdutoSearchTerm(req.itens.map(() => ''));
		} else {
			setEditingRequisicao(null);
			setFormData({ almoxarifadoId: '', departamentoId: '', solicitanteId: '', justificativa: '' });
			setItens([]);
			setProdutoSearchTerm([]);
		}
		setIsModalOpen(true);
	};

	const handleSave = async () => {
		if (!formData.almoxarifadoId || !formData.departamentoId || !formData.solicitanteId) {
			toast.error('Preencha os campos obrigatórios');
			return;
		}

		if (itens.length === 0 || itens.some(i => !i.produto || !i.quantidade)) {
			toast.error('Adicione pelo menos um produto com quantidade');
			return;
		}

		try {
			const payload = {
				almoxarifado_id: Number(formData.almoxarifadoId),
				departamento_id: Number(formData.departamentoId),
				solicitante_id: Number(formData.solicitanteId),
				justificativa: formData.justificativa,
				data: new Date().toISOString().split('T')[0],
				status: 'pendente',
			};

			if (editingRequisicao) {
				await api.update<Record<string, unknown>>('requisicoes_compra_produtos', editingRequisicao.id, payload);
				
				const existingItens = await api.list<Record<string, unknown>>('itens_requisicao_compra_produtos');
				const toDelete = existingItens.filter((i: Record<string, unknown>) => i.requisicao_id === editingRequisicao.id);
				for (const item of toDelete) {
					await api.delete('itens_requisicao_compra_produtos', Number(item.id));
				}
				
				for (const item of itens) {
					await api.create<Record<string, unknown>>('itens_requisicao_compra_produtos', {
						requisicao_id: editingRequisicao.id,
						produto: item.produto,
						unidade: item.unidade || null,
						quantidade: Number(item.quantidade),
					});
				}
				toast.success('Requisição atualizada.');
			} else {
				const created = await api.create<Record<string, unknown>>('requisicoes_compra_produtos', payload);
				const reqId = (created as Record<string, unknown>).id || (created as unknown as { id: number }).id;

				for (const item of itens) {
					await api.create<Record<string, unknown>>('itens_requisicao_compra_produtos', {
						requisicao_id: reqId,
						produto: item.produto,
						unidade: item.unidade || null,
						quantidade: Number(item.quantidade),
					});
				}
				toast.success('Requisição criada.');
			}

			setIsModalOpen(false);
			void load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await api.delete('requisicoes_compra_produtos', id);
			toast.success('Requisição removida.');
			void load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao remover');
		}
	};

	return (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Suprimentos</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Requisição de Compra Produtos</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Requisição de Compra
				</h1>
				<p className="text-slate-500 text-sm">Solicitações de compra de produtos.</p>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Pesquisar requisição"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>
				<button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors">
					<Plus size={20} />
					Nova Requisição
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-[#f5f5f5]">
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-16">ID</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Almoxarifado</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Departamento</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Solicitante</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-24">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{paginatedRequisicoes.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedRequisicoes.map((req) => (
									<tr key={req.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm text-slate-500 text-center">{req.id}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{req.almoxarifadoNome || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{req.departamentoNome || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{req.solicitanteNome || '—'}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{req.data || '—'}</td>
										<td className="px-4 py-4 text-center">
											<span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(req.status)}`}>
												{req.status}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-1">
												<button onClick={() => handleOpenModal(req)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors" title="Editar">
													<MaterialIcon name="edit" size={18} />
												</button>
												<button onClick={() => handleDelete(req.id)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors" title="Excluir">
													<MaterialIcon name="delete" size={18} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{totalPages > 1 && (
					<div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
						<button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 disabled:opacity-50">
							Anterior
						</button>
						<span className="text-sm text-slate-500">{currentPage} / {totalPages}</span>
						<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm text-slate-600 hover:text-emerald-600 disabled:opacity-50">
							Próxima
						</button>
					</div>
				)}
			</div>

			<Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>{editingRequisicao ? 'Editar Requisição' : 'Nova Requisição'}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 mt-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Almoxarifado *</label>
								<Select value={formData.almoxarifadoId} onValueChange={(value) => setFormData({ ...formData, almoxarifadoId: value })}>
									<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
										<SelectValue placeholder="Selecione" />
									</SelectTrigger>
									<SelectContent>
										{almoxarifados.map(a => (
											<SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Departamento *</label>
								<Select value={formData.departamentoId} onValueChange={(value) => setFormData({ ...formData, departamentoId: value })}>
									<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
										<SelectValue placeholder="Selecione" />
									</SelectTrigger>
									<SelectContent>
										{departamentos.map(d => (
											<SelectItem key={d.id} value={String(d.id)}>{d.nome}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Solicitante *</label>
							<Select value={formData.solicitanteId} onValueChange={(value) => setFormData({ ...formData, solicitanteId: value })}>
								<SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-md">
									<SelectValue placeholder="Selecione" />
								</SelectTrigger>
								<SelectContent>
									{funcionarios.map(f => (
										<SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Justificativa</label>
							<textarea
								value={formData.justificativa}
								onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
								rows={2}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm"
								placeholder="Motivo da solicitação..."
							/>
						</div>

						<div className="border-t border-slate-200 pt-4">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-semibold text-slate-700">Produtos</h3>
								<button type="button" onClick={handleAddItem} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
									<Plus size={16} /> Adicionar produto
								</button>
							</div>
							<div className="space-y-2">
								{itens.map((item, index) => (
									<div key={index} className="flex gap-2 items-start">
										<div className="flex-1 relative">
											<input
												type="text"
												placeholder="Buscar produto..."
												value={item.produto || produtoSearchTerm[index] || ''}
												onChange={(e) => {
													handleItemChange(index, 'produto', e.target.value);
													const newSearch = [...produtoSearchTerm];
													newSearch[index] = e.target.value;
													setProdutoSearchTerm(newSearch);
												}}
												className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
											/>
											{produtoSearchTerm[index] && (
												<div className="absolute z-[150] w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-auto mt-1">
													{produtos.filter(p => p.nome.toLowerCase().includes(produtoSearchTerm[index].toLowerCase())).map(p => (
														<button
															key={p.id}
															type="button"
															onClick={() => {
																handleProdutoSelect(index, String(p.id), p.nome, p.unidade);
															}}
															className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
														>
															{p.nome} {p.unidade && `(${p.unidade})`}
														</button>
													))}
													<button
														type="button"
														onClick={() => {
															const nome = produtoSearchTerm[index];
															if (nome && confirm(`Criar novo produto "${nome}"?`)) {
																void handleNovoProduto(index, nome, '');
															}
														}}
														className="w-full px-3 py-2 text-left text-sm text-emerald-600 hover:bg-slate-50 border-t"
													>
														+ Criar "{produtoSearchTerm[index]}"
													</button>
												</div>
											)}
										</div>
										<input
											type="text"
											placeholder="Unidade"
											value={item.unidade}
											onChange={(e) => handleItemChange(index, 'unidade', e.target.value)}
											className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
										/>
										<input
											type="number"
											placeholder="Qtd"
											value={item.quantidade}
											onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
											className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
											required
											min="1"
										/>
										<button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:text-red-700">
											<Trash2 size={18} />
										</button>
									</div>
								))}
								{itens.length === 0 && (
									<p className="text-sm text-slate-500 text-center py-4">Nenhum produto adicionado</p>
								)}
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-4">
							<button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md">
								Cancelar
							</button>
							<button onClick={() => void handleSave()} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-md flex items-center gap-2">
								<Save size={16} />
								Salvar
							</button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};