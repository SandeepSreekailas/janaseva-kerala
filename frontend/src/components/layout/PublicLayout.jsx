import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PublicLayout:
 * Dedicated layout for unauthenticated visitors and public pages:
 * - Home
 * - About Us
 * - How It Works
 * - Departments
 * - Contact Us
 * - FAQ
 * - Track Grievance
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
