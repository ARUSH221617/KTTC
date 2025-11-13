"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Target, Eye, Award, BookOpen, Globe, Lightbulb } from "lucide-react";

const timelineEvents = [
  {
    year: "2001",
    title: "KTTC Founded",
    description: "Khuzestan Teacher Training Center was established with a vision to elevate educational standards in the region.",
    icon: Calendar,
    color: "bg-blue-600"
  },
  {
    year: "2006",
    title: "First Teacher Training Program",
    description: "Launched our flagship teacher training program with 50 pioneering educators.",
    icon: Users,
    color: "bg-green-600"
  },
  {
    year: "2015",
    title: "Expanded Curriculum",
    description: "Introduced advanced courses in educational psychology and classroom management.",
    icon: BookOpen,
    color: "bg-purple-600"
  },
  {
    year: "2021",
    title: "Digital Transformation",
    description: "Transitioned to hybrid learning models, combining online and in-person education.",
    icon: Globe,
    color: "bg-orange-600"
  },
  {
    year: "2024",
    title: "New Learning Management System",
    description: "Launched state-of-the-art LMS with AI-powered personalized learning paths.",
    icon: Lightbulb,
    color: "bg-yellow-600"
  }
];

const teamMembers = [
  {
    name: "Dr. Mohammad Reza Alavi",
    role: "Founder & Director",
    description: "Educational visionary with 25+ years of experience in teacher education.",
    avatar: "/api/placeholder/150/150"
  },
  {
    name: "Prof. Fatemeh Mohammadi",
    role: "Academic Director",
    description: "Expert in educational psychology and curriculum development.",
    avatar: "/api/placeholder/150/150"
  },
  {
    name: "Dr. Ali Kazemi",
    role: "Head of Training Programs",
    description: "Specialist in modern teaching methodologies and educational technology.",
    avatar: "/api/placeholder/150/150"
  },
  {
    name: "Ms. Maryam Hosseini",
    role: "Student Affairs Director",
    description: "Dedicated to student success and career development support.",
    avatar: "/api/placeholder/150/150"
  }
];

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className={`space-y-4 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
              <Badge className="bg-yellow-400 text-blue-900 hover:bg-yellow-300">
                About Our Institution
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                About Khuzestan Teacher Training Center
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A beacon of educational excellence in Khuzestan province, 
                dedicated to empowering educators and transforming lives through quality teacher education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Our Story
                </h2>
                <div className="h-1 w-20 bg-yellow-400 rounded"></div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded in 2001, the Khuzestan Teacher Training Center (KTTC) emerged from a simple yet powerful vision: 
                to create a world-class institution that would elevate the standards of education in our region. 
                What began with just 50 students has now grown into a premier educational center serving over 1,200 teachers annually.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Over the past two decades, we have remained committed to our founding principles of excellence, 
                innovation, and inclusivity. Our programs have evolved to meet the changing needs of 21st-century education, 
                incorporating cutting-edge teaching methodologies and educational technologies.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-bold text-2xl text-gray-900">20+</p>
                    <p className="text-gray-600">Years of Excellence</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-bold text-2xl text-gray-900">1,200+</p>
                    <p className="text-gray-600">Graduate Teachers</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/api/placeholder/600/400"
                alt="KTTC Campus Building"
                className="rounded-xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Our Journey Through Time
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key milestones that have shaped our institution and defined our legacy
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 hidden lg:block"></div>
            
            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-blue-600 rounded-full z-10 hidden lg:block"></div>
                  
                  {/* Content */}
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12 lg:ml-auto'}`}>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className={`flex items-center space-x-3 mb-4 ${index % 2 === 0 ? 'lg:flex-row-reverse lg:space-x-reverse' : ''}`}>
                          <div className={`${event.color} text-white p-3 rounded-full`}>
                            <event.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {event.year}
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-900 mt-1">{event.title}</h3>
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{event.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Target className="h-10 w-10 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To empower educators with innovative teaching methodologies, psychological insights, and leadership skills 
                necessary to create transformative learning experiences. We are committed to fostering excellence in education 
                through comprehensive professional development programs that combine theory with practical application.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Quality teacher education and training</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Research-based teaching methodologies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Continuous professional development</span>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Eye className="h-10 w-10 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                To be the leading teacher training institution in the region, recognized for excellence in education, 
                innovation in teaching, and our contribution to educational advancement. We aspire to create a community 
                of educators who inspire positive change and shape the future of education.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Regional leadership in teacher education</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Innovation in educational technology</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Global recognition for educational excellence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to educational excellence and innovation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-6 space-y-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <Badge variant="secondary" className="mt-2">{member.role}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Join Our Legacy of Excellence
            </h2>
            <p className="text-xl text-blue-100">
              Become part of a community that's shaping the future of education in Khuzestan and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors">
                Explore Our Programs
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                Schedule a Visit
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}