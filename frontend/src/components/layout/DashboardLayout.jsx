/**
 * DashboardLayout
 * Transparent container wrapper for dashboard page views.
 * The outer layout, top navigation, and sidebar are provided by
 * CitizenLayout, CMOLayout, and OfficerLayout respectively.
 */
export default function DashboardLayout({ children }) {
  return <div className="space-y-6">{children}</div>;
}
