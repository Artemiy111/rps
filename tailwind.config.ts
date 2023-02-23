import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',

  theme: {
    screens: {
      xs: { max: '400px' },
      sm: { max: '640px' },
      md: { max: '768px' },
      lg: { max: '1200px' },
    },
    container: {
      screens: {
        DEFAULT: '1200px',
      },
    },
    fontSize: {
      sm: ['16px', { lineHeight: '18px' }],
      base: [`20px`, { lineHeight: '23px' }],
      md: ['24px', { lineHeight: '28px' }],
    },
  },
}
