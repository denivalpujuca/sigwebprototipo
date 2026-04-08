# SigWEB - Sistema de Gestão

Sistema web para gestão empresarial integrada com módulos de administrativo, vendas, estoque, Oficina e Frota.

## Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + Shadcn UI
- **Ícones**: Lucide React + Material Icons
- **Roteamento**: React Router v6

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/          # Componentes Shadcn (Button, Select, Sheet, etc.)
│   ├── Icon.tsx     # Wrapper para Material Icons
│   └── AppSidebar.tsx
├── pages/           # Páginas do sistema
├── lib/             # Utilitários
└── App.tsx          # Rotas principais
```

## Menu do Sistema

### Administrativo
- Dashboard
- Almoxarifados
- Auditoria
- Clientes
- Contratos
- Empresas
- Período Ano
- Serviços

### Compras
- Fornecedores
- Solicitação de Compra
- Pedidos de Compra

### Financeiro
- Contas a Pagar
- Contas a Receber

### Frota
- Marcas
- Modelos
- Veículos e Máquinas

### Gente e Gestão
- Auditoria
- Cargos
- Funcionários

### Oficina
- Dashboard
- Ordem de Serviço

### Resíduos
- Resíduos MTR
- Resíduos Urbano

### Suprimentos
- Produtos
- Catálogo de Produtos
- Requisição de Compra
- Req. Departamentos

### T.I.
- Permissões
- Tipos de Usuário
- Usuários

### Vendas
- Catálogo de Serviços
- Gestão de Orçamentos

## Componentes UI (Shadcn)

O projeto utiliza componentes do Shadcn UI:
- Select, Button, Input
- Sheet (side drawer)
- Card, Badge
- Collapsible

## Padrões de Código

### Select Shadcn
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcao1">Opção 1</SelectItem>
  </SelectContent>
</Select>
```

### Modal Centralizado
```tsx
{isModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
      {/* conteúdo */}
    </div>
  </div>
)}
```

### Tabela com Paginação
- Busca com `useMemo` filtrando por termo
- Paginação com `slice`
- totalPages calculado automaticamente

## Comandos

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Funcionalidades Implementadas

### Catálogos
- Catálogo de Produtos com carrinho de compras
- Catálogo de Serviços com carrinho de compras
- Gestionamento de orçamentos e vendas

### Cadastros
- Clientes, Fornecedores, Empresas
- Funcionários, Cargos, Tipos de Usuário
- Produtos, Serviços
- Marcas, Modelos, Veículos
- Almoxarifados, Contratos

### Controle
- Ordens de serviço e gestão de oficina
- Controle de estoque e requisições
- Gestão de compras e pedidos
- Contas a pagar e receber
- Resíduos MTR e Urbano
- Permissões e auditoria

### UI/UX
- Ordenação alfabética em catálogos
- Categorias via Select em filtros
- Modais centralizados para formulários
- Layout responsivo com Tailwind