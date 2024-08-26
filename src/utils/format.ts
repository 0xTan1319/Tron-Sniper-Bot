export function formatNumber(number: number) {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(2) + "B";
  }
  if (number >= 1e6) {
    return (number / 1e6).toFixed(2) + "M";
  }
  if (number >= 1e3) {
    return (number / 1e3).toFixed(2) + "K";
  }
  return number.toFixed(2);
}

export function formatElapsedTime(createdDate: Date) {
  const now = Date.now();
  const elapsedTime = now - createdDate.getTime();

  const days = Math.floor(elapsedTime / 86400000);
  const hours = Math.floor((elapsedTime % 86400000) / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);

  if (elapsedTime >= 86400000) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (elapsedTime >= 3600000) {
    return `${hours}h ${minutes}m`;
  }
  if (elapsedTime >= 60000) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
