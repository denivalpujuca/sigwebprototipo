import React, { useState } from 'react';
import { MainLayout } from '../components/PageLayout';

interface DocumentacaoPageProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onLogout?: () => void;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Module {
  id: string;
  title: string;
  icon: string;
  sections: Section[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  type: 'single' | 'group';
  sections?: Section[];
  children?: Module[];
}

const menuItems: MenuItem[] = [
  {
    id: 'introducao',
    title: 'Introdução',
    icon: 'info',
    type: 'single',
    sections: [
      {
        id: 'intro',
        title: 'Sobre o Sistema',
        content: `
          <p>O <strong>SigWeb</strong> (Sistema de Gestão Web) é um sistema integrado de gestão de frotas e serviços administrativos.</p>
          <p>Desenvolvido para fornecer controle eficiente de veículos, máquinas, funcionários, clientes, fornecedores, ordens de serviço e muito mais.</p>
          <p>O sistema é composto por módulos principais:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>SaaS</strong> - Módulo principal de gestão</li>
            <li><strong>Abastecimento</strong> - Controle de abastecimento (mobile)</li>
            <li><strong>Fiscal</strong> - Controle de frequência de funcionários</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 'modulos',
    title: 'Módulos',
    icon: 'apps',
    type: 'group',
    children: [
      {
        id: 'administrativo',
        title: 'Administração',
        icon: 'admin_panel_settings',
        sections: [
          {
            id: 'clientes',
            title: 'Clientes',
            content: `
              <p>Cadastro de clientes (PF e PJ).</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Dados pessoais/fiscais (CPF/CNPJ)</li>
                <li>Contato (e-mail, telefone)</li>
                <li>Endereço</li>
                <li>Status Ativo/Inativo</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'empresas',
            title: 'Empresas',
            content: `
              <p>Empresas parceiras ou contratadas.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Razão social, CNPJ, ramo</li>
                <li>Contatos e responsável</li>
                <li>Status Ativo/Inativo</li>
              </ul>
              `
          },
          {
            id: 'almoxarifados',
            title: 'Almoxarifados',
            content: `
              <p>Gerenciamento de almoxarifados e depósitos.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de almoxarifados</li>
                <li>Endereço e responsável</li>
                <li>Vinculação a empresa</li>
                <li>Status Ativo/Inativo</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'contratos',
            title: 'Contratos',
            content: `
              <p>Controle de contratos firmados.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Número, empresa, datas, valor</li>
                <li>Status: Ativo, Expirado, Cancelado</li>
                <li>Controle de vigência</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'servicos',
            title: 'Serviços',
            content: `
              <p>Tipos de serviços oferecidos.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de serviços</li>
                <li>Status Ativo/Inativo</li>
              </ul>
            `
          },
          {
            id: 'periodo-ano',
            title: 'Período Ano',
            content: `
              <p>Controle de períodos mensais.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Mês/Ano com configuração de dias úteis</li>
                <li>Contagem de sábados úteis</li>
                <li>Status: Aberto, Fechado</li>
                <li>Filtro por ano</li>
              </ul>
            `
          },
          {
            id: 'auditoria-admin',
            title: 'Auditoria',
            content: `
              <p>Registro de auditoria das operações administrativas.</p>
              <h3>Informações Registradas</h3>
              <ul>
                <li>Data e hora da operação</li>
                <li>Usuário responsável</li>
                <li>Tipo de operação</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'compras',
        title: 'Compras',
        icon: 'shopping_bag',
        sections: [
          {
            id: 'fornecedores',
            title: 'Fornecedores',
            content: `
              <p>Cadastro de fornecedores para compras.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Dados cadastrais (nome, CNPJ, contato)</li>
                <li>Status Ativo/Inativo</li>
                <li>Busca por nome ou CNPJ</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'produtos',
            title: 'Produtos',
            content: `
              <p>Catálogo de produtos para compras.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro com código, nome, preço, categoria</li>
                <li>Upload de foto do produto</li>
                <li>Status Ativo/Inativo</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'solicitacao-compra',
            title: 'Solicitação de Compra',
            content: `
              <p>Visualização e cotação de produtos provenientes das requisições de suprimentos.</p>
              <h3>Fluxo</h3>
              <ul>
                <li>Produtos são originados das requisições pendentes (em Suprimentos)</li>
                <li>Quantidade automática da requisição</li>
                <li>Preço editável para cotação</li>
                <li>Adição ao carrinho com destaque visual</li>
                <li>Status 'solicitado' após pedido criado</li>
              </ul>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Filtro por categoria</li>
                <li>Carrinho de compras</li>
                <li>Confirmação de pedido</li>
                <li>Atualização automática das requisições</li>
              </ul>
            `
          },
          {
            id: 'pedidos-compra',
            title: 'Pedidos de Compra',
            content: `
              <p>Pedidos de compra finalizados.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Criar pedido com múltiplos itens</li>
                <li>Cálculo automático de total</li>
                <li>Fluxo de aprovação</li>
                <li>Relatório PDF</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'suprimentos',
        title: 'Suprimentos',
        icon: 'inventory_2',
        sections: [
          {
            id: 'produtos-suprimentos',
            title: 'Produtos',
            content: `
              <p>Catálogo de produtos para suprimentos.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro com código, nome, preço, categoria</li>
                <li>Upload de foto do produto</li>
                <li>Status Ativo/Inativo</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'requisicao-compra-produtos',
            title: 'Requisição de Compra',
            content: `
              <p>Requisições de compra de produtos realizadas pelos setores solicitantes.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Setor solicitante</li>
                <li>Almoxarifado de destino</li>
                <li>Data prevista de entrega</li>
                <li>Justificativa geral</li>
                <li>Adicionar produtos cadastrados ou novos</li>
                <li>Quantidade e justificativa por item</li>
                <li>Status: Pendente → Aprovado/Rejeitado/Comprado</li>
              </ul>
            `
          },
          {
            id: 'requisicao-departamento',
            title: 'Requisição Departamentos',
            content: `
              <p>Solicitação de produtos pelos departamentos da empresa.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Seleção de empresa e departamento</li>
                <li>Identificação do solicitante</li>
                <li>Seleção de produtos</li>
                <li>Acompanhamento de status</li>
                <li>Filtro por status</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'financeiro',
        title: 'Financeiro',
        icon: 'account_balance',
        sections: [
          {
            id: 'contas-pagar',
            title: 'Contas a Pagar',
            content: `
              <p>Controle de contas a pagar.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro com descrição, valor, fornecedor, vencimento</li>
                <li>Status: Pendente, Pago</li>
                <li>Filtragem por período e status</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'contas-receber',
            title: 'Contas a Receber',
            content: `
              <p>Controle de contas a receber.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro com descrição, valor, cliente, vencimento</li>
                <li>Status: Pendente, Recebido</li>
                <li>Filtragem por período e status</li>
                <li>Relatório PDF</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'frota',
        title: 'Frota',
        icon: 'local_shipping',
        sections: [
          {
            id: 'veiculos',
            title: 'Veículos e Máquinas',
            content: `
              <p>Controle completo da frota de veículos e máquinas.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de veículos com todos os dados técnicos</li>
                <li>Controle de status: Disponível, Manutenção, Inativo</li>
                <li>Busca por nome, placa ou marca</li>
                <li>Filtro por status</li>
                <li>Relatório PDF agrupado por marca (ordem ascendente)</li>
              </ul>
              <h3>Campos do Cadastro</h3>
              <ul>
                <li><strong>Nome:</strong> Identificação do veículo</li>
                <li><strong>Placa:</strong> Número da placa</li>
                <li><strong>Chassi:</strong> Número do chassi</li>
                <li><strong>Volume:</strong> Capacidade volumétrica</li>
                <li><strong>Marca/Modelo/Tipo:</strong> Dados de identificação</li>
              </ul>
            `
          },
          {
            id: 'marcas',
            title: 'Marcas',
            content: `
              <p>Cadastro e gestão de marcas de veículos e máquinas.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de marcas com tipo (Caminhão, Máquina, Guindaste)</li>
                <li>Edição e desativação de marcas</li>
                <li>Filtro por status (Ativo/Inativo)</li>
              </ul>
              <h3 class="mt-6">Estrutura da Tabela</h3>
              <table class="min-w-full border border-gray-300 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Coluna</th>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Tipo</th>
                    <th class="border border-gray-300 px-3 py-2 text-center font-semibold">Obrigatório</th>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Padrão</th>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">id</td>
                    <td class="border border-gray-300 px-3 py-2">INTEGER</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">auto</td>
                    <td class="border border-gray-300 px-3 py-2">PK — Identificador único</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">nome</td>
                    <td class="border border-gray-300 px-3 py-2">VARCHAR(100)</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">—</td>
                    <td class="border border-gray-300 px-3 py-2">Nome da marca (SCANIA, VOLVO, etc.)</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">tipo</td>
                    <td class="border border-gray-300 px-3 py-2">VARCHAR(50)</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">—</td>
                    <td class="border border-gray-300 px-3 py-2">Tipo de veículo (Caminhão, Máquina, Guindaste)</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">ativo</td>
                    <td class="border border-gray-300 px-3 py-2">BOOLEAN</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">true</td>
                    <td class="border border-gray-300 px-3 py-2">Status ativo/inativo</td>
                  </tr>
                </tbody>
              </table>
              <h4 class="mt-4 font-semibold">Constraints</h4>
              <ul class="list-disc pl-6">
                <li><code>pk_marcas</code> — PRIMARY KEY sobre (id)</li>
                <li><code>uk_marcas_nome</code> — UNIQUE sobre (nome)</li>
                <li><code>chk_marcas_tipo</code> — CHECK (tipo IN: 'Caminhão', 'Máquina', 'Guindaste')</li>
              </ul>
              <h4 class="mt-4 font-semibold">Índices</h4>
              <ul class="list-disc pl-6">
                <li><code>idx_marcas_ativo</code> — ON (ativo)</li>
                <li><code>idx_marcas_tipo</code> — ON (tipo)</li>
              </ul>
              <h4 class="mt-4 font-semibold">Dados de Exemplo</h4>
              <table class="min-w-full border border-gray-300 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border border-gray-300 px-3 py-2">ID</th>
                    <th class="border border-gray-300 px-3 py-2">Nome</th>
                    <th class="border border-gray-300 px-3 py-2">Tipo</th>
                    <th class="border border-gray-300 px-3 py-2">Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="border border-gray-300 px-3 py-2">1</td><td class="border border-gray-300 px-3 py-2">SCANIA</td><td class="border border-gray-300 px-3 py-2">Caminhão</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">2</td><td class="border border-gray-300 px-3 py-2">VOLVO</td><td class="border border-gray-300 px-3 py-2">Caminhão</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">3</td><td class="border border-gray-300 px-3 py-2">MERCEDES</td><td class="border border-gray-300 px-3 py-2">Caminhão</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">7</td><td class="border border-gray-300 px-3 py-2">CATERPILLAR</td><td class="border border-gray-300 px-3 py-2">Máquina</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">12</td><td class="border border-gray-300 px-3 py-2">LIEBHERR</td><td class="border border-gray-300 px-3 py-2">Guindaste</td><td class="border border-gray-300 px-3 py-2">false</td></tr>
                </tbody>
              </table>
            `
          },
          {
            id: 'modelos',
            title: 'Modelos',
            content: `
              <p>Cadastro de modelos vinculados às marcas.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cada modelo relacionado a uma marca</li>
                <li>Filtro por marca e status</li>
                <li>Controle de ativos/inativos</li>
              </ul>
              <h3 class="mt-6">Estrutura da Tabela</h3>
              <table class="min-w-full border border-gray-300 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Coluna</th>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Tipo</th>
                    <th class="border border-gray-300 px-3 py-2 text-center font-semibold">Obrigatório</th>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Padrão</th>
                    <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">id</td>
                    <td class="border border-gray-300 px-3 py-2">INTEGER</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">auto</td>
                    <td class="border border-gray-300 px-3 py-2">PK — Identificador único</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">marcaId</td>
                    <td class="border border-gray-300 px-3 py-2">INTEGER</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">—</td>
                    <td class="border border-gray-300 px-3 py-2">FK — Referência à tabela Marcas</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">marca</td>
                    <td class="border border-gray-300 px-3 py-2">VARCHAR(100)</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">—</td>
                    <td class="border border-gray-300 px-3 py-2">Nome da marca (denormalizado)</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">nome</td>
                    <td class="border border-gray-300 px-3 py-2">VARCHAR(100)</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">—</td>
                    <td class="border border-gray-300 px-3 py-2">Nome do modelo (R 420, FH 440, etc.)</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-300 px-3 py-2">ativo</td>
                    <td class="border border-gray-300 px-3 py-2">BOOLEAN</td>
                    <td class="border border-gray-300 px-3 py-2 text-center">Sim</td>
                    <td class="border border-gray-300 px-3 py-2">true</td>
                    <td class="border border-gray-300 px-3 py-2">Status ativo/inativo</td>
                  </tr>
                </tbody>
              </table>
              <h4 class="mt-4 font-semibold">Constraints</h4>
              <ul class="list-disc pl-6">
                <li><code>pk_modelos</code> — PRIMARY KEY sobre (id)</li>
                <li><code>fk_modelos_marca</code> — FOREIGN KEY (marcaId) REFERENCES Marcas(id)</li>
                <li><code>uk_modelos_nome_marca</code> — UNIQUE sobre (nome, marcaId)</li>
              </ul>
              <h4 class="mt-4 font-semibold">Índices</h4>
              <ul class="list-disc pl-6">
                <li><code>idx_modelos_marcaId</code> — ON (marcaId)</li>
                <li><code>idx_modelos_ativo</code> — ON (ativo)</li>
              </ul>
              <h4 class="mt-4 font-semibold">Relacionamentos</h4>
              <ul class="list-disc pl-6">
                <li>modelos.marcaId → marcas.id (N:1) — Cada modelo pertence a uma marca</li>
              </ul>
              <h4 class="mt-4 font-semibold">Dados de Exemplo</h4>
              <table class="min-w-full border border-gray-300 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border border-gray-300 px-3 py-2">ID</th>
                    <th class="border border-gray-300 px-3 py-2">marcaId</th>
                    <th class="border border-gray-300 px-3 py-2">Marca</th>
                    <th class="border border-gray-300 px-3 py-2">Nome</th>
                    <th class="border border-gray-300 px-3 py-2">Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="border border-gray-300 px-3 py-2">1</td><td class="border border-gray-300 px-3 py-2">1</td><td class="border border-gray-300 px-3 py-2">SCANIA</td><td class="border border-gray-300 px-3 py-2">R 420</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">2</td><td class="border border-gray-300 px-3 py-2">1</td><td class="border border-gray-300 px-3 py-2">SCANIA</td><td class="border border-gray-300 px-3 py-2">G 440</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">3</td><td class="border border-gray-300 px-3 py-2">2</td><td class="border border-gray-300 px-3 py-2">VOLVO</td><td class="border border-gray-300 px-3 py-2">FH 440</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">10</td><td class="border border-gray-300 px-3 py-2">7</td><td class="border border-gray-300 px-3 py-2">CATERPILLAR</td><td class="border border-gray-300 px-3 py-2">140B</td><td class="border border-gray-300 px-3 py-2">true</td></tr>
                  <tr><td class="border border-gray-300 px-3 py-2">15</td><td class="border border-gray-300 px-3 py-2">12</td><td class="border border-gray-300 px-3 py-2">LIEBHERR</td><td class="border border-gray-300 px-3 py-2">LTM 1100-4.2</td><td class="border border-gray-300 px-3 py-2">false</td></tr>
                </tbody>
              </table>
            `
          }
        ]
      },
      {
        id: 'gente-gestao',
        title: 'Gente e Gestão',
        icon: 'groups',
        sections: [
          {
            id: 'funcionarios',
            title: 'Funcionários',
            content: `
              <p>Gestão de funcionários.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro com dados pessoais e cargo</li>
                <li>Upload de foto</li>
                <li>Status: Ativo, Férias, Licença, Demitido</li>
                <li>Busca e filtros</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'cargos',
            title: 'Cargos',
            content: `
              <p>Definição de cargos da organização.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de cargos</li>
                <li>Status Ativo/Inativo</li>
              </ul>
            `
          },
          {
            id: 'auditoria-gg',
            title: 'Auditoria',
            content: `
              <p>Registro de auditoria de RH e gestão de pessoas.</p>
            `
          }
        ]
      },
      {
        id: 'oficina',
        title: 'Oficina',
        icon: 'build',
        sections: [
          {
            id: 'dashboard-oficina',
            title: 'Dashboard',
            content: `
              <p>Visão geral da oficina com indicadores de desempenho.</p>
              <h3>Indicadores</h3>
              <ul>
                <li><strong>OS Abertas:</strong> Ordens aguardando atendimento</li>
                <li><strong>Em Andamento:</strong> Serviços em execução</li>
                <li><strong>Aguardando Peças:</strong> OS paradas por falta de peças</li>
                <li><strong>Concluídas:</strong> Total de OS finalizadas</li>
              </ul>
            `
          },
          {
            id: 'ordem-servico',
            title: 'Ordem de Serviço',
            content: `
              <p>Gestão de ordens de serviço para manutenção.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Criar OS com veículo, placa e serviço</li>
                <li>Status: Aberta → Em Andamento → Aguardando Peças → Concluída</li>
                <li>Edição e exclusão de registros</li>
                <li>Busca por veículo ou placa</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'residuos',
        title: 'Resíduos',
        icon: 'delete',
        sections: [
          {
            id: 'residuos-urbano',
            title: 'Resíduos Urbano',
            content: `
              <p>Controle de resíduos urbanos coletados.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de coletas por tipo (Orgânico, Reciclável, Rejeito)</li>
                <li>Origem e volume</li>
                <li>Status: Coletado, Pendente, Atrasado</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'residuos-mtr',
            title: 'Resíduos MTR',
            content: `
              <p>Controle de Manifestos de Transporte de Resíduos.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de MTR com resíduo, classe, quantidade</li>
                <li>Transportador responsável</li>
                <li>Status: Emitido, Transportado, Recebido, Cancelado</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'ti',
        title: 'T.I.',
        icon: 'computer',
        sections: [
          {
            id: 'usuarios',
            title: 'Usuários',
            content: `
              <p>Gerenciamento de usuários do sistema.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro com nome, e-mail, tipo</li>
                <li>Status Ativo/Inativo</li>
                <li>Relatório PDF</li>
              </ul>
            `
          },
          {
            id: 'tipos-usuario',
            title: 'Tipos de Usuário',
            content: `
              <p>Definição de tipos de usuário e níveis de acesso.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Cadastro de tipos</li>
                <li>Status Ativo/Inativo</li>
              </ul>
            `
          },
          {
            id: 'permissoes',
            title: 'Permissões',
            content: `
              <p>Configuração de permissões por tipo de usuário.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Vincular permissões a tipos</li>
                <li>Controle de acesso por módulo</li>
              </ul>
            `
          }
        ]
      },
      {
        id: 'vendas',
        title: 'Vendas',
        icon: 'point_of_sale',
        sections: [
          {
            id: 'catalogo-produtos',
            title: 'Catálogo de Produtos',
            content: `
              <p>Catálogo de produtos para venda com controle de estoque.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Seleção de empresa para ver estoque</li>
                <li>Filtro por categoria</li>
                <li>Busca de produtos</li>
                <li>Carrinho de compras</li>
                <li>Controle de estoque por empresa</li>
                <li>Finalização de venda</li>
              </ul>
            `
          },
          {
            id: 'gestao-vendas',
            title: 'Gestão de Vendas',
            content: `
              <p>Controle e acompanhamento de vendas.</p>
              <h3>Funcionalidades</h3>
              <ul>
                <li>Registro de vendas realizadas</li>
                <li>Vinculação a cliente</li>
                <li>Controle de valor e data</li>
              </ul>
            `
          }
        ]
      }
    ]
  },
  {
    id: 'sistema',
    title: 'Sistema',
    icon: 'settings',
    type: 'single',
    sections: [
      {
        id: 'navegacao',
        title: 'Navegação',
        content: `
          <h3>Menu Lateral</h3>
          <p>Todas as opções organizadas por módulos:</p>
          <ul class="grid grid-cols-2 gap-2">
            <li>Administrativo (6 itens)</li>
            <li>Frota (3 itens)</li>
            <li>Gente e Gestão (3 itens)</li>
            <li>Oficina (2 itens)</li>
            <li>Compras (4 itens)</li>
            <li>Financeiro (2 itens)</li>
          </ul>
          <h3 class="mt-4">Header</h3>
          <ul>
            <li>Ícone de documentação (menu_book)</li>
            <li>Ícone de notificações</li>
            <li>Data e hora</li>
            <li>Botão de logout</li>
          </ul>
        `
      },
      {
        id: 'identidade',
        title: 'Identidade Visual',
        content: `
          <h3>Cores do Sistema</h3>
          <ul>
            <li><strong>Verde Primário:</strong> #006e2d → #44c365</li>
            <li><strong>Ativo:</strong> #7ffc97</li>
            <li><strong>Inativo:</strong> #ffdad6</li>
            <li><strong>Texto Principal:</strong> #191c1d</li>
            <li><strong>Texto Secundário:</strong> #555f70</li>
          </ul>
          <h3 class="mt-4">Logo</h3>
          <p>SW (SigWeb) em verde gradiente</p>
        `
      },
      {
        id: 'tecnologias',
        title: 'Tecnologias',
        content: `
          <h3>Stack de Desenvolvimento</h3>
          <ul>
            <li><strong>Frontend:</strong> React + TypeScript + Vite</li>
            <li><strong>Estilização:</strong> TailwindCSS</li>
            <li><strong>Ícones:</strong> Material Symbols</li>
            <li><strong>Dados:</strong> LocalStorage</li>
          </ul>
        `
      }
    ]
  }
];

export const DocumentacaoPage: React.FC<DocumentacaoPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('documentacao');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('introducao');
  const [activeModule, setActiveModule] = useState('clientes');
  const [activeSection, setActiveSection] = useState('intro');

  const activeSectionVal = externalActiveSection || internalActiveSection;
  const setActiveSectionVal = externalOnSectionChange || setInternalActiveSection;

  const currentMenu = menuItems.find(m => m.id === activeMenuItem);
  const modulosItem = menuItems.find(m => m.id === 'modulos');
  const currentModule = modulosItem?.children?.find(c => c.id === activeModule);
  
  let currentSections: Section[] | undefined;
  let currentSectionData: Section | undefined;

  if (activeMenuItem === 'modulos' && currentModule) {
    currentSections = currentModule.sections;
    currentSectionData = currentModule.sections.find(s => s.id === activeSection);
  } else if (currentMenu?.sections) {
    currentSections = currentMenu.sections;
    currentSectionData = currentMenu.sections.find(s => s.id === activeSection);
  }

  const handleMenuClick = (menuId: string, type: string) => {
    setActiveMenuItem(menuId);
    if (type === 'single') {
      if (menuId === 'introducao') {
        setActiveSection('intro');
      } else if (menuId === 'sistema') {
        setActiveSection('navegacao');
      }
    } else if (type === 'group') {
      const modulos = menuItems.find(m => m.id === 'modulos');
      if (modulos?.children && modulos.children.length > 0) {
        setActiveModule(modulos.children[0].id);
        setActiveSection(modulos.children[0].sections[0].id);
      }
    }
  };

  const handleModuleClick = (moduleId: string) => {
    const modulos = menuItems.find(m => m.id === 'modulos');
    const module = modulos?.children?.find(c => c.id === moduleId);
    if (module) {
      setActiveMenuItem('modulos');
      setActiveModule(moduleId);
      setActiveSection(module.sections[0].id);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="text-[#191c1d]">Documentação</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Documentação do Sistema</h1>
        <p className="text-[#555f70] text-sm"> Guia de referência do SigWeb </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Menu */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-3">
            <nav className="space-y-1">
              {menuItems.filter(item => item.id !== 'modulos').map(item => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id, item.type)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeMenuItem === item.id
                      ? 'bg-[#006e2d] text-white'
                      : 'text-[#555f70] hover:bg-[#f3f4f5]'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              ))}
              <div className="px-4 py-3 text-sm font-medium text-[#191c1d] border-t border-gray-200 mt-2">Módulos</div>
              {modulosItem?.children?.map(child => (
                <button
                  key={child.id}
                  onClick={() => handleModuleClick(child.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-sm transition-colors ${
                    activeMenuItem === 'modulos' && activeModule === child.id
                      ? 'bg-[#e8f5e9] text-[#006e2d] font-medium'
                      : 'text-[#555f70] hover:bg-[#f3f4f5]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{child.icon}</span>
                  <span>{child.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sections within selected module */}
        {currentSections && currentSections.length > 0 && (
          <div className="lg:w-56 shrink-0">
            <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-3">
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                {currentSections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#e8f5e9] text-[#006e2d] font-medium'
                        : 'text-[#555f70] hover:bg-[#f3f4f5]'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-8">
            {currentSectionData ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <span className="material-symbols-outlined text-[#006e2d] text-3xl">
                    {currentModule?.icon || currentMenu?.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#191c1d]">
                      {currentModule?.title || currentMenu?.title}
                    </h2>
                    <p className="text-sm text-[#555f70]">{currentSectionData.title}</p>
                  </div>
                </div>
                <div 
                  className="prose prose-sm max-w-none text-[#555f70] space-y-3"
                  dangerouslySetInnerHTML={{ __html: currentSectionData.content }}
                />
              </>
            ) : (
              <div className="text-[#555f70]">Selecione uma seção no menu.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout 
      activeSection={activeSectionVal} 
      onSectionChange={setActiveSectionVal} 
      onLogout={() => setShowLogoutModal(true)} 
      showLogoutModal={showLogoutModal} 
      onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} 
      onCancelLogout={() => setShowLogoutModal(false)}
    >
      {content}
    </MainLayout>
  );
};