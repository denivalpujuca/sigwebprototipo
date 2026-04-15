import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

const ALLOWED_TABLES = new Set([
	"vehicles",
	"ordens_servico",
	"usuarios",
	"clientes",
	"funcionarios",
	"funcionarios_admissoes",
	"fornecedores",
	"empresas",
	"marcas",
	"modelos",
	"produtos",
	"categorias_produto",
	"servicos",
	"cargos",
	"tipos_usuario",
	"almoxarifados",
	"almoxarifado_produto",
	"contratos",
	"orcamentos",
	"itens_orcamento",
	"requisicoes_compra",
	"residuos",
	"residuos_mtr",
	"contas_pagar",
	"contas_receber",
	"abastecimentos",
	"auditoria",
	"pedidos_compra",
	"residuos_urbano",
	"periodos_ano",
	"solicitacoes_compra",
	"requisicoes_departamento",
	"requisicoes_compra_produtos",
	"departamentos",
	"usuarios_permissoes",
	"modulos_sistema",
	"usuario_modulos",
	"itens_requisicao_departamento",
	"notificacoes",
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
	}	),
);

// === MODULOS SISTEMA ROUTES ===

// GET /api/modulos_sistema - List all modules
app.get("/api/modulos_sistema", async (c) => {
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT * FROM modulos_sistema WHERE ativo = 1 ORDER BY ordem
		`).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em modulos_sistema:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// GET /api/modulos_sistema/:id - Get single module
app.get("/api/modulos_sistema/:id", async (c) => {
	const id = c.req.param("id");
	try {
		const row = await c.env.DB.prepare(`SELECT * FROM modulos_sistema WHERE id = ?`).bind(id).first();
		if (!row) return c.json({ error: "Módulo não encontrado" }, 404);
		return c.json(row);
	} catch (err) {
		return c.json({ error: String(err) }, 500);
	}
});

// GET /api/usuario_modulos/:usuarioId - Get user's module permissions
app.get("/api/usuario_modulos/:usuarioId", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const usuario = await c.env.DB.prepare(`SELECT tipo FROM usuarios WHERE id = ?`).bind(usuarioId).first();
		
		if (usuario && (usuario.tipo === 'Administrador' || usuario.tipo === 'admin')) {
			const { results } = await c.env.DB.prepare(`
				SELECT ms.*, 'admin' as nivel_acesso
				FROM modulos_sistema ms WHERE ms.ativo = 1 ORDER BY ms.ordem
			`).all();
			return c.json(results);
		}
		
		const { results } = await c.env.DB.prepare(`
			SELECT ms.*, COALESCE(um.nivel_acesso, 'leitura') as nivel_acesso
			FROM modulos_sistema ms
			LEFT JOIN usuario_modulos um ON ms.id = um.modulo_id AND um.usuario_id = ? AND um.ativo = 1
			WHERE ms.ativo = 1
			ORDER BY ms.ordem
		`).bind(usuarioId).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuario_modulos:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// POST /api/usuario_modulos - Create/update user module permission
app.post("/api/usuario_modulos", async (c) => {
	try {
		let body: Record<string, unknown>;
		try {
			body = await c.req.json();
		} catch {
			throw new HTTPException(400, { message: "JSON inválido" });
		}
		
		const { usuario_id, modulo_id, nivel_acesso, ativo } = body;
		
		if (!usuario_id || !modulo_id) {
			throw new HTTPException(400, { message: "usuario_id e modulo_id são obrigatórios" });
		}
		
		const existing = await c.env.DB.prepare(`
			SELECT id FROM usuario_modulos WHERE usuario_id = ? AND modulo_id = ?
		`).bind(Number(usuario_id), Number(modulo_id)).first();
		
		if (existing) {
			await c.env.DB.prepare(`
				UPDATE usuario_modulos SET nivel_acesso = ?, ativo = ?, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
			`).bind(String(nivel_acesso || 'leitura'), ativo !== undefined ? Number(ativo) : 1, existing.id).run();
			
			const row = await c.env.DB.prepare(`SELECT * FROM usuario_modulos WHERE id = ?`).bind(existing.id).first();
			return c.json(row);
		} else {
			const meta = await c.env.DB.prepare(`
				INSERT INTO usuario_modulos (usuario_id, modulo_id, nivel_acesso, ativo)
				VALUES (?, ?, ?, ?)
			`).bind(Number(usuario_id), Number(modulo_id), String(nivel_acesso || 'leitura'), ativo !== undefined ? Number(ativo) : 1).run();
			
			const row = await c.env.DB.prepare(`SELECT * FROM usuario_modulos WHERE id = ?`).bind(meta.meta.last_row_id).first();
			return c.json(row, 201);
		}
	} catch (err) {
		if (err instanceof HTTPException) throw err;
		console.error('Erro em POST usuario_modulos:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// DELETE /api/usuario_modulos/:id - Remove user module permission
app.delete("/api/usuario_modulos/:id", async (c) => {
	const id = c.req.param("id");
	try {
		await c.env.DB.prepare(`UPDATE usuario_modulos SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run();
		return c.body(null, 204);
	} catch (err) {
		console.error('Erro em DELETE usuario_modulos:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// === ITENS_REQUISICAO_DEPARTAMENTO ROUTES ===

app.get("/api/requisicoes_departamento/:id/itens", async (c) => {
	const id = c.req.param("id");
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT * FROM itens_requisicao_departamento
			WHERE requisicao_id = ? ORDER BY id
		`).bind(id).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em requisicoes_departamento/:id/itens:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.post("/api/requisicoes_departamento/:id/itens", async (c) => {
	const id = c.req.param("id");
	try {
		let body: Record<string, unknown>;
		try {
			body = await c.req.json();
		} catch {
			throw new HTTPException(400, { message: "JSON inválido" });
		}
		
		const { produto_nome, quantidade, observacao } = body;
		if (!produto_nome || !quantidade) {
			throw new HTTPException(400, { message: "produto_nome e quantidade são obrigatórios" });
		}
		
		const meta = await c.env.DB.prepare(`
			INSERT INTO itens_requisicao_departamento (requisicao_id, produto_nome, quantidade, observacao)
			VALUES (?, ?, ?, ?)
		`).bind(id, produto_nome, Number(quantidade), observacao || null).run();
		
		const newId = (meta as { meta: { last_row_id: number } }).meta.last_row_id;
		
		await c.env.DB.prepare(`
			UPDATE requisicoes_departamento SET itens = (
				SELECT COUNT(*) FROM itens_requisicao_departamento WHERE requisicao_id = ?
			) WHERE id = ?
		`).bind(id, id).run();
		
		const row = await c.env.DB.prepare(`SELECT * FROM itens_requisicao_departamento WHERE id = ?`).bind(newId).first();
		return c.json(row, 201);
	} catch (err) {
		console.error('Erro em POST requisicoes_departamento/:id/itens:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.put("/api/itens_requisicao/:id", async (c) => {
	const id = c.req.param("id");
	try {
		let body: Record<string, unknown>;
		try {
			body = await c.req.json();
		} catch {
			throw new HTTPException(400, { message: "JSON inválido" });
		}
		
		const { separado, verificado, observacao } = body;
		
		await c.env.DB.prepare(`
			UPDATE itens_requisicao_departamento
			SET separado = COALESCE(?, separado),
				verificado = COALESCE(?, verificado),
				observacao = COALESCE(?, observacao)
			WHERE id = ?
		`).bind(
			separado !== undefined ? Number(separado) : null,
			verificado !== undefined ? Number(verificado) : null,
			observacao !== undefined ? observacao : null,
			id
		).run();
		
		const row = await c.env.DB.prepare(`SELECT * FROM itens_requisicao_departamento WHERE id = ?`).bind(id).first();
		return c.json(row);
	} catch (err) {
		console.error('Erro em PUT itens_requisicao/:id:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// === NOTIFICACOES ROUTES ===

app.get("/api/notificacoes/:usuarioId", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT * FROM notificacoes 
			WHERE usuario_id = ? 
			ORDER BY created_at DESC 
			LIMIT 50
		`).bind(usuarioId).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em notificacoes:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/notificacoes/:usuarioId/count", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const row = await c.env.DB.prepare(`
			SELECT COUNT(*) as count FROM notificacoes 
			WHERE usuario_id = ? AND lida = 0
		`).bind(usuarioId).first();
		return c.json({ count: row?.count || 0 });
	} catch (err) {
		console.error('Erro em notificacoes count:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.post("/api/notificacoes", async (c) => {
	try {
		let body: Record<string, unknown>;
		try {
			body = await c.req.json();
		} catch {
			throw new HTTPException(400, { message: "JSON inválido" });
		}
		
		const { usuario_id, titulo, mensagem, tipo, link } = body;
		if (!usuario_id || !titulo || !mensagem) {
			throw new HTTPException(400, { message: "usuario_id, titulo e mensagem são obrigatórios" });
		}
		
		const meta = await c.env.DB.prepare(`
			INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, link)
			VALUES (?, ?, ?, ?, ?)
		`).bind(usuario_id, titulo, mensagem, tipo || 'info', link || null).run();
		
		const newId = (meta as { meta: { last_row_id: number } }).meta.last_row_id;
		const row = await c.env.DB.prepare(`SELECT * FROM notificacoes WHERE id = ?`).bind(newId).first();
		return c.json(row, 201);
	} catch (err) {
		console.error('Erro em POST notificacoes:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.put("/api/notificacoes/:id/lida", async (c) => {
	const id = c.req.param("id");
	try {
		await c.env.DB.prepare(`UPDATE notificacoes SET lida = 1 WHERE id = ?`).bind(id).run();
		return c.json({ success: true });
	} catch (err) {
		console.error('Erro em PUT notificacoes/lida:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.put("/api/notificacoes/:usuarioId/marcar-todas-lidas", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		await c.env.DB.prepare(`UPDATE notificacoes SET lida = 1 WHERE usuario_id = ? AND lida = 0`).bind(usuarioId).run();
		return c.json({ success: true });
	} catch (err) {
		console.error('Erro em PUT notificacoes/marcar-todas-lidas:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// === USUARIOS_PERMISSOES ROUTES (must be before generic /:table routes) ===

// GET /api/usuarios_permissoes - List all permissions
app.get("/api/usuarios_permissoes", async (c) => {
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				up.id,
				up.usuario_id,
				up.empresa_id,
				up.almoxarifado_id,
				up.nivel_acesso,
				up.ativo,
				up.created_at,
				u.nome as usuario_nome,
				u.email as usuario_email,
				e.nome as empresa_nome,
				a.nome as almoxarifado_nome
			FROM usuarios_permissoes up
			LEFT JOIN usuarios u ON up.usuario_id = u.id
			LEFT JOIN empresas e ON up.empresa_id = e.id
			LEFT JOIN almoxarifados a ON up.almoxarifado_id = a.id
			WHERE up.ativo = 1
			ORDER BY u.nome, e.nome
		`).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuarios_permissoes:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// GET /api/usuarios_permissoes/:usuarioId - Get permissions for a specific user
app.get("/api/usuarios_permissoes/:usuarioId", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				up.id,
				up.usuario_id,
				up.empresa_id,
				up.almoxarifado_id,
				up.nivel_acesso,
				up.ativo,
				up.created_at,
				u.nome as usuario_nome,
				e.nome as empresa_nome,
				a.nome as almoxarifado_nome
			FROM usuarios_permissoes up
			LEFT JOIN usuarios u ON up.usuario_id = u.id
			LEFT JOIN empresas e ON up.empresa_id = e.id
			LEFT JOIN almoxarifados a ON up.almoxarifado_id = a.id
			WHERE up.usuario_id = ? AND up.ativo = 1
			ORDER BY e.nome, a.nome
		`).bind(usuarioId).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuarios_permissoes/:usuarioId:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// GET /api/usuarios_permissoes/almoxarifados/:usuarioId - Get accessible almoxarifados for a user
app.get("/api/usuarios_permissoes/almoxarifados/:usuarioId", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const usuario = await c.env.DB.prepare(`
			SELECT tipo_usuario FROM usuarios WHERE id = ?
		`).bind(usuarioId).first();
		
		if (usuario && (usuario.tipo_usuario === 'Administrador' || usuario.tipo_usuario === 'admin')) {
			const { results } = await c.env.DB.prepare(`
				SELECT 
					a.id,
					a.nome,
					a.localizacao,
					a.empresa_id,
					a.ativo,
					e.nome as empresa_nome
				FROM almoxarifados a
				LEFT JOIN empresas e ON a.empresa_id = e.id
				WHERE a.ativo = 1
				ORDER BY e.nome, a.nome
			`).all();
			return c.json(results);
		}
		
		const { results } = await c.env.DB.prepare(`
			SELECT DISTINCT
				a.id,
				a.nome,
				a.localizacao,
				a.empresa_id,
				a.ativo,
				e.nome as empresa_nome,
				up.nivel_acesso
			FROM usuarios_permissoes up
			INNER JOIN almoxarifados a ON 
				up.almoxarifado_id = a.id 
				OR (up.almoxarifado_id IS NULL AND a.empresa_id = up.empresa_id)
			LEFT JOIN empresas e ON a.empresa_id = e.id
			WHERE up.usuario_id = ? AND up.ativo = 1 AND a.ativo = 1
			ORDER BY e.nome, a.nome
		`).bind(usuarioId).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuarios_permissoes/almoxarifados/:usuarioId:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// GET /api/usuarios_permissoes/empresas/:usuarioId - Get accessible empresas for a user
app.get("/api/usuarios_permissoes/empresas/:usuarioId", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const usuario = await c.env.DB.prepare(`
			SELECT tipo_usuario FROM usuarios WHERE id = ?
		`).bind(usuarioId).first();
		
		if (usuario && (usuario.tipo_usuario === 'Administrador' || usuario.tipo_usuario === 'admin')) {
			const { results } = await c.env.DB.prepare(`
				SELECT id, nome, cnpj, email, telefone, ativo
				FROM empresas
				WHERE ativo = 1
				ORDER BY nome
			`).all();
			return c.json(results);
		}
		
		const { results } = await c.env.DB.prepare(`
			SELECT DISTINCT
				e.id,
				e.nome,
				e.cnpj,
				e.email,
				e.telefone,
				e.ativo
			FROM usuarios_permissoes up
			INNER JOIN empresas e ON up.empresa_id = e.id
			WHERE up.usuario_id = ? AND up.ativo = 1 AND e.ativo = 1
			ORDER BY e.nome
		`).bind(usuarioId).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuarios_permissoes/empresas/:usuarioId:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// POST /api/usuarios_permissoes - Create permission
app.post("/api/usuarios_permissoes", async (c) => {
	try {
		let body: Record<string, unknown>;
		try {
			body = await c.req.json();
		} catch {
			throw new HTTPException(400, { message: "JSON inválido" });
		}
		
		const { usuario_id, empresa_id, almoxarifado_id, nivel_acesso, ativo } = body;
		
		if (!usuario_id || !empresa_id) {
			throw new HTTPException(400, { message: "usuario_id e empresa_id são obrigatórios" });
		}
		
		const meta = await c.env.DB.prepare(`
			INSERT INTO usuarios_permissoes (usuario_id, empresa_id, almoxarifado_id, nivel_acesso, ativo)
			VALUES (?, ?, ?, ?, ?)
		`).bind(
			Number(usuario_id),
			Number(empresa_id),
			almoxarifado_id ? Number(almoxarifado_id) : null,
			String(nivel_acesso || 'padrao'),
			ativo !== undefined ? Number(ativo) : 1
		).run();
		
		const newId = meta.meta.last_row_id;
		const row = await c.env.DB.prepare(`SELECT * FROM usuarios_permissoes WHERE id = ?`).bind(newId).first();
		return c.json(row, 201);
	} catch (err) {
		console.error('Erro em POST usuarios_permissoes:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// PUT /api/usuarios_permissoes/:id - Update permission
app.put("/api/usuarios_permissoes/:id", async (c) => {
	const id = parseId(c.req.param("id"));
	try {
		let body: Record<string, unknown>;
		try {
			body = await c.req.json();
		} catch {
			throw new HTTPException(400, { message: "JSON inválido" });
		}
		
		const { usuario_id, empresa_id, almoxarifado_id, nivel_acesso, ativo } = body;
		
		const updates: string[] = [];
		const values: unknown[] = [];
		
		if (usuario_id !== undefined) {
			updates.push("usuario_id = ?");
			values.push(Number(usuario_id));
		}
		if (empresa_id !== undefined) {
			updates.push("empresa_id = ?");
			values.push(Number(empresa_id));
		}
		if (almoxarifado_id !== undefined) {
			updates.push("almoxarifado_id = ?");
			values.push(almoxarifado_id ? Number(almoxarifado_id) : null);
		}
		if (nivel_acesso !== undefined) {
			updates.push("nivel_acesso = ?");
			values.push(String(nivel_acesso));
		}
		if (ativo !== undefined) {
			updates.push("ativo = ?");
			values.push(Number(ativo));
		}
		
		if (updates.length === 0) {
			throw new HTTPException(400, { message: "Nenhum campo para atualizar" });
		}
		
		updates.push("updated_at = CURRENT_TIMESTAMP");
		values.push(id);
		
		const meta = await c.env.DB.prepare(`
			UPDATE usuarios_permissoes SET ${updates.join(", ")} WHERE id = ?
		`).bind(...values).run();
		
		if (meta.meta.changes === 0) {
			throw new HTTPException(404, { message: "Permissão não encontrada" });
		}
		
		const row = await c.env.DB.prepare(`SELECT * FROM usuarios_permissoes WHERE id = ?`).bind(id).first();
		return c.json(row);
	} catch (err) {
		if (err instanceof HTTPException) throw err;
		console.error('Erro em PUT usuarios_permissoes/:id:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// END USUARIOS_PERMISSOES ROUTES ===

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

app.get("/api/almoxarifados", async (c) => {
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				a.*,
				e.nome as empresa_nome,
				f.nome as responsavel_nome
			FROM almoxarifados a
			LEFT JOIN empresas e ON a.empresa_id = e.id
			LEFT JOIN funcionarios f ON a.responsavel_id = f.id
		`).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em almoxarifados:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/almoxarifados/:id", async (c) => {
	const id = c.req.param("id");
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				a.*,
				e.nome as empresa_nome,
				f.nome as responsavel_nome
			FROM almoxarifados a
			LEFT JOIN empresas e ON a.empresa_id = e.id
			LEFT JOIN funcionarios f ON a.responsavel_id = f.id
			WHERE a.id = ?
		`).bind(id).all();
		if (!results || results.length === 0) {
			return c.json({ error: "Almoxarifado não encontrado" }, 404);
		}
		return c.json(results[0]);
	} catch (err) {
		console.error('Erro em almoxarifados/:id:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/almoxarifados/:id/produtos", async (c) => {
	const id = c.req.param("id");
	console.log('GET almoxarifados/:id/produtos id:', id);
	try {
		const { results, success, error } = await c.env.DB.prepare(`
			SELECT 
				p.id,
				p.nome,
				p.descricao,
				p.categoria_id,
				p.unidade,
				p.foto,
				c.nome as categoria_nome,
				COALESCE(ap.valor_venda, 0) as preco,
				COALESCE(ap.valor_venda, 0) as precoUnitario,
				COALESCE(ap.quantidade_total, 0) as quantidade_total,
				COALESCE(ap.quantidade_reservada, 0) as quantidade_reservada,
				COALESCE(ap.quantidade_total, 0) - COALESCE(ap.quantidade_reservada, 0) as quantidade_disponivel,
				ap.estoque_minimo,
				ap.necessita_gerenciar_minimo,
				p.ativo
			FROM produtos p
			INNER JOIN almoxarifado_produto ap ON p.id = ap.produto_id AND ap.almoxarifado_id = ?
			LEFT JOIN categorias_produto c ON p.categoria_id = c.id
			WHERE p.ativo = 1
			ORDER BY p.nome
		`).bind(id).all();
		console.log('Results:', results, 'success:', success, 'error:', error);
		if (!success) {
			throw new Error(String(error));
		}
		return c.json(results);
	} catch (err) {
		console.error('Erro em almoxarifados/:id/produtos:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/almoxarifados/:id/estoque", async (c) => {
	const id = c.req.param("id");
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				ap.id,
				ap.almoxarifado_id,
				ap.produto_id,
				p.nome as produto_nome,
				p.unidade as produto_unidade,
				ap.quantidade_total,
				ap.quantidade_reservada,
				ap.estoque_minimo,
				ap.necessita_gerenciar_minimo,
				ap.valor_venda,
				ap.ativo
			FROM almoxarifado_produto ap
			JOIN produtos p ON ap.produto_id = p.id
			WHERE ap.almoxarifado_id = ?
			ORDER BY LOWER(p.nome)
		`).bind(id).all();
		return c.json(results || []);
	} catch (err) {
		console.error('Erro em almoxarifados/:id/estoque:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/funcionarios", async (c) => {
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				f.id,
				f.nome,
				f.cpf,
				f.email,
				f.telefone,
				f.foto,
				f.ativo,
				fa.id as admissao_id,
				fa.empresa_id,
				fa.cargo_id,
				fa.data_admissao,
				fa.data_demissao,
				fa.status as admissao_status,
				e.nome as empresa_nome,
				c.nome as cargo_nome
			FROM funcionarios f
			LEFT JOIN (
				SELECT fa2.*
				FROM funcionarios_admissoes fa2
				INNER JOIN (
					SELECT fa3.funcionario_id, MAX(fa3.data_admissao) as max_data
					FROM funcionarios_admissoes fa3
					WHERE fa3.ativo = 1
					GROUP BY fa3.funcionario_id
				) latest ON fa2.funcionario_id = latest.funcionario_id 
					AND fa2.data_admissao = latest.max_data
				WHERE fa2.ativo = 1
			) fa ON f.id = fa.funcionario_id
			LEFT JOIN empresas e ON fa.empresa_id = e.id
			LEFT JOIN cargos c ON fa.cargo_id = c.id
			WHERE f.ativo = 1
		`).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em funcionarios:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/produtos", async (c) => {
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT p.id, p.nome, p.codigo, p.categoria_id, p.unidade, p.ativo, p.foto, p.descricao,
			       c.nome as categoria_nome
		FROM produtos p
		LEFT JOIN categorias_produto c ON p.categoria_id = c.id
	`).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em /api/produtos:', err);
		return c.json({ error: String(err) }, 500);
	}
});

