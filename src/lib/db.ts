import { api } from './api';

/** Lista registros de uma tabela (mesmo contrato do worker: array JSON). */
export async function fetchFromAPI<T = Record<string, unknown>>(table: string): Promise<T[]> {
	try {
		return await api.list<T>(table);
	} catch {
		return [];
	}
}

export const dataSources = {
	vehicles: () => fetchFromAPI('vehicles'),
	servicos: () => fetchFromAPI('servicos'),
	ordens_servico: () => fetchFromAPI('ordens_servico'),
	usuarios: () => fetchFromAPI('usuarios'),
	clientes: () => fetchFromAPI('clientes'),
	contas_pagar: () => fetchFromAPI('contas_pagar'),
};
