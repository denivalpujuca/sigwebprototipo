import * as React from 'react';

const DEFAULT_API = 'https://sigweb-api.denival.workers.dev';

export const getApiBase = (): string =>
	(typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.trim() !== ''
		? import.meta.env.VITE_API_URL.trim()
		: DEFAULT_API).replace(/\/$/, '');

async function parseError(res: Response): Promise<string> {
	try {
		const j = (await res.json()) as { error?: string };
		if (j && typeof j.error === 'string') return j.error;
	} catch {
		/* ignore */
	}
	return `HTTP ${res.status}`;
}

export const api = {
	async list<T>(table: string): Promise<T[]> {
		const res = await fetch(`${getApiBase()}/api/${table}`);
		if (!res.ok) throw new Error(await parseError(res));
		const data: unknown = await res.json();
		return Array.isArray(data) ? (data as T[]) : [];
	},

	async get<T>(table: string, id: number): Promise<T | null> {
		const res = await fetch(`${getApiBase()}/api/${table}/${id}`);
		if (res.status === 404) return null;
		if (!res.ok) throw new Error(await parseError(res));
		return (await res.json()) as T;
	},

	async getUrl<T>(url: string): Promise<T[]> {
		const res = await fetch(`${getApiBase()}${url}`);
		if (!res.ok) throw new Error(await parseError(res));
		const data: unknown = await res.json();
		return Array.isArray(data) ? (data as T[]) : [];
	},

	async create<T>(table: string, payload: Record<string, unknown>): Promise<T> {
		const res = await fetch(`${getApiBase()}/api/${table}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) throw new Error(await parseError(res));
		return (await res.json()) as T;
	},

	async update<T>(table: string, id: number, payload: Record<string, unknown>): Promise<T> {
		const url = `${getApiBase()}/api/${table}/${id}`;
		console.log('API UPDATE:', url, 'payload:', payload);
		const res = await fetch(url, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		console.log('API UPDATE response status:', res.status);
		const result = await res.json();
		console.log('API UPDATE response:', result);
		if (!res.ok) throw new Error(await parseError(res));
		return result as T;
	},

	async delete(table: string, id: number): Promise<void> {
		const res = await fetch(`${getApiBase()}/api/${table}/${id}`, { method: 'DELETE' });
		if (!res.ok && res.status !== 404) throw new Error(await parseError(res));
	},

	async search<T>(table: string, field: string, value: unknown): Promise<T[]> {
		const res = await fetch(`${getApiBase()}/api/${table}/search`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ field, value }),
		});
		if (!res.ok) throw new Error(await parseError(res));
		const data: unknown = await res.json();
		return Array.isArray(data) ? (data as T[]) : [];
	},
};

export const useData = <T>(table: string) => {
	const [data, setData] = React.useState<T[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchData = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await api.list<T>(table);
			setData(result);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
		} finally {
			setLoading(false);
		}
	}, [table]);

	React.useEffect(() => {
		void fetchData();
	}, [fetchData]);

	return { data, loading, error, refetch: fetchData };
};
