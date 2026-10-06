import type { Config } from 'tailwindcss';
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;
const config: Config = {
  safelist: ['chip-neutral','chip-info','chip-success','chip-warning','chip-danger','chip-accent'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'), surface: c('surface'), surface2: c('surface2'), line: c('line'),
        ink: c('ink'), muted: c('muted'), accent: c('accent'), accentfg: c('accentfg'), accentsoft: c('accentsoft'),
        success: c('success'), successsoft: c('successsoft'), warning: c('warning'), warningsoft: c('warningsoft'),
        danger: c('danger'), dangersoft: c('dangersoft'), info: c('info'), infosoft: c('infosoft'),
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgb(16 24 40 / 0.05)', pop: '0 12px 32px rgb(16 24 40 / 0.18)' },
    },
  },
  plugins: [],
};
export default config;
