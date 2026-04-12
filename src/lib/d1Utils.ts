/** Converte 0/1 do SQLite para booleano na UI */
export function ativoFromDb(v: unknown): boolean {
	return v === 1 || v === true;
}

export function ativoToDb(b: boolean): number {
	return b ? 1 : 0;
}

/** Exibe data YYYY-MM-DD (ou ISO) em pt-BR */
export function formatDbDate(value: string | null | undefined): string {
	if (value == null || value === '') return '—';
	const s = String(value).trim();
	const ymd = s.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
		const [y, m, d] = ymd.split('-').map(Number);
		return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
	}
	const t = Date.parse(s);
	return Number.isNaN(t) ? s : new Date(t).toLocaleDateString('pt-BR');
}

export function todayISODate(): string {
	return new Date().toISOString().slice(0, 10);
}
