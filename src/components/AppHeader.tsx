import React from 'react';
import { NavLink } from 'react-router-dom';
import { MaterialIcon } from './Icon';

export const AppHeader: React.FC = () => {
  const [horaAtual, setHoraAtual] = React.useState(new Date().toLocaleTimeString('pt-BR'));
  const [dataAtual] = React.useState(new Date().toLocaleDateString('pt-BR'));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('sistema');
    localStorage.removeItem('activeSection');
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">DS</div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Denival Santos</h1>
          <span className="text-xs text-slate-500">Administrador</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NavLink 
          to="/documentacao"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          title="Documentação"
        >
          <MaterialIcon name="menu_book" />
        </NavLink>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          <MaterialIcon name="notifications" />
        </button>
        <div className="text-right">
          <div className="text-lg font-mono font-bold text-slate-900">{horaAtual}</div>
          <div className="text-xs text-slate-500">{dataAtual}</div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          <MaterialIcon name="logout" />
        </button>
      </div>
    </header>
  );
};