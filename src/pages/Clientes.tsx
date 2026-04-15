import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb } from '../lib/d1Utils';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Cliente {
	id: number;
	nome: string;
	cpfCnpj: string;
	email: string;
	telefone: string;
	endereco: string;
	tipo: 'PF' | 'PJ';
	ativo: boolean;
}

function mapCliente(r: Record<string, unknown>): Cliente {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		cpfCnpj: String(r.cpf_cnpj ?? ''),
		email: String(r.email ?? ''),
		telefone: String(r.telefone ?? ''),
		endereco: String(r.endereco ?? ''),
		tipo: (r.tipo === 'PJ' ? 'PJ' : 'PF') as 'PF' | 'PJ',
		ativo: ativoFromDb(r.ativo),
	};
}

interface ClientesProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const ClientesPage: React.FC<ClientesProps> = () => {
	const { toast, confirm } = useAppFeedback();
	const [clientes, setClientes] = useState<Cliente[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('clientes');
			setClientes(raw.map(mapCliente));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar clientes');
			setClientes([]);
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
	const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
	const [formData, setFormData] = useState({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '', tipo: 'PF' as 'PF' | 'PJ' });
	const itemsPerPage = 5;

	const filteredClientes = useMemo(() => {
		return clientes.filter(
			(cliente) =>
				cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.cpfCnpj.includes(searchTerm),
		);
	}, [clientes, searchTerm]);

	const paginatedClientes = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredClientes.slice(start, start + itemsPerPage);
	}, [filteredClientes, currentPage]);

	const totalPages = Math.ceil(filteredClientes.length / itemsPerPage) || 1;

	const handleSave = async () => {
		try {
			const payload = {
				nome: formData.nome,
				cpf_cnpj: formData.cpfCnpj,
				email: formData.email,
				telefone: formData.telefone,
				endereco: formData.endereco,
				tipo: formData.tipo,
			};
			if (editingCliente) {
				const updated = await api.update<Record<string, unknown>>('clientes', editingCliente.id, {
					...payload,
					ativo: ativoToDb(editingCliente.ativo),
				});
				setClientes((prev) => prev.map((c) => (c.id === editingCliente.id ? mapCliente(updated) : c)));
			} else {
				const created = await api.create<Record<string, unknown>>('clientes', { ...payload, ativo: 1 });
				setClientes((prev) => [...prev, mapCliente(created)]);
			}
			setIsModalOpen(false);
			setEditingCliente(null);
			setFormData({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '', tipo: 'PF' });
			toast.success(editingCliente ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar cliente');
		}
	};

	const handleEdit = (cliente: Cliente) => {
		setEditingCliente(cliente);
		setFormData({
			nome: cliente.nome,
			cpfCnpj: cliente.cpfCnpj,
			email: cliente.email,
			telefone: cliente.telefone,
			endereco: cliente.endereco,
			tipo: cliente.tipo,
		});
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const c = clientes.find((x) => x.id === id);
		if (!c) return;
		try {
			const updated = await api.update<Record<string, unknown>>('clientes', id, { ativo: ativoToDb(!c.ativo) });
			setClientes((prev) => prev.map((x) => (x.id === id ? mapCliente(updated) : x)));
			toast.success('Status do cliente atualizado.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleDelete = async (id: number) => {
		const ok = await confirm({
			title: 'Excluir cliente?',
			description: 'Deseja realmente excluir este registro? Esta ação não pode ser desfeita.',
		});
		if (!ok) return;
		try {
			await api.delete('clientes', id);
			setClientes((prev) => prev.filter((x) => x.id !== id));
			toast.destructive('Cliente excluído.');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao excluir');
		}
	};

	const handleAdd = () => {
		setEditingCliente(null);
		setFormData({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '', tipo: 'PF' });
		setIsModalOpen(true);
	};

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">Administrativo</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Clientes</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Clientes
				</h1>
				<p className="text-slate-500 text-sm">Cadastro e gerenciamento de clientes.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Pesquisar cliente"
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-20">ID</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CPF/CNPJ</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Telefone</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-20">Tipo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center w-28">Status</th>
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
							) : paginatedClientes.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedClientes.map((cliente) => (
									<tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{cliente.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{cliente.nome}</td>
										<td className="px-4 py-4 text-sm font-mono text-slate-500">{cliente.cpfCnpj}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{cliente.email}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{cliente.telefone}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`text-xs font-bold px-2 py-1 rounded ${cliente.tipo === 'PF' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
											>
												{cliente.tipo}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${cliente.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{cliente.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => handleEdit(cliente)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(cliente.id)}
													className={`p-1.5 transition-colors ${cliente.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={cliente.ativo ? 'block' : 'check'} size={20} />
												</button>
												<button
													type="button"
													onClick={() => void handleDelete(cliente.id)}
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
						Exibindo {paginatedClientes.length} de {filteredClientes.length} registros
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
						<SheetTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</SheetTitle>
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
							<label className="block text-sm font-semibold text-slate-700 mb-1">CPF/CNPJ</label>
							<input
								type="text"
								value={formData.cpfCnpj}
								onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
							<input
								type="text"
								value={formData.telefone}
								onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Endereço</label>
							<input
								type="text"
								value={formData.endereco}
								onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
							<Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value as 'PF' | 'PJ' })}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PF">Pessoa Física</SelectItem>
									<SelectItem value="PJ">Pessoa Jurídica</SelectItem>
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
