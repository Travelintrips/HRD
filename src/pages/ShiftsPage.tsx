import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ShiftManagementPanel from "@/components/shift/ShiftManagementPanel";

const ShiftsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Shift Management
          </h1>

          <ShiftManagementPanel userRole="admin" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShiftsPage;
