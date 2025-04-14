import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

interface GeofenceLocationFixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const GeofenceLocationFixDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: GeofenceLocationFixDialogProps) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFixTables = async () => {
    setIsLoading(true);
    try {
      // Create geofence_locations table if it doesn't exist
      const { error: createLocationsError } = await supabase.rpc(
        "execute_sql",
        {
          sql: `
          CREATE TABLE IF NOT EXISTS geofence_locations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            radius INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE geofence_locations ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow all operations on geofence_locations" ON geofence_locations;
          
          CREATE POLICY "Allow all operations on geofence_locations"
            ON geofence_locations
            USING (true)
            WITH CHECK (true);
          
          ALTER PUBLICATION supabase_realtime ADD TABLE geofence_locations;
          `,
        },
      );

      if (createLocationsError) throw createLocationsError;

      // Create employee_location_assignments table if it doesn't exist
      const { error: createAssignmentsError } = await supabase.rpc(
        "execute_sql",
        {
          sql: `
          CREATE TABLE IF NOT EXISTS employee_location_assignments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            location_id UUID NOT NULL REFERENCES geofence_locations(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(employee_id, location_id)
          );
          
          ALTER TABLE employee_location_assignments ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow all operations on employee_location_assignments" ON employee_location_assignments;
          
          CREATE POLICY "Allow all operations on employee_location_assignments"
            ON employee_location_assignments
            USING (true)
            WITH CHECK (true);
          
          ALTER PUBLICATION supabase_realtime ADD TABLE employee_location_assignments;
          `,
        },
      );

      if (createAssignmentsError) throw createAssignmentsError;

      toast({
        title: "Success",
        description: "Database tables fixed successfully",
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error fixing tables:", error);
      toast({
        title: "Error",
        description: `Failed to fix tables: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fix Database Tables</DialogTitle>
          <DialogDescription>
            This will create or fix the geofence location tables in the
            database.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500 mb-2">
            It appears there might be issues with the geofence location tables
            in your database. This utility will create or fix the following
            tables:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
            <li>geofence_locations</li>
            <li>employee_location_assignments</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleFixTables} disabled={isLoading}>
            {isLoading ? "Fixing..." : "Fix Tables"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeofenceLocationFixDialog;
