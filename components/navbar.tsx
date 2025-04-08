"use client";

import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <header className="w-full px-4 md:px-10 py-4 border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="w-11/12 mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="text-lg font-bold tracking-tight">SeuEvento</span>
        </Link>

        {/* Menu (preparado pra inserir os links depois) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {/* Exemplo de placeholder de itens */}
          <Link href="#" className="hover:text-black transition-colors">
            Explorar
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            Categorias
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  );
};
