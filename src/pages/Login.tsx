import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialIcon } from '@/components/Icon';

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
      case 'medica': return 'Saúde do Trabalhador - PCMSO';
      default: return sistema;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">SW</div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-slate-900">SigWeb Prototipo</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Sistema de Gestão</span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 text-center mb-6">Acesso ao Sistema</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Usuário</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MaterialIcon name="person" size={20} />
                </div>
                <Input
                  type="text"
                  value={usuario}
                  onChange={(e) => { setUsuario(e.target.value); setError(''); }}
                  className="pl-10"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MaterialIcon name="lock" size={20} />
                </div>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError(''); }}
                  className="pl-10"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sistema</label>
              <Select value={sistema} onValueChange={setSistema}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sistema" />
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
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-emerald-600 hover:underline">Esqueceu sua senha?</a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-xs text-slate-400">© 2026 SigWeb. Todos os direitos reservados.</span>
        </div>
      </div>
    </div>
  );
};