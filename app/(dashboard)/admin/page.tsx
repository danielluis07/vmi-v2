import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const AdminPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div>
      <p>
        usuário {session?.user.name}, que é um {session?.user.role}
      </p>
    </div>
  );
};

export default AdminPage;
