// components/ui/dialog.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  open: false,
  setOpen: () => {},
})

const Dialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 shadow-xl duration-200",
  {
    variants: {
      variant: {
        default: "bg-gray-800 border border-gray-700",
        destructive: "bg-red-900/50 border-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogContentVariants> {
  onClose?: () => void
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, variant, children, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext)

    return (
      <div
        ref={ref}
        className={dialogContentVariants({ variant, className })}
        {...props}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogTrigger = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = React.useContext(DialogContext)
  
  return (
    <div 
      onClick={() => setOpen(true)}
      className="cursor-pointer"
    >
      {children}
    </div>
  )
}

export { Dialog, DialogContent, DialogTrigger }