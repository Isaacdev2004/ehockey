'use client'
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
    SidebarTrigger
} from "@/components/ui/sidebar";
import Link from "next/link";
import {  
    TrophyIcon, 
    LogInIcon,
    HomeIcon,
	LayoutDashboardIcon,
    UserIcon,
    UsersIcon,
    SettingsIcon,
    MenuIcon
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/use-auth-store"
import { useAuthSession } from "@/lib/utils/auth-utils";
import { UserRole, hasPermission } from "@/types/auth";
import { useEffect, useState } from "react";
import { MobileSidebarBackdrop } from "./mobile-sidebar-backdrop";

export function AppSidebar() {
	const { user } = useAuthStore();
	const { session } = useAuthSession();
	const [userRole, setUserRole] = useState<UserRole | null>(null);

	useEffect(() => {
		// TODO: Fetch user role from API
		// For now, we'll set a default role for testing
		if (session?.user) {
			setUserRole(UserRole.PLAYER); // Default to player for testing
		}
	}, [session]);

	return (
        <>
			<MobileSidebarBackdrop />
			
			{/* Mobile Hamburger Menu */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<SidebarTrigger className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg">
					<MenuIcon className="h-5 w-5" />
				</SidebarTrigger>
			</div>

			<Sidebar className="bg-sidebar text-sidebar-foreground w-64 h-screen shadow-lg fixed top-0 left-0 z-40 lg:translate-x-0 transition-transform duration-300">
				<SidebarHeader className="p-4 bg-blue-900 text-white rounded-t-lg shadow-lg">
                    <div className="flex items-center gap-2">
						<h2 className="text-xl font-bold">EASHL Leagues</h2>
                    </div>
				</SidebarHeader>
				<SidebarContent className="p-4 bg-blue-900 text-white rounded-b-lg shadow-lg">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
									<HomeIcon className="h-5 w-5" />
									<span>Home</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/leagues" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
									<TrophyIcon className="h-5 w-5" />
									<span>Leagues</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					{user && (
						<>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/dashboard" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
										<LayoutDashboardIcon className="h-5 w-5" />
										<span>Dashboard</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							
							{/* Role-based navigation */}
							{userRole && hasPermission(userRole, 'canViewStats') && (
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<Link href="/player" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
											<UserIcon className="h-5 w-5" />
											<span>Player Panel</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
							
							{userRole && hasPermission(userRole, 'canManageTeam') && (
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<Link href="/manager" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
											<UsersIcon className="h-5 w-5" />
											<span>Manager Panel</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
							
							{userRole && hasPermission(userRole, 'canManageLeague') && (
								<>
									<SidebarMenuItem>
										<SidebarMenuButton asChild>
											<Link href="/admin" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
												<SettingsIcon className="h-5 w-5" />
												<span>Admin Panel</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild>
											<Link href="/admin/ea-sports" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
												<TrophyIcon className="h-5 w-5" />
												<span>EA Sports</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</>
							)}
						</>
					)}
					{!user &&(
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/login" className="flex items-center gap-2 hover:bg-blue-800 p-2 rounded transition-colors">
									<LogInIcon className="h-5 w-5" />
									<span>Login</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
					</SidebarMenu>
				</SidebarContent>
			</Sidebar>
		</>
	);
}