export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl mb-6">
        SW
      </div>
      <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">SigWeb</h1>
      <p className="text-slate-400 text-lg uppercase tracking-widest">Sistema de Gestão</p>
    </div>
  );
};
