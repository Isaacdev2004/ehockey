import { League } from "@/types/league";
import { useState, useEffect } from "react";

export function useMyLeagues(){
    const [leagues, setLeagues] = useState<League[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchLeagues() {
            try{
                const response = await fetch("/api/my-leagues");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch leagues");
                }
                setLeagues(data.data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch leagues");
            }
            finally {
                setIsLoading(false);
            }
        }
            fetchLeagues();

        },[]);
    return { leagues, isLoading, error };
}

export function useLeagues(){
    const [leagues, setLeagues] = useState<League[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function fetchLeagues() {
            try{
                const response = await fetch("/api/leagues");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch leagues");
                }
                setLeagues(data.data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch leagues");
            }
            finally {
                setIsLoading(false);
            }
        }
            fetchLeagues();

        },[]);
    return { leagues, isLoading, error };
}

// Legacy exports for backward compatibility
export const getMyLeagues = useMyLeagues;
export const getLeagues = useLeagues;
