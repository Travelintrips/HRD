import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Download,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface CheckInOutWidgetProps {
  employeeName?: string;
  employeeId?: string;
  currentStatus?: "checked-in" | "checked-out" | "pending";
  lastCheckTime?: string;
  isWithinGeofence?: boolean;
  requiresSelfie?: boolean;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onTakeSelfie?: () => void;
  officeLocation?: { latitude: number; longitude: number; radius: number };
}

const CheckInOutWidget = ({
  employeeName = "John Doe",
  employeeId = "EMP-1234",
  currentStatus: initialStatus = "checked-out",
  lastCheckTime: initialLastCheckTime = "08:00 AM",
  isWithinGeofence: initialGeofenceStatus = true,
  requiresSelfie = true,
  onCheckIn = () => {},
  onCheckOut = () => {},
  onTakeSelfie = () => {},
  officeLocation = { latitude: -6.2088, longitude: 106.8456, radius: 100 }, // Default to Jakarta coordinates with 100m radius
}: CheckInOutWidgetProps) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [lastCheckTime, setLastCheckTime] = useState(initialLastCheckTime);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelfieLoading, setIsSelfieLoading] = useState(false);
  const [isWithinGeofence, setIsWithinGeofence] = useState(
    initialGeofenceStatus,
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Update current time every second
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate distance between two points using Haversine formula (in meters)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if user is within geofence
  const checkGeofence = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ latitude, longitude });

    const distance = calculateDistance(
      latitude,
      longitude,
      officeLocation.latitude,
      officeLocation.longitude,
    );

    const withinGeofence = distance <= officeLocation.radius;
    setIsWithinGeofence(withinGeofence);

    return withinGeofence;
  };

  // Get current position as a Promise
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  };

  // Watch user's position
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          checkGeofence(position);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location Error",
            description:
              "Unable to access your location. Please enable location services.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    // Fetch the current attendance status for the employee
    if (employeeId !== "EMP-1234") {
      // Only fetch if we have a real employee ID
      fetchAttendanceStatus();
    }
  }, [employeeId]);

  const fetchAttendanceStatus = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Get today's attendance record for this employee
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        // If check_in exists but check_out doesn't, employee is checked in
        if (data.check_in && !data.check_out) {
          setCurrentStatus("checked-in");
          setLastCheckTime(formatTimeFromISOString(data.check_in));
        }
        // If both check_in and check_out exist, employee is checked out
        else if (data.check_in && data.check_out) {
          setCurrentStatus("checked-out");
          setLastCheckTime(formatTimeFromISOString(data.check_out));
        }
        // If neither exist (shouldn't happen), employee is checked out
        else {
          setCurrentStatus("checked-out");
        }
      } else {
        // No attendance record for today, employee is checked out
        setCurrentStatus("checked-out");
        setLastCheckTime("Not checked in today");
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance status",
        variant: "destructive",
      });
    }
  };

  const formatTimeFromISOString = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case "checked-in":
        return "Checked In";
      case "checked-out":
        return "Checked Out";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "checked-in":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "checked-out":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleCheckIn = async () => {
    if (!isWithinGeofence) {
      toast({
        title: "Location Error",
        description: "You must be within office premises to check in",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current geolocation
      let locationData = { latitude: 0, longitude: 0 };
      try {
        const position = await getCurrentPosition();
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("Location captured:", locationData);
      } catch (locationError) {
        console.error("Error getting location:", locationError);
        toast({
          title: "Location Warning",
          description:
            "Could not capture your location. Please enable location services.",
          variant: "warning",
        });
      }

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const timestamp = now.toISOString();

      // Check if there's already an attendance record for today
      const { data: existingRecord, error: fetchError } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw fetchError;
      }

      let result;
      if (existingRecord) {
        // Update existing record with check-in time
        result = await supabase
          .from("attendance")
          .update({
            check_in: timestamp,
            status: "present",
            location_check_in: locationData, // Real geolocation data
          })
          .eq("id", existingRecord.id);
      } else {
        // Create new attendance record
        result = await supabase.from("attendance").insert({
          employee_id: employeeId,
          date: today,
          check_in: timestamp,
          status: "present",
          location_check_in: locationData, // Real geolocation data
        });
      }

      if (result.error) throw result.error;

      setCurrentStatus("checked-in");
      setLastCheckTime(formatTimeFromISOString(timestamp));

      toast({
        title: "Success",
        description: "You have successfully checked in",
      });

      onCheckIn();
    } catch (error) {
      console.error("Error during check-in:", error);
      toast({
        title: "Check-in Failed",
        description: "There was an error recording your check-in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!isWithinGeofence) {
      toast({
        title: "Location Error",
        description: "You must be within office premises to check out",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current geolocation
      let locationData = { latitude: 0, longitude: 0 };
      try {
        const position = await getCurrentPosition();
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("Location captured for checkout:", locationData);
      } catch (locationError) {
        console.error("Error getting location for checkout:", locationError);
        toast({
          title: "Location Warning",
          description:
            "Could not capture your location. Please enable location services.",
          variant: "warning",
        });
      }

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const timestamp = now.toISOString();

      // Get today's attendance record
      const { data: existingRecord, error: fetchError } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingRecord) {
        throw new Error("No check-in record found for today");
      }

      // Update record with check-out time
      const { error: updateError } = await supabase
        .from("attendance")
        .update({
          check_out: timestamp,
          location_check_out: locationData, // Real geolocation data
        })
        .eq("id", existingRecord.id);

      if (updateError) throw updateError;

      setCurrentStatus("checked-out");
      setLastCheckTime(formatTimeFromISOString(timestamp));

      toast({
        title: "Success",
        description: "You have successfully checked out",
      });

      onCheckOut();
    } catch (error) {
      console.error("Error during check-out:", error);
      toast({
        title: "Check-out Failed",
        description: "There was an error recording your check-out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeSelfie = async () => {
    if (!isWithinGeofence) {
      toast({
        title: "Location Error",
        description:
          "You must be within office premises to take a verification selfie",
        variant: "destructive",
      });
      return;
    }

    setIsSelfieLoading(true);
    try {
      // In a real implementation, you would capture a photo here
      // For now, we'll simulate a delay and success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const today = format(new Date(), "yyyy-MM-dd");

      // Get today's attendance record
      const { data: existingRecord, error: fetchError } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Update with selfie URL (in a real app, you would upload the image to storage)
      const selfieField =
        currentStatus === "checked-in" ? "selfie_check_in" : "selfie_check_out";
      const { error: updateError } = await supabase
        .from("attendance")
        .update({
          [selfieField]: "https://example.com/selfie.jpg", // Placeholder URL
        })
        .eq("id", existingRecord.id);

      if (updateError) throw updateError;

      toast({
        title: "Selfie Captured",
        description: "Verification selfie has been saved",
      });

      onTakeSelfie();
    } catch (error) {
      console.error("Error capturing selfie:", error);
      toast({
        title: "Selfie Failed",
        description: "There was an error capturing your verification selfie",
        variant: "destructive",
      });
    } finally {
      setIsSelfieLoading(false);
    }
  };

  const handleViewAttendanceHistory = async () => {
    try {
      // Fetch attendance history for this employee
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;

      // In a real app, you would display this data in a modal or navigate to a history page
      console.log("Attendance history:", data);

      toast({
        title: "Attendance History",
        description: `Showing last ${data.length} attendance records`,
      });
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance history",
        variant: "destructive",
      });
    }
  };

  const handleExportAttendanceData = async () => {
    try {
      // Fetch attendance data for export
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false });

      if (error) throw error;

      // In a real app, you would format this data for export (CSV, Excel, etc.)
      console.log("Attendance data for export:", data);

      toast({
        title: "Export Successful",
        description: `${data.length} attendance records exported`,
      });
    } catch (error) {
      console.error("Error exporting attendance data:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your attendance data",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[350px] bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Attendance</CardTitle>
          <Badge className={getStatusColor()}>
            <span className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Current Time</span>
            </div>
            <span className="text-sm font-bold">{currentTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Last Activity</span>
            </div>
            <span className="text-sm">{lastCheckTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Location Status</span>
            </div>
            {isWithinGeofence ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Within Range
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                Out of Range
              </Badge>
            )}
          </div>

          <Separator />

          <div className="pt-2">
            {currentStatus === "checked-out" ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCheckIn}
                disabled={!isWithinGeofence || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
            ) : (
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleCheckOut}
                disabled={!isWithinGeofence || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Check Out"
                )}
              </Button>
            )}
          </div>

          {requiresSelfie && (
            <div className="pt-1">
              <Button
                variant="outline"
                className="w-full border-dashed border-gray-300 flex items-center gap-2"
                onClick={handleTakeSelfie}
                disabled={!isWithinGeofence || isSelfieLoading}
              >
                {isSelfieLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Take Verification Selfie
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleViewAttendanceHistory}
            >
              <History className="h-4 w-4" />
              View History
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExportAttendanceData}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-6">
        <div className="w-full text-center text-xs text-gray-500">
          {isWithinGeofence
            ? "You are within the office geofence"
            : "You must be within office premises to check in/out"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CheckInOutWidget;
