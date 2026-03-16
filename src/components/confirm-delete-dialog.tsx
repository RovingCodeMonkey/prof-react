import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog'

interface ConfirmDeleteDialogProps {
  onConfirm: () => void
  description?: string
}

export function ConfirmDeleteDialog({
  onConfirm,
  description = 'This action cannot be undone.',
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Trash2 />
        <span className="sr-only">Delete</span>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="destructive" />} onClick={onConfirm}>
            Delete
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
