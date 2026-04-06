import { useState } from 'react';

interface LoginProps {
  onLogin: (sistema: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [sistema, setSistema] = useState('saas');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    onLogin(sistema);
  };

  const getSistemaLabel = (sistema: string) => {
    switch (sistema) {
      case 'saas': return 'SaaS - Gestão de Frotas';
      case 'abastecimento': return 'Abastecimento';
      case 'fiscal': return 'Fiscal - Controle de Chamada';
      default: return sistema;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e3132] to-[#1a1d1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#006e2d] to-[#44c365] rounded-lg flex items-center justify-center text-white font-bold text-xl">SW</div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-[#191c1d]">SigWeb Prototipo</span>
              <span className="text-[10px] uppercase tracking-widest text-[#555f70]">Sistema de Gestão</span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#191c1d] text-center mb-6">Acesso ao Sistema</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-2">Usuário</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">person</span>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => { setUsuario(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] focus:border-transparent text-sm"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-2">Senha</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">lock</span>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] focus:border-transparent text-sm"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-2">Sistema</label>
              <div className="relative">
                <select
                  value={sistema}
                  onChange={(e) => setSistema(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fa] border border-[#bccbb9]/30 rounded-lg focus:ring-2 focus:ring-[#006e2d] focus:border-transparent text-sm appearance-none cursor-pointer"
                >
                  <option value="saas">{getSistemaLabel('saas')}</option>
                  <option value="abastecimento">{getSistemaLabel('abastecimento')}</option>
                  <option value="fiscal">{getSistemaLabel('fiscal')}</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none">expand_more</span>
              </div>
            </div>

            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-[#006e2d] hover:underline">Esqueceu sua senha?</a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-xs text-slate-400">© 2026 SigWeb. Todos os direitos reservados.</span>
        </div>
      </div>
    </div>
  );
};