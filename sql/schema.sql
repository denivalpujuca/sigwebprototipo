-- SigWEB D1 Schema
-- Execute via: wrangler d1 execute sigweb-db --local --file=sql/schema.sql
-- Ou no dashboard: Cloudflare Dashboard > D1 > seu banco > Query

-- Veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  placa TEXT NOT NULL UNIQUE,
  chassi TEXT,
  volume INTEGER DEFAULT 0,
  marca TEXT,
  modelo TEXT,
  tipo TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ordens de Serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  veiculo TEXT NOT NULL,
  placa TEXT NOT NULL,
  servico TEXT NOT NULL,
  status TEXT DEFAULT 'aberta' CHECK(status IN ('aberta','andamento','esperando','concluida')),
  data TEXT NOT NULL,
  valor REAL DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT,
  tipo_usuario TEXT DEFAULT 'Operador',
  ativo INTEGER DEFAULT 1,
  ultimo_acesso TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  tipo TEXT DEFAULT 'PF' CHECK(tipo IN ('PF','PJ')),
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Funcionarios
CREATE TABLE IF NOT EXISTS funcionarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  cargo TEXT,
  empresa TEXT,
  data_admissao TEXT,
  status TEXT DEFAULT 'ATIVO' CHECK(status IN ('ATIVO','FERIAS','LICENCA','DEMITIDO')),
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Empresas
CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Marcas
CREATE TABLE IF NOT EXISTS marcas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Modelos
CREATE TABLE IF NOT EXISTS modelos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  marca_id INTEGER,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marca_id) REFERENCES marcas(id)
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  codigo TEXT,
  preco REAL DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco REAL DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cargos
CREATE TABLE IF NOT EXISTS cargos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tipos Usuário
CREATE TABLE IF NOT EXISTS tipos_usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Almoxarifados
CREATE TABLE IF NOT EXISTS almoxarifados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  localizacao TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL,
  cliente_id INTEGER,
  valor REAL DEFAULT 0,
  data_inicio TEXT,
  data_fim TEXT,
  status TEXT DEFAULT 'ativo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  data TEXT NOT NULL,
  status TEXT DEFAULT 'aberto',
  valor_total REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Itens Orçamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orcamento_id INTEGER,
  servico_id INTEGER,
  quantidade INTEGER DEFAULT 1,
  preco REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id),
  FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Requisições Compra
CREATE TABLE IF NOT EXISTS requisicoes_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solicitante TEXT NOT NULL,
  data TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  centro_custo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Residuos
CREATE TABLE IF NOT EXISTS residuos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT,
  fonte TEXT,
  destino TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Residuos MTR
CREATE TABLE IF NOT EXISTS residuos_mtr (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  residuo_id INTEGER,
  numero TEXT NOT NULL,
  data TEXT NOT NULL,
  peso REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (residuo_id) REFERENCES residuos(id)
);

-- Contas Pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  fornecedor TEXT NOT NULL,
  valor REAL DEFAULT 0,
  data_vencimento TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente','pago','atrasado')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contas Receber
CREATE TABLE IF NOT EXISTS contas_receber (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  cliente TEXT NOT NULL,
  valor REAL DEFAULT 0,
  data_vencimento TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente','recebido','atrasado')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permissões
CREATE TABLE IF NOT EXISTS permissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_usuario_id INTEGER,
  modulo TEXT NOT NULL,
  acao TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_usuario_id) REFERENCES tipos_usuario(id)
);

-- Abastecimentos
CREATE TABLE IF NOT EXISTS abastecimentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  veiculo TEXT NOT NULL,
  placa TEXT NOT NULL,
  data TEXT NOT NULL,
  litros REAL DEFAULT 0,
  valor REAL DEFAULT 0,
  km INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria
CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT NOT NULL,
  acao TEXT NOT NULL,
  tabela TEXT NOT NULL,
  registro_id INTEGER,
  detalhes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_os_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_os_placa ON ordens_servico(placa);
CREATE INDEX IF NOT EXISTS idx_contas_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);

-- Seed data inicial (dados mocados convertidos)
INSERT INTO vehicles (nome, placa, chassi, volume, marca, modelo, tipo, ativo) VALUES
('SCANIA R 420A6X4', 'OEH8629', '9BSR6X400C3699158', 21000, 'CATERPILLAR', '140B', 'Caminhão Traçado', 1),
('MERCEDES BENZ AXOR 3344', 'PXI1A22', '9BSR6X411B2238472', 18000, 'VOLVO', 'FMX 460', 'Basculante', 0),
('VOLKSWAGEN CONSTELLATION 24.280', 'QOE9481', '9BSR6X499A1122847', 15000, 'FORD', 'CARGO 2428', 'Tanque Pipa', 0),
('IVECO TECTOR 240E28', 'RKY5F11', '9BSR6X400L9938812', 12500, 'SCANIA', 'P310', 'Carga Geral', 1),
('VOLVO FH 440', 'OEH8630', '9BSR6X400C3699159', 20000, 'VOLVO', 'FH 440', 'Caminhão', 1),
('MERCEDES AXOR', 'OEH8631', '9BSR6X400C3699160', 18000, 'MERCEDES', 'AXOR 1844', 'Caminhão', 1);

