import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FileSpreadsheet, Search, MapPin } from 'lucide-react';

const removeAcentos = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const HistoryTab: React.FC = () => {
  const [historyMeetings, setHistoryMeetings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyRoomFilter, setHistoryRoomFilter] = useState<string>('all');
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);

  useEffect(() => {
    api.get('/rooms').then(res => setRooms(res.data)).catch(() => {});
    api.get('/meetings').then(res => {
      const sorted = res.data.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setHistoryMeetings(sorted);
    }).catch(() => toast.error('Erro ao carregar histórico'));
  }, []);

  const filteredHistory = historyMeetings.filter(meeting => {
    if (historyRoomFilter !== 'all' && meeting.roomId !== historyRoomFilter) return false; 
    const searchNorm = removeAcentos(searchQuery);
    const data = new Date(meeting.startTime).toLocaleDateString('pt-BR');
    const status = meeting.canceled ? 'cancelada' : 'confirmada';
    return (
      removeAcentos(meeting.title).includes(searchNorm) ||
      removeAcentos(meeting.sector.name).includes(searchNorm) ||
      (meeting.room?.name && removeAcentos(meeting.room.name).includes(searchNorm)) ||
      data.includes(searchNorm) || status.includes(searchNorm)
    );
  });

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredHistory.map(m => m.id);
    const allSelected = allFilteredIds.every(id => selectedMeetings.includes(id));
    setSelectedMeetings(allSelected ? prev => prev.filter(id => !allFilteredIds.includes(id)) : Array.from(new Set([...selectedMeetings, ...allFilteredIds])));
  };

  const handleExportCSV = () => {
    const toExport = selectedMeetings.length > 0 ? historyMeetings.filter(m => selectedMeetings.includes(m.id)) : filteredHistory;
    if (toExport.length === 0) return toast.error('Não há dados para exportar.');
    
    const headers = ['Data', 'Início', 'Fim', 'Reunião', 'Setor', 'Sala', 'Status'];
    const csvRows = [headers.join(',')];

    toExport.forEach(m => {
      const data = new Date(m.startTime).toLocaleDateString('pt-BR');
      const inicio = new Date(m.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const fim = new Date(m.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const status = m.canceled ? 'Cancelada' : 'Confirmada';
      const sala = m.room?.name || 'Sem Sala';
      csvRows.push(`${data},${inicio},${fim},"${m.title}","${m.sector.name}","${sala}",${status}`);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `historico_${new Date().toLocaleDateString('pt-BR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download concluído!');
    setSelectedMeetings([]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div className="relative w-full sm:w-[28rem]">
          <Search size={20} className="absolute inset-y-0 left-4 my-auto text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Buscar (ex: expedicao)..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md w-full sm:w-auto justify-center hover:bg-green-700">
          <FileSpreadsheet size={20} /> {selectedMeetings.length > 0 ? `Baixar Selecionados (${selectedMeetings.length})` : 'Baixar Todos'}
        </button>
      </div>

      <div className="px-6 py-3 border-b flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setHistoryRoomFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold border ${historyRoomFilter === 'all' ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600'}`}>Todas</button>
        {rooms.map(r => (
          <button key={r.id} onClick={() => setHistoryRoomFilter(r.id)} className={`px-4 py-2 rounded-full text-sm font-bold border whitespace-nowrap ${historyRoomFilter === r.id ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{r.name}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 text-sm text-gray-400 uppercase">
              <th className="pb-4 w-10"><input type="checkbox" className="w-5 h-5 accent-primary" checked={filteredHistory.length > 0 && filteredHistory.every(m => selectedMeetings.includes(m.id))} onChange={handleToggleSelectAll} /></th>
              <th className="pb-4">Data</th>
              <th className="pb-4">Horário</th>
              <th className="pb-4">Reunião e Sala</th>
              <th className="pb-4">Setor</th>
              <th className="pb-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredHistory.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4"><input type="checkbox" className="w-5 h-5 accent-primary" checked={selectedMeetings.includes(m.id)} onChange={() => { setSelectedMeetings(p => p.includes(m.id) ? p.filter(id => id !== m.id) : [...p, m.id]) }} /></td>
                <td className="py-4 text-sm text-gray-600">{new Date(m.startTime).toLocaleDateString('pt-BR')}</td>
                <td className="py-4 text-sm text-gray-500">{new Date(m.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-4 text-sm font-bold text-gray-800">{m.title} <div className="text-xs text-gray-400 mt-1"><MapPin size={12} className="inline mr-1" />{m.room?.name || 'Sem Sala'}</div></td>
                <td className="py-4"><span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: m.sector.color + '15', color: m.sector.color }}>{m.sector.name}</span></td>
                <td className="py-4 text-right">{m.canceled ? <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Cancelada</span> : <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Confirmada</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};