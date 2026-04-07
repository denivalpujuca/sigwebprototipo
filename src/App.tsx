import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';

export const LogoutContext = createContext<{ onLogout: () => void }>({ onLogout: () => {} });

// @ts-ignore
const AdministrativoDashboardPage = React.lazy(() => import('./pages/AdministrativoDashboard').then(m => ({ default: (props: any) => React.createElement(m.AdministrativoDashboardPage, props) })));
// @ts-ignore
const DashboardPage = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: (props: any) => React.createElement(m.DashboardPage, props) })));
// @ts-ignore
const OficinaDashboardPage = React.lazy(() => import('./pages/OficinaDashboard').then(m => ({ default: (props: any) => React.createElement(m.OficinaDashboardPage, props) })));
// @ts-ignore
const VehiclesPage = React.lazy(() => import('./pages/Vehicles').then(m => ({ default: (props: any) => React.createElement(m.VehiclesPage, props) })));
// @ts-ignore
const ClientesPage = React.lazy(() => import('./pages/Clientes').then(m => ({ default: (props: any) => React.createElement(m.ClientesPage, props) })));
// @ts-ignore
const MarcasPage = React.lazy(() => import('./pages/Marcas').then(m => ({ default: (props: any) => React.createElement(m.MarcasPage, props) })));
// @ts-ignore
const ModelosPage = React.lazy(() => import('./pages/Modelos').then(m => ({ default: (props: any) => React.createElement(m.ModelosPage, props) })));
// @ts-ignore
const FuncionariosPage = React.lazy(() => import('./pages/Funcionarios').then(m => ({ default: (props: any) => React.createElement(m.FuncionariosPage, props) })));
// @ts-ignore
const CargosPage = React.lazy(() => import('./pages/Cargos').then(m => ({ default: (props: any) => React.createElement(m.CargosPage, props) })));
// @ts-ignore
const EmpresasPage = React.lazy(() => import('./pages/Empresas').then(m => ({ default: (props: any) => React.createElement(m.EmpresasPage, props) })));
// @ts-ignore
const ContratosPage = React.lazy(() => import('./pages/Contratos').then(m => ({ default: (props: any) => React.createElement(m.ContratosPage, props) })));
// @ts-ignore
const ServicosPage = React.lazy(() => import('./pages/Servicos').then(m => ({ default: (props: any) => React.createElement(m.ServicosPage, props) })));
// @ts-ignore
const FornecedoresPage = React.lazy(() => import('./pages/Fornecedores').then(m => ({ default: (props: any) => React.createElement(m.FornecedoresPage, props) })));
// @ts-ignore
const ProdutosPage = React.lazy(() => import('./pages/Produtos').then(m => ({ default: (props: any) => React.createElement(m.ProdutosPage, props) })));
// @ts-ignore
const UsuariosPage = React.lazy(() => import('./pages/Usuarios').then(m => ({ default: (props: any) => React.createElement(m.UsuariosPage, props) })));
// @ts-ignore
const TiposUsuarioPage = React.lazy(() => import('./pages/TiposUsuario').then(m => ({ default: (props: any) => React.createElement(m.TiposUsuarioPage, props) })));
// @ts-ignore
const PermissoesPage = React.lazy(() => import('./pages/Permissoes').then(m => ({ default: (props: any) => React.createElement(m.PermissoesPage, props) })));
// @ts-ignore
const SolicitacaoCompraPage = React.lazy(() => import('./pages/SolicitacaoCompra').then(m => ({ default: (props: any) => React.createElement(m.SolicitacaoCompraPage, props) })));
// @ts-ignore
const PedidosCompraPage = React.lazy(() => import('./pages/PedidosCompra').then(m => ({ default: (props: any) => React.createElement(m.PedidosCompraPage, props) })));
// @ts-ignore
const VendasPage = React.lazy(() => import('./pages/Vendas').then(m => ({ default: (props: any) => React.createElement(m.VendasPage, props) })));
// @ts-ignore
const GestaoVendasPage = React.lazy(() => import('./pages/GestaoVendas').then(m => ({ default: (props: any) => React.createElement(m.GestaoVendasPage, props) })));
// @ts-ignore
const ContasPagarPage = React.lazy(() => import('./pages/ContasPagar').then(m => ({ default: (props: any) => React.createElement(m.ContasPagarPage, props) })));
// @ts-ignore
const ContasReceberPage = React.lazy(() => import('./pages/ContasReceber').then(m => ({ default: (props: any) => React.createElement(m.ContasReceberPage, props) })));
// @ts-ignore
const AuditoriaPage = React.lazy(() => import('./pages/Auditoria').then(m => ({ default: (props: any) => React.createElement(m.AuditoriaPage, props) })));
// @ts-ignore
const AuditoriaAdminPage = React.lazy(() => import('./pages/AuditoriaAdmin').then(m => ({ default: (props: any) => React.createElement(m.AuditoriaAdminPage, props) })));
// @ts-ignore
const AlmoxarifadosPage = React.lazy(() => import('./pages/Almoxarifados').then(m => ({ default: (props: any) => React.createElement(m.AlmoxarifadosPage, props) })));
// @ts-ignore
const RequisicaoCompraProdutosPage = React.lazy(() => import('./pages/RequisicaoCompraProdutos').then(m => ({ default: (props: any) => React.createElement(m.RequisicaoCompraProdutosPage, props) })));
// @ts-ignore
const RequisicaoDepartamentoPage = React.lazy(() => import('./pages/RequisicaoDepartamento').then(m => ({ default: (props: any) => React.createElement(m.RequisicaoDepartamentoPage, props) })));
// @ts-ignore
const PeriodoAnoPage = React.lazy(() => import('./pages/PeriodoAno').then(m => ({ default: (props: any) => React.createElement(m.PeriodoAnoPage, props) })));
// @ts-ignore
const ResiduosUrbanoPage = React.lazy(() => import('./pages/ResiduosUrbano').then(m => ({ default: (props: any) => React.createElement(m.ResiduosUrbanoPage, props) })));
// @ts-ignore
const ResiduosMTRPage = React.lazy(() => import('./pages/ResiduosMTR').then(m => ({ default: (props: any) => React.createElement(m.ResiduosMTRPage, props) })));
// @ts-ignore
const CatalogoServicosPage = React.lazy(() => import('./pages/CatalogoServicos').then(m => ({ default: (props: any) => React.createElement(m.CatalogoServicosPage, props) })));
// @ts-ignore
const DocumentacaoPage = React.lazy(() => import('./pages/Documentacao').then(m => ({ default: (props: any) => React.createElement(m.DocumentacaoPage, props) })));
// @ts-ignore
const OrdemServicoPage = React.lazy(() => import('./pages/OrdemServico').then(m => ({ default: (props: any) => React.createElement(m.OrdemServicoPage, props) })));

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('loggedIn') === 'true';
  });

  useEffect(() => {
    const checkAuth = () => {
      const logged = localStorage.getItem('loggedIn') === 'true';
      setIsLoggedIn(logged);
      if (!logged) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 500);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleLogin = (sistema: string) => {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('sistema', sistema);
    setIsLoggedIn(true);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('sistema');
    setIsLoggedIn(false);
    navigate('/', { replace: true });
  };

  const PageContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <main className="p-6 overflow-y-auto bg-slate-50 h-full">{children}</main>
  );

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <LogoutContext.Provider value={{ onLogout: handleLogout }}>
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="w-72 shrink-0 border-0 bg-[#f5f5f5] flex flex-col h-full">
          <AppSidebar />
        </aside>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <AppHeader />
          <Routes>
            <Route path="/" element={<PageContent><HomePage /></PageContent>} />
            <Route path="/dashboard" element={<PageContent><DashboardPage /></PageContent>} />
            <Route path="/administrativo-dashboard" element={<PageContent><AdministrativoDashboardPage /></PageContent>} />
            <Route path="/oficina-dashboard" element={<PageContent><OficinaDashboardPage /></PageContent>} />
            <Route path="/marcas" element={<PageContent><MarcasPage /></PageContent>} />
            <Route path="/modelos" element={<PageContent><ModelosPage /></PageContent>} />
            <Route path="/veiculos" element={<PageContent><VehiclesPage /></PageContent>} />
            <Route path="/clientes" element={<PageContent><ClientesPage /></PageContent>} />
            <Route path="/empresas" element={<PageContent><EmpresasPage /></PageContent>} />
            <Route path="/funcionarios" element={<PageContent><FuncionariosPage /></PageContent>} />
            <Route path="/cargos" element={<PageContent><CargosPage /></PageContent>} />
            <Route path="/contratos" element={<PageContent><ContratosPage /></PageContent>} />
            <Route path="/servicos" element={<PageContent><ServicosPage /></PageContent>} />
            <Route path="/ordem-servico" element={<PageContent><OrdemServicoPage /></PageContent>} />
            <Route path="/fornecedores" element={<PageContent><FornecedoresPage /></PageContent>} />
            <Route path="/produtos" element={<PageContent><ProdutosPage /></PageContent>} />
            <Route path="/usuarios" element={<PageContent><UsuariosPage /></PageContent>} />
            <Route path="/tipos-usuario" element={<PageContent><TiposUsuarioPage /></PageContent>} />
            <Route path="/permissoes" element={<PageContent><PermissoesPage /></PageContent>} />
            <Route path="/solicitacao-compra" element={<PageContent><SolicitacaoCompraPage /></PageContent>} />
            <Route path="/pedidos-compra" element={<PageContent><PedidosCompraPage /></PageContent>} />
            <Route path="/catalogo-produtos" element={<PageContent><VendasPage /></PageContent>} />
            <Route path="/vendas-relatorio" element={<PageContent><GestaoVendasPage /></PageContent>} />
            <Route path="/contas-pagar" element={<PageContent><ContasPagarPage /></PageContent>} />
            <Route path="/contas-receber" element={<PageContent><ContasReceberPage /></PageContent>} />
            <Route path="/auditoria" element={<PageContent><AuditoriaPage /></PageContent>} />
            <Route path="/auditoria-admin" element={<PageContent><AuditoriaAdminPage /></PageContent>} />
            <Route path="/almoxarifados" element={<PageContent><AlmoxarifadosPage /></PageContent>} />
            <Route path="/requisicao-compra-produtos" element={<PageContent><RequisicaoCompraProdutosPage /></PageContent>} />
            <Route path="/requisicao-departamento" element={<PageContent><RequisicaoDepartamentoPage /></PageContent>} />
            <Route path="/periodo-ano" element={<PageContent><PeriodoAnoPage /></PageContent>} />
            <Route path="/residuos-urbano" element={<PageContent><ResiduosUrbanoPage /></PageContent>} />
            <Route path="/residuos-mtr" element={<PageContent><ResiduosMTRPage /></PageContent>} />
            <Route path="/catalogo-servicos" element={<PageContent><CatalogoServicosPage /></PageContent>} />
            <Route path="/documentacao" element={<PageContent><DocumentacaoPage /></PageContent>} />
          </Routes>
        </div>
      </div>
    </LogoutContext.Provider>
  );
}

export default App;