INSERT INTO ordens_servico (veiculo, placa, servico, status, data, valor, ativo) VALUES
('Volkswagen Constellation', 'ABC-1234', 'Troca de óleo e filtros', 'andamento', '2026-04-05', 450, 1),
('Mercedes-Benz Axor', 'XYZ-9876', 'Revisão geral', 'esperando', '2026-04-04', 1200, 1),
('Ford Cargo', 'DEF-5678', 'Reparo freios', 'aberta', '2026-04-05', 380, 1),
('Scania R500', 'GHI-4321', 'Troca de pneus', 'concluida', '2026-04-03', 2800, 1),
('Volvo FH', 'JKL-8765', 'Diagnóstico motor', 'andamento', '2026-04-04', 650, 1);

INSERT INTO usuarios (nome, email, cpf, tipo_usuario, ativo, ultimo_acesso) VALUES
('Ricardo Mendes', 'ricardo.mendes@fleet.com', '123.456.789-00', 'Administrador', 1, '2026-04-04'),
('Juliana Silva', 'juliana.silva@fleet.com', '234.567.890-11', 'Gerente', 1, '2026-04-03'),
('Carlos Oliveira', 'carlos.oliveira@fleet.com', '345.678.901-22', 'Operador', 1, '2026-04-02'),
('Ana Paula Santos', 'ana.santos@fleet.com', '456.789.012-33', 'Operador', 0, '2026-03-28'),
('Bruno Costa', 'bruno.costa@fleet.com', '567.890.123-44', 'Visualizador', 1, '2026-04-01'),
('Patrícia Lima', 'patricia.lima@fleet.com', '678.901.234-55', 'Auditor', 1, NULL),
('Roberto Alves', 'roberto.alves@fleet.com', '789.012.345-66', 'Operador', 1, '2026-04-04'),
('Fernanda Costa', 'fernanda.costa@fleet.com', '890.123.456-77', 'Gerente', 1, '2026-04-03');

INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, tipo, ativo) VALUES
('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123', 'PF', 1),
('Empresa ABC Ltda', '12.345.678/0001-90', 'contato@abc.com.br', '(11) 3333-3333', 'Av. B, 456', 'PJ', 1),
('Maria Santos', '987.654.321-00', 'maria@email.com', '(21) 88888-8888', 'Rua C, 789', 'PF', 1),
('XYZ Comercial', '98.765.432/0001-10', 'vendas@xyz.com.br', '(31) 4444-4444', 'Av. D, 101', 'PJ', 0),
('Pedro Oliveira', '111.222.333-44', 'pedro@email.com', '(41) 7777-7777', 'Rua E, 202', 'PF', 1);

INSERT INTO funcionarios (nome, cpf, email, telefone, cargo, empresa, data_admissao, status, ativo) VALUES
('Ricardo Mendes', '123.456.789-00', 'ricardo@empresa.com', '(11) 99999-9999', 'Diretor', 'Gestão Urbana S/A', '2020-01-15', 'ATIVO', 1),
('João Silva', '234.567.890-11', 'joao@empresa.com', '(11) 88888-8888', 'Motorista', 'Serviços Metropolitanos', '2021-03-20', 'ATIVO', 1),
('Maria Santos', '345.678.901-22', 'maria@empresa.com', '(21) 77777-7777', 'Assistente', 'Ambiental Norte S/A', '2022-06-10', 'ATIVO', 1),
('Pedro Oliveira', '456.789.012-33', 'pedro@empresa.com', '(31) 66666-6666', 'Mecânico', 'Transporte Público', '2021-09-05', 'FERIAS', 1),
('Ana Costa', '567.890.123-44', 'ana@empresa.com', '(41) 55555-5555', 'Técnica T.I.', 'Saneamento Básico S/A', '2023-01-15', 'ATIVO', 1);

INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, status) VALUES
('Serviços de TI', 'Tech Solutions', 5000, '2026-04-15', 'pendente'),
('Aluguel', 'Imóveis ABC', 10000, '2026-04-01', 'pago'),
('Material de Escritório', 'Papelaria Central', 1500, '2026-04-20', 'pendente'),
('Manutenção Veículos', 'Auto Posto 24h', 3500, '2026-04-18', 'pendente');

INSERT INTO marcas (nome, ativo) VALUES
('VOLVO', 1),
('MERCEDES', 1),
('SCANIA', 1),
('FORD', 1),
('VOLKSWAGEN', 1),
('IVECO', 1);

INSERT INTO servicos (nome, descricao, preco, ativo) VALUES
('Troca de Óleo', 'Troca de óleo двигателя e filtros', 450, 1),
('Revisão Geral', 'Revisão completa do veículo', 1200, 1),
('Reparo Freios', 'Troca de pastilhas e disco', 380, 1),
('Troca de Pneus', 'Troca jogo de pneus', 2800, 1),
('Diagnóstico Motor', 'Diagnóstico eletrônico', 650, 1),
('Alinhamento', 'Alinhamento e balanceamento', 200, 1);

INSERT INTO cargos (nome, ativo) VALUES
('Diretor', 1),
('Gerente', 1),
('Motorista', 1),
('Mecânico', 1),
('Assistente', 1),
('Técnica T.I.', 1);

INSERT INTO tipos_usuario (nome, ativo) VALUES
('Administrador', 1),
('Gerente', 1),
('Operador', 1),
('Visualizador', 1),
('Auditor', 1);