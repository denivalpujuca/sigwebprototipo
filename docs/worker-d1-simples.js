// Cloudflare Worker - Copie e cole no editor de Workers
// Acesse: Cloudflare Dashboard > Workers > Create Worker

export default {
  async fetch(request, env) {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const table = path.split('/api/')[1]?.split('/')[0];
    
    if (!table) {
      return new Response(JSON.stringify({ ok: true }), { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }
    
    const id = path.split('/')[3];
    
    try {
      let results;
      
      if (request.method === 'GET' && !id) {
        results = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
      } else if (request.method === 'GET' && id) {
        results = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).all();
      } else if (request.method === 'POST') {
        const body = await request.json();
        const keys = Object.keys(body);
        const values = Object.values(body);
        const placeholders = keys.map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        results = await env.DB.prepare(query).bind(...values).run();
      } else if (request.method === 'PUT' && id) {
        const body = await request.json();
        const keys = Object.keys(body);
        const values = Object.values(body);
        const set = keys.map(k => `${k} = ?`).join(', ');
        results = await env.DB.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`).bind(...values, id).run();
      } else if (request.method === 'DELETE' && id) {
        results = await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
      }
      
      return new Response(JSON.stringify({ data: results?.results || results }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
};