/** @type {import('tailwindcss').Config} */
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
        DEFAULT: '100%',
      },
    },
  },
}
