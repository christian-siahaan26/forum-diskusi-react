/**
 * @param {string} isoString
 * @returns {string}
 */
const formatDate = (isoString) => {
  const now = new Date();
  const past = new Date(isoString);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = [
    { label: 'tahun', seconds: 31536000 },
    { label: 'bulan', seconds: 2592000 },
    { label: 'minggu', seconds: 604800 },
    { label: 'hari', seconds: 86400 },
    { label: 'jam', seconds: 3600 },
    { label: 'menit', seconds: 60 },
  ];

  const matchedInterval = intervals.find(
    (interval) => Math.floor(seconds / interval.seconds) >= 1,
  );

  if (matchedInterval) {
    const count = Math.floor(seconds / matchedInterval.seconds);
    return `${count} ${matchedInterval.label} yang lalu`;
  }

  return 'Baru saja';
};

export default formatDate;
