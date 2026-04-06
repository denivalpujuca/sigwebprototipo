import { useState, useMemo } from 'react';
import { MainLayout } from '../components/PageLayout';

interface Empresa {
  id: number;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  segmento: string;
  ativo: boolean;
}

const initialEmpresas: Empresa[] = [
  { id: 1, nomeFantasia: 'Tech Solutions', razaoSocial: 'Tech Solutions Tecnologia Ltda', cnpj: '12.345.678/0001-90', email: 'contato@techsolutions.com.br', telefone: '(11) 3333-3333', endereco: 'Av. Paulista, 1000', segmento: 'Tecnologia', ativo: true },
  { id: 2, nomeFantasia: 'Auto Peças Delta', razaoSocial: 'Delta Auto Peças Ltda', cnpj: '23.456.789/0001-01', email: 'vendas@deltapecas.com.br', telefone: '(11) 4444-4444', endereco: 'Rua das Peças, 200', segmento: 'Automotivo', ativo: true },
  { id: 3, nomeFantasia: 'Serviços ABC', razaoSocial: 'ABC Serviços Gerais Ltda', cnpj: '34.567.890/0001-12', email: 'contato@abcservicos.com.br', telefone: '(21) 5555-5555', endereco: 'Av. Rio Branco, 300', segmento: 'Serviços', ativo: true },
  { id: 4, nomeFantasia: 'Logística XYZ', razaoSocial: 'XYZ Logística Ltda', cnpj: '45.678.901/0001-23', email: 'operacao@xyzlog.com.br', telefone: '(31) 6666-6666', endereco: 'Av. Getúlio Vargas, 400', segmento: 'Logística', ativo: false },
  { id: 5, nomeFantasia: 'Construtora Mega', razaoSocial: 'Mega Construções Ltda', cnpj: '56.789.012/0001-34', email: 'projetos@megaconstrucoes.com.br', telefone: '(41) 7777-7777', endereco: 'Rua das Obras, 500', segmento: 'Construção Civil', ativo: true },
];

interface EmpresasProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const EmpresasPage: React.FC<EmpresasProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativos' | 'inativos'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({ nomeFantasia: '', razaoSocial: '', cnpj: '', email: '', telefone: '', endereco: '', segmento: '' });
  const itemsPerPage = 5;

  const handleSearch = () => {
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const handlePrint = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Empresas</title>
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
          <h1>Relatório de Empresas</h1>
          <p>Total de registros: ${filteredEmpresas.length}</p>
          <table>
            <thead>
              <tr>
                <th>Cod</th><th>Nome Fantasia</th><th>Razão Social</th><th>CNPJ</th><th>Segmento</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmpresas.map(e => `
                <tr>
                  <td>${e.id}</td><td>${e.nomeFantasia}</td><td>${e.razaoSocial}</td><td>${e.cnpj}</td><td>${e.segmento}</td><td>${e.ativo ? 'Ativo' : 'Inativo'}</td>
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

  const filteredEmpresas = useMemo(() => {
    return empresas.filter(empresa => {
      const matchesSearch = 
        empresa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cnpj.includes(searchTerm) ||
        empresa.segmento.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'ativos' && empresa.ativo) || (filterStatus === 'inativos' && !empresa.ativo);
      return matchesSearch && matchesStatus;
    });
  }, [empresas, searchTerm, filterStatus]);

  const paginatedEmpresas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmpresas.slice(start, start + itemsPerPage);
  }, [filteredEmpresas, currentPage]);

  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);

  const handleSave = () => {
    if (editingEmpresa) {
      setEmpresas(prev => prev.map(e => e.id === editingEmpresa.id ? { ...formData, id: editingEmpresa.id, ativo: editingEmpresa.ativo } : e));
    } else {
      const newId = Math.max(...empresas.map(e => e.id), 0) + 1;
      setEmpresas(prev => [...prev, { ...formData, id: newId, ativo: true }]);
    }
    setIsModalOpen(false);
    setEditingEmpresa(null);
    setFormData({ nomeFantasia: '', razaoSocial: '', cnpj: '', email: '', telefone: '', endereco: '', segmento: '' });
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({ nomeFantasia: empresa.nomeFantasia, razaoSocial: empresa.razaoSocial, cnpj: empresa.cnpj, email: empresa.email, telefone: empresa.telefone, endereco: empresa.endereco, segmento: empresa.segmento });
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ativo: !e.ativo } : e));
  };

  const handleAdd = () => {
    setEditingEmpresa(null);
    setFormData({ nomeFantasia: '', razaoSocial: '', cnpj: '', email: '', telefone: '', endereco: '', segmento: '' });
    setIsModalOpen(true);
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Administrativo</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Empresas</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Empresas</h1>
        <p className="text-[#555f70] text-sm">Cadastro e gerenciamento de empresas parceiras.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar empresa"
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
        <button
          onClick={handleAdd}
          className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome Fantasia</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Razão Social</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">CNPJ</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Segmento</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedEmpresas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedEmpresas.map(empresa => (
                  <tr key={empresa.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-[#191c1d]">{empresa.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{empresa.nomeFantasia}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{empresa.razaoSocial}</td>
                    <td className="px-4 py-4 text-sm font-mono text-[#555f70]">{empresa.cnpj}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{empresa.segmento}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${empresa.ativo ? 'bg-[#7ffc97] text-[#002109]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {empresa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(empresa)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(empresa.id)} className={`p-1.5 transition-colors ${empresa.ativo ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{empresa.ativo ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedEmpresas.length} de {filteredEmpresas.length} registros</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded ${currentPage === page ? 'bg-[#006e2d] text-white' : 'hover:bg-[#e7e8e9]'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 rounded hover:bg-[#e7e8e9] text-[#555f70]">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome Fantasia</label>
                <input type="text" value={formData.nomeFantasia} onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Razão Social</label>
                <input type="text" value={formData.razaoSocial} onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">CNPJ</label>
                <input type="text" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Telefone</label>
                <input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Endereço</label>
                <input type="text" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-1">Segmento</label>
                <input type="text" value={formData.segmento} onChange={(e) => setFormData({ ...formData, segmento: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#191c1d] text-sm font-semibold rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">save</span>
                  Salvar
                </button>
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