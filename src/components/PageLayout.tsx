import React from 'react';
import { Sidebar } from './Sidebar';
import { MaterialIcon } from './Icon';

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
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">DS</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Denival Santos</h1>
              <span className="text-xs text-slate-500">Administrador</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onSectionChange('documentacao')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Documentação"
            >
              <MaterialIcon name="menu_book" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <MaterialIcon name="notifications" />
            </button>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-slate-900">{horaAtual}</div>
              <div className="text-xs text-slate-500">{dataAtual}</div>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <MaterialIcon name="logout" />
            </button>
          </div>
        </header>
        <main className="p-6 overflow-y-auto bg-slate-50 h-full">
          {children}
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-sm w-full max-w-md mx-4 overflow-hidden p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MaterialIcon name="logout" className="text-red-600 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Sair do Sistema</h2>
              <p className="text-slate-500">Tem certeza que deseja realmente sair?</p>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                onClick={onCancelLogout}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-sm font-semibold rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md flex items-center justify-center gap-2"
              >
                <MaterialIcon name="logout" size={18} />
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
    green: 'from-emerald-600 to-emerald-400',
    blue: 'bg-blue-600',
    red: 'bg-red-600'
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium tracking-wide">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <MaterialIcon name="arrow_right" size={14} />}
            <span className={crumb.link ? 'hover:text-emerald-600 cursor-pointer' : 'text-slate-900'}>
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>{title}</h1>
            <p className="text-slate-500 text-sm">{subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`${colorClasses[stat.color]} text-white p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold tracking-widest text-white opacity-80">{stat.label}</span>
                  <MaterialIcon name={stat.icon} className="opacity-80" />
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
          <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-none shadow-sm rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        {onFilter && (
          <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-sm font-semibold rounded-md flex items-center gap-2">
            <MaterialIcon name="tune" size={18} />
            Filtrar
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {onPrint && (
          <button className="p-2.5 bg-white shadow-sm hover:shadow-md transition-all text-slate-500 rounded-md">
            <MaterialIcon name="print" />
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-white font-bold rounded-md flex items-center gap-2 transition-colors"
          >
            <MaterialIcon name="add" size={20} />
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${header.align ? `text-${header.align}` : ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
        {emptyMessage && (
          <div className="px-6 py-8 text-center text-slate-500">
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
    <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
      <span className="text-xs text-slate-500 font-medium">Exibindo {showing} de {total} {label}</span>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-500"
        >
          <MaterialIcon name="arrow_left" size={20} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded cursor-pointer ${
              currentPage === page 
                ? 'bg-emerald-600 text-white' 
                : 'hover:bg-slate-200'
            }`}
          >
            {page}
          </button>
        ))}
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-500"
        >
          <MaterialIcon name="arrow_right" size={20} />
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
          className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <MaterialIcon name={editIcon} size={20} />
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete}
          disabled={deleteDisabled}
          className={`p-1.5 transition-colors text-slate-500 hover:text-red-600 ${deleteDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <MaterialIcon name={deleteIcon} size={20} />
        </button>
      )}
    </div>
  );
};