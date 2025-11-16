import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContacts } from "@/lib/data-fetching";
import ContactsTable from "./contacts-table";

/**
 * Renders the admin contacts page.
 *
 * @returns {Promise<JSX.Element>} The rendered admin contacts page.
 */
export default async function AdminContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactsTable initialData={contacts} />
        </CardContent>
      </Card>
    </div>
  );
}