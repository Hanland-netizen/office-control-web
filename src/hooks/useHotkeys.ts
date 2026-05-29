import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useHotkeys() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'f': e.preventDefault(); 
            document.querySelector<HTMLInputElement>('input[placeholder*="Поиск"]')?.focus(); break;
          case '1': e.preventDefault(); navigate('/'); break;
          case '2': e.preventDefault(); navigate('/cameras'); break;
          case '3': e.preventDefault(); navigate('/employees'); break;
          case '4': e.preventDefault(); navigate('/events'); break;
        }
      }
      if (e.key === 'Escape') {
        document.querySelector<HTMLButtonElement>('[aria-label="close"]')?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
