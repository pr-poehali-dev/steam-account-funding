import { useEffect } from 'react';
import { api } from '@/lib/api';
import { setStoredUser } from '@/lib/auth';

interface TelegramLoginButtonProps {
  onAuth: (user: any) => void;
  botUsername?: string;
}

declare global {
  interface Window {
    TelegramLoginWidget: any;
  }
}

export default function TelegramLoginButton({ onAuth, botUsername = 'demo_bot' }: TelegramLoginButtonProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.async = true;

    (window as any).onTelegramAuth = async (user: any) => {
      try {
        const result = await api.authenticateWithTelegram(user);
        if (result.success && result.user) {
          setStoredUser(result.user);
          onAuth(result.user);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };

    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  return <div id="telegram-login-container" className="flex justify-center" />;
}
