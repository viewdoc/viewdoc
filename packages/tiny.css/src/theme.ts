export interface Theme {
  primaryColor?: string
  backgroundColor?: string
  alternativeBackgroundColor?: string
  foregroundColor?: string
}

export type BaseThemeName = 'light' | 'dark'

export const baseThemes: Record<BaseThemeName, Theme> = {
  light: {
    primaryColor: '#084499',
    backgroundColor: '#FFFFFF',
    alternativeBackgroundColor: '#E6E6E6',
    foregroundColor: '#111111',
  },
  dark: {
    primaryColor: '#679CE6',
    backgroundColor: '#2E2734',
    alternativeBackgroundColor: '#17131A',
    foregroundColor: '#EEEEEE',
  },
}

export const createTheme = (base: BaseThemeName, options?: Theme): string => {
  const theme: Theme = { ...baseThemes[base], ...options }
  return `
    body {
      background: ${theme.backgroundColor};
      color: ${theme.foregroundColor};
    }

    a {
      color: ${theme.primaryColor};
    }

    mark, hr, input[type=submit], input[type=button], input[type=reset], button {
      background: ${theme.primaryColor};
      color: ${theme.backgroundColor};
    }

    blockquote, thead th, tfoot th {
      border-color: ${theme.primaryColor};
    }

    tr:nth-child(even) {
      background: ${theme.alternativeBackgroundColor};
    }

    pre, code, kbd, samp {
      background: ${theme.alternativeBackgroundColor};
    }

    input[type=submit][disabled], input[type=button][disabled], input[type=reset][disabled], button[disabled] {
      background: ${theme.alternativeBackgroundColor};
      color: ${theme.foregroundColor};
    }

    input:focus, select:focus, textarea:focus {
      outline-color: ${theme.primaryColor};
    }

    ${
      base === 'dark'
        ? `
      img {
        opacity: 0.9;
      }

      img:hover {
        opacity: 1;
      }
    `
        : ''
    }
  `
}
