import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../components/Icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { api } from '../lib/api';
import { ativoFromDb, ativoToDb, formatDbDate } from '../lib/d1Utils';

interface Usuario {
	id: number;
	nome: string;
	email: string;
	cpf: string;
	tipoUsuario: string;
	ativo: boolean;
	ultimoAcesso: string | null;
}

function mapUsuario(r: Record<string, unknown>): Usuario {
	return {
		id: Number(r.id),
		nome: String(r.nome ?? ''),
		email: String(r.email ?? ''),
		cpf: String(r.cpf ?? ''),
		tipoUsuario: String(r.tipo_usuario ?? ''),
		ativo: ativoFromDb(r.ativo),
		ultimoAcesso: r.ultimo_acesso != null && String(r.ultimo_acesso) !== '' ? String(r.ultimo_acesso) : null,
	};
}

interface UsuariosPageProps {
	activeSection?: string;
	onSectionChange?: (section: string) => void;
}

export const UsuariosPage: React.FC<UsuariosPageProps> = () => {
	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const raw = await api.list<Record<string, unknown>>('usuarios');
			setUsuarios(raw.map(mapUsuario));
		} catch (e) {
			setLoadError(e instanceof Error ? e.message : 'Erro ao carregar usuários');
			setUsuarios([]);
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
	const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
	const [formData, setFormData] = useState({ nome: '', email: '', cpf: '', tipoUsuario: 'Operador' });
	const itemsPerPage = 5;

	const filteredUsuarios = useMemo(() => {
		return usuarios.filter(
			(u) =>
				u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				u.cpf.includes(searchTerm),
		);
	}, [usuarios, searchTerm]);

	const paginatedUsuarios = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredUsuarios.slice(start, start + itemsPerPage);
	}, [filteredUsuarios, currentPage]);

	const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage) || 1;

	const formatarUltimo = (s: string | null) => {
		if (!s) return 'Nunca';
		return formatDbDate(s);
	};

	const handleSave = async () => {
		try {
			const base = {
				nome: formData.nome,
				email: formData.email,
				cpf: formData.cpf,
				tipo_usuario: formData.tipoUsuario,
			};
			if (editingUsuario) {
				const updated = await api.update<Record<string, unknown>>('usuarios', editingUsuario.id, {
					...base,
					ativo: ativoToDb(editingUsuario.ativo),
				});
				setUsuarios((prev) => prev.map((u) => (u.id === editingUsuario.id ? mapUsuario(updated) : u)));
			} else {
				const created = await api.create<Record<string, unknown>>('usuarios', { ...base, ativo: 1 });
				setUsuarios((prev) => [...prev, mapUsuario(created)]);
			}
			setIsModalOpen(false);
			setEditingUsuario(null);
			setFormData({ nome: '', email: '', cpf: '', tipoUsuario: 'Operador' });
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao salvar usuário');
		}
	};

	const handleEdit = (usuario: Usuario) => {
		setEditingUsuario(usuario);
		setFormData({ nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, tipoUsuario: usuario.tipoUsuario });
		setIsModalOpen(true);
	};

	const handleToggle = async (id: number) => {
		const u = usuarios.find((x) => x.id === id);
		if (!u) return;
		try {
			const updated = await api.update<Record<string, unknown>>('usuarios', id, { ativo: ativoToDb(!u.ativo) });
			setUsuarios((prev) => prev.map((x) => (x.id === id ? mapUsuario(updated) : x)));
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Erro ao atualizar');
		}
	};

	const handleAdd = () => {
		setEditingUsuario(null);
		setFormData({ nome: '', email: '', cpf: '', tipoUsuario: 'Operador' });
		setIsModalOpen(true);
	};

	const content = (
		<>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<span className="hover:text-emerald-600 cursor-pointer">Página Inicial</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="hover:text-emerald-600 cursor-pointer">T.I.</span>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Usuários</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
					Usuários
				</h1>
				<p className="text-slate-500 text-sm">Gerenciamento de usuários do sistema.</p>
				{loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
						<input
							type="text"
							placeholder="Pesquisar usuário"
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
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cod</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nome</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">CPF</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Tipo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Último Acesso</th>
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
							) : paginatedUsuarios.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-8 text-center text-slate-500">
										Nenhum registro encontrado
									</td>
								</tr>
							) : (
								paginatedUsuarios.map((usuario) => (
									<tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-4 text-sm font-semibold text-slate-900">{usuario.id}</td>
										<td className="px-4 py-4 text-sm font-bold text-slate-900">{usuario.nome}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{usuario.email}</td>
										<td className="px-4 py-4 text-sm font-mono text-slate-900">{usuario.cpf}</td>
										<td className="px-4 py-4 text-center text-sm text-slate-900">{usuario.tipoUsuario}</td>
										<td className="px-4 py-4 text-sm text-slate-500">{formatarUltimo(usuario.ultimoAcesso)}</td>
										<td className="px-4 py-4 text-center">
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${usuario.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
											>
												{usuario.ativo ? 'Ativo' : 'Inativo'}
											</span>
										</td>
										<td className="px-4 py-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<button onClick={() => handleEdit(usuario)} className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
													<MaterialIcon name="edit" size={20} />
												</button>
												<button
													onClick={() => void handleToggle(usuario.id)}
													className={`p-1.5 transition-colors ${usuario.ativo ? 'text-slate-500 hover:text-red-600' : 'text-emerald-600 hover:opacity-70'}`}
												>
													<MaterialIcon name={usuario.ativo ? 'block' : 'check'} size={20} />
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
						Exibindo {paginatedUsuarios.length} de {filteredUsuarios.length} registros
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
						<SheetTitle>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</SheetTitle>
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
							<label className="block text-sm font-semibold text-slate-700 mb-1">CPF</label>
							<input
								type="text"
								value={formData.cpf}
								onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
								className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Usuário</label>
							<Select value={formData.tipoUsuario} onValueChange={(value) => setFormData({ ...formData, tipoUsuario: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Administrador">Administrador</SelectItem>
									<SelectItem value="Gerente">Gerente</SelectItem>
									<SelectItem value="Operador">Operador</SelectItem>
									<SelectItem value="Visualizador">Visualizador</SelectItem>
									<SelectItem value="Auditor">Auditor</SelectItem>
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
