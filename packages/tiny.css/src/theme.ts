export interface Theme {
  primaryColor?: string
  backgroundColor?: string
  foregroundColor?: string
  alternativeBackgroundColor?: string
  alternativeForegroundColor?: string
}

export type BaseThemeName = 'light' | 'dark'

export const baseThemes: Record<BaseThemeName, Theme> = {
  light: {
    primaryColor: '#DA6741',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#3B394D',
    alternativeBackgroundColor: '#E6E6E6',
    alternativeForegroundColor: '#4E4C66',
  },
  dark: {
    primaryColor: '#FF9673',
    backgroundColor: '#001427',
    foregroundColor: '#DAE6F2',
    alternativeBackgroundColor: '#002040',
    alternativeForegroundColor: '#C3CED9',
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

    pre, code, kbd, samp,
    input[type=submit][disabled], input[type=button][disabled], input[type=reset][disabled], button[disabled] {
      background: ${theme.alternativeBackgroundColor};
      color: ${theme.alternativeForegroundColor};
    }

    input:focus, select:focus, textarea:focus {
      outline-color: ${theme.primaryColor};
    }

    ${
      base === 'dark'
        ? `
      img {
        opacity: 0.8;
      }

      img:hover {
        opacity: 1;
      }
    `
        : ''
    }
  `
}
