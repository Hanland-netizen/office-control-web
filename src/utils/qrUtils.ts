export function generateQRDataURL(text: string, size = 200): string {
  // Используй URL для генерации QR через Google Charts API (работает без библиотеки)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&color=1565C0`;
}
