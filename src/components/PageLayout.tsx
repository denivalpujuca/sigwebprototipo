import React from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
  showLogoutModal?: boolean;
  onConfirmLogout?: () => void;
  onCancelLogout?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeSection,
  onSectionChange,
  onLogout,
  showLogoutModal,
  onConfirmLogout,
  onCancelLogout
}) => {
  const [horaAtual, setHoraAtual] = React.useState(new Date().toLocaleTimeString('pt-BR'));
  const [dataAtual] = React.useState(new Date().toLocaleDateString('pt-BR'));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => {
          if (section === 'sair' && onLogout) {
            onLogout();
          } else {
            onSectionChange(section);
          }
        }} 
      />
      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006e2d] flex items-center justify-center text-white font-bold">DS</div>
            <div>
              <h1 className="text-lg font-bold text-[#191c1d]">Denival Santos</h1>
              <span className="text-xs text-[#555f70]">Administrador</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onSectionChange('documentacao')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#555f70]"
              title="Documentação"
            >
              <span className="material-symbols-outlined">menu_book</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#555f70]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-[#191c1d]">{horaAtual}</div>
              <div className="text-xs text-[#555f70]">{dataAtual}</div>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#555f70]">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>
        <main className="p-8 overflow-y-auto bg-[#f8f9fa] h-full">
          {children}
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[#ba1a1a] text-3xl">logout</span>
              </div>
              <h2 className="text-xl font-bold text-[#191c1d] mb-2">Sair do Sistema</h2>
              <p className="text-[#555f70]">Tem certeza que deseja realmente sair?</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={onCancelLogout}
                className="flex-1 px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-[#bccbb9] transition-colors text-[#191c1d] text-sm font-semibold rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-[#ba1a1a] hover:opacity-90 text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">logout</span>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PageHeaderProps {
  breadcrumbs: { label: string; link?: boolean }[];
  title: string;
  subtitle: string;
  stats: {
    label: string;
    value: string | number;
    icon: string;
    color: 'green' | 'blue' | 'red';
  }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  subtitle,
  stats
}) => {
  const colorClasses = {
    green: 'from-[#006e2d] to-[#44c365]',
    blue: 'bg-[#005ac2]',
    red: 'bg-[#ba1a1a]'
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-[#555f70] mb-2 font-medium tracking-wide">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="material-symbols-outlined text-[14px]">chevron_right</span>}
            <span className={crumb.link ? 'hover:text-[#006e2d] cursor-pointer' : 'text-[#191c1d]'}>
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>{title}</h1>
            <p className="text-[#555f70] text-sm">{subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`${colorClasses[stat.color]} text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg ${stat.color === 'green' ? 'shadow-[#006e2d]/10' : stat.color === 'blue' ? 'shadow-[#005ac2]/10' : 'shadow-[#ba1a1a]/10'}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold tracking-widest text-white opacity-80">{stat.label}</span>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold tracking-tight">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

interface ActionBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  onFilter?: () => void;
  onPrint?: () => void;
  addLabel?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  searchPlaceholder = "Pesquisar",
  searchValue,
  onSearchChange,
  onAdd,
  onFilter,
  onPrint,
  addLabel = "Adicionar"
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-stretch md:items-center">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6c]">search</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm"
          />
        </div>
        {onFilter && (
          <button className="px-5 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] transition-colors text-[#191c1d] text-sm font-semibold rounded-md flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">tune</span>
            Filtrar
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {onPrint && (
          <button className="p-2.5 bg-white shadow-sm hover:shadow-md transition-all text-[#555f70] rounded-md">
            <span className="material-symbols-outlined">print</span>
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-gradient-to-br from-[#006e2d] to-[#44c365] px-6 py-2.5 text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
};

interface TableProps {
  headers: { label: string; align?: 'left' | 'center' | 'right' }[];
  children: React.ReactNode;
  emptyMessage?: string;
}

export const DataTable: React.FC<TableProps> = ({ headers, children, emptyMessage }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f3f4f5]">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`px-4 py-4 text-[11px] font-bold text-[#555f70] uppercase tracking-widest ${header.align ? `text-${header.align}` : ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#bccbb9]/10">
            {children}
          </tbody>
        </table>
        {emptyMessage && (
          <div className="px-6 py-8 text-center text-[#555f70]">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

interface TablePaginationProps {
  showing: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  showing,
  total,
  currentPage,
  totalPages,
  onPageChange,
  label = 'registros'
}) => {
  return (
    <div className="px-6 py-4 flex items-center justify-between bg-[#f3f4f5]/20">
      <span className="text-xs text-[#555f70] font-medium">Exibindo {showing} de {total} {label}</span>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="p-1 rounded hover:bg-[#e7e8e9] transition-colors text-[#555f70]"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded cursor-pointer ${
              currentPage === page 
                ? 'bg-[#006e2d] text-white' 
                : 'hover:bg-[#e7e8e9]'
            }`}
          >
            {page}
          </button>
        ))}
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="p-1 rounded hover:bg-[#e7e8e9] transition-colors text-[#555f70]"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  editIcon?: string;
  deleteIcon?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  deleteDisabled = false,
  editIcon = 'edit',
  deleteIcon = 'block'
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {onEdit && (
        <button 
          onClick={onEdit}
          className="p-1.5 text-[#555f70] hover:text-[#006e2d] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">{editIcon}</span>
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete}
          disabled={deleteDisabled}
          className={`p-1.5 transition-colors text-[#555f70] hover:text-[#ba1a1a] ${deleteDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <span className="material-symbols-outlined text-[20px]">{deleteIcon}</span>
        </button>
      )}
    </div>
  );
};