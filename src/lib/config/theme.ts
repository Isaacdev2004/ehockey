// Theme Configuration Interface
export interface ThemeConfig {
  logo: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  logo: {
    url: '/logo.png',
    alt: 'EHockey League',
    width: 150,
    height: 50,
  },
  colors: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8',
    },
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};

// Theme Manager Class
export class ThemeManager {
  private static instance: ThemeManager;
  private config: ThemeConfig;

  private constructor() {
    this.config = this.loadThemeFromEnvironment();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private loadThemeFromEnvironment(): ThemeConfig {
    const config = { ...defaultTheme };

    // Load logo configuration from environment
    const logoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL;
    if (logoUrl) {
      config.logo.url = logoUrl;
    }

    // Load color configuration from environment
    const primaryColor = process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR;
    if (primaryColor) {
      config.colors.primary = primaryColor;
    }

    const secondaryColor = process.env.NEXT_PUBLIC_BRAND_SECONDARY_COLOR;
    if (secondaryColor) {
      config.colors.secondary = secondaryColor;
    }

    const accentColor = process.env.NEXT_PUBLIC_BRAND_ACCENT_COLOR;
    if (accentColor) {
      config.colors.accent = accentColor;
    }

    return config;
  }

  getConfig(): ThemeConfig {
    return this.config;
  }

  updateConfig(updates: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Generate CSS variables for the theme
  generateCSSVariables(): string {
    const { colors, spacing, borderRadius } = this.config;
    
    return `
      :root {
        /* Colors */
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-accent: ${colors.accent};
        --color-background: ${colors.background};
        --color-surface: ${colors.surface};
        --color-text-primary: ${colors.text.primary};
        --color-text-secondary: ${colors.text.secondary};
        --color-text-muted: ${colors.text.muted};
        --color-border: ${colors.border};
        --color-success: ${colors.success};
        --color-warning: ${colors.warning};
        --color-error: ${colors.error};
        
        /* Spacing */
        --spacing-xs: ${spacing.xs};
        --spacing-sm: ${spacing.sm};
        --spacing-md: ${spacing.md};
        --spacing-lg: ${spacing.lg};
        --spacing-xl: ${spacing.xl};
        
        /* Border Radius */
        --radius-sm: ${borderRadius.sm};
        --radius-md: ${borderRadius.md};
        --radius-lg: ${borderRadius.lg};
        --radius-full: ${borderRadius.full};
      }
    `;
  }

  // Generate Tailwind CSS configuration
  generateTailwindConfig(): any {
    const { colors, spacing, borderRadius, fonts } = this.config;
    
    return {
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: colors.primary,
              50: this.generateColorShades(colors.primary, 50),
              100: this.generateColorShades(colors.primary, 100),
              200: this.generateColorShades(colors.primary, 200),
              300: this.generateColorShades(colors.primary, 300),
              400: this.generateColorShades(colors.primary, 400),
              500: colors.primary,
              600: this.generateColorShades(colors.primary, 600),
              700: this.generateColorShades(colors.primary, 700),
              800: this.generateColorShades(colors.primary, 800),
              900: this.generateColorShades(colors.primary, 900),
            },
            secondary: {
              DEFAULT: colors.secondary,
              50: this.generateColorShades(colors.secondary, 50),
              100: this.generateColorShades(colors.secondary, 100),
              200: this.generateColorShades(colors.secondary, 200),
              300: this.generateColorShades(colors.secondary, 300),
              400: this.generateColorShades(colors.secondary, 400),
              500: colors.secondary,
              600: this.generateColorShades(colors.secondary, 600),
              700: this.generateColorShades(colors.secondary, 700),
              800: this.generateColorShades(colors.secondary, 800),
              900: this.generateColorShades(colors.secondary, 900),
            },
            accent: colors.accent,
            success: colors.success,
            warning: colors.warning,
            error: colors.error,
          },
          spacing,
          borderRadius,
          fontFamily: {
            heading: fonts.heading,
            body: fonts.body,
          },
        },
      },
    };
  }

  // Helper function to generate color shades
  private generateColorShades(baseColor: string, shade: number): string {
    // This is a simplified implementation
    // In a real application, you might want to use a color manipulation library
    // like `color2k` or `chroma-js` to generate proper color shades
    
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Simple shade generation (you might want to improve this)
    const factor = shade / 500;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}

// React Hook for using theme in components
export function useTheme() {
  const themeManager = ThemeManager.getInstance();
  return themeManager.getConfig();
}

// Utility functions for theme usage
export const getTheme = () => ThemeManager.getInstance().getConfig();
export const updateTheme = (updates: Partial<ThemeConfig>) => {
  ThemeManager.getInstance().updateConfig(updates);
};

// Predefined theme presets
export const themePresets = {
  default: defaultTheme,
  dark: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      background: '#0f172a',
      surface: '#1e293b',
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
        muted: '#64748b',
      },
      border: '#334155',
    },
  },
  blue: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#0ea5e9',
    },
  },
  green: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#059669',
      secondary: '#10b981',
      accent: '#84cc16',
    },
  },
  purple: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a855f7',
    },
  },
};
