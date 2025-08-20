export enum UserRole {
  PLAYER = 'PLAYER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export interface UserPermissions {
  canViewLeague: boolean;
  canViewTeam: boolean;
  canViewStats: boolean;
  canEditProfile: boolean;
  canManageTeam: boolean;
  canCreateGames: boolean;
  canEnterStats: boolean;
  canManageLeague: boolean;
  canManageUsers: boolean;
  canConfigureBranding: boolean;
  canImportExport: boolean;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  teamId?: string;
  leagueId?: string;
  permissions: UserPermissions;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.PLAYER]: {
    canViewLeague: true,
    canViewTeam: true,
    canViewStats: true,
    canEditProfile: true,
    canManageTeam: false,
    canCreateGames: false,
    canEnterStats: false,
    canManageLeague: false,
    canManageUsers: false,
    canConfigureBranding: false,
    canImportExport: false,
  },
  [UserRole.MANAGER]: {
    canViewLeague: true,
    canViewTeam: true,
    canViewStats: true,
    canEditProfile: true,
    canManageTeam: true,
    canCreateGames: true,
    canEnterStats: true,
    canManageLeague: false,
    canManageUsers: false,
    canConfigureBranding: false,
    canImportExport: true,
  },
  [UserRole.ADMIN]: {
    canViewLeague: true,
    canViewTeam: true,
    canViewStats: true,
    canEditProfile: true,
    canManageTeam: true,
    canCreateGames: true,
    canEnterStats: true,
    canManageLeague: true,
    canManageUsers: true,
    canConfigureBranding: true,
    canImportExport: true,
  },
};

export const getPermissionsForRole = (role: UserRole): UserPermissions => {
  return ROLE_PERMISSIONS[role];
};

export const hasPermission = (
  userRole: UserRole,
  permission: keyof UserPermissions
): boolean => {
  const permissions = getPermissionsForRole(userRole);
  return permissions[permission];
};
