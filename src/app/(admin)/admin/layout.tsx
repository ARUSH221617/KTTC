import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validateAdminSession } from "@/lib/auth";
import AdminHeader from "./header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if admin is authenticated by verifying the session token
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  let isAuthenticated = false;
  if (token?.value) {
    isAuthenticated = validateAdminSession(token.value);
  }

  if (!isAuthenticated) {
    // Redirect to admin login
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="py-6">{children}</div>
    </div>
  );
}
