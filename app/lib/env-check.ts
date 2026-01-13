// Проверка переменных окружения при старте приложения

export function validateEnvironment() {
  const requiredVars = {
    POSTGRES_URL: process.env.POSTGRES_URL,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(', ')}\n` +
        `   App will show "no data" state until variables are configured.\n` +
        `   For production, please set up these variables in .env.local`,
    );
    return false;
  }

  return true;
}
