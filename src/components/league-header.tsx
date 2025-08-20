import { Trophy, Calendar, Users, User } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { HeaderLogo } from "@/components/ui/logo"

export default function LeagueHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <HeaderLogo />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EHockey League</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">2024-2025 Season</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600 mb-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Games</span>
                <span className="font-bold text-gray-900 dark:text-white">48</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 mb-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Teams</span>
                <span className="font-bold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="h-4 w-4 text-blue-600 mb-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Players</span>
                <span className="font-bold text-gray-900 dark:text-white">96</span>
              </div>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
