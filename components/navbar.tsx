import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <header className="w-full px-4 md:px-10 py-4 border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="w-11/12 mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
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
