import * as React from 'react';
import { api } from '@/lib/api';

export interface Empresa {
	id: number;
	nome: string;
	cnpj?: string;
	email?: string;
	telefone?: string;
	ativo: number;
}

export interface Almoxarifado {
	id: number;
	nome: string;
	localizacao?: string;
	empresa_id: number;
	empresa_nome?: string;
	ativo: number;
	nivel_acesso?: string;
}

export interface ModuloSistema {
	id: number;
	codigo: string;
	nome: string;
	icone?: string;
	ordem: number;
	nivel_acesso?: string;
}

export interface UsuarioPermissao {
	id: number;
	usuario_id: number;
	empresa_id: number;
	almoxarifado_id: number | null;
	nivel_acesso: 'admin' | 'padrao' | 'leitura';
	ativo: number;
	usuario_nome?: string;
	empresa_nome?: string;
	almoxarifado_nome?: string;
}

type EmpresaContextValue = {
	empresas: Empresa[];
	empresaSelecionada: Empresa | null;
	almoxarifadosPermitidos: Almoxarifado[];
	modulosPermitidos: ModuloSistema[];
	isAdmin: boolean;
	isLoading: boolean;
	setEmpresaSelecionada: (empresa: Empresa | null) => void;
	refreshData: () => Promise<void>;
	hasAccess: (almoxarifadoId: number, nivel?: 'admin' | 'padrao' | 'leitura') => boolean;
	hasModuleAccess: (moduloCodigo: string, nivel?: 'admin' | 'padrao' | 'leitura') => boolean;
};

