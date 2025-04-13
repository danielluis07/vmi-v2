"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const MobileMenu = () => {
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer">
        <Menu className="size-8 text-white" />
      </SheetTrigger>
      <SheetContent>
        <VisuallyHidden.Root asChild>
          <SheetTitle>Menu</SheetTitle>
        </VisuallyHidden.Root>
        <VisuallyHidden.Root asChild>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </VisuallyHidden.Root>
        <div></div>
      </SheetContent>
    </Sheet>
  );
};
