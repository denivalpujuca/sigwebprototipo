import { useState } from 'react';
import { MainLayout } from '../components/PageLayout';

interface OficinaDashboardProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const OficinaDashboardPage: React.FC<OficinaDashboardProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('oficina-dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer" onClick={() => setActiveSection('oficina-dashboard')}>Oficina</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Dashboard</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p className="text-[#555f70] text-sm">Visão geral da oficina.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">OS ABERTAS</span>
            <span className="material-symbols-outlined">build</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">12</div>
        </div>
        <div className="bg-gradient-to-br from-[#005ac2] to-[#0088ff] text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">EM ANDAMENTO</span>
            <span className="material-symbols-outlined">engineering</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">5</div>
        </div>
        <div className="bg-gradient-to-br from-[#F4B400] to-[#FFD600] text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">AGUARDANDO PEÇAS</span>
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">3</div>
        </div>
        <div className="bg-gradient-to-br from-[#ba1a1a] to-[#ff6b6b] text-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">CONCLUÍDAS</span>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">48</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] p-6">
        <h2 className="text-lg font-bold text-[#191c1d] mb-4">Ordens de Serviço Recentes</h2>
        <div className="text-center text-[#555f70] py-8">
          <span className="material-symbols-outlined text-4xl mb-2">construction</span>
          <p>Nenhuma ordem de serviço recente</p>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection} 
      onLogout={() => setShowLogoutModal(true)} 
      showLogoutModal={showLogoutModal} 
      onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} 
      onCancelLogout={() => setShowLogoutModal(false)}
    >
      {content}
    </MainLayout>
  );
};