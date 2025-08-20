import { 
    Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { addTeamSchema } from "@/lib/validations/addTeam"
import { AddTeamFormData } from "@/lib/validations/addTeam"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseAddTeam } from "@/hooks/use-manage-teams"
import { CustomAlertDialog } from "./alert"
import {AlertDialogProps} from "./alert"
import { searchClub } from "@/hooks/use-manage-teams"
import { useState } from "react"
interface AddTeamDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
    const {addTeam, isLoading} = UseAddTeam()
    const [alertOpen, setAlertOpen] = useState(false)
    const [officialClubName, setOfficialClubName] = useState("")
    const [officialClubId, setOfficialClubId] = useState("")
    const form = useForm<AddTeamFormData>({
    resolver: zodResolver(addTeamSchema),
    defaultValues: {
      clubId: "",
      clubName: "",
      logo: "",
    }
  });
    const alertDialogProps :AlertDialogProps = {
        open: alertOpen,
        onOpenChange:setAlertOpen,
        title: `Add ${officialClubName} ?`,
        description: `Are you sure you want to add ${officialClubName} as a new team?`,
        cancelText: "Cancel",
        confirmText: isLoading ? "Adding Team..." : "Add Team",
        onConfirm: async () => {
            await addTeam(await searchClub({
                clubName: form.getValues("clubName"),
                clubId: form.getValues("clubId"),
                logo: form.getValues("logo")
            }))
            alertDialogProps.onOpenChange(false)
            onOpenChange(false)
        }
    }
    const handleSearch = async(e: React.MouseEvent) => {
        e.preventDefault()
        try{
            const team = await searchClub({
                clubName: form.getValues("clubName"),
                clubId: form.getValues("clubId"),
                logo: form.getValues("logo")
            })
            if(team){
                setOfficialClubName(team.club.clubName)
                setOfficialClubId(team.club.clubId)
                console.log('club found')
            }
            setAlertOpen(true)
          }catch (e){
            console.log(e)
          }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black text-white border border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white">Add New Team</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <Form {...form}>
                        <form className="space-y-4">
                            <FormField
                                control={form.control}
                                name="clubId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Club ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ClubId" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clubName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Club Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Club name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="logo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="logo url" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <button
                                type="button"
                                onClick={handleSearch}                             
                                className="w-full p-2 bg-blue-500 text-white rounded"
                            >
                                {"Add Team"}
                            </button>
                            <CustomAlertDialog {...alertDialogProps} />
                        </form>
                    </Form>
                </div>


            </DialogContent>
        </Dialog>
    )

    
}
