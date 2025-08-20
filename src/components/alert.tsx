import {
    AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog'
export interface AlertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    cancelText?: string
    confirmText?: string
    onConfirm?: () => any
}


export function CustomAlertDialog(props: AlertDialogProps) {
    const { open, onOpenChange, title, description, cancelText, confirmText, onConfirm } = props

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogPortal>
                <AlertDialogOverlay />
                <AlertDialogContent className="bg-black text-white border border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{cancelText || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirm}>{confirmText || "Confirm"}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogPortal>
        </AlertDialog>
    )
}