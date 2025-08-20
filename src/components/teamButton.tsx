import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { MoreVertical } from "lucide-react"
import { Button } from "./ui/button"
import { CustomAlertDialog } from "./alert"
import { AlertDialogProps } from "./alert"
import { useState } from "react"
import { useTeamStore } from "@/lib/stores/use-team-store"
import { Team } from "@/types/team"
import { UseDeleteTeam } from "@/hooks/use-manage-teams"
interface TeamButtonProps {
    id: string;
    teamName: string;
    logoUrl: string;
}



export function TeamButton({id, teamName, logoUrl }: TeamButtonProps) {
    const {isLoading, deleteTeam} = UseDeleteTeam()
    const {setTeam} = useTeamStore();
    const [alertOpen, setAlertOpen] = useState(false);
    const alertDialogProps: AlertDialogProps = {
        open:alertOpen,
        onOpenChange:setAlertOpen,
        title: `Delete ${teamName}?`,
        description: `Are you sure you want to delete ${teamName}? `,
        cancelText: "Cancel",
        confirmText: isLoading ? "Deleting..." : "Delete",
        onConfirm: async () =>{
            await deleteTeam()
            alertDialogProps.onOpenChange(false)
        }

    }
    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/20">
                    <img 
                        src={logoUrl} 
                        alt={`${teamName} logo`} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                    />
                </div>
                
                <CardHeader className="flex-grow p-0">
                    <CardTitle className="text-xl font-bold tracking-tight">
                        {teamName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Click to view details
                    </p>
                </CardHeader>

                <Button variant="ghost" size="icon" className="h-8 w-8" title="delete team" onClick ={(
                    () =>{
                        setTeam({
                            clubId: id,
                            clubName: teamName,
                            logo: logoUrl,
                        } as Team)
                        alertDialogProps.onOpenChange(true)
                    }
                )}>

                    <MoreVertical className="h-6 w-6" />
                </Button>
                <CustomAlertDialog {...alertDialogProps} />
            </div>
        </Card>
    );
}