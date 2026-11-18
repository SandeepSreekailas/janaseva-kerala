import { Link } from 'react-router-dom';
import { FileText, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/track', label: 'Track Grievance' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/departments', label: 'Departments' },
  { to: '/about', label: 'About Us' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/accessibility', label: 'Accessibility' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#17365D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#E4B84A] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#17365D]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">JanaSeva Kerala</h3>
                <p className="text-xs text-gray-400">ജനസേവ കേരള</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              An initiative by the Chief Minister's Office, Government of Kerala, to
              ensure transparent and timely resolution of public grievances.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#E4B84A] mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#E4B84A] mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://kerala.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Kerala.gov.in
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[#E4B84A] mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                <span>Chief Minister's Office, Secretariat, Thiruvananthapuram, Kerala — 695001</span>
              </li>
              <li>
                <a
                  href="tel:+914712512345"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-gray-400" />
                  +91 471 251 2345
                </a>
              </li>
              <li>
                <a
                  href="mailto:janaseva@kerala.gov.in"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  janaseva@kerala.gov.in
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>&copy; {currentYear} JanaSeva Kerala. All rights reserved.</p>
            <p>
              <span className="text-[#16865B] font-medium">Disclaimer:</span>{' '}
              This is an official Government of Kerala portal. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
