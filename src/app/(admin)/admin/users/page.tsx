import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UsersTable from "./users-table";

/**
 * Renders the admin users page.
 *
 * @returns {Promise<JSX.Element>} The rendered admin users page.
 */
export default async function AdminUsersPage() {
  // For now, returning empty array since there might not be a user API endpoint
  // In a real application, you would have an API endpoint for users
  const users = []; // await getUsers();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable initialData={users} />
        </CardContent>
      </Card>
    </div>
  );
}