import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { api } from '../lib/api';
import { formatDbDate } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Conta {
	id: number;
	descricao: string;
	cliente: string;
	valor: number;
	dataVencimento: string;
	status: 'pendente' | 'recebido' | 'atrasado';
}

function mapConta(r: Record<string, unknown>): Conta {
	const st = String(r.status ?? 'pendente');
	return {
		id: Number(r.id),
		descricao: String(r.descricao ?? ''),
		cliente: String(r.cliente ?? ''),
		valor: Number(r.valor ?? 0),
		dataVencimento: String(r.data_vencimento ?? '').slice(0, 10),
		status: st === 'recebido' || st === 'atrasado' ? st : 'pendente',
	};
}

interface ContasReceberProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const ContasReceberPage: React.FC<ContasReceberProps> = () => {
	const { toast, confirm } = useAppFeedback();
	const [contas, setContas] = useState<Conta[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('contas_receber');
			setContas(raw.map(mapConta));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar contas');
			setContas([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	const filteredContas = useMemo(() => {
		return contas.filter(
			(c) =>
				c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.cliente.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [contas, searchTerm]);

	const paginatedContas = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredContas.slice(start, start + itemsPerPage);
	}, [filteredContas, currentPage]);

	const totalPages = Math.ceil(filteredContas.length / itemsPerPage) || 1;

	const handleToggle = async (id: number) => {
		const c = contas.find((x) => x.id === id);
		if (!c) return;
		const order: Conta['status'][] = ['pendente', 'recebido', 'atrasado'];
		const next = order[(order.indexOf(c.status) + 1) % order.length];
		try {
			const updated = await api.update<Record<string, unknown>>('contas_receber', id, {
				descricao: c.descricao,
				cliente: c.cliente,
				valor: c.valor,
				data_vencimento: c.dataVencimento,
				status: next,
			});
			setContas((prev) => prev.map((x) => (x.id === id ? mapConta(updated) : x)));
			toast.success('Status da conta atualizado.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar status');
		}
	};

	const handleDelete = async (id: number) => {
		const ok = await confirm({
			title: 'Excluir conta a receber?',
			description: 'Deseja realmente excluir este registro? Esta ação não pode ser desfeita.',
		});
		if (!ok) return;
		try {
			await api.delete('contas_receber', id);
			setContas((prev) => prev.filter((x) => x.id !== id));
			toast.destructive('Conta a receber excluída.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
		}
	};

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Financeiro</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Contas a Receber</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Contas a Receber
				</h1>
				<p className="text-slate-500 text-sm">Gerenciamento de contas a receber (D1).</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar conta"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
						/>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-[#f5f5f5]">
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vencimento</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={7} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedContas.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedContas.map((conta) => (
									<tr key={conta.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{conta.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{conta.descricao}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{conta.cliente}</td>
										<td className="px-4 py-4 text-sm text-right font-medium text-slate-900">R$ {conta.valor.toLocaleString('pt-BR')}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{formatDbDate(conta.dataVencimento)}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${conta.status === 'recebido' ? 'bg-emerald-100 text-emerald-700' : conta.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
											>
												{conta.status}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button
													type="button"
													onClick={() => void handleToggle(conta.id)}
													className={`p-1.5 transition-colors ${conta.status === 'pendente' ? 'text-slate-500 hover:text-emerald-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={conta.status === 'pendente' ? 'block' : 'check'} size={20} />
												</button>
												<button
													type="button"
													onClick={() => void handleDelete(conta.id)}
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
						Exibindo {paginatedContas.length} de {filteredContas.length} registros
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
		</>
	);

	return <>{content}</>;
};
