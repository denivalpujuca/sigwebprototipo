import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { MaterialIcon } from './Icon';
import { LogoutContext } from '../App';
import { useEmpresa } from '../context/EmpresaContext';
import { useNotificacoes } from '../context/NotificacaoContext';

export const AppHeader: React.FC = () => {
  const { onLogout } = useContext(LogoutContext);
  const { empresas, empresaSelecionada, setEmpresaSelecionada, isAdmin, isLoading } = useEmpresa();
  const { notificacoes, unreadCount, marcarLida, marcarTodasLidas } = useNotificacoes();
  const [horaAtual, setHoraAtual] = useState(new Date().toLocaleTimeString('pt-BR'));
  const [dataAtual] = useState(new Date().toLocaleDateString('pt-BR'));
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);
  const [showNotificacoesDropdown, setShowNotificacoesDropdown] = useState(false);
  const notificacoesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && empresas.length === 1 && !empresaSelecionada) {
      setEmpresaSelecionada(empresas[0]);
    }
  }, [isLoading, empresas, empresaSelecionada, setEmpresaSelecionada]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target as Node)) {
        setShowNotificacoesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatarTempo = (data: string) => {
    const date = new Date(data);
    const agora = new Date();
    const diff = Math.floor((agora.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {isAdmin && empresas.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowEmpresaDropdown(!showEmpresaDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <MaterialIcon name="business" />
              <span className="text-sm font-medium text-slate-700">
                {empresaSelecionada?.nome || 'Selecionar Empresa'}
              </span>
              <MaterialIcon name={showEmpresaDropdown ? 'expand_less' : 'expand_more'} />
            </button>
            {showEmpresaDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                {empresas.map((empresa) => (
                  <button
                    key={empresa.id}
                    onClick={() => {
                      setEmpresaSelecionada(empresa);
                      setShowEmpresaDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors ${
                      empresaSelecionada?.id === empresa.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    {empresa.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!isAdmin && empresaSelecionada && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <MaterialIcon name="business" />
            <span className="text-sm font-medium text-blue-700">{empresaSelecionada.nome}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NavLink 
          to="/documentacao"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          title="Documentação"
        >
          <MaterialIcon name="menu_book" />
        </NavLink>
        
        <div className="relative" ref={notificacoesRef}>
          <button 
            onClick={() => setShowNotificacoesDropdown(!showNotificacoesDropdown)}
            className={`p-2 rounded-lg transition-colors relative flex items-center gap-2 ${
              unreadCount > 0 
                ? 'bg-red-50 hover:bg-red-100' 
                : 'hover:bg-slate-100'
            }`}
          >
            {unreadCount > 0 ? (
              <svg className="w-6 h-6 animate-bounce" style={{ color: '#dc2626' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
            ) : (
              <MaterialIcon name="notifications" className="text-slate-500" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="text-xs font-medium" style={{ color: '#dc2626' }}>
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </button>
          
          {showNotificacoesDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl w-80 max-h-96 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-sm font-semibold text-slate-700">Notificações</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => { marcarTodasLidas(); }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 text-sm">
                    Nenhuma notificação
                  </div>
                ) : (
                  notificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => { marcarLida(notif.id); setShowNotificacoesDropdown(false); }}
                      className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                        notif.lida ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.lida && (
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{notif.titulo}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.mensagem}</p>
                          <p className="text-xs text-slate-400 mt-1">{formatarTempo(notif.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-lg font-mono font-bold text-slate-900">{horaAtual}</div>
          <div className="text-xs text-slate-500">{dataAtual}</div>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          <MaterialIcon name="logout" />
        </button>
      </div>
      {showEmpresaDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowEmpresaDropdown(false)}
        />
      )}
    </header>
  );
};
