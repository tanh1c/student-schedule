import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef(
  (
    {
      className,
      bodyClassName,
      children,
      side = "left",
      title = "Menu",
      description = "Bảng điều hướng và thao tác nhanh.",
      ...props
    },
    ref
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
          {
            "left-0 top-0 h-full w-80 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left":
              side === "left",
            "right-0 top-0 h-full w-80 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right":
              side === "right",
            "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-[28px] border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom":
              side === "bottom",
          },
          className
        )}
        {...props}
      >
        <SheetPrimitive.Title className="sr-only">
          {title}
        </SheetPrimitive.Title>
        <SheetPrimitive.Description className="sr-only">
          {description}
        </SheetPrimitive.Description>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="font-semibold">{title}</div>
          <SheetClose className="rounded-md p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </SheetClose>
        </div>
        <div className={cn("flex-1 overflow-y-auto px-4 pb-6", bodyClassName)}>
          {children}
        </div>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent };
