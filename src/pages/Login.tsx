import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialIcon } from '@/components/Icon';
import { api } from '@/lib/api';

interface LoginProps {
  onLogin: (sistema: string) => void;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [sistema, setSistema] = useState('saas');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const data = await api.list<Usuario>('usuarios');
        const ativos = data.filter((u: any) => u.ativo === 1 || u.ativo === true);
        setUsuarios(ativos);
      } catch (e) {
        console.error('Erro ao carregar usuários:', e);
        setError('Erro ao carregar usuários');
      } finally {
        setLoadingUsuarios(false);
      }
    };
    void loadUsuarios();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) {
      setError('Selecione um usuário');
      return;
    }
    setIsLoading(true);
    
    const usuario = usuarios.find(u => String(u.id) === usuarioId);
    
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('sistema', sistema);
    localStorage.setItem('usuario_id', usuarioId);
    localStorage.setItem('usuario_nome', usuario?.nome || '');
    
    setTimeout(() => {
      onLogin(sistema);
      setIsLoading(false);
    }, 300);
  };

  const getSistemaLabel = (s: string) => {
    switch (s) {
      case 'saas': return 'SaaS - Gestão de Frotas';
      case 'abastecimento': return 'Abastecimento';
      case 'fiscal': return 'Fiscal - Controle de Chamada';
      case 'medica': return 'Saúde do Trabalhador - PCMSO';
      default: return s;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              SW
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-slate-900">SigWeb</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Sistema de Gestão</span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 text-center mb-2">Bem-vindo</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Selecione seu usuário para acessar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Usuário</label>
              {loadingUsuarios ? (
                <div className="flex items-center justify-center h-11 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <Select value={usuarioId} onValueChange={(v) => { setUsuarioId(v); setError(''); }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione seu usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-slate-500">Nenhum usuário encontrado</div>
                    ) : (
                      usuarios.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          <div className="flex items-center gap-2">
                            <MaterialIcon name="person" size={16} />
                            <span>{u.nome}</span>
                            <span className="text-slate-400 text-xs">({u.email})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sistema</label>
              <Select value={sistema} onValueChange={(v) => { setSistema(v); setError(''); }}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">{getSistemaLabel('saas')}</SelectItem>
                  <SelectItem value="abastecimento">{getSistemaLabel('abastecimento')}</SelectItem>
                  <SelectItem value="fiscal">{getSistemaLabel('fiscal')}</SelectItem>
                  <SelectItem value="medica">{getSistemaLabel('medica')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 flex items-center gap-2">
                <MaterialIcon name="error_outline" size={16} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || loadingUsuarios || !usuarioId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                <>
                  <MaterialIcon name="login" size={20} />
                  <span>Entrar</span>
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <span className="text-xs text-slate-500">© 2026 SigWeb. Todos os direitos reservados.</span>
        </div>
      </div>
    </div>
  );
};
