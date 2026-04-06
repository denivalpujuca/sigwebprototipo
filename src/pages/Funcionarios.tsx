import { useState, useMemo, useRef } from 'react';
import { MainLayout } from '../components/PageLayout';
import { Select } from '../components/Select';

interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  empresa: string;
  dataAdmissao: string;
  status: 'ATIVO' | 'FERIAS' | 'LICENCA' | 'DEMITIDO';
  fotos: string[];
}

const initialFuncionarios: Funcionario[] = [
  { id: 1, nome: 'Ricardo Mendes', cpf: '123.456.789-00', email: 'ricardo@empresa.com', telefone: '(11) 99999-9999', cargo: 'Diretor', empresa: 'Gestão Urbana S/A', dataAdmissao: '2020-01-15', status: 'ATIVO', fotos: ['https://placehold.co/100x100/006e2d/white?text=RM'] },
  { id: 2, nome: 'João Silva', cpf: '234.567.890-11', email: 'joao@empresa.com', telefone: '(11) 88888-8888', cargo: 'Motorista', empresa: 'Serviços Metropolitanos', dataAdmissao: '2021-03-20', status: 'ATIVO', fotos: ['https://placehold.co/100x100/006e2d/white?text=JS'] },
  { id: 3, nome: 'Maria Santos', cpf: '345.678.901-22', email: 'maria@empresa.com', telefone: '(21) 77777-7777', cargo: 'Assistente', empresa: 'Ambiental Norte S/A', dataAdmissao: '2022-06-10', status: 'ATIVO', fotos: ['https://placehold.co/100x100/006e2d/white?text=MS'] },
  { id: 4, nome: 'Pedro Oliveira', cpf: '456.789.012-33', email: 'pedro@empresa.com', telefone: '(31) 66666-6666', cargo: 'Mecânico', empresa: 'Transporte Público', dataAdmissao: '2021-09-05', status: 'FERIAS', fotos: ['https://placehold.co/100x100/006e2d/white?text=PO'] },
  { id: 5, nome: 'Ana Costa', cpf: '567.890.123-44', email: 'ana@empresa.com', telefone: '(41) 55555-5555', cargo: 'Técnica T.I.', empresa: 'Saneamento Básico S/A', dataAdmissao: '2023-01-15', status: 'ATIVO', fotos: ['https://placehold.co/100x100/006e2d/white?text=AC'] },
];

