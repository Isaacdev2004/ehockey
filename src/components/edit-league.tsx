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
import { CreateLeagueSchema } from "@/lib/validations/createLeague"
import { CreateLeagueFormData } from "@/lib/validations/createLeague"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseUpdateLeague } from "@/hooks/use-manage-league"
import {League} from "@/types/league"

interface EditLeagueDialogProps {
    league: League
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditLeagueDialog({ open, onOpenChange, league }: EditLeagueDialogProps) {
    const {isLoading, editLeague} = UseUpdateLeague()
    const form = useForm<CreateLeagueFormData>({
    resolver: zodResolver(CreateLeagueSchema),
    defaultValues: {
        league_name: decodeURIComponent(league.league_name),
      description: league.description,
      logo_url: league.logo_url,
    },
  });
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black text-white border border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit {" "} {decodeURIComponent(league.league_name)}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(editLeague)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="league_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>League Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="my league" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="league description (Max 240 characters)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="logo_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/logo.png" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full p-2 bg-blue-500 text-white rounded"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
};

