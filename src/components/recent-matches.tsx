"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

// Mock data for recent matches
const recentMatches = [
  {
    id: 1,
    date: "May 20, 2025",
    homeTeam: "Toronto Maple Leafs",
    homeScore: 3,
    awayTeam: "Montreal Canadiens",
    awayScore: 2,
    status: "Final",
    homeGoals: ["J. Smith (2)", "M. Johnson"],
    awayGoals: ["T. Williams", "R. Brown"],
  },
  {
    id: 2,
    date: "May 18, 2025",
    homeTeam: "Boston Bruins",
    homeScore: 1,
    awayTeam: "New York Rangers",
    awayScore: 4,
    status: "Final",
    homeGoals: ["D. Miller"],
    awayGoals: ["S. Davis", "J. Wilson (2)", "A. Taylor"],
  },
  {
    id: 3,
    date: "May 16, 2025",
    homeTeam: "Chicago Blackhawks",
    homeScore: 2,
    awayTeam: "Detroit Red Wings",
    awayScore: 2,
    status: "Final",
    homeGoals: ["R. Anderson", "C. Thomas"],
    awayGoals: ["L. Martinez", "K. Lewis"],
  },
  {
    id: 4,
    date: "May 14, 2025",
    homeTeam: "Vancouver Canucks",
    homeScore: 5,
    awayTeam: "Edmonton Oilers",
    awayScore: 3,
    status: "Final",
    homeGoals: ["P. Walker", "B. Hall (2)", "G. Young", "H. Allen"],
    awayGoals: ["F. King", "E. Wright", "O. Scott"],
  },
  {
    id: 5,
    date: "May 12, 2025",
    homeTeam: "Pittsburgh Penguins",
    homeScore: 0,
    awayTeam: "Washington Capitals",
    awayScore: 2,
    status: "Final",
    homeGoals: [],
    awayGoals: ["V. Adams", "Q. Nelson"],
  },
]

export default function RecentMatches() {
  const [page, setPage] = useState(1)
  const matchesPerPage = 3
  const totalPages = Math.ceil(recentMatches.length / matchesPerPage)

  const paginatedMatches = recentMatches.slice((page - 1) * matchesPerPage, page * matchesPerPage)

  return (
    <div className="space-y-4">
      {paginatedMatches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{match.date}</span>
              </div>
              <Badge variant={match.status === "Final" ? "outline" : "default"}>{match.status}</Badge>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-2 items-center">
                <div className="col-span-3">
                  <div className="font-semibold text-right text-gray-900 dark:text-white">{match.homeTeam}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                    {match.homeGoals.length > 0 ? match.homeGoals.join(", ") : "No goals"}
                  </div>
                </div>

                <div className="col-span-1 flex justify-center items-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {match.homeScore} - {match.awayScore}
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="font-semibold text-gray-900 dark:text-white">{match.awayTeam}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {match.awayGoals.length > 0 ? match.awayGoals.join(", ") : "No goals"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
