-- DDL apenas (sem INSERT). Idempotente no D1 remoto/local.
-- Aplicar: npm run d1:push (a partir da raiz) ou wrangler d1 execute sigweb-db --remote --file=sql/d1_tables_only.sql

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
  empresa_id INTEGER,
  ativo INTEGER DEFAULT 1,
  ultimo_acesso TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id)
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

-- Funcionarios (dados básicos)
CREATE TABLE IF NOT EXISTS funcionarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  foto TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de admissões dos funcionários
DROP TABLE IF EXISTS funcionarios_admissoes;

CREATE TABLE IF NOT EXISTS funcionarios_admissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  funcionario_id INTEGER NOT NULL,
  empresa_id INTEGER,
  cargo_id INTEGER,
  data_admissao TEXT NOT NULL,
  data_demissao TEXT,
  status TEXT DEFAULT 'ATIVO' CHECK(status IN ('ATIVO','FERIAS','LICENCA','DEMITIDO','PROMOVIDO')),
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  FOREIGN KEY (cargo_id) REFERENCES cargos(id)
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

-- Categorias de Produtos
CREATE TABLE IF NOT EXISTS categorias_produto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  codigo TEXT,
  categoria_id INTEGER,
  unidade TEXT DEFAULT 'un',
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
  empresa_id INTEGER,
  responsavel_id INTEGER,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Almoxarifado Produtos (estoque por almoxarifado)
CREATE TABLE IF NOT EXISTS almoxarifado_produto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  almoxarifado_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade_total INTEGER DEFAULT 0,
  quantidade_reservada INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  necessita_gerenciar_minimo INTEGER DEFAULT 0,
  valor_venda REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifados(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
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

-- Pedidos de Compra
CREATE TABLE IF NOT EXISTS pedidos_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  data DATE NOT NULL,
  itens INTEGER DEFAULT 0,
  total REAL DEFAULT 0,
  status TEXT DEFAULT 'pendente'
);

-- Resíduos Urbano
CREATE TABLE IF NOT EXISTS residuos_urbano (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  descricao TEXT,
  origem TEXT NOT NULL,
  volume REAL DEFAULT 0,
  unidade TEXT DEFAULT 'kg',
  data_coleta DATE,
  status TEXT DEFAULT 'PENDENTE'
);

-- Períodos do Ano
CREATE TABLE IF NOT EXISTS periodos_ano (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  periodo_ano TEXT NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  dias_uteis_semana INTEGER DEFAULT 22,
  sabados_uteis INTEGER DEFAULT 4,
  status TEXT DEFAULT 'ABERTO',
  ativo INTEGER DEFAULT 1
);

-- Solicitações de Compra
CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setor TEXT NOT NULL,
  almoxarifado TEXT NOT NULL,
  data DATE,
  itens INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pendente'
);

-- Requisições por Departamento
CREATE TABLE IF NOT EXISTS requisicoes_departamento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa TEXT NOT NULL,
  departamento TEXT NOT NULL,
  solicitante TEXT NOT NULL,
  almoxarifado_id INTEGER,
  data DATE,
  itens INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifados(id)
);

-- Itens das Requisições de Departamento
CREATE TABLE IF NOT EXISTS itens_requisicao_departamento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisicao_id INTEGER NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  unidade TEXT DEFAULT 'un',
  separado INTEGER DEFAULT 0,
  verificado INTEGER DEFAULT 0,
  observacao TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requisicao_id) REFERENCES requisicoes_departamento(id)
);

-- Requisições de Compra de Produtos
CREATE TABLE IF NOT EXISTS requisicoes_compra_produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setor TEXT NOT NULL,
  almoxarifado TEXT NOT NULL,
  data DATE,
  justificativa TEXT,
  itens INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pendente'
);

-- Departamentos
CREATE TABLE IF NOT EXISTS departamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  empresa TEXT NOT NULL,
  responsavel TEXT,
  email TEXT,
  telefone TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Requisições de Compra de Produtos (recolocar)
DROP TABLE IF EXISTS requisicoes_compra_produtos;

CREATE TABLE IF NOT EXISTS requisicoes_compra_produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  almoxarifado_id INTEGER,
  departamento_id INTEGER,
  solicitante_id INTEGER,
  data DATE,
  justificativa TEXT,
  status TEXT DEFAULT 'pendente',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifados(id),
  FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
  FOREIGN KEY (solicitante_id) REFERENCES funcionarios(id)
);

-- Itens das Requisições de Compra de Produtos
DROP TABLE IF EXISTS itens_requisicao_compra_produtos;

CREATE TABLE IF NOT EXISTS itens_requisicao_compra_produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisicao_id INTEGER NOT NULL,
  produto TEXT NOT NULL,
  unidade TEXT,
  quantidade REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requisicao_id) REFERENCES requisicoes_compra_produtos(id) ON DELETE CASCADE
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_os_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_os_placa ON ordens_servico(placa);
CREATE INDEX IF NOT EXISTS idx_contas_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);

-- Permissões de Usuários por Empresa/Almoxarifado
DROP TABLE IF EXISTS usuarios_permissoes;

CREATE TABLE IF NOT EXISTS usuarios_permissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  empresa_id INTEGER NOT NULL,
  almoxarifado_id INTEGER,
  nivel_acesso TEXT DEFAULT 'padrao' CHECK(nivel_acesso IN ('admin', 'padrao', 'leitura')),
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  FOREIGN KEY (almoxarifado_id) REFERENCES almoxarifados(id)
);

-- Índices para permissões
CREATE INDEX IF NOT EXISTS idx_usuarios_permissoes_usuario ON usuarios_permissoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_permissoes_empresa ON usuarios_permissoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_permissoes_almoxarifado ON usuarios_permissoes(almoxarifado_id);
