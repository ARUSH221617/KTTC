import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/auth";
import AdminHeader from "./header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if admin is authenticated by verifying the session token
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    // Redirect to admin login
    redirect("/login");
  }

  const session = await verifyAdminSession(token);
  if (!session) {
    // Redirect to admin login
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative bg-gray-50">
      <AdminHeader />
      {children}
    </div>
  );
}
