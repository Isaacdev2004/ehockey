// Theme Configuration Interface
export interface ThemeConfig {
  logo: {
    primary: string; // Main logo for larger areas (EHOCKEY)
    secondary: string; // Compact logo for smaller areas (EH)
    full: string; // Full logo with .NET (EHOCKEY.NET)
    verified: string; // Verified badge
    circle: string; // Circular logo variant
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

// Default dark theme configuration with client's logos
export const defaultTheme: ThemeConfig = {
  logo: {
    primary: '/images/EHOCKEY WHITE.png', // Main logo for larger areas
    secondary: '/images/EH WHITE.png', // Compact logo for smaller areas
    full: '/images/EHOCKEY NET WHITE.png', // Full logo with .NET
    verified: '/images/ehockey verified.png', // Verified badge
    circle: '/images/eh circle secondary.png', // Circular logo variant
    alt: 'EHockey League',
    width: 150,
    height: 50,
  },
  colors: {
    primary: '#3b82f6', // Blue
    secondary: '#1e40af', // Darker blue
    accent: '#60a5fa', // Light blue
    background: '#1f2937', // Dark grey (not too dark)
    surface: '#374151', // Slightly lighter grey
    text: {
      primary: '#ffffff', // White
      secondary: '#d1d5db', // Light grey
      muted: '#9ca3af', // Muted grey
    },
    border: '#4b5563', // Border grey
    success: '#10b981', // Green
    warning: '#f59e0b', // Yellow
    error: '#ef4444', // Red
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

// Logo variants for different contexts
export const logoVariants = {
  primary: {
    light: '/images/EHOCKEY WHITE.png',
    dark: '/images/EHOCKEY BLACK.png',
  },
  secondary: {
    light: '/images/EH WHITE.png',
    dark: '/images/EH BLACK.png',
  },
  full: {
    light: '/images/EHOCKEY NET WHITE.png',
    dark: '/images/EHOCKEY NET BLACK.png',
  },
  verified: '/images/ehockey verified.png',
  circle: '/images/eh circle secondary.png',
};

// Theme Manager Class
export class ThemeManager {
  private static instance: ThemeManager;
  private config: ThemeConfig;
  private isDarkMode: boolean = true; // Default to dark mode

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

  // Get appropriate logo based on context and theme
  getLogo(variant: 'primary' | 'secondary' | 'full' | 'verified' | 'circle' = 'primary'): string {
    if (variant === 'verified') {
      return logoVariants.verified;
    }
    
    if (variant === 'circle') {
      return logoVariants.circle;
    }

    const theme = this.isDarkMode ? 'light' : 'dark';
    return logoVariants[variant][theme];
  }

  // Set theme mode (dark/light)
  setThemeMode(isDark: boolean): void {
    this.isDarkMode = isDark;
  }

  // Get current theme mode
  getThemeMode(): boolean {
    return this.isDarkMode;
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
            background: colors.background,
            surface: colors.surface,
            border: colors.border,
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

  // Generate color shades for Tailwind
  private generateColorShades(baseColor: string, shade: number): string {
    // This is a simplified color shade generator
    // In a real implementation, you'd want to use a proper color manipulation library
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Simple shade calculation
    const factor = shade / 500;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Update logo configuration
  updateLogo(variant: 'primary' | 'secondary' | 'full' | 'verified' | 'circle', url: string, alt?: string, width?: number, height?: number): void {
    if (variant === 'primary') {
      this.config.logo.primary = url;
    } else if (variant === 'secondary') {
      this.config.logo.secondary = url;
    } else if (variant === 'full') {
      this.config.logo.full = url;
    } else if (variant === 'verified') {
      this.config.logo.verified = url;
    } else if (variant === 'circle') {
      this.config.logo.circle = url;
    }

    if (alt) {
      this.config.logo.alt = alt;
    }
    if (width) {
      this.config.logo.width = width;
    }
    if (height) {
      this.config.logo.height = height;
    }
  }

  // Get current logo configuration
  getLogoConfig(): ThemeConfig['logo'] {
    return this.config.logo;
  }

  // Get all available logo variants
  getAllLogoVariants(): typeof logoVariants {
    return logoVariants;
  }
}

// Export convenience functions
export const getThemeManager = () => ThemeManager.getInstance();
export const getThemeConfig = () => ThemeManager.getInstance().getConfig();
export const updateTheme = (updates: Partial<ThemeConfig>) => ThemeManager.getInstance().updateConfig(updates);
export const getLogo = (variant?: 'primary' | 'secondary' | 'full' | 'verified' | 'circle') => ThemeManager.getInstance().getLogo(variant);
