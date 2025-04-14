import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export interface GeofenceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  created_at: string;
  updated_at: string;
  assigned_employees?: string[];
}

interface GeofenceLocationTableProps {
  locations: GeofenceLocation[];
  onEdit: (location: GeofenceLocation) => void;
  onDelete: (locationId: string) => void;
  isLoading?: boolean;
}

const GeofenceLocationTable = ({
  locations,
  onEdit,
  onDelete,
  isLoading = false,
}: GeofenceLocationTableProps) => {
  if (isLoading) {
    return (
      <div className="py-4 text-center text-gray-500">Loading locations...</div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="mb-2">No geofence locations found</p>
        <p className="text-sm">Add a new location to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead>Radius (m)</TableHead>
            <TableHead>Assigned Employees</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell>{location.address}</TableCell>
              <TableCell>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </TableCell>
              <TableCell>{location.radius}</TableCell>
              <TableCell>
                {location.assigned_employees ? (
                  <span className="text-sm">
                    {location.assigned_employees.length} employees
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">None</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(location)}
                    title="Edit location"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(location.id)}
                    title="Delete location"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GeofenceLocationTable;
