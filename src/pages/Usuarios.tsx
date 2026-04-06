import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';
import { Select } from '../components/Select';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  tipoUsuario: string;
  ativo: boolean;
  ultimoAcesso: Date | null;
}

const initialUsuarios: Usuario[] = [
  { id: 1, nome: 'Ricardo Mendes', email: 'ricardo.mendes@fleet.com', cpf: '123.456.789-00', tipoUsuario: 'Administrador', ativo: true, ultimoAcesso: new Date('2026-04-04') },
  { id: 2, nome: 'Juliana Silva', email: 'juliana.silva@fleet.com', cpf: '234.567.890-11', tipoUsuario: 'Gerente', ativo: true, ultimoAcesso: new Date('2026-04-03') },
  { id: 3, nome: 'Carlos Oliveira', email: 'carlos.oliveira@fleet.com', cpf: '345.678.901-22', tipoUsuario: 'Operador', ativo: true, ultimoAcesso: new Date('2026-04-02') },
  { id: 4, nome: 'Ana Paula Santos', email: 'ana.santos@fleet.com', cpf: '456.789.012-33', tipoUsuario: 'Operador', ativo: false, ultimoAcesso: new Date('2026-03-28') },
  { id: 5, nome: 'Bruno Costa', email: 'bruno.costa@fleet.com', cpf: '567.890.123-44', tipoUsuario: 'Visualizador', ativo: true, ultimoAcesso: new Date('2026-04-01') },
  { id: 6, nome: 'Patrícia Lima', email: 'patricia.lima@fleet.com', cpf: '678.901.234-55', tipoUsuario: 'Auditor', ativo: true, ultimoAcesso: null },
  { id: 7, nome: 'Roberto Alves', email: 'roberto.alves@fleet.com', cpf: '789.012.345-66', tipoUsuario: 'Operador', ativo: true, ultimoAcesso: new Date('2026-04-04') },
  { id: 8, nome: 'Fernanda Costa', email: 'fernanda.costa@fleet.com', cpf: '890.123.456-77', tipoUsuario: 'Gerente', ativo: true, ultimoAcesso: new Date('2026-04-03') },
];

