import * as React from 'react';
import { api } from '@/lib/api';

export interface Notificacao {
	id: number;
	usuario_id: number;
	titulo: string;
	mensagem: string;
	tipo: 'info' | 'success' | 'warning' | 'error';
	lida: number;
	link: string | null;
	created_at: string;
}

interface NotificacaoContextValue {
	notificacoes: Notificacao[];
	unreadCount: number;
	loading: boolean;
	refresh: () => Promise<void>;
	marcarLida: (id: number) => Promise<void>;
	marcarTodasLidas: () => Promise<void>;
	createNotification: (data: Omit<Notificacao, 'id' | 'lida' | 'created_at'>) => Promise<void>;
}

const NotificacaoContext = React.createContext<NotificacaoContextValue | null>(null);

export function NotificacaoProvider({ children }: { children: React.ReactNode }) {
	const [notificacoes, setNotificacoes] = React.useState<Notificacao[]>([]);
	const [unreadCount, setUnreadCount] = React.useState(0);
	const [loading, setLoading] = React.useState(false);

	const usuarioId = React.useMemo(() => {
		const stored = localStorage.getItem('usuario_id');
		return stored ? Number(stored) : null;
	}, []);

	const refresh = React.useCallback(async () => {
		if (!usuarioId) {
			setNotificacoes([]);
			setUnreadCount(0);
			return;
		}

		setLoading(true);
		try {
			const [data, countData] = await Promise.all([
				api.getUrl<Notificacao>(`/api/notificacoes/${usuarioId}`),
				api.getUrl<{ count: number }>(`/api/notificacoes/${usuarioId}/count`),
			]);
			
			setNotificacoes(Array.isArray(data) ? data : []);
			const countResult = Array.isArray(countData) ? countData[0] : countData;
			setUnreadCount(countResult?.count || 0);
		} catch (err) {
			console.error('Erro ao carregar notificacoes:', err);
		} finally {
			setLoading(false);
		}
	}, [usuarioId]);

	React.useEffect(() => {
		void refresh();
		const interval = setInterval(() => {
			void refresh();
		}, 30000);
		return () => clearInterval(interval);
	}, [refresh]);

	const marcarLida = React.useCallback(async (id: number) => {
		try {
			await api.getUrl(`/api/notificacoes/${id}/lida`);
			setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: 1 } : n));
			setUnreadCount(prev => Math.max(0, prev - 1));
		} catch (err) {
			console.error('Erro ao marcar notificacao como lida:', err);
		}
	}, []);

	const marcarTodasLidas = React.useCallback(async () => {
		if (!usuarioId) return;
		try {
			await api.getUrl(`/api/notificacoes/${usuarioId}/marcar-todas-lidas`);
			setNotificacoes(prev => prev.map(n => ({ ...n, lida: 1 })));
			setUnreadCount(0);
		} catch (err) {
			console.error('Erro ao marcar todas notificacoes como lidas:', err);
		}
	}, [usuarioId]);

	const createNotification = React.useCallback(async (data: Omit<Notificacao, 'id' | 'lida' | 'created_at'>) => {
		try {
			await api.create('notificacoes', data);
			if (data.usuario_id === usuarioId) {
				void refresh();
			}
		} catch (err) {
			console.error('Erro ao criar notificacao:', err);
		}
	}, [usuarioId, refresh]);

	const value = React.useMemo(() => ({
		notificacoes,
		unreadCount,
		loading,
		refresh,
		marcarLida,
		marcarTodasLidas,
		createNotification,
	}), [notificacoes, unreadCount, loading, refresh, marcarLida, marcarTodasLidas, createNotification]);

	return (
		<NotificacaoContext.Provider value={value}>
			{children}
		</NotificacaoContext.Provider>
	);
}

export function useNotificacoes() {
	const context = React.useContext(NotificacaoContext);
	if (!context) {
		throw new Error('useNotificacoes must be used within NotificacaoProvider');
	}
	return context;
}
