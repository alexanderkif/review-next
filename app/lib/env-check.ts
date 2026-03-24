// Проверка переменных окружения при старте приложения

export function validateEnvironment() {
  const requiredVars = {
    POSTGRES_URL: process.env.POSTGRES_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
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

  // Optional but recommended
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY is not set — AI chatbot will not work.');
  }
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY is not set — Groq fallback for chatbot is disabled.');
  }

  return true;
}
