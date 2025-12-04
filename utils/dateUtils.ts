/**
 * Format date to relative time display
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted relative time string
 */
export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return '';

  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return '今天过期';
    if (absDays === 1) return '昨天过期';
    if (absDays <= 7) return `${absDays}天前过期`;
    if (absDays <= 30) return `${Math.floor(absDays / 7)}周前过期`;
    return `${Math.floor(absDays / 30)}个月前过期`;
  }

  if (diffDays === 0) return '今天过期';
  if (diffDays === 1) return '明天过期';
  if (diffDays === 2) return '后天过期';
  if (diffDays <= 7) return `${diffDays}天后过期`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}周后过期`;
  return `${Math.floor(diffDays / 30)}个月后过期`;
}

/**
 * Get expiry status with color and text
 */
export function getExpiryStatus(dateStr?: string): { color: string; text: string; isExpired: boolean } {
  if (!dateStr) return { color: 'bg-zinc-200', text: '', isExpired: false };

  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 3600 * 24));

  if (days < 0) {
    return { color: 'bg-red-500', text: '已过期', isExpired: true };
  }
  if (days === 0) {
    return { color: 'bg-red-400', text: '今天过期', isExpired: false };
  }
  if (days === 1) {
    return { color: 'bg-orange-500', text: '明天过期', isExpired: false };
  }
  if (days <= 3) {
    return { color: 'bg-orange-400', text: `剩 ${days} 天`, isExpired: false };
  }
  if (days <= 7) {
    return { color: 'bg-yellow-400', text: `剩 ${days} 天`, isExpired: false };
  }
  return { color: 'bg-emerald-400', text: `剩 ${days} 天`, isExpired: false };
}
