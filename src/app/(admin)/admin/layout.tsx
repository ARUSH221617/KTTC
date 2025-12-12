import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if admin is authenticated by verifying the session token
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Ensure user is an admin
  if (session.user.role !== "admin" && session.user.role !== "ADMIN") {
    // Redirect to home or show unauthorized page
    redirect("/");
  }

  return (
    <div className="min-h-screen relative bg-gray-50">
      {children}
    </div>
  );
}
