import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialIcon } from '@/components/Icon';

interface MedicaProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

interface FuncionarioMedico {
  id: number;
  nome: string;
  cargo: string;
  cpf: string;
  dataNascimento: string;
  tipoSanguineo: string;
  ultimoExame: string;
  proximoExame: string;
  status: 'apto' | 'inapto' | 'pendente' | 'exame-pendente';
  telefoneEmergencia: string;
  contatoEmergencia: string;
  alergias: string[];
  condicoes: string[];
}

const funcionarios: FuncionarioMedico[] = [
  { id: 1, nome: 'Ricardo Mendes', cargo: 'Diretor', cpf: '123.456.789-00', dataNascimento: '15/03/1975', tipoSanguineo: 'A+', ultimoExame: '10/01/2026', proximoExame: '10/07/2026', status: 'apto', telefoneEmergencia: '(11) 99999-0001', contatoEmergencia: 'Maria Mendes', alergias: [], condicoes: [] },
  { id: 2, nome: 'João Silva', cargo: 'Motorista', cpf: '234.567.890-11', dataNascimento: '22/08/1985', tipoSanguineo: 'O+', ultimoExame: '05/02/2026', proximoExame: '05/08/2026', status: 'apto', telefoneEmergencia: '(11) 99999-0002', contatoEmergencia: 'Ana Silva', alergias: ['Penicilina'], condicoes: [] },
  { id: 3, nome: 'Maria Santos', cargo: 'Assistente', cpf: '345.678.901-22', dataNascimento: '10/05/1990', tipoSanguineo: 'B-', ultimoExame: '20/12/2025', proximoExame: '20/06/2026', status: 'exame-pendente', telefoneEmergencia: '(11) 99999-0003', contatoEmergencia: 'Carlos Santos', alergias: [], condicoes: ['Hipertensão'] },
  { id: 4, nome: 'Pedro Oliveira', cargo: 'Mecânico', cpf: '456.789.012-33', dataNascimento: '03/11/1982', tipoSanguineo: 'A-', ultimoExame: '15/11/2025', proximoExame: '15/05/2026', status: 'inapto', telefoneEmergencia: '(11) 99999-0004', contatoEmergencia: 'Fernanda Oliveira', alergias: ['Dipirona'], condicoes: ['Diabetes'] },
  { id: 5, nome: 'Ana Costa', cargo: 'Técnica T.I.', cpf: '567.890.123-44', dataNascimento: '28/02/1995', tipoSanguineo: 'AB+', ultimoExame: '08/03/2026', proximoExame: '08/09/2026', status: 'apto', telefoneEmergencia: '(11) 99999-0005', contatoEmergencia: 'Roberto Costa', alergias: [], condicoes: [] },
  { id: 6, nome: 'Carlos Souza', cargo: 'Motorista', cpf: '678.901.234-55', dataNascimento: '17/07/1988', tipoSanguineo: 'O-', ultimoExame: '25/01/2026', proximoExame: '25/07/2026', status: 'apto', telefoneEmergencia: '(11) 99999-0006', contatoEmergencia: 'Juliana Souza', alergias: [], condicoes: [] },
  { id: 7, nome: 'Juliana Lima', cargo: 'Assistente', cpf: '789.012.345-66', dataNascimento: '05/12/1992', tipoSanguineo: 'B+', ultimoExame: '01/02/2026', proximoExame: '01/08/2026', status: 'pendente', telefoneEmergencia: '(11) 99999-0007', contatoEmergencia: 'Paulo Lima', alergias: ['Dipirona', 'Aspirina'], condicoes: [] },
  { id: 8, nome: 'Roberto Alves', cargo: 'Motorista', cpf: '890.123.456-77', dataNascimento: '12/04/1980', tipoSanguineo: 'A+', ultimoExame: '18/01/2026', proximoExame: '18/07/2026', status: 'apto', telefoneEmergencia: '(11) 99999-0008', contatoEmergencia: 'Sandra Alves', alergias: [], condicoes: [] },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'apto': return { variant: 'emerald' as const, label: 'APTO' };
    case 'inapto': return { variant: 'destructive' as const, label: 'INAPTO' };
    case 'pendente': return { variant: 'yellow' as const, label: 'PENDENTE' };
    case 'exame-pendente': return { variant: 'blue' as const, label: 'EXAME' };
    default: return { variant: 'secondary' as const, label: status };
  }
};

