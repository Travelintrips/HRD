import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { GeofenceLocation } from "../settings/GeofenceLocationTable";
import { Employee } from "@/types/database.types";

interface EmployeeLocationAssignmentDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  employee?: Employee;
  employeeId?: string;
  employeeName?: string;
  onSuccess?: () => void;
}

const EmployeeLocationAssignmentDialog = ({
  open,
  onOpenChange,
  onClose,
  employee,
  employeeId,
  employeeName,
  onSuccess,
}: EmployeeLocationAssignmentDialogProps) => {
  // Use either the employee object or the separate ID/name props
  const empId = employee?.id || employeeId;
  const empName = employee?.name || employeeName;
  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all locations
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("geofence_locations")
          .select("*")
          .order("name");

        if (error) throw error;
        setLocations(data || []);
      } catch (error: any) {
        console.error("Error fetching locations:", error.message);
        toast({
          title: "Error",
          description: "Failed to load locations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchLocations();
    }
  }, [open]);

  // Fetch assigned locations for this employee
  useEffect(() => {
    const fetchAssignedLocations = async () => {
      if (!empId) return;

      try {
        const { data, error } = await supabase
          .from("employee_location_assignments")
          .select("location_id")
          .eq("employee_id", empId);

        if (error) throw error;

        const locationIds = data.map((item) => item.location_id);
        setSelectedLocations(locationIds || []);
      } catch (error: any) {
        console.error("Error fetching assigned locations:", error.message);
        toast({
          title: "Error",
          description: "Failed to load assigned locations",
          variant: "destructive",
        });
      }
    };

    if (open && empId) {
      fetchAssignedLocations();
    }
  }, [employee, open]);

  const handleToggleLocation = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId],
    );
  };

  const handleSave = async () => {
    try {
      if (!empId) {
        toast({
          title: "Error",
          description: "Employee ID is missing",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // First delete all existing assignments for this employee
      const { error: deleteError } = await supabase
        .from("employee_location_assignments")
        .delete()
        .eq("employee_id", empId);

      if (deleteError) throw deleteError;

      // Then insert new assignments
      if (selectedLocations && selectedLocations.length > 0) {
        const assignments = selectedLocations.map((locationId) => ({
          employee_id: empId,
          location_id: locationId,
        }));

        const { error: insertError } = await supabase
          .from("employee_location_assignments")
          .insert(assignments);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Location assignments updated successfully",
      });

      if (onSuccess) onSuccess();
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error saving location assignments:", error.message);
      toast({
        title: "Error",
        description: "Failed to update location assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange || (() => {})}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Check-in Locations</DialogTitle>
          <DialogDescription>
            Select the locations where {empName} can check in and out.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Assigned Locations</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !selectedLocations?.length && "text-muted-foreground",
                  )}
                  disabled={isLoading}
                >
                  {selectedLocations && selectedLocations.length > 0
                    ? `${selectedLocations.length} location${selectedLocations.length > 1 ? "s" : ""} selected`
                    : "Select locations"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search locations..." />
                  <CommandEmpty>No locations found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {locations && locations.length > 0 ? (
                        locations.map((location) => (
                          <CommandItem
                            key={location.id}
                            value={location.name}
                            onSelect={() => handleToggleLocation(location.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLocations &&
                                  selectedLocations.includes(location.id)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {location.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {location.address}
                              </span>
                            </div>
                          </CommandItem>
                        ))
                      ) : (
                        <CommandItem>Loading locations...</CommandItem>
                      )}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedLocations && selectedLocations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedLocations.map((locationId) => {
                  const location = locations.find((l) => l.id === locationId);
                  return (
                    <Badge
                      key={locationId}
                      variant="secondary"
                      className="mr-1 mb-1"
                    >
                      {location?.name || locationId}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onOpenChange) onOpenChange(false);
              if (onClose) onClose();
            }}
            className="mr-2"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeLocationAssignmentDialog;
