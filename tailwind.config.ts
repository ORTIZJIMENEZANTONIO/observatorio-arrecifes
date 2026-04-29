import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './utils/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: deep ocean teal/cyan (Allen Coral Atlas inspired)
        primary: {
          DEFAULT: '#0E7490',
          light: '#0891B2',
          dark: '#0B566D',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#0E7490',
          600: '#0B566D',
          700: '#083F50',
          800: '#062E3B',
          900: '#041F28',
        },
        // Secondary: shallow water/lagoon turquoise
        secondary: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          dark: '#0891B2',
        },
        // Coral accent: living coral, ties identity to the topic
        coral: {
          DEFAULT: '#FF7A66',
          light: '#FFA193',
          dark: '#E5503D',
          50: '#FFF1EE',
          100: '#FFD9D2',
          200: '#FFB7AB',
          300: '#FF9181',
          400: '#FF7A66',
          500: '#E5503D',
        },
        // Eco green: vegetation, mangroves
        eco: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#047857',
        },
        // Warning amber: bleaching alerts
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        // Alert red: critical thresholds (DHW > 8)
        alert: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        'slate-custom': {
          DEFAULT: '#5E6B78',
          light: '#7A8694',
          dark: '#4A5560',
        },
        surface: {
          DEFAULT: '#F4F8FA',
          warm: '#F5F3EE',
          cool: '#EDF6F9',
        },
        ink: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        badge: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        panel: '0 2px 8px rgba(0,0,0,0.06)',
        'glow-coral': '0 0 24px rgba(255,122,102,0.35)',
      },
    },
  },
  plugins: [],
}
