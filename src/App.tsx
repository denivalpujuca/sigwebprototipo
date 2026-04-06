import { useState, useEffect } from 'react';
import { VehiclesPage } from './pages/Vehicles';
import { SolicitacaoCompraPage } from './pages/SolicitacaoCompra';
import { PedidosCompraPage } from './pages/PedidosCompra';
import { ProdutosPage } from './pages/Produtos';
import { TiposUsuarioPage } from './pages/TiposUsuario';
import { UsuariosPage } from './pages/Usuarios';
import { PermissoesPage } from './pages/Permissoes';
import { ClientesPage } from './pages/Clientes';
import { EmpresasPage } from './pages/Empresas';
import { ContratosPage } from './pages/Contratos';
import { ServicosPage } from './pages/Servicos';
import { CatalogoServicosPage } from './pages/CatalogoServicos';
import { FuncionariosPage } from './pages/Funcionarios';
import { CargosPage } from './pages/Cargos';
import { ResiduosUrbanoPage } from './pages/ResiduosUrbano';
import { ResiduosMTRPage } from './pages/ResiduosMTR';
import { PeriodoAnoPage } from './pages/PeriodoAno';
import { FornecedoresPage } from './pages/Fornecedores';
import { VendasPage } from './pages/Vendas';
import { GestaoVendasPage } from './pages/GestaoVendas';
import { AuditoriaPage } from './pages/Auditoria';
import { AuditoriaAdminPage } from './pages/AuditoriaAdmin';
import { ContasPagarPage } from './pages/ContasPagar';
import { ContasReceberPage } from './pages/ContasReceber';
import { LoginPage } from './pages/Login';
import { AbastecimentoPage } from './pages/Abastecimento';
import { FiscalPage } from './pages/Fiscal';
import { OficinaDashboardPage } from './pages/OficinaDashboard';
import { OrdemServicoPage } from './pages/OrdemServico';
import { MarcasPage } from './pages/Marcas';
import { ModelosPage } from './pages/Modelos';
import { DocumentacaoPage } from './pages/Documentacao';
import { AlmoxarifadosPage } from './pages/Almoxarifados';
import { RequisicaoCompraProdutosPage } from './pages/RequisicaoCompraProdutos';
import { RequisicaoDepartamentoPage } from './pages/RequisicaoDepartamento';

function App() {
  const [sistema, setSistema] = useState<'saas' | 'abastecimento' | 'fiscal'>('saas');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('loggedIn');
    if (storedLoggedIn === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem('activeSection');
    return saved || 'periodo-ano';
  });

  const handleLogin = (sistemaSelecionado: string) => {
    setSistema(sistemaSelecionado as 'saas' | 'abastecimento' | 'fiscal');
    localStorage.setItem('sistema', sistemaSelecionado);
    if (sistemaSelecionado === 'saas') {
      setLoggedIn(true);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('activeSection', 'periodo-ano');
      setActiveSection('periodo-ano');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('sistema');
    localStorage.removeItem('activeSection');
    setLoggedIn(false);
    setSistema('saas');
    setActiveSection('periodo-ano');
  };

  const handleSectionChange = (section: string) => {
    if (section === 'sair') {
      handleLogout();
      return;
    }
    localStorage.setItem('activeSection', section);
    setActiveSection(section);
  };

  // Sistemas isolados (Abastecimento e Fiscal) - não precisam de login
  if (sistema === 'abastecimento') {
    return <AbastecimentoPage activeSection="abastecimento" onSectionChange={() => {}} onLogout={handleLogout} />;
  }

  if (sistema === 'fiscal') {
    return <FiscalPage activeSection="fiscal" onSectionChange={() => {}} onLogout={handleLogout} />;
  }

  // Para SaaS, verifica se está logado
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    const pageProps = { activeSection, onSectionChange: handleSectionChange, onLogout: handleLogout };
    switch (activeSection) {
      case 'periodo-ano':
        return <PeriodoAnoPage {...pageProps} />;
      case 'residuos-urbano':
        return <ResiduosUrbanoPage {...pageProps} />;
      case 'residuos-mtr':
        return <ResiduosMTRPage {...pageProps} />;
      case 'cargos':
        return <CargosPage {...pageProps} />;
      case 'funcionarios':
        return <FuncionariosPage {...pageProps} />;
      case 'clientes':
        return <ClientesPage {...pageProps} />;
      case 'empresas':
        return <EmpresasPage {...pageProps} />;
      case 'almoxarifados':
        return <AlmoxarifadosPage {...pageProps} />;
      case 'contratos':
        return <ContratosPage {...pageProps} />;
      case 'servicos':
        return <ServicosPage {...pageProps} />;
      case 'veiculos':
        return <VehiclesPage {...pageProps} />;
      case 'marcas':
        return <MarcasPage {...pageProps} />;
      case 'modelos':
        return <ModelosPage {...pageProps} />;
      case 'marcas-modelos':
        return <MarcasPage {...pageProps} />;
      case 'solicitacao-compra':
        return <SolicitacaoCompraPage {...pageProps} />;
      case 'pedidos-compra':
        return <PedidosCompraPage {...pageProps} />;
      case 'tipos-usuario':
        return <TiposUsuarioPage {...pageProps} />;
      case 'usuarios':
        return <UsuariosPage {...pageProps} />;
      case 'permissoes':
        return <PermissoesPage {...pageProps} />;
      case 'produtos':
        return <ProdutosPage {...pageProps} />;
      case 'catalogo-produtos':
        return <VendasPage {...pageProps} />;
      case 'requisicao-compra-produtos':
        return <RequisicaoCompraProdutosPage {...pageProps} />;
      case 'requisicao-departamento':
        return <RequisicaoDepartamentoPage {...pageProps} />;
      case 'fornecedores':
        return <FornecedoresPage {...pageProps} />;
      case 'catalogo-servicos':
        return <CatalogoServicosPage {...pageProps} />;
      case 'vendas-relatorio':
        return <GestaoVendasPage {...pageProps} />;
      case 'contas-pagar':
        return <ContasPagarPage {...pageProps} />;
      case 'contas-receber':
        return <ContasReceberPage {...pageProps} />;
      case 'auditoria-admin':
        return <AuditoriaAdminPage {...pageProps} />;
      case 'auditoria':
        return <AuditoriaPage {...pageProps} />;
      case 'oficina-dashboard':
        return <OficinaDashboardPage {...pageProps} />;
      case 'ordem-servico':
        return <OrdemServicoPage {...pageProps} />;
      case 'documentacao':
        return <DocumentacaoPage {...pageProps} />;
      case 'sair':
        window.location.reload();
        return null;
      default:
        return <VehiclesPage {...pageProps} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {renderPage()}
    </div>
  );
}

export default App;