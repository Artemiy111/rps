import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',

  theme: {
    screens: {
      lg: { max: '1200px' },
      md: { max: '768px' },
      sm: { max: '640px' },
      xs: { max: '400px' },
    },
    container: {
      screens: {
        DEFAULT: '1200px',
      },
    },
    fontSize: {
      xs: ['14px', { lineHeight: '16px' }],
      sm: ['16px', { lineHeight: '18px' }],
      base: [`20px`, { lineHeight: '23px' }],
      md: ['24px', { lineHeight: '28px' }],
    },
  },
}
