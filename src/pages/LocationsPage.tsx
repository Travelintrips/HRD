import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Map } from "lucide-react";
import GeofenceLocationTable, {
  GeofenceLocation,
} from "@/components/settings/GeofenceLocationTable";
import GeofenceLocationDialog from "@/components/settings/GeofenceLocationDialog";
import GeofenceMapView from "@/components/settings/GeofenceMapView";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LocationsPage = () => {
  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] =
    useState<GeofenceLocation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch locations from the database
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      // First get all locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("geofence_locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (locationsError) throw locationsError;

      // For each location, get the assigned employees
      const locationsWithEmployees = await Promise.all(
        (locationsData || []).map(async (location) => {
          const { data: assignmentsData, error: assignmentsError } =
            await supabase
              .from("employee_location_assignments")
              .select("employee_id, employees(name, employee_id)")
              .eq("location_id", location.id);

          if (assignmentsError) {
            console.error("Error fetching assignments:", assignmentsError);
            return location;
          }

          return {
            ...location,
            assigned_employees: assignmentsData.map((a) => a.employee_id),
            employee_details: assignmentsData.map((a) => a.employees),
          };
        }),
      );

      setLocations(locationsWithEmployees || []);
    } catch (error: any) {
      console.error("Error fetching locations:", error.message);
      toast({
        title: "Error",
        description: "Failed to load geofence locations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle edit location
  const handleEditLocation = (location: GeofenceLocation) => {
    setSelectedLocation(location);
    setIsDialogOpen(true);
  };

  // Handle delete location
  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const { error } = await supabase
        .from("geofence_locations")
        .delete()
        .eq("id", locationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location deleted successfully",
      });

      // Refresh the locations list
      fetchLocations();
    } catch (error: any) {
      console.error("Error deleting location:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  // Handle add new location
  const handleAddLocation = () => {
    setSelectedLocation(null);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleSubmitLocation = async (formData: any) => {
    console.log("Form data received:", formData);
    try {
      const { assignedEmployees, ...locationData } = formData;

      // Add updated_at timestamp
      const dataWithTimestamp = {
        ...locationData,
        updated_at: new Date().toISOString(),
      };

      if (selectedLocation) {
        console.log("Updating location with ID:", selectedLocation.id);
        console.log("Update data:", dataWithTimestamp);

        // Ensure address is included in the update data and properly formatted
        dataWithTimestamp.address =
          dataWithTimestamp.address || selectedLocation?.address || "";

        // Make sure address is always a string
        if (typeof dataWithTimestamp.address !== "string") {
          dataWithTimestamp.address = String(dataWithTimestamp.address || "");
        }

        console.log("Final update data with address:", dataWithTimestamp);

        // Update existing location
        const { data, error: updateError } = await supabase
          .from("geofence_locations")
          .update(dataWithTimestamp)
          .eq("id", selectedLocation.id)
          .select();

        console.log("Update response:", { data, error: updateError });
        if (updateError) throw updateError;

        // Delete existing assignments
        const { error: deleteError } = await supabase
          .from("employee_location_assignments")
          .delete()
          .eq("location_id", selectedLocation.id);

        if (deleteError) throw deleteError;

        // Add new assignments
        if (assignedEmployees && assignedEmployees.length > 0) {
          const assignments = assignedEmployees.map((employeeId: string) => ({
            employee_id: employeeId,
            location_id: selectedLocation.id,
          }));

          const { error: insertError } = await supabase
            .from("employee_location_assignments")
            .insert(assignments);

          if (insertError) throw insertError;
        }

        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        // Create new location
        // Ensure address is included and properly formatted for new locations too
        if (
          !dataWithTimestamp.address ||
          typeof dataWithTimestamp.address !== "string"
        ) {
          dataWithTimestamp.address = String(dataWithTimestamp.address || "");
        }

        const newLocationData = {
          ...dataWithTimestamp,
          created_at: new Date().toISOString(),
        };

        const { data: newLocation, error: insertError } = await supabase
          .from("geofence_locations")
          .insert(newLocationData)
          .select()
          .single();

        if (insertError) throw insertError;

        // Add assignments
        if (assignedEmployees && assignedEmployees.length > 0 && newLocation) {
          const assignments = assignedEmployees.map((employeeId: string) => ({
            employee_id: employeeId,
            location_id: newLocation.id,
          }));

          const { error: assignError } = await supabase
            .from("employee_location_assignments")
            .insert(assignments);

          if (assignError) throw assignError;
        }

        toast({
          title: "Success",
          description: "Location added successfully",
        });
      }

      // Close dialog and refresh locations
      setIsDialogOpen(false);
      fetchLocations();
    } catch (error: any) {
      console.error("Error saving location:", error.message);
      toast({
        title: "Error",
        description: "Failed to save location: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePath="/locations" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Geofence Locations</h1>
            <Button onClick={handleAddLocation} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Manage Geofence Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Configure locations where employees can check in and out. Each
                location can have a specific geofence radius.
              </p>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-0">
                  <GeofenceLocationTable
                    locations={locations}
                    onEdit={handleEditLocation}
                    onDelete={handleDeleteLocation}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="map" className="mt-0">
                  <div className="h-[500px] border rounded-md">
                    <GeofenceMapView
                      locations={locations}
                      selectedLocation={selectedLocation}
                      onLocationSelect={setSelectedLocation}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                  {selectedLocation && (
                    <div className="mt-4 p-4 border rounded-md">
                      <h2 className="font-semibold">Selected Location:</h2>
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedLocation.name}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedLocation.address}
                      </p>
                      <p>
                        <span className="font-medium">Coordinates:</span>{" "}
                        {selectedLocation.latitude.toFixed(6)},{" "}
                        {selectedLocation.longitude.toFixed(6)}
                      </p>
                      <p>
                        <span className="font-medium">Radius:</span>{" "}
                        {selectedLocation.radius}m
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditLocation(selectedLocation)}
                        >
                          Edit Location
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteLocation(selectedLocation.id)
                          }
                        >
                          Delete Location
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <GeofenceLocationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        location={selectedLocation || undefined}
        onSubmit={handleSubmitLocation}
      />
    </div>
  );
};

export default LocationsPage;
