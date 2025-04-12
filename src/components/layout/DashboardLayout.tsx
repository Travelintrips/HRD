import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePath={currentPath} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 px-6">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HRD Attendance System. All rights
            reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
