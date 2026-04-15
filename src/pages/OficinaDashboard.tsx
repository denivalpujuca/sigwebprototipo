import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import { formatDbDate } from '../lib/d1Utils';

type UiStatus = 'aberta' | 'andamento' | 'concluida';

interface OS {
	id: number;
	veiculo: string;
	placa: string;
	tipo: string;
	dataLabel: string;
	status: UiStatus;
}

function mapOsRow(r: Record<string, unknown>): OS {
	const st = String(r.status ?? 'aberta');
	let status: UiStatus = 'aberta';
	if (st === 'concluida') status = 'concluida';
	else if (st === 'andamento' || st === 'esperando') status = 'andamento';
	const d = String(r.data ?? '').slice(0, 10);
	return {
		id: Number(r.id),
		veiculo: String(r.veiculo ?? ''),
		placa: String(r.placa ?? ''),
		tipo: String(r.servico ?? ''),
		dataLabel: formatDbDate(d),
		status,
	};
}

interface OficinaDashboardProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const OficinaDashboardPage: React.FC<OficinaDashboardProps> = () => {
	const [oss, setOss] = useState<OS[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('ordens_servico');
			setOss(raw.map(mapOsRow));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar OS');
			setOss([]);
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

	const filteredOSs = useMemo(() => {
		return oss.filter(
			(os) =>
				os.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
				os.placa.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [oss, searchTerm]);

	const paginatedOSs = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredOSs.slice(start, start + itemsPerPage);
	}, [filteredOSs, currentPage]);

	const totalPages = Math.ceil(filteredOSs.length / itemsPerPage) || 1;

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Oficina</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Dashboard</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Dashboard
				</h1>
				<p className="text-slate-500 text-sm">Ordens de serviço (D1). Alterações em Frota → Ordem de Serviço.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Pesquisar OS"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
						/>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-[#f5f5f5]">
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">OS</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Veículo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Placa</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Serviço</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedOSs.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedOSs.map((os) => (
									<tr key={os.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{os.id}</td>
										<td className="px-4 py-4 text-sm font-medium text-slate-900">{os.veiculo}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{os.placa}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{os.tipo}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{os.dataLabel}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold capitalize ${os.status === 'aberta' ? 'bg-yellow-100 text-yellow-700' : os.status === 'andamento' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
											>
												{os.status}
											</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<div className="px-6 py-4 flex items-center justify-between bg-[#f5f5f5]">
					<span className="text-xs text-slate-500 font-medium">
						Exibindo {paginatedOSs.length} de {filteredOSs.length} registros
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
