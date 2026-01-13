// Утилита для условного логирования в зависимости от окружения
const isDevelopment = process.env.NODE_ENV === 'development';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: any[] is intentional here - matches console API signature
export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // В продакшене можно добавить отправку в сервис мониторинга
    // например, Sentry, LogRocket и т.д.
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

// Для серверных логов - всегда выводим в production для отладки
export const serverLogger = {
  log: (...args: any[]) => {
    console.log(...args);
  },

  error: (...args: any[]) => {
    console.error(...args);
  },

  warn: (...args: any[]) => {
    console.warn(...args);
  },

  info: (...args: any[]) => {
    console.info(...args);
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