const EmpresaContext = React.createContext<EmpresaContextValue | null>(null);

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
	const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
	const [empresaSelecionada, setEmpresaSelecionadaState] = React.useState<Empresa | null>(null);
	const [almoxarifadosPermitidos, setAlmoxarifadosPermitidos] = React.useState<Almoxarifado[]>([]);
	const [modulosPermitidos, setModulosPermitidos] = React.useState<ModuloSistema[]>([]);
	const [isAdmin, setIsAdmin] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(true);

	const usuarioId = React.useMemo(() => {
		const stored = localStorage.getItem('usuario_id');
		return stored ? Number(stored) : null;
	}, []);

	const refreshData = React.useCallback(async () => {
		if (!usuarioId) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const [empresasData, permissoesData, usuarioData, modulosRaw] = await Promise.all([
				api.list<Empresa>('empresas'),
				api.list<UsuarioPermissao>('usuarios_permissoes').catch(() => []),
				api.get<{ tipo: string }>('usuarios', usuarioId).catch(() => null),
				api.getUrl<ModuloSistema>(`/api/usuario_modulos/${usuarioId}`).catch(() => []),
			]);

			const adminStatus = usuarioData?.tipo === 'Administrador' || usuarioData?.tipo === 'admin';
			setIsAdmin(adminStatus);

			const permissoesUsuario = permissoesData.filter(p => p.usuario_id === usuarioId);

			if (adminStatus) {
				setEmpresas(empresasData.filter(e => e.ativo === 1));
				
				const allAlmox = await api.list<Almoxarifado>('almoxarifados');
				setAlmoxarifadosPermitidos(allAlmox.filter(a => a.ativo === 1).map(a => ({ ...a, nivel_acesso: 'admin' })));
				
				const modulosArray = Array.isArray(modulosRaw) ? modulosRaw : [];
				setModulosPermitidos((modulosArray as ModuloSistema[]).map((m) => ({ ...m, nivel_acesso: 'admin' as const })));
			} else {
				const empresasPermitidas = empresasData.filter(e => 
					e.ativo === 1 && permissoesUsuario.some(p => p.empresa_id === e.id)
				);
				setEmpresas(empresasPermitidas);

				const almoxarifadosData = await api.list<Almoxarifado>('almoxarifados');
				
				const almoxarifadosComPermissao = almoxarifadosData
					.filter(a => a.ativo === 1)
					.map(a => {
						const permsDaEmpresa = permissoesUsuario.filter(p => p.empresa_id === a.empresa_id);
						const permGeral = permsDaEmpresa.find(p => p.almoxarifado_id === null);
						const permEspecifica = permsDaEmpresa.find(p => p.almoxarifado_id === a.id);
						
						let nivelAcesso = 'leitura';
						if (permGeral) {
							nivelAcesso = permGeral.nivel_acesso;
						} else if (permEspecifica) {
							nivelAcesso = permEspecifica.nivel_acesso;
						}
						
						return { ...a, nivel_acesso: nivelAcesso };
					})
					.filter(a => {
						const permsDaEmpresa = permissoesUsuario.filter(p => p.empresa_id === a.empresa_id);
						return permsDaEmpresa.some(p => p.almoxarifado_id === null || p.almoxarifado_id === a.id);
					});

				setAlmoxarifadosPermitidos(almoxarifadosComPermissao);
				
				const modulosArray = Array.isArray(modulosRaw) ? modulosRaw : [];
				setModulosPermitidos((modulosArray as ModuloSistema[]).map((m) => ({
					...m,
					nivel_acesso: m.nivel_acesso || 'leitura',
				})));
			}

			const storedEmpresaId = localStorage.getItem('empresa_selecionada_id');
			if (storedEmpresaId) {
				const storedEmpresa = empresasData.find(e => e.id === Number(storedEmpresaId));
				if (storedEmpresa) {
					setEmpresaSelecionadaState(storedEmpresa);
				}
			}
		} catch (err) {
			console.error('Erro ao carregar dados de empresa:', err);
		} finally {
			setIsLoading(false);
		}
	}, [usuarioId]);

	React.useEffect(() => {
		void refreshData();
	}, [refreshData]);

	const setEmpresaSelecionada = React.useCallback((empresa: Empresa | null) => {
		setEmpresaSelecionadaState(empresa);
		if (empresa) {
			localStorage.setItem('empresa_selecionada_id', String(empresa.id));
		} else {
			localStorage.removeItem('empresa_selecionada_id');
		}
	}, []);

	const hasAccess = React.useCallback((almoxarifadoId: number, nivel: 'admin' | 'padrao' | 'leitura' = 'leitura'): boolean => {
		if (isAdmin) return true;
		
		const almoxarifado = almoxarifadosPermitidos.find(a => a.id === almoxarifadoId);
		if (!almoxarifado) return false;

		const nivelMap = { 'leitura': 1, 'padrao': 2, 'admin': 3 };
		const userNivel = nivelMap[almoxarifado.nivel_acesso as keyof typeof nivelMap] || 0;
		const requiredNivel = nivelMap[nivel];
		
		return userNivel >= requiredNivel;
	}, [isAdmin, almoxarifadosPermitidos]);

	const hasModuleAccess = React.useCallback((moduloCodigo: string, nivel: 'admin' | 'padrao' | 'leitura' = 'leitura'): boolean => {
		if (isAdmin) return true;
		
		const modulo = modulosPermitidos.find(m => m.codigo === moduloCodigo);
		if (!modulo) return false;

		const nivelMap = { 'leitura': 1, 'padrao': 2, 'admin': 3 };
		const userNivel = nivelMap[modulo.nivel_acesso as keyof typeof nivelMap] || 0;
		const requiredNivel = nivelMap[nivel];
		
		return userNivel >= requiredNivel;
	}, [isAdmin, modulosPermitidos]);

	const value = React.useMemo(() => ({
		empresas,
		empresaSelecionada,
		almoxarifadosPermitidos,
		modulosPermitidos,
		isAdmin,
		isLoading,
		setEmpresaSelecionada,
		refreshData,
		hasAccess,
		hasModuleAccess,
	}), [empresas, empresaSelecionada, almoxarifadosPermitidos, modulosPermitidos, isAdmin, isLoading, setEmpresaSelecionada, refreshData, hasAccess, hasModuleAccess]);

	return (
		<EmpresaContext.Provider value={value}>
			{children}
		</EmpresaContext.Provider>
	);
}

export function useEmpresa() {
	const context = React.useContext(EmpresaContext);
	if (!context) {
		throw new Error('useEmpresa must be used within EmpresaProvider');
	}
	return context;
}
