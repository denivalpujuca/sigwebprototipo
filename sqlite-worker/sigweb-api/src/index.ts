import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

const ALLOWED_TABLES = new Set([
	"vehicles",
	"ordens_servico",
	"usuarios",
	"clientes",
	"funcionarios",
	"fornecedores",
	"empresas",
	"marcas",
	"modelos",
	"produtos",
	"servicos",
	"cargos",
	"tipos_usuario",
	"almoxarifados",
	"contratos",
	"orcamentos",
	"itens_orcamento",
	"requisicoes_compra",
	"residuos",
	"residuos_mtr",
	"contas_pagar",
	"contas_receber",
	"permissoes",
	"abastecimentos",
	"auditoria",
]);

const columnCache = new Map<string, Set<string>>();

/** Normaliza o retorno de `.all()` do D1 (objeto com `results` ou array direto). */
function extractAllRows(result: unknown): unknown[] {
	if (Array.isArray(result)) return result;
	if (result && typeof result === "object" && "results" in result) {
		const r = (result as { results: unknown }).results;
		if (Array.isArray(r)) return r;
	}
	return [];
}

/** PRAGMA table_info: linha como objeto `{ name }` ou tupla `[cid, name, type, ...]`. */
function pragmaRowColumnName(row: unknown): string | null {
	if (row == null) return null;
	if (Array.isArray(row)) {
		return typeof row[1] === "string" ? row[1] : null;
	}
	if (typeof row === "object") {
		const o = row as Record<string, unknown>;
		const v = o.name ?? o.NAME ?? o.Name;
		return typeof v === "string" && v.length > 0 ? v : null;
	}
	return null;
}

async function getColumns(db: D1Database, table: string): Promise<Set<string>> {
	const hit = columnCache.get(table);
	if (hit !== undefined && hit.size > 0) return hit;

	if (!/^[a-zA-Z0-9_]+$/.test(table)) {
		throw new HTTPException(400, { message: "Nome de tabela inválido" });
	}

	const raw = await db.prepare(`PRAGMA table_info(${table})`).all();
	const rows = extractAllRows(raw);
	const names = new Set<string>();
	for (const row of rows) {
		const col = pragmaRowColumnName(row);
		if (col) names.add(col);
	}

	if (names.size === 0) {
		throw new HTTPException(500, {
			message: `Não foi possível ler as colunas da tabela "${table}". Confirme se ela existe no D1 e se o schema foi aplicado (sql/schema.sql).`,
		});
	}

	columnCache.set(table, names);
	return names;
}

function assertTable(table: string): void {
	if (!ALLOWED_TABLES.has(table)) {
		throw new HTTPException(404, { message: `Tabela não permitida: ${table}` });
	}
}

function parseId(id: string): number {
	if (!/^\d+$/.test(id)) {
		throw new HTTPException(400, { message: "id deve ser numérico" });
	}
	return Number(id);
}

const app = new Hono<{ Bindings: Env }>();

app.use(
	"/api/*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type"],
	}),
);

app.post("/api/:table/search", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	let body: { field?: string; value?: unknown };
	try {
		body = await c.req.json();
	} catch {
		throw new HTTPException(400, { message: "JSON inválido" });
	}
	const field = body.field;
	if (typeof field !== "string" || !field) {
		throw new HTTPException(400, { message: "field é obrigatório" });
	}
	const columns = await getColumns(c.env.DB, table);
	if (!columns.has(field)) {
		throw new HTTPException(400, { message: `Coluna inválida: ${field}` });
	}
	const value = body.value ?? null;
	const quoted = `"${field.replace(/"/g, "")}"`;
	const stmt = c.env.DB.prepare(`SELECT * FROM ${table} WHERE ${quoted} = ?`).bind(value);
	const { results } = await stmt.all();
	return c.json(results);
});

app.get("/api/:table", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	const { results } = await c.env.DB.prepare(`SELECT * FROM ${table}`).all();
	return c.json(results);
});

app.get("/api/:table/:id", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	const id = parseId(c.req.param("id"));
	const row = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
	if (!row) {
		throw new HTTPException(404, { message: "Registro não encontrado" });
	}
	return c.json(row);
});

app.post("/api/:table", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	let body: Record<string, unknown>;
	try {
		body = await c.req.json();
	} catch {
		throw new HTTPException(400, { message: "JSON inválido" });
	}
	const columns = await getColumns(c.env.DB, table);
	const keys = Object.keys(body).filter((k) => columns.has(k) && k !== "id");
	if (keys.length === 0) {
		const received = Object.keys(body);
		const msg =
			received.length > 0
				? `Nenhuma coluna válida no corpo. Campos enviados: ${received.join(", ")}. Use os nomes das colunas do SQLite (snake_case), ex.: cpf_cnpj, marca_id, tipo_usuario.`
				: "Nenhuma coluna válida no corpo (JSON vazio).";
		throw new HTTPException(400, { message: msg });
	}
	const placeholders = keys.map(() => "?").join(", ");
	const cols = keys.map((k) => `"${k.replace(/"/g, "")}"`).join(", ");
	const values = keys.map((k) => body[k] ?? null);
	const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`;
	const meta = await c.env.DB.prepare(sql).bind(...values).run();
	const newId = meta.meta.last_row_id;
	const row = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(newId).first();
	return c.json(row, 201);
});

app.put("/api/:table/:id", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	const id = parseId(c.req.param("id"));
	let body: Record<string, unknown>;
	try {
		body = await c.req.json();
	} catch {
		throw new HTTPException(400, { message: "JSON inválido" });
	}
	const columns = await getColumns(c.env.DB, table);
	const keys = Object.keys(body).filter(
		(k) => columns.has(k) && k !== "id" && k !== "updated_at",
	);
	const setParts: string[] = [];
	const values: unknown[] = [];
	for (const k of keys) {
		setParts.push(`"${k.replace(/"/g, "")}" = ?`);
		values.push(body[k] ?? null);
	}
	if (columns.has("updated_at")) {
		setParts.push(`"updated_at" = CURRENT_TIMESTAMP`);
	}
	if (setParts.length === 0) {
		const received = Object.keys(body);
		const msg =
			received.length > 0
				? `Nenhuma coluna válida no corpo. Campos enviados: ${received.join(", ")}. Use os nomes das colunas do SQLite (snake_case).`
				: "Nenhuma coluna válida no corpo (JSON vazio).";
		throw new HTTPException(400, { message: msg });
	}
	values.push(id);
	const sql = `UPDATE ${table} SET ${setParts.join(", ")} WHERE id = ?`;
	const meta = await c.env.DB.prepare(sql).bind(...values).run();
	if (meta.meta.changes === 0) {
		throw new HTTPException(404, { message: "Registro não encontrado" });
	}
	const row = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
	return c.json(row);
});

app.delete("/api/:table/:id", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	const id = parseId(c.req.param("id"));
	const meta = await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
	if (meta.meta.changes === 0) {
		throw new HTTPException(404, { message: "Registro não encontrado" });
	}
	return c.body(null, 204);
});

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ error: err.message }, err.status);
	}
	console.error(err);
	return c.json({ error: "Erro interno" }, 500);
});

app.notFound((c) => c.json({ error: "Não encontrado" }, 404));

export default app;
