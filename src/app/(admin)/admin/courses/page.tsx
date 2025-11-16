import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourses } from "@/lib/data-fetching";
import CoursesTable from "./courses-table";

/**
 * Renders the admin courses page.
 *
 * @returns {Promise<JSX.Element>} The rendered admin courses page.
 */
export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <CoursesTable initialData={courses} />
        </CardContent>
      </Card>
    </div>
  );
}