// Logo Management System
export interface LogoConfig {
  id: string;
  name: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type: 'league' | 'team' | 'sponsor';
  teamId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogoSheet {
  leagueLogo: LogoConfig;
  teamLogos: LogoConfig[];
  sponsorLogos?: LogoConfig[];
  metadata: {
    season: string;
    league: string;
    totalTeams: number;
    lastUpdated: string;
  };
}

// Logo Manager Class
export class LogoManager {
  private static instance: LogoManager;
  private logos: Map<string, LogoConfig> = new Map();
  private defaultLogo: LogoConfig;

  private constructor() {
    this.defaultLogo = {
      id: 'default',
      name: 'Default Logo',
      url: '/logo.png',
      alt: 'EHockey League',
      width: 150,
      height: 50,
      type: 'league',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  static getInstance(): LogoManager {
    if (!LogoManager.instance) {
      LogoManager.instance = new LogoManager();
    }
    return LogoManager.instance;
  }

  // Add or update a logo
  addLogo(logo: LogoConfig): void {
    this.logos.set(logo.id, {
      ...logo,
      updatedAt: new Date().toISOString(),
    });
  }

  // Get logo by ID
  getLogo(id: string): LogoConfig | undefined {
    return this.logos.get(id) || this.defaultLogo;
  }

  // Get logo by team ID
  getTeamLogo(teamId: string): LogoConfig | undefined {
    for (const logo of this.logos.values()) {
      if (logo.type === 'team' && logo.teamId === teamId && logo.isActive) {
        return logo;
      }
    }
    return this.defaultLogo;
  }

  // Get league logo
  getLeagueLogo(): LogoConfig {
    for (const logo of this.logos.values()) {
      if (logo.type === 'league' && logo.isActive) {
        return logo;
      }
    }
    return this.defaultLogo;
  }

  // Get all active logos
  getAllLogos(): LogoConfig[] {
    return Array.from(this.logos.values()).filter(logo => logo.isActive);
  }

  // Get logos by type
  getLogosByType(type: 'league' | 'team' | 'sponsor'): LogoConfig[] {
    return Array.from(this.logos.values()).filter(logo => logo.type === type && logo.isActive);
  }

  // Deactivate logo
  deactivateLogo(id: string): void {
    const logo = this.logos.get(id);
    if (logo) {
      logo.isActive = false;
      logo.updatedAt = new Date().toISOString();
      this.logos.set(id, logo);
    }
  }

  // Import logo sheet
  importLogoSheet(logoSheet: LogoSheet): void {
    // Add league logo
    this.addLogo(logoSheet.leagueLogo);

    // Add team logos
    logoSheet.teamLogos.forEach(logo => {
      this.addLogo(logo);
    });

    // Add sponsor logos if provided
    if (logoSheet.sponsorLogos) {
      logoSheet.sponsorLogos.forEach(logo => {
        this.addLogo(logo);
      });
    }
  }

  // Export logo sheet
  exportLogoSheet(): LogoSheet {
    const leagueLogo = this.getLeagueLogo();
    const teamLogos = this.getLogosByType('team');
    const sponsorLogos = this.getLogosByType('sponsor');

    return {
      leagueLogo,
      teamLogos,
      sponsorLogos: sponsorLogos.length > 0 ? sponsorLogos : undefined,
      metadata: {
        season: '2024-25',
        league: 'EHockey League',
        totalTeams: teamLogos.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  // Validate logo configuration
  validateLogo(logo: Partial<LogoConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!logo.id) errors.push('Logo ID is required');
    if (!logo.name) errors.push('Logo name is required');
    if (!logo.url) errors.push('Logo URL is required');
    if (!logo.type) errors.push('Logo type is required');
    if (logo.type === 'team' && !logo.teamId) errors.push('Team ID is required for team logos');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get logo statistics
  getLogoStats(): {
    total: number;
    active: number;
    byType: Record<string, number>;
  } {
    const allLogos = Array.from(this.logos.values());
    const activeLogos = allLogos.filter(logo => logo.isActive);
    
    const byType: Record<string, number> = {};
    allLogos.forEach(logo => {
      byType[logo.type] = (byType[logo.type] || 0) + 1;
    });

    return {
      total: allLogos.length,
      active: activeLogos.length,
      byType,
    };
  }
}

// Export convenience functions
export const getLogoManager = () => LogoManager.getInstance();
export const addLogo = (logo: LogoConfig) => LogoManager.getInstance().addLogo(logo);
export const getLogo = (id: string) => LogoManager.getInstance().getLogo(id);
export const getTeamLogo = (teamId: string) => LogoManager.getInstance().getTeamLogo(teamId);
export const getLeagueLogo = () => LogoManager.getInstance().getLeagueLogo();
export const importLogoSheet = (logoSheet: LogoSheet) => LogoManager.getInstance().importLogoSheet(logoSheet);
export const exportLogoSheet = () => LogoManager.getInstance().exportLogoSheet();