app.get("/api/:table", async (c) => {
	const table = c.req.param("table");
	assertTable(table);
	const { results } = await c.env.DB.prepare(`SELECT * FROM ${table}`).all();
	return c.json(results);
});

app.get("/api/funcionarios/:id", async (c) => {
	const id = parseId(c.req.param("id"));
	try {
		const func = await c.env.DB.prepare(`
			SELECT id, nome, cpf, email, telefone, foto, ativo
			FROM funcionarios
			WHERE id = ?
		`).bind(id).first();
		
		if (!func) {
			throw new HTTPException(404, { message: "Funcionário não encontrado" });
		}
		
		const admissao = await c.env.DB.prepare(`
			SELECT fa.id, fa.empresa_id, fa.cargo_id, fa.data_admissao, fa.data_demissao, fa.status, fa.ativo
			FROM funcionarios_admissoes fa
			WHERE fa.funcionario_id = ? AND fa.ativo = 1
			ORDER BY fa.data_admissao DESC
			LIMIT 1
		`).bind(id).first();
		
		let empresaNome = null;
		let cargoNome = null;
		
		if (admissao && admissao.empresa_id) {
			const empresa = await c.env.DB.prepare(`SELECT nome FROM empresas WHERE id = ?`).bind(admissao.empresa_id).first();
			empresaNome = empresa?.nome || null;
		}
		if (admissao && admissao.cargo_id) {
			const cargo = await c.env.DB.prepare(`SELECT nome FROM cargos WHERE id = ?`).bind(admissao.cargo_id).first();
			cargoNome = cargo?.nome || null;
		}
		
		return c.json({
			...func,
			admissao_id: admissao?.id || null,
			empresa_id: admissao?.empresa_id || null,
			cargo_id: admissao?.cargo_id || null,
			data_admissao: admissao?.data_admissao || null,
			data_demissao: admissao?.data_demissao || null,
			admissao_status: admissao?.status || null,
			empresa_nome: empresaNome,
			cargo_nome: cargoNome,
		});
	} catch (err) {
		console.error('Erro em funcionarios/:id:', err);
		return c.json({ error: String(err) }, 500);
	}
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
		try {
			console.log(`[POST ${table}] Body:`, body);
			columnCache.delete(table);
			const columns = await getColumns(c.env.DB, table);
			console.log(`[POST ${table}] Colunas disponíveis:`, columns);
			const keys = Object.keys(body).filter((k) => columns.has(k) && k !== "id");
			console.log(`[POST ${table}] Keys após filtro:`, keys);
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
			console.log(`[POST ${table}] SQL:`, sql, 'Values:', values);
			const meta = await c.env.DB.prepare(sql).bind(...values).run();
			const newId = meta.meta.last_row_id;
			const row = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(newId).first();
			return c.json(row, 201);
		} catch (err) {
			console.error(`[POST ${table}] Erro:`, err);
			return c.json({ error: String(err) }, 500);
		}
	});

