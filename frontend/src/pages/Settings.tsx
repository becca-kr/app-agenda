import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft, Upload, Trash2, Palette, Tags, Edit2, History, FileSpreadsheet, Search, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Sector { id: string; name: string; color: string; }
interface MeetingType { id: string; name: string; }

const removeAcentos = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { primaryColor: globalColor, logoUrl: globalLogo, footerText: globalFooter } = useConfig();
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'sectors' | 'history' | 'rooms'>('appearance');

  const [color, setColor] = useState(globalColor);
  const [footer, setFooter] = useState(globalFooter);
  const [logo, setLogo] = useState(globalLogo || '');

  const [cadastroType, setCadastroType] = useState<'sector' | 'meeting' | 'room'>('sector');
  const [newCadastroName, setNewCadastroName] = useState('');
  const [newSectorColor, setNewSectorColor] = useState('#2196F3');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'sector' | 'meeting' | 'room', name: string} | null>(null);

  const [historyMeetings, setHistoryMeetings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  
  const [historyRoomFilter, setHistoryRoomFilter] = useState<string>('all');

  useEffect(() => {
    setColor(globalColor);
    setFooter(globalFooter);
    setLogo(globalLogo || '');
  }, [globalColor, globalFooter, globalLogo]);

  useEffect(() => {
    if (activeTab === 'sectors') {
      fetchSectors();
      fetchMeetingTypes();
    } else if (activeTab === 'history') {
      fetchHistory();
      fetchRooms(); 
    } else if (activeTab === 'rooms') {
      fetchRooms();
    }
  }, [activeTab]);

  const fetchSectors = async () => {
    try { setSectors((await api.get('/sectors')).data); } catch (error) { toast.error('Erro ao carregar setores'); }
  };

  const fetchMeetingTypes = async () => {
    try { setMeetingTypes((await api.get('/meeting-types')).data); } catch (error) { toast.error('Erro ao carregar nomes de reunião'); }
  };

  const fetchRooms = async () => {
    try { setRooms((await api.get('/rooms')).data); } catch (error) { toast.error('Erro ao carregar salas'); }
  };

  const fetchHistory = async () => {
    try { 
      const response = await api.get('/meetings');
      const sorted = response.data.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setHistoryMeetings(sorted); 
    } catch (error) { 
      toast.error('Erro ao carregar histórico'); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@AgendaToken'); 
    localStorage.removeItem('user');
    toast.success('Sessão encerrada com sucesso!');
    navigate('/');
  };

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      await api.put('/settings', { primaryColor: color, footerText: footer, companyLogo: logo });
      toast.success('Aparência salva! Reinicie para aplicar totalmente.');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveCadastro = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const nameToSave = newCadastroName.trim();
    if (!nameToSave || isAdding) return;

    try {
      setIsAdding(true);
      if (editingItemId) {
        if (cadastroType === 'sector') await api.put(`/sectors/${editingItemId}`, { name: nameToSave, color: newSectorColor });
        else if (cadastroType === 'meeting') await api.put(`/meeting-types/${editingItemId}`, { name: nameToSave });
        else if (cadastroType === 'room') await api.put(`/rooms/${editingItemId}`, { name: nameToSave });
        toast.success('Atualizado com sucesso!');
      } else {
        if (cadastroType === 'sector') await api.post('/sectors', { name: nameToSave, color: newSectorColor });
        else if (cadastroType === 'meeting') await api.post('/meeting-types', { name: nameToSave });
        else if (cadastroType === 'room') await api.post('/rooms', { name: nameToSave });
        toast.success('Cadastrado com sucesso!');
      }
      
      setNewCadastroName('');
      setEditingItemId(null);
      
      if (cadastroType === 'sector') fetchSectors(); 
      else if (cadastroType === 'meeting') fetchMeetingTypes();
      else if (cadastroType === 'room') fetchRooms(); 

    } catch (error) {
      toast.error(editingItemId ? 'Erro ao atualizar' : 'Erro ao cadastrar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (item: any, type: 'sector' | 'meeting' | 'room') => {
    setCadastroType(type);
    setNewCadastroName(item.name);
    if (type === 'sector') setNewSectorColor(item.color);
    setEditingItemId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewCadastroName('');
    setNewSectorColor('#2196F3');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'sector') {
        await api.delete(`/sectors/${itemToDelete.id}`);
        fetchSectors();
      } else if (itemToDelete.type === 'meeting') {
        await api.delete(`/meeting-types/${itemToDelete.id}`);
        fetchMeetingTypes();
      } else if (itemToDelete.type === 'room') {
        await api.delete(`/rooms/${itemToDelete.id}`);
        fetchRooms();
      }
      toast.success('Excluído com sucesso!');
      setItemToDelete(null);
    } catch (error) {
      toast.error('Erro ao excluir. Pode ter reuniões vinculadas.');
    }
  };

  const filteredHistory = historyMeetings.filter(meeting => {
    if (historyRoomFilter !== 'all' && meeting.roomId !== historyRoomFilter) {
      return false; 
    }

    const searchNorm = removeAcentos(searchQuery);
    const data = new Date(meeting.startTime).toLocaleDateString('pt-BR');
    const status = meeting.canceled ? 'cancelada' : 'confirmada';
    
    return (
      removeAcentos(meeting.title).includes(searchNorm) ||
      removeAcentos(meeting.sector.name).includes(searchNorm) ||
      (meeting.room?.name && removeAcentos(meeting.room.name).includes(searchNorm)) ||
      data.includes(searchNorm) ||
      status.includes(searchNorm)
    );
  });

  const handleToggleSelect = (id: string) => {
    setSelectedMeetings(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]);
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredHistory.map(m => m.id);
    const allSelected = allFilteredIds.every(id => selectedMeetings.includes(id));
    if (allSelected) {
      setSelectedMeetings(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      const newSelected = new Set([...selectedMeetings, ...allFilteredIds]);
      setSelectedMeetings(Array.from(newSelected));
    }
  };

  const handleExportCSV = () => {
    const toExport = selectedMeetings.length > 0 ? historyMeetings.filter(m => selectedMeetings.includes(m.id)) : filteredHistory;
    if (toExport.length === 0) return toast.error('Não há dados para exportar.');
    
    const headers = ['Data', 'Início', 'Fim', 'Reunião', 'Setor', 'Sala', 'Status'];
    const csvRows = [headers.join(',')];

    toExport.forEach(meeting => {
      const data = new Date(meeting.startTime).toLocaleDateString('pt-BR');
      const inicio = new Date(meeting.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const fim = new Date(meeting.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const status = meeting.canceled ? 'Cancelada' : 'Confirmada';
      const sala = meeting.room?.name || 'Sem Sala';
      
      csvRows.push(`${data},${inicio},${fim},"${meeting.title}","${meeting.sector.name}","${sala}",${status}`);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historico_reunioes_${new Date().toLocaleDateString('pt-BR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download concluído!');
    setSelectedMeetings([]);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      <header className="bg-white px-8 py-6 shadow-sm flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><ArrowLeft size={24} className="text-gray-600" /></button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Painel de Configurações</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors active:scale-95" title="Sair do Sistema">
          <LogOut size={20} />
          <span className="hidden sm:inline">Sair da Conta</span>
        </button>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        <aside className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'appearance' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}>
            <Palette size={20} /> <span className="hidden sm:inline">Aparência</span>
          </button>
          <button onClick={() => setActiveTab('sectors')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'sectors' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}>
            <Tags size={20} /> <span className="hidden sm:inline">Setores / Tags</span>
          </button>
          <button onClick={() => { setActiveTab('rooms'); setCadastroType('room'); }} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'rooms' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}>
            <MapPin size={20} /> <span className="hidden sm:inline">Salas Físicas</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'history' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-200/50'}`}>
            <History size={20} /> <span className="hidden sm:inline">Histórico</span>
          </button>
        </aside>

        <main className="flex-1 overflow-hidden flex flex-col pb-4">
          
          {/* ABA 1: APARÊNCIA */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-10 flex flex-col lg:flex-row gap-10 overflow-y-auto">
              <form onSubmit={handleSaveAppearance} className="flex-1 space-y-8 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Identidade Visual</h2>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Cor Primária</label>
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-3">
                      {['#0057FF', '#10B981', '#8B5CF6', '#F43F5E', '#0F172A'].map(preset => (
                        <button key={preset} type="button" onClick={() => setColor(preset)} className={`w-12 h-12 rounded-full shadow-sm border-2 transition-transform hover:scale-110 shrink-0 ${color === preset ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: preset }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-full sm:w-max">
                      <span className="text-xs font-bold text-gray-400 uppercase ml-2">Ou personalize:</span>
                      <div className="flex gap-2 items-center ml-2">
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 rounded-lg cursor-pointer border-none shadow-sm shrink-0" />
                        <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-28 p-2 bg-white rounded-xl outline-none font-mono border border-gray-200 focus:border-primary text-center uppercase text-sm font-bold text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Texto do Rodapé</label>
                  <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-primary text-gray-700" placeholder="Ex: © 2026 Minha Empresa" />
                </div>
                <button type="submit" disabled={isAdding} style={{ backgroundColor: color }} className="w-full py-4 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-70">
                  <Save size={24} /> {isAdding ? 'Salvando...' : 'Salvar Aparência'}
                </button>
              </form>
              <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Logo da Empresa</label>
                  <div className="flex-1 relative bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-blue-50/50 transition-colors group flex flex-col items-center justify-center p-6 min-h-[240px] overflow-hidden">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setLogo(reader.result as string); reader.readAsDataURL(file); } }} />
                    {logo ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <img src={logo} alt="Preview" className="max-h-24 max-w-full object-contain z-0" />
                        <span className="text-xs font-bold text-gray-400 uppercase group-hover:text-primary transition-colors text-center">Clique para trocar</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary transition-colors">
                        <Upload size={32} />
                        <span className="text-sm font-bold text-center">Clique ou arraste<br/>sua logo aqui</span>
                        <span className="text-xs opacity-70">PNG, JPG ou SVG</span>
                      </div>
                    )}
                  </div>
                  {logo && <button onClick={() => setLogo('')} className="mt-4 text-sm text-red-500 font-bold hover:underline self-center w-full text-center">Remover Imagem</button>}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: CADASTROS */}
          {activeTab === 'sectors' && (
            <div className="flex flex-col h-full space-y-6 overflow-hidden">
              <form onSubmit={handleSaveCadastro} className="shrink-0 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                {editingItemId && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{editingItemId ? 'Editar Cadastro' : 'Adicionar Novo'}</h2>
                  {editingItemId && <button type="button" onClick={handleCancelEdit} className="text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar Edição</button>}
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end max-w-5xl">
                  <div className="w-full lg:w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipo</label>
                    <select disabled={!!editingItemId} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" value={cadastroType} onChange={(e) => setCadastroType(e.target.value as 'sector' | 'meeting')}>
                      <option value="sector">Setor / Tag</option>
                      <option value="meeting">Nome da Reunião</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                    <input type="text" value={newCadastroName} onChange={(e) => setNewCadastroName(e.target.value)} placeholder={cadastroType === 'sector' ? "Ex: Diretoria" : "Ex: Apresentação de Resultados"} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                  </div>
                  {cadastroType === 'sector' && (
                    <div className="w-full lg:w-auto">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cor</label>
                      <div className="h-[58px] w-full lg:w-16 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: newSectorColor }}>
                        <input type="color" value={newSectorColor} onChange={(e) => setNewSectorColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  )}
                  <button type="submit" disabled={isAdding} className={`w-full lg:w-auto h-[58px] text-white px-8 rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 mt-4 lg:mt-0 ${editingItemId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}>
                    {isAdding ? 'Aguarde...' : (editingItemId ? 'Salvar Alterações' : 'Salvar Cadastro')}
                  </button>
                </div>
              </form>
              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Setores</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                      {sectors.map(sector => (
                        <div key={sector.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${editingItemId === sector.id ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded shadow-sm shrink-0" style={{ backgroundColor: sector.color }} />
                            <span className="font-semibold text-gray-700 truncate">{sector.name}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleEditClick(sector, 'sector')} className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Editar"><Edit2 size={18} /></button>
                            <button onClick={() => setItemToDelete({ id: sector.id, type: 'sector', name: sector.name })} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 shrink-0">Nomes de Reunião</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
                      {meetingTypes.map(mt => (
                        <div key={mt.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${editingItemId === mt.id ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                          <span className="font-semibold text-gray-700 truncate">{mt.name}</span>
                          <div className="flex gap-1 shrink-0">
                             <button onClick={() => handleEditClick(mt, 'meeting')} className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Editar"><Edit2 size={18} /></button>
                            <button onClick={() => setItemToDelete({ id: mt.id, type: 'meeting', name: mt.name })} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Excluir"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: SALAS */}
          {activeTab === 'rooms' && (
            <div className="flex flex-col h-full space-y-6 overflow-hidden">
              <form onSubmit={handleSaveCadastro} className="shrink-0 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                {editingItemId && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingItemId ? 'Editar Sala' : 'Cadastrar Nova Sala'}
                  </h2>
                  {editingItemId && <button type="button" onClick={handleCancelEdit} className="text-sm font-bold text-gray-500 hover:text-gray-700">Cancelar Edição</button>}
                </div>
                
                <div className="flex flex-col lg:flex-row gap-4 items-end max-w-2xl">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Sala Física</label>
                    <input 
                      type="text" 
                      value={newCadastroName}
                      onChange={(e) => {
                        setNewCadastroName(e.target.value);
                        setCadastroType('room');
                      }}
                      placeholder="Ex: Sala de Inovação, Auditório, Sala 02..."
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isAdding}
                    className={`w-full lg:w-auto h-[58px] px-8 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50 mt-4 lg:mt-0 ${editingItemId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isAdding ? 'Aguarde...' : (editingItemId ? 'Salvar Alterações' : 'Criar Sala')}
                  </button>
                </div>
              </form>

              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Salas Ativas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map(room => (
                    <div key={room.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-colors">
                      <span className="font-bold text-gray-700">{room.name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditClick(room, 'room')} className="p-2 text-gray-400 hover:text-yellow-600"><Edit2 size={18} /></button>
                        <button onClick={() => setItemToDelete({ id: room.id, type: 'room', name: room.name })} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {rooms.length === 0 && <p className="text-sm text-gray-400 col-span-full">Nenhuma sala cadastrada.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: HISTÓRICO DE REUNIÕES */}
          {activeTab === 'history' && (
            <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-gray-50/50">
                <div className="relative w-full sm:w-[28rem]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar (ex: expedicao, diretoria)..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary shadow-sm text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all w-full sm:w-auto justify-center"
                >
                  <FileSpreadsheet size={20} /> 
                  {selectedMeetings.length > 0 ? `Baixar Selecionados (${selectedMeetings.length})` : 'Baixar Todos Filtrados'}
                </button>
              </div>

              {/* MUDANÇA: Aba / Pílulas de filtro por Sala */}
              <div className="px-6 md:px-8 py-3 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => setHistoryRoomFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${historyRoomFilter === 'all' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Todas as Salas
                </button>
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setHistoryRoomFilter(room.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${historyRoomFilter === room.id ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="pb-4 w-10">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-primary" checked={filteredHistory.length > 0 && filteredHistory.every(m => selectedMeetings.includes(m.id))} onChange={handleToggleSelectAll} />
                      </th>
                      <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Data</th>
                      <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Horário</th>
                      <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Reunião e Sala</th>
                      <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Setor</th>
                      <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredHistory.map((meeting) => (
                      <tr key={meeting.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-4"><input type="checkbox" className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-primary" checked={selectedMeetings.includes(meeting.id)} onChange={() => handleToggleSelect(meeting.id)} /></td>
                        <td className="py-4 text-sm font-semibold text-gray-600 hidden sm:table-cell whitespace-nowrap">{new Date(meeting.startTime).toLocaleDateString('pt-BR')}</td>
                        <td className="py-4 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">{new Date(meeting.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-4 text-sm font-bold text-gray-800">
                          {meeting.title}
                          <div className="text-xs text-gray-400 mt-1 font-medium">
                            <MapPin size={12} className="inline mr-1" />
                            {meeting.room?.name || 'Sem Sala'}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap" style={{ backgroundColor: meeting.sector.color + '15', color: meeting.sector.color }}>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meeting.sector.color }} />
                            <span className="truncate max-w-[100px] lg:max-w-none">{meeting.sector.name}</span>
                          </span>
                        </td>
                        <td className="py-4 text-right whitespace-nowrap">
                          {meeting.canceled ? <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Cancelada</span> : <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Confirmada</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <History size={48} className="mb-4 opacity-30" />
                    <p className="text-lg font-bold text-gray-500">Nenhum registro encontrado</p>
                    <p className="text-sm">Tente ajustar os termos da sua busca.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL DE EXCLUSÃO */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto"><Trash2 size={32} /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Excluir {itemToDelete.type === 'sector' ? 'Setor' : itemToDelete.type === 'room' ? 'Sala' : 'Reunião'}</h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed">Tem a certeza que deseja apagar <strong>{itemToDelete.name}</strong>?</p>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 px-4 py-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-4 bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};