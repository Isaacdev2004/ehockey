import { useLeagueStore } from "../stores/use-league-store";
import { NextResponse } from "next/server";
import { League } from "@/types/league";

export async function findLeague(handler: (myLeague: League) => Promise<NextResponse>) {
    const {league} = useLeagueStore()
    if(!league){
        return NextResponse.json({ error: "League not found" }, { status: 404 });
    }
    return await handler(league);

}