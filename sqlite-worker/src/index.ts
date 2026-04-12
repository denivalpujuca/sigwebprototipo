import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bearerAuth } from 'hono/bearer-auth'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('/api/*', bearerAuth({ token: c => c.env.API_KEY }))

const TABLES = [
  'vehicles', 'ordens_servico', 'usuarios', 'clientes', 'funcionarios',
  'fornecedores', 'empresas', 'marcas', 'modelos', 'produtos', 'servicos',
  'cargos', 'tipos_usuario', 'almoxarifados', 'contratos', 'orcamentos',
  'itens_orcamento', 'requisicoes_compra', 'residuos', 'residuos_mtr',
  'contas_pagar', 'contas_receber', 'permissoes', 'abastecimentos', 'auditoria'
]

const getTable = async (db: D1Database, table: string) => {
  const { results } = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
  ).bind(table).run()
  if (!results || results.length === 0) {
    throw new Error(`no such table: ${table}`)
  }
  return table
}

const handleError = (error: unknown) => {
  console.error(error)
  return Response.json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  )
}

const executeQuery = async (db: D1Database, query: string, params?: unknown[]) => {
  try {
    const result = params 
      ? await db.prepare(query).bind(...params).run()
      : await db.prepare(query).run()
    return result
  } catch (e) {
    throw e
  }
}

// List all tables (from database)
app.get('/api', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).run()
    const tables = (results || []).map((r: Record<string, unknown>) => r.name as string)
    return c.json({ tables })
  } catch (e) {
    return handleError(e)
  }
})

// GET all records
app.get('/api/:table', async (c) => {
  try {
    const table = await getTable(c.env.DB, c.req.param('table'))
    const { results } = await c.env.DB.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).run()
    return c.json({ data: results })
  } catch (e) {
    return handleError(e)
  }
})

// GET single record
app.get('/api/:table/:id', async (c) => {
  try {
    const table = await getTable(c.env.DB, c.req.param('table'))
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).run()
    return c.json({ data: results[0] || null })
  } catch (e) {
    return handleError(e)
  }
})

// POST create record
app.post('/api/:table', async (c) => {
  try {
    const table = await getTable(c.env.DB, c.req.param('table'))
    const body = await c.req.json()
    
    const fields = Object.keys(body)
    const values = Object.values(body)
    const placeholders = fields.map(() => '?').join(', ')
    const fieldList = fields.join(', ')
    
    const query = `INSERT INTO ${table} (${fieldList}) VALUES (${placeholders})`
    const result = await executeQuery(c.env.DB, query, values)
    
    return c.json({ success: true, id: result.meta?.last_row_id }, 201)
  } catch (e) {
    return handleError(e)
  }
})

// PUT update record
app.put('/api/:table/:id', async (c) => {
  try {
    const table = await getTable(c.env.DB, c.req.param('table'))
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const fields = Object.keys(body)
    const values = Object.values(body)
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    
    const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    const result = await executeQuery(c.env.DB, query, [...values, id])
    
    return c.json({ success: true, changes: result.meta?.changes })
  } catch (e) {
    return handleError(e)
  }
})

// DELETE record
app.delete('/api/:table/:id', async (c) => {
  try {
    const table = await getTable(c.env.DB, c.req.param('table'))
    const id = c.req.param('id')
    
    await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run()
    
    return c.json({ success: true })
  } catch (e) {
    return handleError(e)
  }
})

// SEARCH records
app.post('/api/:table/search', async (c) => {
  try {
    const table = await getTable(c.env.DB, c.req.param('table'))
    const body = await c.req.json()
    const { field, value } = body
    
    if (!field || !value) {
      return c.json({ error: 'field and value required' }, 400)
    }
    
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM ${table} WHERE ${field} LIKE ? ORDER BY id DESC`
    ).bind(`%${value}%`).run()
    
    return c.json({ data: results })
  } catch (e) {
    return handleError(e)
  }
})

export default app