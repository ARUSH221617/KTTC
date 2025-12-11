import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold">KTTC</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Khuzestan Teacher Training Center - Empowering educators with modern teaching skills and professional development programs for over 20 years.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/certificate" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Certificate
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Contact Info</h3>
            <address className="space-y-3 not-italic">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Khorramshahr, Khuzestan, Iran</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-yellow-400" />
                <a href="tel:+986123456789" className="text-gray-300 text-sm hover:text-yellow-400">+98 61 2345 6789</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-yellow-400" />
                <a href="mailto:info@kttc.edu.ir" className="text-gray-300 text-sm hover:text-yellow-400">info@kttc.edu.ir</a>
              </div>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} KTTC - Khuzestan Teacher Training Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
