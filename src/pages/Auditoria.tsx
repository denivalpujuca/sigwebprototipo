import { useState } from 'react';
import { MainLayout } from '../components/PageLayout';

interface AuditoriaRegistro {
  id: number;
  data: string;
  usuario: string;
  acao: string;
  modulo: string;
  detalhe: string;
}

const initialRegistros: AuditoriaRegistro[] = [
  { id: 1, data: '2026-04-05 10:30:00', usuario: 'Ricardo Mendes', acao: 'Criação', modulo: 'Funcionários', detalhe: 'Novo funcionário: João Silva' },
  { id: 2, data: '2026-04-05 11:15:00', usuario: 'Maria Santos', acao: 'Edição', modulo: 'Produtos', detalhe: 'Atualização de preço: Caneta esferográfica' },
  { id: 3, data: '2026-04-04 09:00:00', usuario: 'Ricardo Mendes', acao: 'Exclusão', modulo: 'Contratos', detalhe: 'Contrato removido: 0000005/2026' },
  { id: 4, data: '2026-04-04 14:30:00', usuario: 'Pedro Oliveira', acao: 'Criação', modulo: 'Fornecedores', detalhe: 'Novo fornecedor: Distribuidora ABC' },
  { id: 5, data: '2026-04-03 16:45:00', usuario: 'Ana Costa', acao: 'Edição', modulo: 'Veículos', detalhe: 'Atualização de status: ABC-1234 (Manutenção)' },
  { id: 6, data: '2026-04-03 08:20:00', usuario: 'Ricardo Mendes', acao: 'Login', modulo: 'Sistema', detalhe: 'Acesso ao sistema' },
];

interface AuditoriaProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const AuditoriaPage: React.FC<AuditoriaProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const parentMenu = activeSection === 'auditoria-admin' ? 'Administrativo' : 'Gente e Gestão';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModulo, setFilterModulo] = useState('all');
  const [filterAcao, setFilterAcao] = useState('all');

  const filteredRegistros = initialRegistros.filter(registro => {
    const matchesSearch = registro.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.detalhe.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModulo = filterModulo === 'all' || registro.modulo === filterModulo;
    const matchesAcao = filterAcao === 'all' || registro.acao === filterAcao;
    return matchesSearch && matchesModulo && matchesAcao;
  });

  const modulos = [...new Set(initialRegistros.map(r => r.modulo))];
  const acoes = [...new Set(initialRegistros.map(r => r.acao))];

  const getAcaoBadge = (acao: string) => {
    switch (acao) {
      case 'Criação':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'Edição':
        return 'bg-[#bae3ff] text-[#003366]';
      case 'Exclusão':
        return 'bg-[#ffdad6] text-[#93000a]';
      case 'Login':
        return 'bg-[#ffe4b3] text-[#663c00]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">{parentMenu}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Auditoria</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Auditoria</h1>
        <p className="text-[#555f70] text-sm">Registro de atividades do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterModulo}
              onChange={(e) => setFilterModulo(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Módulos</option>
              {modulos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
          <div className="relative">
            <select
              value={filterAcao}
              onChange={(e) => setFilterAcao(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todas as Ações</option>
              {acoes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Data</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Usuário</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Ação</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Módulo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                filteredRegistros.map(registro => (
                  <tr key={registro.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-[#555f70] font-mono">{registro.data}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#191c1d]">{registro.usuario}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getAcaoBadge(registro.acao)}`}>
                        {registro.acao}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{registro.modulo}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70] max-w-xs truncate">{registro.detalhe}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={() => setShowLogoutModal(true)} showLogoutModal={showLogoutModal} onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} onCancelLogout={() => setShowLogoutModal(false)}>
      {content}
    </MainLayout>
  );
};