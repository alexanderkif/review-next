/** @type {import("prettier").Config} */
const config = {
  // 2026 Best Practices
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  arrowParens: 'always',
  endOfLine: 'auto', // auto для кросс-платформенной совместимости
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  // Plugins для Next.js/React
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
