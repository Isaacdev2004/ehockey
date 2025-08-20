import { useState,useEffect } from "react"
import { set } from "zod"
import { Team } from "@/types/team"
import { AddTeamFormData } from "@/lib/validations/addTeam"
import { useLeagueStore } from "@/lib/stores/use-league-store"
import { useTeamStore } from "@/lib/stores/use-team-store"
interface UseAddTeam {
    isLoading: boolean
    addTeam: (clubInfo: any) => Promise<void>
}
interface UseDeleteTeam {
    isLoading: boolean
    deleteTeam: () => Promise<void>
}

export function UseAddTeam() : UseAddTeam {
    const {league} = useLeagueStore()
    const [isLoading, setIsLoading] = useState(false)
    async function addTeam(clubInfo: any) {
    try{
        console.log("info", clubInfo)
        setIsLoading(true)
        const response = await fetch("/api/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...clubInfo, league: league.league_name }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error)
        }

        const { data: responseData } = await response.json()
        } catch (error) {
            console.error(error instanceof Error ? error.message : "Failed to  add Team");
        } finally {
            setIsLoading(false);
        }
    }
    return { isLoading, addTeam }
}

export async function searchClub(form: AddTeamFormData) {
    try{
        const response = await fetch(`/api/stats?clubId=${form.clubId}&clubName=${form.clubName}`)
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error)
        }
        const data = await response.json()
        console.log(data)
        return {...data, logo: form.logo}
    } catch (error) {
        console.error(error instanceof Error ? error.message : "Failed to  add Team");
    }
}

export function UseGetTeams(){
    const {league} = useLeagueStore()
    const [teams, setTeams] = useState<Team[] | null>(null);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        useEffect(() => {
            async function getMyTeams() {
                try{
                    const response = await fetch(`/api/teams?league=${league.league_name}`);
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || "Failed to fetch teams");
                    }
                    setTeams(data.data);
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to fetch teams");
                }
                finally {
                    setIsLoading(false);
                }
            }
                getMyTeams();
    
            },[]);
        return { teams, isLoading, error };
    }
    export function UseDeleteTeam() : UseDeleteTeam {
        const {team} = useTeamStore()
        const {league} = useLeagueStore()
        const [isLoading, setIsLoading] = useState(false)
            async function deleteTeam(){
                try{
                    setIsLoading(true)
                    const response = await fetch(`/api/teams?league=${league.league_name}`,{
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(team),
                    })
                    if (!response.ok) {
                        const error = await response.json()
                        throw new Error(error.error)
                    }
                    const { data: responseData } = await response.json()
                }
                catch (error) {
                    console.error(error instanceof Error ? error.message : "Failed to  add Team");
                } finally {
                    setIsLoading(false);
                }
        }
        return { isLoading, deleteTeam }
    }



