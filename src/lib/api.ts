const API_BASE = import.meta.env.VITE_API_URL || 'https://sigweb-api.YOUR_SUBDOMAIN.workers.dev';

const getAuthHeader = () => {
  const token = localStorage.getItem('api_token') || import.meta.env.VITE_API_KEY;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  async list<T>(table: string): Promise<T[]> {
    const res = await fetch(`${API_BASE}/api/${table}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ data: T[] }>(res);
    return data.data;
  },

  async get<T>(table: string, id: number): Promise<T | null> {
    const res = await fetch(`${API_BASE}/api/${table}/${id}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ data: T }>(res);
    return data.data;
  },

  async create<T>(table: string, payload: Partial<T>): Promise<{ success: boolean; id: number }> {
    const res = await fetch(`${API_BASE}/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async update<T>(table: string, id: number, payload: Partial<T>): Promise<{ success: boolean; changes: number }> {
    const res = await fetch(`${API_BASE}/api/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async delete(table: string, id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/${table}/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async search<T>(table: string, field: string, value: string): Promise<T[]> {
    const res = await fetch(`${API_BASE}/api/${table}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ field, value }),
    });
    const data = await handleResponse<{ data: T[] }>(res);
    return data.data;
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
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};