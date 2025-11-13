import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTestimonials } from "@/lib/data-fetching";
import TestimonialsTable from "./testimonials-table";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();
  
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialsTable initialData={testimonials} />
        </CardContent>
      </Card>
    </div>
  );
}