interface FuncionariosProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export const FuncionariosPage: React.FC<FuncionariosProps> = ({ activeSection: externalActiveSection, onSectionChange: externalOnSectionChange, onLogout }) => {
  const [internalActiveSection, setInternalActiveSection] = useState('frota');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const activeSection = externalActiveSection || internalActiveSection;
  const setActiveSection = externalOnSectionChange || setInternalActiveSection;

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(initialFuncionarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [selectedFotoIndex, setSelectedFotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO' as Funcionario['status'], fotos: [] as string[] });
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
          <title>Relatório de Funcionários</title>
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
          <h1>Relatório de Funcionários</h1>
          <p>Total de registros: ${filteredFuncionarios.length}</p>
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>CPF</th><th>Cargo</th><th>Empresa</th><th>Admissão</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredFuncionarios.map(f => `
                <tr>
                  <td>${f.nome}</td><td>${f.cpf}</td><td>${f.cargo}</td><td>${f.empresa}</td><td>${new Date(f.dataAdmissao).toLocaleDateString('pt-BR')}</td><td>${f.status}</td>
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

  const filteredFuncionarios = useMemo(() => {
    return funcionarios.filter(funcionario => {
      const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcionario.cpf.includes(searchTerm) ||
        funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || funcionario.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [funcionarios, searchTerm, filterStatus]);

  const paginatedFuncionarios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFuncionarios.slice(start, start + itemsPerPage);
  }, [filteredFuncionarios, currentPage]);

  const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage);

  const handleSave = () => {
    if (editingFuncionario) {
      setFuncionarios(prev => prev.map(f => f.id === editingFuncionario.id ? { ...formData, id: editingFuncionario.id } : f));
    } else {
      const newId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
      setFuncionarios(prev => [...prev, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
    setEditingFuncionario(null);
    setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO', fotos: [] });
    setSelectedFotoIndex(0);
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setFormData({ 
      nome: funcionario.nome, 
      cpf: funcionario.cpf, 
      email: funcionario.email, 
      telefone: funcionario.telefone, 
      cargo: funcionario.cargo, 
      empresa: funcionario.empresa, 
      dataAdmissao: funcionario.dataAdmissao, 
      status: funcionario.status,
      fotos: [...funcionario.fotos]
    });
    setSelectedFotoIndex(0);
    setIsModalOpen(true);
  };

  const handleToggle = (id: number) => {
    setFuncionarios(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'ATIVO' ? 'DEMITIDO' : 'ATIVO' } : f));
  };

  const handleAdd = () => {
    setEditingFuncionario(null);
    setFormData({ nome: '', cpf: '', email: '', telefone: '', cargo: '', empresa: '', dataAdmissao: '', status: 'ATIVO', fotos: [] });
    setSelectedFotoIndex(0);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const newFotos = [...prev.fotos, reader.result as string];
          setSelectedFotoIndex(newFotos.length - 1);
          return { ...prev, fotos: newFotos };
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleRemoveFoto = (index: number) => {
    const newFotos = formData.fotos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, fotos: newFotos }));
    if (selectedFotoIndex >= newFotos.length && newFotos.length > 0) {
      setSelectedFotoIndex(newFotos.length - 1);
    } else if (newFotos.length === 0) {
      setSelectedFotoIndex(0);
    }
  };

  const handleMoveFoto = (index: number, direction: 'left' | 'right') => {
    const newFotos = [...formData.fotos];
    if (direction === 'left' && index > 0) {
      [newFotos[index - 1], newFotos[index]] = [newFotos[index], newFotos[index - 1]];
      setSelectedFotoIndex(index - 1);
    } else if (direction === 'right' && index < newFotos.length - 1) {
      [newFotos[index], newFotos[index + 1]] = [newFotos[index + 1], newFotos[index]];
      setSelectedFotoIndex(index + 1);
    }
    setFormData(prev => ({ ...prev, fotos: newFotos }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-[#7ffc97] text-[#002109]';
      case 'FERIAS':
        return 'bg-[#bae3ff] text-[#003366]';
      case 'LICENCA':
        return 'bg-[#ffe4b3] text-[#663c00]';
      case 'DEMITIDO':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const content = (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        <span className="hover:text-[#006e2d] cursor-pointer">Página Inicial</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#006e2d] cursor-pointer">Gente e Gestão</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#191c1d]">Funcionários</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Funcionários</h1>
            <p className="text-[#555f70] text-sm">Gerenciamento de funcionários.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            <div className="bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#006e2d]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">ATIVOS</span>
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {funcionarios.filter(f => f.status === 'ATIVO').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Funcionários</div>
              </div>
            </div>
            <div className="bg-[#005ac2] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#005ac2]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">FÉRIAS</span>
                <span className="material-symbols-outlined">beach_access</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {funcionarios.filter(f => f.status === 'FERIAS').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Em Férias</div>
              </div>
            </div>
            <div className="bg-[#f59e0b] text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg shadow-[#f59e0b]/10">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold tracking-widest text-white opacity-80">PENDÊNCIAS</span>
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {funcionarios.filter(f => f.status === 'LICENCA').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white opacity-80">Licenças</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
            <input
              type="text"
              placeholder="Pesquisar funcionário"
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 pr-10 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="FERIAS">Férias</option>
              <option value="LICENCA">Licença</option>
              <option value="DEMITIDO">Demitido</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#555f70] pointer-events-none text-lg">expand_more</span>
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
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest w-16">Foto</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">CPF</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Cargo</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest">Empresa</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Admissão</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 border-b border-gray-300">
              {paginatedFuncionarios.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#555f70]">Nenhum registro encontrado</td>
                </tr>
              ) : (
                paginatedFuncionarios.map(funcionario => (
                  <tr key={funcionario.id} className="hover:bg-[#f3f4f5]/50 transition-colors">
                    <td className="px-4 py-4">
                      {funcionario.fotos.length > 0 ? (
                        <img src={funcionario.fotos[0]} alt="Foto" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#f3f4f5] flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#191c1d]">{funcionario.nome}</td>
                    <td className="px-4 py-4 text-sm font-mono text-[#555f70]">{funcionario.cpf}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{funcionario.cargo}</td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{funcionario.empresa}</td>
                    <td className="px-4 py-4 text-center text-sm text-[#555f70]">
                      {new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(funcionario.status)}`}>
                        {funcionario.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(funcionario)} className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleToggle(funcionario.id)} className={`p-1.5 transition-colors ${funcionario.status === 'ATIVO' ? 'text-[#555f70] hover:text-[#ba1a1a]' : 'text-[#006e2d] hover:opacity-70'}`}>
                          <span className="material-symbols-outlined text-[20px]">{funcionario.status === 'ATIVO' ? 'block' : 'check_circle'}</span>
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
          <span className="text-xs text-[#555f70] font-medium">Exibindo {paginatedFuncionarios.length} de {filteredFuncionarios.length} registros</span>
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
          <div className="bg-white/85 backdrop-blur-[20px] rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]/10">
              <h2 className="text-lg font-bold text-[#191c1d]">{editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#555f70] hover:text-[#191c1d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#bccbb9]/20">
                    {formData.fotos.length > 0 ? (
                      <>
                        <div className="w-full h-80 rounded-lg overflow-hidden bg-white mb-4 flex items-center justify-center border border-gray-200">
                          <img src={formData.fotos[selectedFotoIndex]} alt="Foto principal" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 items-center">
                          {formData.fotos.map((foto, index) => (
                            <div key={index} className="relative flex flex-col items-center">
                              <button
                                type="button"
                                onClick={() => setSelectedFotoIndex(index)}
                                className={`relative group flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 ${selectedFotoIndex === index ? 'border-[#006e2d]' : 'border-transparent hover:border-gray-300'}`}
                              >
                                <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFoto(index); }}
                                  className="absolute -top-2 -right-2 bg-[#ba1a1a] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </button>
                              {formData.fotos.length > 1 && (
                                <div className="flex gap-0.5 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveFoto(index, 'left')}
                                    disabled={index === 0}
                                    className="p-0.5 text-gray-400 hover:text-[#006e2d] disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveFoto(index, 'right')}
                                    disabled={index === formData.fotos.length - 1}
                                    className="p-0.5 text-gray-400 hover:text-[#006e2d] disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-shrink-0 w-20 h-20 rounded-full border-2 border-dashed border-gray-300 hover:border-[#006e2d] flex items-center justify-center text-gray-400 hover:text-[#006e2d] transition-colors bg-white"
                          >
                            <span className="material-symbols-outlined text-3xl">add</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-80 rounded-full bg-white mb-4 flex items-center justify-center border border-gray-200">
                          <div className="text-center text-[#555f70]">
                            <span className="material-symbols-outlined text-6xl mb-2">person</span>
                            <p className="text-sm">Nenhuma foto adicionada</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#555f70] hover:border-[#006e2d] hover:text-[#006e2d] transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">add_a_photo</span>
                          Adicionar foto
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome</label>
                    <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#191c1d] mb-1">CPF</label>
                      <input type="text" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#191c1d] mb-1">Telefone</label>
                      <input type="text" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191c1d] mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#191c1d] mb-1">Cargo</label>
                      <input type="text" value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#191c1d] mb-1">Empresa</label>
                      <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#191c1d] mb-1">Data de Admissão</label>
                      <input type="date" value={formData.dataAdmissao} onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })} className="w-full px-4 py-2.5 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm" required />
                    </div>
                    <Select
                      label="Status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Funcionario['status'] })}
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="FERIAS">Férias</option>
                      <option value="LICENCA">Licença</option>
                      <option value="DEMITIDO">Demitido</option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[#bccbb9]/20">
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