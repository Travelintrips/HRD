import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import GeofenceMapView from "./GeofenceMapView";

interface GeofenceLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GeofenceLocationFormData) => void;
  initialData?: GeofenceLocationFormData;
}

export interface GeofenceLocationFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function GeofenceLocationDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: GeofenceLocationDialogProps) {
  const [formData, setFormData] = useState<GeofenceLocationFormData>(
    initialData || {
      name: "",
      address: "",
      latitude: -6.2088, // Default to Jakarta
      longitude: 106.8456,
      radius: 100,
    },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "radius" || name === "latitude" || name === "longitude"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleRadiusChange = (value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      radius: value[0],
    }));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configure Geofence Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                Latitude
              </Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                Longitude
              </Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="radius" className="text-right">
                Radius (m)
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  id="radius"
                  min={50}
                  max={500}
                  step={10}
                  value={[formData.radius]}
                  onValueChange={handleRadiusChange}
                  className="flex-1"
                />
                <span className="w-12 text-center">{formData.radius}m</span>
              </div>
            </div>
            <div className="col-span-4 mt-4">
              <div className="h-[300px] border rounded-md overflow-hidden">
                {open && (
                  <GeofenceMapView
                    locations={[
                      {
                        id: "temp",
                        name: formData.name || "New Location",
                        address: formData.address || "Address",
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        radius: formData.radius,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      },
                    ]}
                    selectedLocation={{
                      id: "temp",
                      name: formData.name || "New Location",
                      address: formData.address || "Address",
                      latitude: formData.latitude,
                      longitude: formData.longitude,
                      radius: formData.radius,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    }}
                    onLocationSelect={() => {}}
                    onMapClick={handleMapClick}
                    interactive
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Location</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
