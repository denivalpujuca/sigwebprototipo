import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/Icon';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';
import { useEmpresa } from '@/context/EmpresaContext';

interface Usuario {
	id: number;
	nome: string;
	email: string;
	tipo_usuario: string;
	ativo: number;
}

interface Empresa {
	id: number;
	nome: string;
	ativo: number;
}

interface Almoxarifado {
	id: number;
	nome: string;
	empresa_id: number;
	ativo: number;
}

interface UsuarioPermissao {
	id: number;
	usuario_id: number;
	empresa_id: number;
	almoxarifado_id: number | null;
	nivel_acesso: string;
	ativo: number;
	usuario_nome?: string;
	empresa_nome?: string;
	almoxarifado_nome?: string;
}

export const UsuariosPermissoesPage: React.FC = () => {
	const { toast, confirm } = useAppFeedback();
	const { refreshData } = useEmpresa();
	const [permissoes, setPermissoes] = useState<UsuarioPermissao[]>([]);
	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [empresas, setEmpresas] = useState<Empresa[]>([]);
	const [almoxarifados, setAlmoxarifados] = useState<Almoxarifado[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingPermissao, setEditingPermissao] = useState<UsuarioPermissao | null>(null);
	const [formData, setFormData] = useState({
		usuarioId: '',
		empresaId: '',
		almoxarifadoId: '',
		nivelAcesso: 'padrao',
	});
	const [searchTerm, setSearchTerm] = useState('');

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [permissoesRaw, usuariosRaw, empresasRaw, almoxarifadosRaw] = await Promise.all([
				api.list<UsuarioPermissao>('usuarios_permissoes'),
				api.list<Usuario>('usuarios'),
				api.list<Empresa>('empresas'),
				api.list<Almoxarifado>('almoxarifados'),
			]);
			setPermissoes(permissoesRaw || []);
			setUsuarios((usuariosRaw || []).filter((u: Usuario) => u.ativo === 1));
			setEmpresas((empresasRaw || []).filter((e: Empresa) => e.ativo === 1));
			setAlmoxarifados((almoxarifadosRaw || []).filter((a: Almoxarifado) => a.ativo === 1));
		} catch (e) {
			console.error('Erro ao carregar:', e);
			toast.error('Erro ao carregar permissões');
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const filtered = permissoes.filter((p) =>
		p.usuario_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		p.empresa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		p.almoxarifado_nome?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleOpenModal = (permissao?: UsuarioPermissao) => {
		if (permissao) {
			setEditingPermissao(permissao);
			setFormData({
				usuarioId: String(permissao.usuario_id),
				empresaId: String(permissao.empresa_id),
				almoxarifadoId: permissao.almoxarifado_id ? String(permissao.almoxarifado_id) : '__all__',
				nivelAcesso: permissao.nivel_acesso,
			});
		} else {
			setEditingPermissao(null);
			setFormData({ usuarioId: '', empresaId: '', almoxarifadoId: '__all__', nivelAcesso: 'padrao' });
		}
		setIsModalOpen(true);
	};

	const handleSave = async () => {
		if (!formData.usuarioId || !formData.empresaId) {
			toast.error('Selecione usuário e empresa');
			return;
		}

		try {
			const payload: Record<string, unknown> = {
				usuario_id: Number(formData.usuarioId),
				empresa_id: Number(formData.empresaId),
				nivel_acesso: formData.nivelAcesso,
				ativo: 1,
			};

			if (formData.almoxarifadoId && formData.almoxarifadoId !== '__all__') {
				payload.almoxarifado_id = Number(formData.almoxarifadoId);
			}

			if (editingPermissao) {
				await api.update<Record<string, unknown>>('usuarios_permissoes', editingPermissao.id, payload);
				toast.success('Permissão atualizada');
			} else {
				await api.create<Record<string, unknown>>('usuarios_permissoes', payload);
				toast.success('Permissão criada');
			}

			setIsModalOpen(false);
			void loadData();
			void refreshData();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleDelete = async (id: number) => {
		const ok = await confirm({
			title: 'Excluir permissão?',
			description: 'Deseja realmente excluir esta permissão?',
			confirmLabel: 'Sim, excluir',
		});
		if (!ok) return;

		try {
			await api.delete('usuarios_permissoes', id);
			toast.success('Permissão removida');
			void loadData();
			void refreshData();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Erro ao remover');
		}
	};

	const almoxarifadosPorEmpresa = almoxarifados.filter(
		(a) => !formData.empresaId || a.empresa_id === Number(formData.empresaId)
	);

	return (
		<div>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<Link to="/" className="hover:text-emerald-600">Página Inicial</Link>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Permissões de Usuários</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Permissões de Usuários</h1>
				<p className="text-slate-500 text-sm">Gerenciar acesso de usuários por empresa e almoxarifado</p>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="flex-1 flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Pesquisar..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2"
				>
					<Plus size={20} />
					Nova Permissão
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<table className="w-full text-left">
					<thead>
						<tr className="bg-[#f5f5f5]">
							<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">Usuário</th>
							<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">Empresa</th>
							<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">Almoxarifado</th>
							<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">Nível</th>
							<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center w-24">Ações</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{loading ? (
							<tr>
								<td colSpan={5} className="px-6 py-8 text-center text-slate-500">Carregando...</td>
							</tr>
						) : filtered.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhuma permissão encontrada</td>
							</tr>
						) : (
							filtered.map((p) => (
								<tr key={p.id} className="hover:bg-slate-50">
									<td className="px-4 py-4 text-sm font-medium text-slate-900">{p.usuario_nome || '—'}</td>
									<td className="px-4 py-4 text-sm text-slate-500">{p.empresa_nome || '—'}</td>
									<td className="px-4 py-4 text-sm text-slate-500">{p.almoxarifado_nome || 'Todos da empresa'}</td>
									<td className="px-4 py-4">
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${
											p.nivel_acesso === 'admin' ? 'bg-purple-100 text-purple-700' :
											p.nivel_acesso === 'padrao' ? 'bg-blue-100 text-blue-700' :
											'bg-slate-100 text-slate-700'
										}`}>
											{p.nivel_acesso === 'admin' ? 'Admin' : p.nivel_acesso === 'padrao' ? 'Padrão' : 'Leitura'}
										</span>
									</td>
									<td className="px-4 py-4 text-center">
										<button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:text-red-700">
											<Trash2 size={18} />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>{editingPermissao ? 'Editar' : 'Nova Permissão'}</SheetTitle>
					</SheetHeader>
					<div className="space-y-4 mt-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
							<Select value={formData.usuarioId} onValueChange={(v) => setFormData({ ...formData, usuarioId: v })}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione" />
								</SelectTrigger>
								<SelectContent>
									{usuarios.map((u) => (
										<SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
							<Select value={formData.empresaId} onValueChange={(v) => setFormData({ ...formData, empresaId: v, almoxarifadoId: '' })}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione" />
								</SelectTrigger>
								<SelectContent>
									{empresas.map((e) => (
										<SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Almoxarifado (opcional)</label>
							<Select value={formData.almoxarifadoId || '__all__'} onValueChange={(v) => setFormData({ ...formData, almoxarifadoId: v === '__all__' ? '' : v })}>
								<SelectTrigger>
									<SelectValue placeholder="Todos da empresa" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__all__">Todos da empresa</SelectItem>
									{almoxarifadosPorEmpresa.map((a) => (
										<SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Nível</label>
							<Select value={formData.nivelAcesso} onValueChange={(v) => setFormData({ ...formData, nivelAcesso: v })}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="leitura">Leitura</SelectItem>
									<SelectItem value="padrao">Padrão</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-2 pt-4">
							<button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md">
								Cancelar
							</button>
							<button onClick={() => void handleSave()} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
								{editingPermissao ? 'Salvar' : 'Criar'}
							</button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
};
