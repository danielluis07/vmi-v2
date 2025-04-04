import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ProducerPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  return (
    <div>
      <p>
        usuário {session?.user.name}, que é um {session?.user.role}
      </p>
    </div>
  );
};

export default ProducerPage;
