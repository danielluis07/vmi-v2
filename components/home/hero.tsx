import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative w-full h-[450px] md:h-[550px] lg:h-[650px]">
      <div className="absolute inset-0 bg-[url(/main-banner.jpg)] bg-cover bg-center brightness-50"></div>
      <div className="flex items-center relative z-10 h-full">
        <div className="flex flex-col items-start gap-y-5 max-w-6xl mx-auto px-4">
          <h1 className="font-extrabold text-3xl md:text-6xl text-white">
            Encontre e Garanta seu Próximo Evento Inesquecível!
          </h1>
          <h2 className="text-white text-lg">
            De shows a conferências, garanta seu ingresso antes que esgotem!
          </h2>
          <Button size="lg">Garanta seu Ingresso Agora</Button>
        </div>
      </div>
    </div>
  );
};
