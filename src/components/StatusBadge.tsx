import React from 'react';

interface StatusBadgeProps {
  status: 'DISPONIVEL' | 'MANUTENCAO' | 'INATIVO';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    DISPONIVEL: 'bg-[#006e2d] text-white',
    MANUTENCAO: 'bg-[#005ac2] text-white',
    INATIVO: 'bg-[#ba1a1a] text-white',
  };

  const labels = {
    DISPONIVEL: 'DISPONÍVEL',
    MANUTENCAO: 'MANUTENÇÃO',
    INATIVO: 'INATIVO',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};