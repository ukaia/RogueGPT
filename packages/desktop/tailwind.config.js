/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
