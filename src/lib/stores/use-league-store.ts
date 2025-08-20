import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { League } from '@/types/league'

interface LeagueState{
    league: League,
    setLeague: (league: League) => void,
}
export const useLeagueStore = create<LeagueState>()(
    persist(
        (set) => ({
            league: {
                league_name: "",
                owner: "",
                description: "",
                logo_url: "",
            },
            setLeague: (league: League) => set({ league })
        })
        , {
            name: 'league-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                league: state.league,
            }),
        }
    )
)