app.put("/api/:table/:id", async (c) => {
	const table = c.req.param("table");
	const idParam = c.req.param("id");
	console.log('PUT:', table, idParam);
	assertTable(table);
	const id = parseId(idParam);
	let body: Record<string, unknown>;
	try {
		body = await c.req.json();
		console.log('PUT body:', body);
	} catch {
		throw new HTTPException(400, { message: "JSON inválido" });
	}
		try {
		columnCache.delete(table);
		const columns = await getColumns(c.env.DB, table);
		console.log(`[PUT ${table}] Colunas:`, columns);
		const keys = Object.keys(body).filter(
			(k) => columns.has(k) && k !== "id" && k !== "updated_at",
		);
		console.log(`[PUT ${table}] Body keys:`, Object.keys(body), 'Filtered keys:', keys);
		console.log('Keys after filter:', keys);
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
		console.log('PUT SQL:', sql, 'values:', values);
		const meta = await c.env.DB.prepare(sql).bind(...values).run();
		if (meta.meta.changes === 0) {
			throw new HTTPException(404, { message: "Registro não encontrado" });
		}
		const row = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
		if (!row) {
			throw new HTTPException(404, { message: "Registro não encontrado após update" });
		}
		return c.json({ ...row, ...body });
	} catch (err) {
		console.error('PUT error:', err);
		return c.json({ error: String(err) }, 500);
	}
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

// === PERMISSIONS ENDPOINTS ===

// GET /api/usuarios_permissoes - List all permissions
app.get("/api/usuarios_permissoes", async (c) => {
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				up.id,
				up.usuario_id,
				up.empresa_id,
				up.almoxarifado_id,
				up.nivel_acesso,
				up.ativo,
				up.created_at,
				u.nome as usuario_nome,
				u.email as usuario_email,
				e.nome as empresa_nome,
				a.nome as almoxarifado_nome
			FROM usuarios_permissoes up
			LEFT JOIN usuarios u ON up.usuario_id = u.id
			LEFT JOIN empresas e ON up.empresa_id = e.id
			LEFT JOIN almoxarifados a ON up.almoxarifado_id = a.id
			WHERE up.ativo = 1
			ORDER BY u.nome, e.nome
		`).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuarios_permissoes:', err);
		return c.json({ error: String(err) }, 500);
	}
});

// GET /api/usuarios_permissoes/:usuarioId - Get permissions for a specific user
app.get("/api/usuarios_permissoes/:usuarioId", async (c) => {
	const usuarioId = c.req.param("usuarioId");
	try {
		const { results } = await c.env.DB.prepare(`
			SELECT 
				up.id,
				up.usuario_id,
				up.empresa_id,
				up.almoxarifado_id,
				up.nivel_acesso,
				up.ativo,
				up.created_at,
				u.nome as usuario_nome,
				e.nome as empresa_nome,
				a.nome as almoxarifado_nome
			FROM usuarios_permissoes up
			LEFT JOIN usuarios u ON up.usuario_id = u.id
			LEFT JOIN empresas e ON up.empresa_id = e.id
			LEFT JOIN almoxarifados a ON up.almoxarifado_id = a.id
			WHERE up.usuario_id = ? AND up.ativo = 1
			ORDER BY e.nome, a.nome
		`).bind(usuarioId).all();
		return c.json(results);
	} catch (err) {
		console.error('Erro em usuarios_permissoes/:usuarioId:', err);
		return c.json({ error: String(err) }, 500);
	}
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
