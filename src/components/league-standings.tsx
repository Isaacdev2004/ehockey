"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search } from "lucide-react"

// Mock data for standings
const standingsData = [
  { id: 1, team: "Toronto Maple Leafs", gp: 20, w: 15, l: 3, otl: 2, pts: 32, gf: 68, ga: 42, diff: 26 },
  { id: 2, team: "Boston Bruins", gp: 20, w: 14, l: 4, otl: 2, pts: 30, gf: 62, ga: 45, diff: 17 },
  { id: 3, team: "Tampa Bay Lightning", gp: 20, w: 13, l: 5, otl: 2, pts: 28, gf: 59, ga: 48, diff: 11 },
  { id: 4, team: "Florida Panthers", gp: 20, w: 12, l: 6, otl: 2, pts: 26, gf: 55, ga: 50, diff: 5 },
  { id: 5, team: "Montreal Canadiens", gp: 20, w: 10, l: 8, otl: 2, pts: 22, gf: 52, ga: 53, diff: -1 },
  { id: 6, team: "Ottawa Senators", gp: 20, w: 9, l: 9, otl: 2, pts: 20, gf: 48, ga: 55, diff: -7 },
  { id: 7, team: "Buffalo Sabres", gp: 20, w: 8, l: 10, otl: 2, pts: 18, gf: 45, ga: 58, diff: -13 },
  { id: 8, team: "Detroit Red Wings", gp: 20, w: 7, l: 11, otl: 2, pts: 16, gf: 42, ga: 60, diff: -18 },
  { id: 9, team: "New York Rangers", gp: 20, w: 6, l: 12, otl: 2, pts: 14, gf: 40, ga: 63, diff: -23 },
  { id: 10, team: "New York Islanders", gp: 20, w: 5, l: 13, otl: 2, pts: 12, gf: 38, ga: 65, diff: -27 },
  { id: 11, team: "New Jersey Devils", gp: 20, w: 4, l: 14, otl: 2, pts: 10, gf: 35, ga: 68, diff: -33 },
  { id: 12, team: "Philadelphia Flyers", gp: 20, w: 3, l: 15, otl: 2, pts: 8, gf: 32, ga: 70, diff: -38 },
]

type SortKey = "team" | "gp" | "w" | "l" | "otl" | "pts" | "gf" | "ga" | "diff"

export default function LeagueStandings({ limit }: { limit?: number }) {
  const [sortKey, setSortKey] = useState<SortKey>("pts")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const sortedData = [...standingsData]
    .filter((team) => team.team.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (sortKey === "team") {
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      }

      return sortDirection === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
    })

  const displayData = limit ? sortedData.slice(0, limit) : sortedData

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search teams..."
              className="pl-8 border-gray-200 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
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
                  onClick={() => handleSort("w")}
                  className="p-0 font-semibold hover:bg-transparent"
                >
                  W
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("l")}
                  className="p-0 font-semibold hover:bg-transparent"
                >
                  L
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("otl")}
                  className="p-0 font-semibold hover:bg-transparent"
                >
                  OTL
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
                  onClick={() => handleSort("gf")}
                  className="p-0 font-semibold hover:bg-transparent"
                >
                  GF
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("ga")}
                  className="p-0 font-semibold hover:bg-transparent"
                >
                  GA
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("diff")}
                  className="p-0 font-semibold hover:bg-transparent"
                >
                  DIFF
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((team, index) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{team.team}</TableCell>
                <TableCell className="text-center">{team.gp}</TableCell>
                <TableCell className="text-center">{team.w}</TableCell>
                <TableCell className="text-center">{team.l}</TableCell>
                <TableCell className="text-center">{team.otl}</TableCell>
                <TableCell className="text-center font-bold">{team.pts}</TableCell>
                <TableCell className="text-center">{team.gf}</TableCell>
                <TableCell className="text-center">{team.ga}</TableCell>
                <TableCell
                  className={`text-center ${
                    team.diff > 0
                      ? "text-blue-600 dark:text-blue-400"
                      : team.diff < 0
                        ? "text-red-600 dark:text-red-400"
                        : ""
                  }`}
                >
                  {team.diff > 0 ? `+${team.diff}` : team.diff}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
