-- Dados iniciais (execute por último)
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
('Ricardo Mendes', 'ricardo.mendes@fleet.com', '12345678900', 'Administrador', 1, '2026-04-04'),
('Juliana Silva', 'juliana.silva@fleet.com', '23456789011', 'Gerente', 1, '2026-04-03'),
('Carlos Oliveira', 'carlos.oliveira@fleet.com', '34567890122', 'Operador', 1, '2026-04-02'),
('Ana Paula Santos', 'ana.santos@fleet.com', '45678901233', 'Operador', 0, '2026-03-28'),
('Bruno Costa', 'bruno.costa@fleet.com', '56789012344', 'Visualizador', 1, '2026-04-01'),
('Patrícia Lima', 'patricia.lima@fleet.com', '67890123455', 'Auditor', 1, NULL),
('Roberto Alves', 'roberto.alves@fleet.com', '78901234566', 'Operador', 1, '2026-04-04'),
('Fernanda Costa', 'fernanda.costa@fleet.com', '89012345677', 'Gerente', 1, '2026-04-03');

INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, tipo, ativo) VALUES
('João Silva', '12345678900', 'joao@email.com', '11999999999', 'Rua A, 123', 'PF', 1),
('Empresa ABC Ltda', '12345678000190', 'contato@abc.com.br', '1133333333', 'Av. B, 456', 'PJ', 1),
('Maria Santos', '98765432100', 'maria@email.com', '2188888888', 'Rua C, 789', 'PF', 1),
('XYZ Comercial', '98765432001010', 'vendas@xyz.com.br', '3144444444', 'Av. D, 101', 'PJ', 0),
('Pedro Oliveira', '11122233344', 'pedro@email.com', '4177777777', 'Rua E, 202', 'PF', 1);

INSERT INTO funcionarios (nome, cpf, email, telefone, cargo, empresa, data_admissao, status, ativo) VALUES
('Ricardo Mendes', '12345678900', 'ricardo@empresa.com', '11999999999', 'Diretor', 'Gestão Urbana S/A', '2020-01-15', 'ATIVO', 1),
('João Silva', '23456789011', 'joao@empresa.com', '1188888888', 'Motorista', 'Serviços Metropolitanos', '2021-03-20', 'ATIVO', 1),
('Maria Santos', '34567890122', 'maria@empresa.com', '2177777777', 'Assistente', 'Ambiental Norte S/A', '2022-06-10', 'ATIVO', 1),
('Pedro Oliveira', '45678901233', 'pedro@empresa.com', '3166666666', 'Mecânico', 'Transporte Público', '2021-09-05', 'FERIAS', 1),
('Ana Costa', '56789012344', 'ana@empresa.com', '4155555555', 'Técnica T.I.', 'Saneamento Básico S/A', '2023-01-15', 'ATIVO', 1);

INSERT INTO marcas (nome, ativo) VALUES
('VOLVO', 1), ('MERCEDES', 1), ('SCANIA', 1), ('FORD', 1), ('VOLKSWAGEN', 1), ('IVECO', 1);

INSERT INTO servicos (nome, descricao, preco, ativo) VALUES
('Troca de Óleo', 'Troca de óleo e filtros', 450, 1),
('Revisão Geral', 'Revisão completa do veículo', 1200, 1),
('Reparo Freios', 'Troca de pastilhas e disco', 380, 1),
('Troca de Pneus', 'Troca jogo de pneus', 2800, 1),
('Diagnóstico Motor', 'Diagnóstico eletrônico', 650, 1),
('Alinhamento', 'Alinhamento e balanceamento', 200, 1);

INSERT INTO cargos (nome, ativo) VALUES
('Diretor', 1), ('Gerente', 1), ('Motorista', 1), ('Mecânico', 1), ('Assistente', 1), ('Técnica T.I.', 1);

INSERT INTO tipos_usuario (nome, ativo) VALUES
('Administrador', 1), ('Gerente', 1), ('Operador', 1), ('Visualizador', 1), ('Auditor', 1);

INSERT INTO contas_pagar (descricao, fornecedor, valor, data_vencimento, status) VALUES
('Serviços de TI', 'Tech Solutions', 5000, '2026-04-15', 'pendente'),
('Aluguel', 'Imóveis ABC', 10000, '2026-04-01', 'pago'),
('Material de Escritório', 'Papelaria Central', 1500, '2026-04-20', 'pendente'),
('Manutenção Veículos', 'Auto Posto 24h', 3500, '2026-04-18', 'pendente');