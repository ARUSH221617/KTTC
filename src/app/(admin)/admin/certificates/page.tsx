import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCertificates } from "@/lib/data-fetching";
import CertificatesTable from "./certificates-table";

export default async function AdminCertificatesPage() {
  const certificates = await getCertificates();
  
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificatesTable initialData={certificates} />
        </CardContent>
      </Card>
    </div>
  );
}