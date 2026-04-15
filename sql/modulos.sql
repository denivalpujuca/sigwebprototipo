-- Módulos do Sistema
CREATE TABLE IF NOT EXISTS modulos_sistema (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permissões de Módulos por Usuário
CREATE TABLE IF NOT EXISTS usuario_modulos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  modulo_id INTEGER NOT NULL,
  nivel_acesso TEXT DEFAULT 'leitura' CHECK(nivel_acesso IN ('admin', 'padrao', 'leitura')),
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (modulo_id) REFERENCES modulos_sistema(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuario_modulos_usuario ON usuario_modulos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_modulos_modulo ON usuario_modulos(modulo_id);

-- Inserir módulos padrão (só se não existirem)
INSERT OR IGNORE INTO modulos_sistema (codigo, nome, icone, ordem) VALUES
('administrativo', 'Administrativo', 'dashboard', 1),
('compras', 'Compras', 'shopping_cart', 2),
('almoxarifado', 'Almoxarifado', 'inventory', 3),
('frota', 'Frota', 'local_shipping', 4),
('oficina', 'Oficina', 'build', 5),
('vendas', 'Vendas', 'point_of_sale', 6),
('financeiro', 'Financeiro', 'account_balance', 7),
('ti', 'T.I.', 'computer', 8),
('residuos', 'Resíduos', 'eco', 9);
