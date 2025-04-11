"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  // Add event listener on mount and remove it on unmount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "w-full px-4 md:px-10 py-4 border-b shadow-sm z-50 transition-all",
        scrolled
          ? "bg-white fixed top-0 left-0 right-0 shadow-lg"
          : "bg-transparent absolute top-0 border-none shadow-none"
      )}>
      <div className="w-11/12 mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative size-12 bg-white rounded-md">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              sizes="96px"
              className="object-cover p-1"
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/auth/sign-in">
            <Button>Entrar</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button variant="outline">Registrar</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
