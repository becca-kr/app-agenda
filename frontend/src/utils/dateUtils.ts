export const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const formatDateTitle = (date: Date) => {
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
};