interface UsuariosPageProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const UsuariosPage: React.FC<UsuariosPageProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativos' | 'inativos'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '', cpf: '', tipoUsuario: 'Operador', ativo: true });
  const itemsPerPage = 4;

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Usuários</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #191c1d; margin-bottom: 10px; }
            p { color: #555f70; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f3f4f5; }
          </style>
        </head>
        <body>
          <h1>Relatório de Usuários</h1>
          <p>Total de registros: ${filteredUsuarios.length}</p>
          <table>
            <thead>
              <tr>
                <th>Cod</th><th>Nome</th><th>Email</th><th>CPF</th><th>Tipo</th><th>Último Acesso</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsuarios.map(u => `
                <tr>
                  <td>${u.id}</td><td>${u.nome}</td><td>${u.email}</td><td>${u.cpf}</td><td>${u.tipoUsuario}</td><td>${formatarData(u.ultimoAcesso)}</td><td>${u.ativo ? 'Ativo' : 'Inativo'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    printFrame.contentWindow?.document.write(content);
    printFrame.contentWindow?.document.close();
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = 
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.cpf.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'ativos' && usuario.ativo) || (filterStatus === 'inativos' && !usuario.ativo);
      return matchesSearch && matchesStatus;
    });
  }, [usuarios, searchTerm, filterStatus]);

  const paginatedUsuarios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsuarios.slice(start, start + itemsPerPage);
  }, [filteredUsuarios, currentPage]);

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  const handleSave = () => {
    if (editingUsuario) {
      setUsuarios(prev => prev.map(u => u.id === editingUsuario.id ? { ...formData, id: editingUsuario.id, ultimoAcesso: editingUsuario.ultimoAcesso } : u));
    } else {
      const newId = Math.max(...usuarios.map(u => u.id), 0) + 1;
      setUsuarios(prev => [...prev, { ...formData, id: newId, ultimoAcesso: null }]);
    }
    setIsModalOpen(false);
    setEditingUsuario(null);
    setFormData({ nome: '', email: '', cpf: '', tipoUsuario: 'Operador', ativo: true });
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({ nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, tipoUsuario: usuario.tipoUsuario, ativo: usuario.ativo });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u));
  };

  const handleAdd = () => {
    setEditingUsuario(null);
    setFormData({ nome: '', email: '', cpf: '', tipoUsuario: 'Operador', ativo: true });
    setIsModalOpen(true);
  };

  const formatarData = (data: Date | null) => {
    if (!data) return 'Nunca';
    return data.toLocaleDateString('pt-BR');
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">T.I.</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Usuários</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Usuários</h1>
        <p className="text-[#555f70] text-sm">Gerenciamento de usuários do sistema.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">TOTAL</span>
            <span className="material-symbols-outlined">people</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{usuarios.length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Usuários</div>
          </div>
        </div>
        <div className="bg-[#005ac2] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#005ac2]/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ATIVOS</span>
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{usuarios.filter(u => u.ativo).length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Ativos</div>
          </div>
        </div>
        <div className="bg-[#ba1a1a] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#ba1a1a]/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold tracking-widest text-white opacity-80">INATIVOS</span>
            <span className="material-symbols-outlined">person_off</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{usuarios.filter(u => !u.ativo).length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Inativos</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar usuário"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-[#006e2d] text-white rounded-md hover:bg-[#005a26] flex items-center gap-2"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">filter_list</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setCurrentPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm cursor-pointer appearance-none"
            >
              <option value="all">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7b6c] pointer-events-none">expand_more</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-white border border-gray-300 text-[#555f70] rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Gerar PDF
        </button>
        <button onClick={handleAdd} className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90">
          <span className="material-symbols-outlined">add</span>
          Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]">
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cod</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Email</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">CPF</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Tipo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Último Acesso</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedUsuarios.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td></tr>
              ) : (
                paginatedUsuarios.map(usuario => (
                  <tr key={usuario.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{usuario.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{usuario.nome}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{usuario.email}</td>
                    <td className="px-4 py-4 text-sm font-mono text-[#191c1d]">{usuario.cpf}</td>
                    <td className="px-4 py-4 text-center text-sm text-[#191c1d]">{usuario.tipoUsuario}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{formatarData(usuario.ultimoAcesso)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${usuario.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(usuario)} className="p-1.5 text-[#555f70] hover:text-[#006e2d]">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(usuario.id)} className={`p-1.5 ${usuario.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{usuario.ativo ? 'block' : 'check_circle'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedUsuarios.length} de {filteredUsuarios.length} registros</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-[#006e2d] text-white' : 'hover:bg-[#e7e8e9]'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome</label><input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required /></div>
              <div><label className="block text-sm font-semibold text-[#191c1d] mb-1">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required /></div>
              <div><label className="block text-sm font-semibold text-[#191c1d] mb-1">CPF</label><input type="text" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required /></div>
              <Select
                label="Tipo de Usuário"
                value={formData.tipoUsuario}
                onChange={(e) => setFormData({ ...formData, tipoUsuario: e.target.value })}
              >
                <option>Administrador</option>
                <option>Gerente</option>
                <option>Operador</option>
                <option>Visualizador</option>
                <option>Auditor</option>
              </Select>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg flex items-center gap-2"><span className="material-symbols-outlined">save</span>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection} onLogout={() => setShowLogoutModal(true)} showLogoutModal={showLogoutModal} onConfirmLogout={onLogout || (() => { localStorage.removeItem('loggedIn'); window.location.reload(); })} onCancelLogout={() => setShowLogoutModal(false)}>
      {content}
    </MainLayout>
  );
};