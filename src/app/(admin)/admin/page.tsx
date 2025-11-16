'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  Users,
  Mail,
  Award,
  MessageCircle,
  BarChart3,
  TrendingUp,
  UserPlus,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalCertificates: number;
  };
  recent: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
    courses: Array<{
      id: string;
      title: string;
      instructor: {
        name: string;
      };
      createdAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your KTTC platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalUsers || 0}</div>
            <p className="text-xs text-gray-500">Active users on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalCourses || 0}</div>
            <p className="text-xs text-gray-500">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.stats.totalCertificates || 0}</div>
            <p className="text-xs text-gray-500">Certificates issued</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-blue-500" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent.users && dashboardData.recent.users.length > 0 ? (
                dashboardData.recent.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent users</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              Recent Courses
            </CardTitle>
            <CardDescription>Latest created courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recent.courses && dashboardData.recent.courses.length > 0 ? (
                dashboardData.recent.courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500">By {course.instructor.name}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent courses</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage different sections of your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link href="/admin/courses">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center">
                <GraduationCap className="h-6 w-6 mb-2" />
                <span>Manage Courses</span>
              </Button>
            </Link>
            <Link href="/admin/certificates">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center">
                <Award className="h-6 w-6 mb-2" />
                <span>Manage Certificates</span>
              </Button>
            </Link>
            <Link href="/admin/contacts">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center">
                <Mail className="h-6 w-6 mb-2" />
                <span>Manage Contacts</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}