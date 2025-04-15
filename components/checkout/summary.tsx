"use client";

import { capitalizeFirstLetter, cn, formatCurrency } from "@/lib/utils";
import { useCheckoutStore } from "@/stores/use-checkout-data";
import { ptBR } from "date-fns/locale";
import { Banknote, CalendarDays, Ticket, User } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CheckoutSummary = () => {
  const { tickets } = useCheckoutStore();

  return (
    <ScrollArea className="h-[150px]">
      <div className={cn(tickets.length > 1 && "grid grid-cols-2 gap-2")}>
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 p-4 border rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              {ticket.day && (
                <span>
                  {capitalizeFirstLetter(
                    format(
                      new Date(ticket.day),
                      "EEEE, dd 'de' MMMM 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span>{ticket.sectorName || "Setor padrão"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>
                {ticket.gender === "FEMALE" ? "Feminino" : "Masculino"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Banknote className="w-4 h-4 text-muted-foreground" />
              <span>
                {ticket.quantity} × {formatCurrency(ticket.price)} ={" "}
                <strong>
                  {formatCurrency(ticket.price * ticket.quantity)}
                </strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
