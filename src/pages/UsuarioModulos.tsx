import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/Icon';
import { Search, Check, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '../lib/api';
import { useAppFeedback } from '@/context/AppFeedbackContext';

interface Usuario {
	id: number;
	nome: string;
	email: string;
	tipo_usuario: string;
	ativo: number;
}

interface Modulo {
	id: number;
	codigo: string;
	nome: string;
	icone?: string;
	nivel_acesso?: string;
}

export const UsuarioModulosPage: React.FC = () => {
	const { toast } = useAppFeedback();
	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [modulos, setModulos] = useState<Modulo[]>([]);
	const [permissoes, setPermissoes] = useState<Record<number, Record<number, string>>>({});
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [usuariosRaw, modulosRaw] = await Promise.all([
				api.list<Usuario>('usuarios'),
				api.list<Modulo>('modulos_sistema'),
			]);
			setUsuarios(usuariosRaw.filter((u: Usuario) => u.ativo === 1));
			setModulos(modulosRaw);
			
			const permissoesMap: Record<number, Record<number, string>> = {};
			for (const usuario of usuariosRaw) {
				const mods = await api.getUrl<Modulo[]>(`/api/usuario_modulos/${usuario.id}`).catch(() => []);
				const modsArray = Array.isArray(mods) ? mods.flat() : [];
				permissoesMap[usuario.id] = {};
				for (const m of modsArray) {
					if (m && typeof m === 'object' && 'id' in m) {
						permissoesMap[usuario.id][m.id as number] = (m as Modulo).nivel_acesso || 'leitura';
					}
				}
			}
			setPermissoes(permissoesMap);
		} catch (e) {
			console.error('Erro ao carregar:', e);
			toast.error('Erro ao carregar dados');
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleToggleModulo = async (usuarioId: number, moduloId: number, nivel: string) => {
		if (nivel === '__none__') {
			setPermissoes(prev => {
				const newState = { ...prev };
				if (newState[usuarioId]) {
					delete newState[usuarioId][moduloId];
				}
				return newState;
			});
			return;
		}
		try {
			await api.create('/api/usuario_modulos', {
				usuario_id: usuarioId,
				modulo_id: moduloId,
				nivel_acesso: nivel,
				ativo: 1,
			});
			setPermissoes(prev => ({
				...prev,
				[usuarioId]: {
					...prev[usuarioId],
					[moduloId]: nivel,
				},
			}));
			toast.success('Permissão atualizada');
		} catch (e) {
			console.error('Erro ao salvar:', e);
			toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
		}
	};

	const handleOpenModal = (usuario: Usuario) => {
		setUsuarioSelecionado(usuario);
		setIsModalOpen(true);
	};

	const filteredUsuarios = usuarios.filter(u =>
		u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
		u.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getNivelLabel = (nivel?: string) => {
		switch (nivel) {
			case 'admin': return 'Admin';
			case 'padrao': return 'Padrão';
			case 'leitura': return 'Leitura';
			default: return '—';
		}
	};

	return (
		<div>
			<nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
				<Link to="/" className="hover:text-emerald-600">Página Inicial</Link>
				<MaterialIcon name="arrow_right" size={14} />
				<span className="text-slate-900">Permissão de Módulos</span>
			</nav>

			<div className="mb-6">
				<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Permissão de Módulos</h1>
				<p className="text-slate-500 text-sm">Gerenciar acesso de usuários aos módulos do sistema</p>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
					<input
						type="text"
						placeholder="Pesquisar usuário..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-[#f5f5f5]">
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">Usuário</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">Tipo</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">Admin?</th>
								<th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center w-32">Ações</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td colSpan={4} className="px-6 py-8 text-center text-slate-500">Carregando...</td>
								</tr>
							) : filteredUsuarios.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado</td>
								</tr>
							) : (
								filteredUsuarios.map((u) => (
									<tr key={u.id} className="hover:bg-slate-50">
										<td className="px-4 py-4">
											<div className="font-medium text-slate-900">{u.nome}</div>
											<div className="text-sm text-slate-500">{u.email}</div>
										</td>
										<td className="px-4 py-4 text-center text-sm text-slate-500">{u.tipo_usuario}</td>
										<td className="px-4 py-4 text-center">
											{u.tipo_usuario === 'Administrador' ? (
												<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
													<Check size={12} className="mr-1" /> Sim
												</span>
											) : (
												<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
													<X size={12} className="mr-1" /> Não
												</span>
											)}
										</td>
										<td className="px-4 py-4 text-center">
											{u.tipo_usuario !== 'Administrador' && (
												<button
													onClick={() => handleOpenModal(u)}
													className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md"
												>
													Módulos
												</button>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
				<SheetContent className="sm:max-w-[500px]">
					<SheetHeader>
						<SheetTitle>Módulos de {usuarioSelecionado?.nome}</SheetTitle>
					</SheetHeader>
					<div className="space-y-3 mt-4">
						{modulos.map((modulo) => {
							const nivelAtual = permissoes[usuarioSelecionado?.id || 0]?.[modulo.id];
							return (
								<div key={modulo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
									<div>
										<div className="font-medium text-slate-900">{modulo.nome}</div>
										<div className="text-xs text-slate-500">Atual: {getNivelLabel(nivelAtual)}</div>
									</div>
									<Select
										value={nivelAtual || '__none__'}
										onValueChange={(v) => {
											if (usuarioSelecionado) {
												handleToggleModulo(usuarioSelecionado.id, modulo.id, v);
											}
										}}
									>
										<SelectTrigger className="w-28">
											<SelectValue placeholder="Sem acesso" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="__none__">Sem acesso</SelectItem>
											<SelectItem value="leitura">Leitura</SelectItem>
											<SelectItem value="padrao">Padrão</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>
							);
						})}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
};
