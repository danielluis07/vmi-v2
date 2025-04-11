import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full border-t text-muted-foreground text-sm">
      <div className="w-11/12 mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          &copy; {new Date().getFullYear()} Vendo meu ingresso. Todos os
          direitos reservados.
        </p>

        <div className="flex gap-4">
          <Link href="/terms" className="hover:underline">
            Termos de uso
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacidade
          </Link>
          <Link href="/contact" className="hover:underline">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  );
};
