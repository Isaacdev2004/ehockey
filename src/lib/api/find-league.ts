import { NextResponse } from "next/server";
import { League } from "@/types/league";

export async function findLeague(league: League | null, handler: (myLeague: League) => Promise<NextResponse>) {
    if(!league){
        return NextResponse.json({ error: "League not found" }, { status: 404 });
    }
    return await handler(league);
}