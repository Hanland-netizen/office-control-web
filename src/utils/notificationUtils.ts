export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendBrowserNotification(title: string, body: string, level: string) {
  if (Notification.permission !== 'granted') return;
  const icons: Record<string, string> = {
    critical: '🔴', alert: '🟠', warning: '🟡', info: '🔵'
  };
  new Notification(`${icons[level] || ''} ${title}`, {
    body,
    icon: '/favicon.ico',
    tag: `office-${level}-${Date.now()}`
  });
}
