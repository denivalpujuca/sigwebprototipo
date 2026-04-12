import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { beforeAll, describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("SigWEB API", () => {
	beforeAll(async () => {
		await env.DB.prepare(
			`CREATE TABLE IF NOT EXISTS vehicles (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				nome TEXT NOT NULL
			)`,
		).run();
		await env.DB.prepare(`DELETE FROM vehicles`).run();
		await env.DB.prepare(`INSERT INTO vehicles (nome) VALUES ('Vitest')`).run();
	});
	it("GET /api/tabela_invalida retorna 404", async () => {
		const request = new IncomingRequest("http://example.com/api/tabela_invalida");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(404);
		const body = (await response.json()) as { error?: string };
		expect(body.error).toBeDefined();
	});

	it("GET /api/vehicles retorna JSON (lista)", async () => {
		const response = await SELF.fetch("https://example.com/api/vehicles");
		expect(response.headers.get("content-type")?.includes("application/json")).toBe(true);
		const data = (await response.json()) as unknown[];
		expect(Array.isArray(data)).toBe(true);
	});

	it("OPTIONS /api/vehicles sends CORS headers", async () => {
		const response = await SELF.fetch("https://example.com/api/vehicles", {
			method: "OPTIONS",
			headers: { Origin: "http://localhost:5173" },
		});
		expect(response.headers.get("access-control-allow-origin")).toBeTruthy();
	});
});