export const MedicaPage: React.FC<MedicaProps> = () => {
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    window.location.reload();
  };

  const [horaAtual, setHoraAtual] = useState(() => new Date().toLocaleTimeString('pt-BR'));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioMedico | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredFuncionarios = funcionarios.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cpf.includes(searchTerm)
  );

  const paginatedFuncionarios = filteredFuncionarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage);

  const stats = {
    aptos: funcionarios.filter(f => f.status === 'apto').length,
    inaptos: funcionarios.filter(f => f.status === 'inapto').length,
    pendentes: funcionarios.filter(f => f.status === 'pendente' || f.status === 'exame-pendente').length,
    total: funcionarios.length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded flex items-center justify-center text-white font-bold text-sm">SW</div>
          <div>
            <span className="font-bold text-slate-900">SigWeb Prototipo</span>
            <span className="text-xs text-slate-500 ml-2">Saúde do Trabalhador - PCMSO</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-slate-900">{horaAtual}</div>
            <div className="text-xs text-slate-500">{new Date().toLocaleDateString('pt-BR')}</div>
          </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <MaterialIcon name="logout" />
            </Button>
        </div>
      </header>

      <main className="p-4 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-400 text-white border-0">
            <CardContent className="p-4">
              <div className="text-[11px] font-bold tracking-widest opacity-80 mb-1">APTOS</div>
              <div className="text-3xl font-bold">{stats.aptos}</div>
              <div className="text-xs opacity-80">funcionários</div>
            </CardContent>
          </Card>
          <Card className="bg-red-500 text-white border-0">
            <CardContent className="p-4">
              <div className="text-[11px] font-bold tracking-widest opacity-80 mb-1">INAPTOS</div>
              <div className="text-3xl font-bold">{stats.inaptos}</div>
              <div className="text-xs opacity-80">funcionários</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500 text-white border-0">
            <CardContent className="p-4">
              <div className="text-[11px] font-bold tracking-widest opacity-80 mb-1">PENDENTES</div>
              <div className="text-3xl font-bold">{stats.pendentes}</div>
              <div className="text-xs opacity-80">funcionários</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-[11px] font-bold tracking-widest text-slate-500 mb-1">TOTAL</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500">funcionários</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Controle Médico de Funcionários</CardTitle>
                <p className="text-xs text-slate-500 mt-1">PCMSO - Programa de Controle Médico de Saúde Ocupacional</p>
              </div>
                <div className="relative">
                <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Funcionário</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Cargo</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Último</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Próximo</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedFuncionarios.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado</td>
                    </tr>
                  ) : (
                    paginatedFuncionarios.map(funcionario => {
                      const badge = getStatusBadge(funcionario.status);
                      return (
                        <tr key={funcionario.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-xs">
                                {funcionario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">{funcionario.nome}</div>
                                <div className="text-xs text-slate-500">{funcionario.cpf}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900">{funcionario.cargo}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">{funcionario.tipoSanguineo}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{funcionario.ultimoExame}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{funcionario.proximoExame}</td>
                          <td className="px-4 py-3">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedFuncionario(funcionario)}>
                              <MaterialIcon name="visibility" className="text-slate-500" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">Exibindo {paginatedFuncionarios.length} de {filteredFuncionarios.length} registros</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                  <MaterialIcon name="arrow_left" className="text-lg" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button key={page} variant={currentPage === page ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                  <MaterialIcon name="arrow_right" className="text-lg" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleLogout} className="bg-emerald-600 hover:bg-emerald-700">
            <MaterialIcon name="logout" className="mr-2" size={20} />
            Sair
          </Button>
        </div>
      </main>

      {selectedFuncionario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Dados Médicos</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedFuncionario(null)}>
                  <MaterialIcon name="close" className="text-white" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold">
                  {selectedFuncionario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedFuncionario.nome}</h4>
                  <p className="text-sm text-slate-500">{selectedFuncionario.cargo}</p>
                  <Badge variant={getStatusBadge(selectedFuncionario.status).variant} className="mt-1">
                    {getStatusBadge(selectedFuncionario.status).label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b pb-1">Informações Pessoais</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">CPF:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.cpf}</span></div>
                    <div><span className="text-slate-500">Nascimento:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.dataNascimento}</span></div>
                    <div><span className="text-slate-500">Tipo Sanguíneo:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.tipoSanguineo}</span></div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b pb-1">Exames</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Último Exame:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.ultimoExame}</span></div>
                    <div><span className="text-slate-500">Próximo Exame:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.proximoExame}</span></div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b pb-1">Contato de Emergência</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Telefone:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.telefoneEmergencia}</span></div>
                    <div><span className="text-slate-500">Contato:</span> <span className="text-slate-900 font-medium">{selectedFuncionario.contatoEmergencia}</span></div>
                  </div>
                </div>

                {selectedFuncionario.alergias.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b pb-1">Alergias</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedFuncionario.alergias.map((alergia, i) => (
                        <Badge key={i} variant="red">{alergia}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFuncionario.condicoes.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b pb-1">Condições de Saúde</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedFuncionario.condicoes.map((cond, i) => (
                        <Badge key={i} variant="yellow">{cond}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};