import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Vehicle {
	id: number;
	nome: string;
	placa: string;
	chassi: string;
	volume: number;
	marca: string;
	modelo: string;
	tipo: string;
	ativo: boolean;
}

function mapVehicle(v: Record<string, unknown>): Vehicle {
	return {
		id: Number(v.id),
		nome: String(v.nome ?? ''),
		placa: String(v.placa ?? ''),
		chassi: String(v.chassi ?? ''),
		volume: Number(v.volume ?? 0),
		marca: String(v.marca ?? ''),
		modelo: String(v.modelo ?? ''),
		tipo: String(v.tipo ?? ''),
		ativo: ativoFromDb(v.ativo),
	};
}

interface VehiclesPageProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = () => {
	const { toast, confirm } = useAppFeedback();
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('vehicles');
			setVehicles(raw.map(mapVehicle));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar veículos');
			setVehicles([]);
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
	const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
	const [formData, setFormData] = useState({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '' });
	const itemsPerPage = 5;

	const filteredVehicles = useMemo(() => {
		return vehicles.filter(
			(vehicle) =>
				vehicle.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
				vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [vehicles, searchTerm]);

	const paginatedVehicles = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredVehicles.slice(start, start + itemsPerPage);
	}, [filteredVehicles, currentPage]);

	const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;

	const handleSave = async () => {
		try {
			if (editingVehicle) {
				const updated = await api.update<Record<string, unknown>>('vehicles', editingVehicle.id, {
					nome: formData.nome,
					placa: formData.placa,
					chassi: formData.chassi,
					volume: formData.volume,
					marca: formData.marca,
					modelo: formData.modelo,
					tipo: formData.tipo,
					ativo: ativoToDb(editingVehicle.ativo),
				});
				setVehicles((prev) => prev.map((v) => (v.id === editingVehicle.id ? mapVehicle(updated) : v)));
			} else {
				const created = await api.create<Record<string, unknown>>('vehicles', {
					nome: formData.nome,
					placa: formData.placa,
					chassi: formData.chassi,
					volume: formData.volume,
					marca: formData.marca,
					modelo: formData.modelo,
					tipo: formData.tipo,
					ativo: 1,
				});
				setVehicles((prev) => [...prev, mapVehicle(created)]);
			}
			setIsModalOpen(false);
			setEditingVehicle(null);
			setFormData({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '' });
			toast.success(editingVehicle ? 'Veículo atualizado com sucesso.' : 'Veículo cadastrado com sucesso.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar veículo');
		}
	};

	const handleEdit = (vehicle: Vehicle) => {
		setEditingVehicle(vehicle);
		setFormData({
			nome: vehicle.nome,
			placa: vehicle.placa,
			chassi: vehicle.chassi,
			volume: vehicle.volume,
			marca: vehicle.marca,
			modelo: vehicle.modelo,
			tipo: vehicle.tipo,
		});
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const v = vehicles.find((x) => x.id === id);
		if (!v) return;
		try {
			const updated = await api.update<Record<string, unknown>>('vehicles', id, {
				ativo: ativoToDb(!v.ativo),
			});
			setVehicles((prev) => prev.map((x) => (x.id === id ? mapVehicle(updated) : x)));
			toast.success('Status do veículo atualizado.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar status');
		}
	};

	const handleDelete = async (id: number) => {
		const ok = await confirm({
			title: 'Excluir veículo?',
			description: 'Deseja realmente excluir este registro? Esta ação não pode ser desfeita.',
		});
		if (!ok) return;
		try {
			await api.delete('vehicles', id);
			setVehicles((prev) => prev.filter((x) => x.id !== id));
			toast.destructive('Veículo excluído.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
		}
	};

	const handleAdd = () => {
		setEditingVehicle(null);
		setFormData({ nome: '', placa: '', chassi: '', volume: 0, marca: '', modelo: '', tipo: '' });
		setIsModalOpen(true);
	};

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Frota</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Veículos e Máquinas</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Veículos e Máquinas
				</h1>
				<p className="text-slate-500 text-sm">Cadastro e gerenciamento de veículos e máquinas.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar veículo"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
						/>
					</div>
				</div>
				<button
					onClick={handleAdd}
					className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors"
				>
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Placa</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Veículo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Chassi</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Volume</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Marca/Modelo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={8} className="px-6 py-8 text-center text-slate-500">
										Carregando…
									</td>
								</tr>
							) : paginatedVehicles.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedVehicles.map((vehicle) => (
									<tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{vehicle.id}</td>
										<td className="px-4 py-4 text-sm font-mono text-slate-900">{vehicle.placa}</td>
										<td className="px-4 py-4">
											<div className="flex flex-col">
												<span className="text-sm font-bold text-slate-900">{vehicle.nome}</span>
												<span className="text-[11px] text-slate-500">{vehicle.tipo}</span>
											</div>
										</td>
										<td className="px-4 py-4 text-sm text-slate-500">{vehicle.chassi}</td>
										<td className="px-4 py-4 text-center text-sm font-bold text-slate-900">{vehicle.volume.toLocaleString()}</td>
										<td className="px-4 py-4 text-sm text-slate-500">
											{vehicle.marca} {vehicle.modelo}
										</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${vehicle.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{vehicle.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button
													onClick={() => handleEdit(vehicle)}
													className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors"
												>
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(vehicle.id)}
													className={`p-1.5 transition-colors ${vehicle.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={vehicle.ativo ? 'block' : 'check'} size={20} />
												</button>
												<button
													type="button"
													onClick={() => void handleDelete(vehicle.id)}
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
				<div className="px-6 py-4 flex justify-between bg-[#f5f5f5]">
					<span className="text-xs text-slate-500 font-medium">
						Exibindo {paginatedVehicles.length} de {filteredVehicles.length} registros
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
						<SheetTitle>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</SheetTitle>
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
								<label className="block text-sm font-semibold text-slate-700 mb-1">Placa</label>
								<input
									type="text"
									value={formData.placa}
									onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Volume (M³)</label>
								<input
									type="number"
									value={formData.volume}
									onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value, 10) || 0 })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Chassi</label>
							<input
								type="text"
								value={formData.chassi}
								onChange={(e) => setFormData({ ...formData, chassi: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Marca</label>
								<input
									type="text"
									value={formData.marca}
									onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1">Modelo</label>
								<input
									type="text"
									value={formData.modelo}
									onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
									className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
									required
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
							<input
								type="text"
								value={formData.tipo}
								onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
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
