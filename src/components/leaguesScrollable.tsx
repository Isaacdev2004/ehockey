'use client'
import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area'
import { LeagueButton } from './leagueButton'
import { getMyLeagues } from '@/hooks/show-leagues'
import { getLeagues } from '@/hooks/show-leagues'
import { League } from '@/types/league'
import { useRouter } from 'next/navigation'
import { useLeagueStore } from '@/lib/stores/use-league-store'

export default  function LeaguesScrollable() {
    const {setLeague} = useLeagueStore()
    const router = useRouter()
    const { leagues, isLoading, error } = getMyLeagues()
    if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (error) return <p className="text-sm text-red-500">{error}</p>
    console.log(leagues?.length)

    return (
        <ScrollArea className="h-[300px] w-full">
            <div className="flex flex-col gap-2 p-4">
                {leagues && leagues.length>0 && (
                    <>
                        {leagues.map((league: League, i) => (
                            <LeagueButton
                                key={i}
                                name={league.league_name}
                                description={league.description}
                                logoUrl={league.logo_url}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLeague(league)
                                    router.push(`leagues/${league.league_name}`)

                                }}
                            />
                        ))}
                    </>
                )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                {(!leagues || leagues.length === 0) &&(
                    <p className="text-sm text-muted-foreground">
                        No leagues found.
                    </p>)}
            </div>
            <ScrollBar />
        </ScrollArea>
    )
}

export function AllLeaguesScrollable() {
    const {setLeague} = useLeagueStore()
    const router = useRouter()
    const { leagues, isLoading, error } = getLeagues()
    if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>
    if (error) return <p className="text-sm text-red-500">{error}</p>
    console.log(leagues?.length)

    return (
        <ScrollArea className="h-[300px] w-full">
            <div className="flex flex-col gap-2 p-4">
                {leagues && leagues.length>0 && (
                    <>
                        {leagues.map((league: League, i) => (
                            <LeagueButton
                                key={i}
                                name={league.league_name}
                                description={league.description}
                                logoUrl={league.logo_url}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLeague(league)
                                    router.push(`leagues/${league.league_name}`)
                                }}
                                
                            />
                        ))}
                    </>
                )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                {(!leagues || leagues.length === 0) &&(
                    <p className="text-sm text-muted-foreground">
                        No leagues found.
                    </p>)}
            </div>
            <ScrollBar />
        </ScrollArea>
    )
}