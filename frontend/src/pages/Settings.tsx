import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, LogOut, Palette, Tags, MapPin, History } from 'lucide-react';

import { AppearanceTab } from '../components/SettingsTabs/AppearanceTab';
import { SectorsTab } from '../components/SettingsTabs/SectorsTab';
import { RoomsTab } from '../components/SettingsTabs/RoomsTab';
import { HistoryTab } from '../components/SettingsTabs/HistoryTab';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'appearance' | 'sectors' | 'rooms' | 'history'>('appearance');

  const handleLogout = () => {
    localStorage.removeItem('@AgendaToken'); 
    localStorage.removeItem('user');
    toast.success('Sessão encerrada!');
    navigate('/');
  };

  const menuItems = [
    { id: 'appearance', label: 'Aparência', icon: <Palette size={20} /> },
    { id: 'sectors', label: 'Setores', icon: <Tags size={20} /> },
    { id: 'rooms', label: 'Salas Físicas', icon: <MapPin size={20} /> },
    { id: 'history', label: 'Histórico', icon: <History size={20} /> }
  ] as const;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Cabeçalho Fixo */}
      <header className="bg-white px-8 py-6 shadow-sm flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} className="text-gray-600" /></button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Painel de Configurações</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold active:scale-95">
          <LogOut size={20} /> <span className="hidden sm:inline">Sair da Conta</span>
        </button>
      </header>

      {/* Corpo */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Menu Lateral */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all shrink-0 ${activeTab === item.id ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}>
              {item.icon} <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* ÁREA DINÂMICA */}
        <main className="flex-1 overflow-hidden flex flex-col pb-4">
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'sectors' && <SectorsTab />}
          {activeTab === 'rooms' && <RoomsTab />}
          {activeTab === 'history' && <HistoryTab />}
        </main>
      </div>
    </div>
  );
};