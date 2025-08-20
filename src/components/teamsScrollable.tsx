import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area'
import { TeamButton } from './teamButton'
import { Team } from '@/types/team'
import { UseGetTeams } from '@/hooks/use-manage-teams'

export function TeamsScrollable() {
    const {teams, isLoading, error} = UseGetTeams()
    if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>
        if (error) return <p className="text-sm text-red-500">{error}</p>
        console.log(teams)
    
        return (
            <ScrollArea className="h-[300px] w-full">
                <div className="flex flex-col gap-2 p-4">
                    {teams && teams.length>0 && (
                        <>
                            {teams.map((team: Team, i) => (
                                <TeamButton
                                    key={i}
                                    id={team.clubId}
                                    teamName={team.clubName}
                                    logoUrl={team.logo}
                                />
                            ))}
                        </>
                    )}
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                    {(!teams || teams.length === 0) &&(
                        <p className="text-sm text-muted-foreground">
                            No Teams found.
                        </p>)}
                </div>
                <ScrollBar />
            </ScrollArea>
        )
}