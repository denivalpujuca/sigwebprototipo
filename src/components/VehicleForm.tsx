import { useState, useEffect } from 'react';
import type { Vehicle } from '../mocks/vehicles';
import { MaterialIcon } from './Icon';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSave: (vehicle: Omit<Vehicle, 'id'>) => void;
  onClose: () => void;
}

type VehicleStatus = 'DISPONIVEL' | 'MANUTENCAO' | 'INATIVO';

export const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSave, onClose }) => {
  const [formData, setFormData] = useState<{
    nome: string;
    placa: string;
    chassi: string;
    volume: number;
    marca: string;
    modelo: string;
    tipo: string;
    status: VehicleStatus;
  }>({
    nome: '',
    placa: '',
    chassi: '',
    volume: 0,
    marca: '',
    modelo: '',
    tipo: '',
    status: 'DISPONIVEL',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        nome: vehicle.nome,
        placa: vehicle.placa,
        chassi: vehicle.chassi,
        volume: vehicle.volume,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        tipo: vehicle.tipo || '',
        status: vehicle.status,
      });
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,29,0.06)] w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccbb9]">
          <h2 className="text-lg font-bold text-[#191c1d]">
            {vehicle ? 'Editar Veículo' : 'Novo Veículo'}
          </h2>
          <button onClick={onClose} className="text-[#555f70] hover:text-[#191c1d] transition-colors">
            <MaterialIcon name="close" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#191c1d] mb-1">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-1">Placa</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-1">Volume (M³)</label>
              <input
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#191c1d] mb-1">Chassi</label>
            <input
              type="text"
              value={formData.chassi}
              onChange={(e) => setFormData({ ...formData, chassi: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm font-mono"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-1">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#191c1d] mb-1">Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#191c1d] mb-1">Tipo</label>
            <input
              type="text"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm"
              placeholder="Ex: Caminhão, Carro, Máquina"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#191c1d] mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
              className="w-full px-4 py-2.5 bg-white border border-[#bccbb9] rounded-md focus:ring-2 focus:ring-[#006e2d] focus:border-[#006e2d] text-sm"
            >
              <option value="DISPONIVEL">Disponível</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#f3f4f5] hover:bg-[#e7e8e9] border border-[#bccbb9] transition-colors text-[#191c1d] text-sm font-semibold rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-br from-[#006e2d] to-[#44c365] text-white font-bold rounded-md shadow-lg shadow-[#006e2d]/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <MaterialIcon name="save" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};