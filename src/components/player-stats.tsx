"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for player stats
const playerStatsData = [
  {
    id: 1,
    name: "John Smith",
    team: "Toronto Maple Leafs",
    position: "C",
    gp: 20,
    g: 12,
    a: 18,
    pts: 30,
    pim: 10,
    ppg: 4,
    shg: 1,
    gwg: 3,
    shots: 65,
    faceoffPct: 56.2,
  },
  {
    id: 2,
    name: "Mike Johnson",
    team: "Toronto Maple Leafs",
    position: "RW",
    gp: 20,
    g: 10,
    a: 15,
    pts: 25,
    pim: 8,
    ppg: 3,
    shg: 0,
    gwg: 2,
    shots: 58,
    faceoffPct: 0,
  },
  {
    id: 3,
    name: "David Williams",
    team: "Boston Bruins",
    position: "D",
    gp: 20,
    g: 5,
    a: 20,
    pts: 25,
    pim: 14,
    ppg: 2,
    shg: 0,
    gwg: 1,
    shots: 45,
    faceoffPct: 0,
  },
  {
    id: 4,
    name: "Robert Brown",
    team: "Boston Bruins",
    position: "LW",
    gp: 20,
    g: 15,
    a: 8,
    pts: 23,
    pim: 12,
    ppg: 6,
    shg: 0,
    gwg: 4,
    shots: 70,
    faceoffPct: 0,
  },
  {
    id: 5,
    name: "James Wilson",
    team: "Tampa Bay Lightning",
    position: "C",
    gp: 20,
    g: 8,
    a: 14,
    pts: 22,
    pim: 6,
    ppg: 3,
    shg: 1,
    gwg: 2,
    shots: 52,
    faceoffPct: 53.8,
  },
  {
    id: 6,
    name: "Thomas Davis",
    team: "Tampa Bay Lightning",
    position: "D",
    gp: 20,
    g: 3,
    a: 18,
    pts: 21,
    pim: 16,
    ppg: 1,
    shg: 0,
    gwg: 0,
    shots: 40,
    faceoffPct: 0,
  },
  {
    id: 7,
    name: "Richard Anderson",
    team: "Florida Panthers",
    position: "RW",
    gp: 20,
    g: 11,
    a: 9,
    pts: 20,
    pim: 10,
    ppg: 4,
    shg: 0,
    gwg: 3,
    shots: 62,
    faceoffPct: 0,
  },
  {
    id: 8,
    name: "Charles Thomas",
    team: "Florida Panthers",
    position: "C",
    gp: 20,
    g: 7,
    a: 13,
    pts: 20,
    pim: 8,
    ppg: 2,
    shg: 1,
    gwg: 1,
    shots: 48,
    faceoffPct: 51.5,
  },
  {
    id: 9,
    name: "Daniel Miller",
    team: "Montreal Canadiens",
    position: "D",
    gp: 20,
    g: 4,
    a: 15,
    pts: 19,
    pim: 18,
    ppg: 2,
    shg: 0,
    gwg: 1,
    shots: 42,
    faceoffPct: 0,
  },
  {
    id: 10,
    name: "Paul Walker",
    team: "Montreal Canadiens",
    position: "LW",
    gp: 20,
    g: 12,
    a: 6,
    pts: 18,
    pim: 14,
    ppg: 5,
    shg: 0,
    gwg: 3,
    shots: 68,
    faceoffPct: 0,
  },
  {
    id: 11,
    name: "Mark Taylor",
    team: "Ottawa Senators",
    position: "C",
    gp: 20,
    g: 9,
    a: 8,
    pts: 17,
    pim: 10,
    ppg: 3,
    shg: 0,
    gwg: 2,
    shots: 55,
    faceoffPct: 49.8,
  },
  {
    id: 12,
    name: "Steven Lewis",
    team: "Ottawa Senators",
    position: "D",
    gp: 20,
    g: 2,
    a: 14,
    pts: 16,
    pim: 20,
    ppg: 1,
    shg: 0,
    gwg: 0,
    shots: 38,
    faceoffPct: 0,
  },
]

type SortKey =
  | "name"
  | "team"
  | "position"
  | "gp"
  | "g"
  | "a"
  | "pts"
  | "pim"
  | "ppg"
  | "shg"
  | "gwg"
  | "shots"
  | "faceoffPct"

export default function PlayerStats() {
  const [sortKey, setSortKey] = useState<SortKey>("pts")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState<string[]>([])
  const [statType, setStatType] = useState("skaters")

  const positions = ["C", "LW", "RW", "D", "G"]

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const filteredPlayers = playerStatsData
    .filter(
      (player) =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((player) => positionFilter.length === 0 || positionFilter.includes(player.position))
    .sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (sortKey === "name" || sortKey === "team" || sortKey === "position") {
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      }

      return sortDirection === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
    })

  return (
    <div className="space-y-4">
      <Tabs defaultValue="skaters" onValueChange={setStatType} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="skaters" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Skaters
          </TabsTrigger>
          <TabsTrigger value="goalies" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Goalies
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search players or teams..."
            className="pl-8 border-gray-200 dark:border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-gray-200 dark:border-gray-700">
              <Filter className="h-4 w-4" />
              <span>Position</span>
              {positionFilter.length > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                  {positionFilter.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {positions.map((position) => (
              <DropdownMenuCheckboxItem
                key={position}
                checked={positionFilter.includes(position)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setPositionFilter([...positionFilter, position])
                  } else {
                    setPositionFilter(positionFilter.filter((p) => p !== position))
                  }
                }}
              >
                {position}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {statType === "skaters" && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    Player
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("team")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    Team
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("position")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    POS
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("gp")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    GP
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("g")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    G
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("a")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    A
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("pts")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    PTS
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("pim")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    PIM
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("ppg")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    PPG
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("shg")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    SHG
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("gwg")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    GWG
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("shots")}
                    className="p-0 font-semibold hover:bg-transparent"
                  >
                    SHOTS
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell className="text-center">{player.gp}</TableCell>
                  <TableCell className="text-center">{player.g}</TableCell>
                  <TableCell className="text-center">{player.a}</TableCell>
                  <TableCell className="text-center font-bold">{player.pts}</TableCell>
                  <TableCell className="text-center">{player.pim}</TableCell>
                  <TableCell className="text-center">{player.ppg}</TableCell>
                  <TableCell className="text-center">{player.shg}</TableCell>
                  <TableCell className="text-center">{player.gwg}</TableCell>
                  <TableCell className="text-center">{player.shots}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {statType === "goalies" && (
        <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-center text-gray-500 dark:text-gray-400">Goalie statistics will be available soon.</p>
        </div>
      )}
    </div>
  )
}
