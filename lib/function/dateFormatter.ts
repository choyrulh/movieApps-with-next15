
const indonesianMonths = [
  'Januari', 'Februari', 'Maret', 'April',
  'Mei', 'Juni', 'Juli', 'Agustus',
  'September', 'Oktober', 'November', 'Desember'
];

const indonesianDays = [
  'Minggu', 'Senin', 'Selasa', 'Rabu',
  'Kamis', 'Jumat', 'Sabtu'
];

export function formatIndonesianDate(date: Date, includeTime: boolean = true): string {
  const day = indonesianDays[date.getDay()];
  const dateNum = date.getDate();
  const month = indonesianMonths[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  let formatted = `${dateNum} ${month} ${year}`;
  if(includeTime) formatted += ` ${hours}:${minutes}`;
  return formatted;
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if(years > 0) return `${years} tahun yang lalu`;
  if(months > 0) return `${months} bulan yang lalu`;
  if(days > 0) return `${days} hari yang lalu`;
  if(hours > 0) return `${hours} jam yang lalu`;
  if(minutes > 0) return `${minutes} menit yang lalu`;
  if(seconds > 0) return `${seconds} detik yang lalu`;
  
  return 'baru saja';
}

// Contoh penggunaan:
// const date = new Date('2024-03-25T15:30:00Z');
// console.log(formatIndonesianDate(date)); // "25 Maret 2024 20:30"
// console.log(getTimeAgo(date)); // "2 jam yang lalu" (tergantung waktu sekarang)