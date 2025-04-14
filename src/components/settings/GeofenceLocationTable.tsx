import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Edit, Trash2, MapPin } from "lucide-react";

export interface GeofenceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  created_at: string;
  updated_at: string;
}

interface GeofenceLocationTableProps {
  locations: GeofenceLocation[];
  onEdit: (location: GeofenceLocation) => void;
  onDelete: (id: string) => void;
  onSelect: (location: GeofenceLocation) => void;
}

export default function GeofenceLocationTable({
  locations,
  onEdit,
  onDelete,
  onSelect,
}: GeofenceLocationTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (location: GeofenceLocation) => {
    setSelectedId(location.id);
    onSelect(location);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead>Radius</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                No geofence locations defined
              </TableCell>
            </TableRow>
          ) : (
            locations.map((location) => (
              <TableRow
                key={location.id}
                className={selectedId === location.id ? "bg-muted/50" : ""}
              >
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>
                  {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)}
                </TableCell>
                <TableCell>{location.radius}m</TableCell>
                <TableCell>
                  {format(new Date(location.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSelect(location)}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(location)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
