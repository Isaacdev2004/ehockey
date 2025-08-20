import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {Team} from '@/types/team';

interface TeamState {
    team: Team;
    setTeam: (team: Team) => void;
}

export const useTeamStore = create<TeamState>()(
    persist(
        (set) => ({
            team: {
                clubId: '',
                league: '',
                clubName: '',
                logo: '',
            },
            setTeam: (team: Team) => set({team}),
        }),
        {
            name: 'team-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                team: state.team,
            }),
        })
    )
