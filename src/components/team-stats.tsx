"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Mock data for team stats
const teamStatsData = [
  {
    id: 1,
    name: "Toronto Maple Leafs",
    logo: "/placeholder.svg?height=80&width=80",
    gp: 20,
    w: 15,
    l: 3,
    otl: 2,
    pts: 32,
    gf: 68,
    ga: 42,
    ppg: 15,
    ppo: 60,
    pkg: 10,
    pko: 58,
    sh: 620,
    sv: 580,
  },
  {
    id: 2,
    name: "Boston Bruins",
    logo: "/placeholder.svg?height=80&width=80",
    gp: 20,
    w: 14,
    l: 4,
    otl: 2,
    pts: 30,
    gf: 62,
    ga: 45,
    ppg: 14,
    ppo: 58,
    pkg: 12,
    pko: 55,
    sh: 605,
    sv: 560,
  },
  {
    id: 3,
    name: "Tampa Bay Lightning",
    logo: "/placeholder.svg?height=80&width=80",
    gp: 20,
    w: 13,
    l: 5,
    otl: 2,
    pts: 28,
    gf: 59,
    ga: 48,
    ppg: 16,
    ppo: 62,
    pkg: 14,
    pko: 52,
    sh: 590,
    sv: 542,
  },
  {
    id: 4,
    name: "Florida Panthers",
    logo: "/placeholder.svg?height=80&width=80",
    gp: 20,
    w: 12,
    l: 6,
    otl: 2,
    pts: 26,
    gf: 55,
    ga: 50,
    ppg: 12,
    ppo: 55,
    pkg: 15,
    pko: 50,
    sh: 575,
    sv: 525,
  },
  {
    id: 5,
    name: "Montreal Canadiens",
    logo: "/placeholder.svg?height=80&width=80",
    gp: 20,
    w: 10,
    l: 8,
    otl: 2,
    pts: 22,
    gf: 52,
    ga: 53,
    ppg: 10,
    ppo: 50,
    pkg: 16,
    pko: 48,
    sh: 560,
    sv: 507,
  },
  {
    id: 6,
    name: "Ottawa Senators",
    logo: "/placeholder.svg?height=80&width=80",
    gp: 20,
    w: 9,
    l: 9,
    otl: 2,
    pts: 20,
    gf: 48,
    ga: 55,
    ppg: 9,
    ppo: 48,
    pkg: 18,
    pko: 45,
    sh: 545,
    sv: 490,
  },
]

export default function TeamStats() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTeams = teamStatsData.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search teams..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="overflow-hidden border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-100 dark:bg-gray-800 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={team.logo || "/placeholder.svg"}
                    alt={`${team.name} logo`}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">{team.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="offense"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Offense
                  </TabsTrigger>
                  <TabsTrigger
                    value="defense"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Defense
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400">GP</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{team.gp}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Record</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {team.w}-{team.l}-{team.otl}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400">PTS</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{team.pts}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Goals For</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {team.gf} ({(team.gf / team.gp).toFixed(2)}/game)
                      </span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Goals Against</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {team.ga} ({(team.ga / team.gp).toFixed(2)}/game)
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="offense" className="pt-4">
                  <div className="space-y-3">
                    <div className="flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500">Power Play Goals</span>
                      <span className="font-bold">
                        {team.ppg} ({((team.ppg / team.ppo) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500">Power Play Opportunities</span>
                      <span className="font-bold">{team.ppo}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500">Shots</span>
                      <span className="font-bold">
                        {team.sh} ({(team.sh / team.gp).toFixed(1)}/game)
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="defense" className="pt-4">
                  <div className="space-y-3">
                    <div className="flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500">Penalty Kill</span>
                      <span className="font-bold">{((1 - team.pkg / team.pko) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500">PK Goals Against</span>
                      <span className="font-bold">
                        {team.pkg} of {team.pko}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <span className="text-xs text-zinc-500">Save Percentage</span>
                      <span className="font-bold">{((team.sv / (team.sv + team.ga)) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
