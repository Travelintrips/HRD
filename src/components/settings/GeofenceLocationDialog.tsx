import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GeofenceLocation } from "./GeofenceLocationTable";
import { Employee } from "@/types/database.types";
import { supabase } from "@/lib/supabaseClient";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z
    .number()
    .or(
      z
        .string()
        .regex(/^-?\d+(\.\d+)?$/)
        .transform(Number),
    )
    .refine((val) => val >= -90 && val <= 90, {
      message: "Latitude must be between -90 and 90",
    }),
  longitude: z
    .number()
    .or(
      z
        .string()
        .regex(/^-?\d+(\.\d+)?$/)
        .transform(Number),
    )
    .refine((val) => val >= -180 && val <= 180, {
      message: "Longitude must be between -180 and 180",
    }),
  radius: z
    .number()
    .or(
      z
        .string()
        .regex(/^\d+(\.\d+)?$/)
        .transform(Number),
    )
    .refine((val) => val > 0, {
      message: "Radius must be greater than 0",
    }),
  assignedEmployees: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GeofenceLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: GeofenceLocation;
  onSubmit: (data: FormValues & { assignedEmployees: string[] }) => void;
}

const GeofenceLocationDialog = ({
  open,
  onOpenChange,
  location,
  onSubmit,
}: GeofenceLocationDialogProps) => {
  const isEditing = !!location;
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location?.name || "",
      address: typeof location?.address === "string" ? location.address : "",
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      radius: location?.radius || 100,
      assignedEmployees: [] as string[],
    },
  });

  // Fetch employees from the database
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, name, employee_id")
          .order("name");

        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
        // Initialize with empty array on error
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      // Initialize with empty array before fetching
      setEmployees([]);
      fetchEmployees();
    }
  }, [open]);

  // Fetch assigned employees for this location if editing
  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      if (!location?.id) return;

      try {
        const { data, error } = await supabase
          .from("employee_location_assignments")
          .select("employee_id")
          .eq("location_id", location.id);

        if (error) throw error;

        const employeeIds = data.map((item) => item.employee_id);
        setSelectedEmployees(employeeIds || []);
        form.setValue("assignedEmployees", employeeIds || []);
      } catch (error) {
        console.error("Error fetching assigned employees:", error);
        // Set to empty array on error
        setSelectedEmployees([]);
        form.setValue("assignedEmployees", []);
      }
    };

    if (isEditing && open) {
      fetchAssignedEmployees();
    } else if (open && !isEditing) {
      // Reset selected employees when adding a new location
      setSelectedEmployees([]);
      form.setValue("assignedEmployees", []);
    }
  }, [location, isEditing, open, form]);

  React.useEffect(() => {
    if (open && location) {
      console.log("Resetting form with location:", location);
      // Ensure address is a string and has a default value
      const addressValue =
        typeof location.address === "string"
          ? location.address
          : String(location.address || "");

      form.reset({
        name: location.name,
        address: addressValue,
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius,
        assignedEmployees: selectedEmployees || [],
      });
    } else if (open && !location) {
      console.log("Resetting form for new location");
      form.reset({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
        radius: 100,
        assignedEmployees: [] as string[],
      });
    }
  }, [location, form, selectedEmployees, open]);

  const handleSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);

    // Ensure assignedEmployees is always an array
    const formattedData = {
      ...data,
      assignedEmployees: Array.isArray(data.assignedEmployees)
        ? data.assignedEmployees
        : [],
    };

    // Make sure all required fields are present and properly formatted
    formattedData.address = formattedData.address || location?.address || "";

    // Ensure address is always a string
    if (typeof formattedData.address !== "string") {
      formattedData.address = String(formattedData.address || "");
    }

    // Ensure all numeric fields are properly converted to numbers
    formattedData.latitude = Number(formattedData.latitude);
    formattedData.longitude = Number(formattedData.longitude);
    formattedData.radius = Number(formattedData.radius);

    console.log("Formatted data to submit:", formattedData);
    onSubmit(formattedData);
  };

  // Filter employees based on search value
  const filteredEmployees = React.useMemo(() => {
    if (!employees) return [];
    if (!searchValue) return employees;

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        employee.employee_id.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [employees, searchValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Location" : "Add New Location"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the geofence location details."
              : "Add a new geofence location for employee check-in/out."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Business St, City, Country"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.000000"
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        {...field}
                        value={field.value.toString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.000000"
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        {...field}
                        value={field.value.toString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="radius"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Radius (meters)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="100"
                      onChange={(e) => onChange(parseInt(e.target.value, 10))}
                      {...field}
                      value={field.value.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedEmployees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Employees</FormLabel>
                  <FormDescription>
                    Select employees who are allowed to check in/out at this
                    location
                  </FormDescription>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !(
                                Array.isArray(field.value) &&
                                field.value.length > 0
                              ) && "text-muted-foreground",
                            )}
                          >
                            {Array.isArray(field.value) &&
                            field.value.length > 0
                              ? `${field.value.length} employee${field.value.length > 1 ? "s" : ""} selected`
                              : "Select employees"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search employees..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>No employees found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-[200px]">
                                {filteredEmployees.length > 0 ? (
                                  filteredEmployees.map((employee) => (
                                    <CommandItem
                                      key={employee.id}
                                      value={employee.name}
                                      onSelect={() => {
                                        try {
                                          const currentValues = Array.isArray(
                                            field.value,
                                          )
                                            ? field.value
                                            : [];
                                          const newValues =
                                            currentValues.includes(employee.id)
                                              ? currentValues.filter(
                                                  (id) => id !== employee.id,
                                                )
                                              : [...currentValues, employee.id];
                                          field.onChange(newValues);
                                          setSelectedEmployees(newValues);
                                        } catch (error) {
                                          console.error(
                                            "Error in employee selection:",
                                            error,
                                          );
                                          // Fallback to a safe default
                                          const newValues = [employee.id];
                                          field.onChange(newValues);
                                          setSelectedEmployees(newValues);
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          Array.isArray(field.value) &&
                                            field.value.includes(employee.id)
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <span className="font-medium">
                                        {employee.name}
                                      </span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        {employee.employee_id}
                                      </span>
                                    </CommandItem>
                                  ))
                                ) : isLoading ? (
                                  <CommandItem>
                                    Loading employees...
                                  </CommandItem>
                                ) : (
                                  <CommandItem>No employees found</CommandItem>
                                )}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.value.map((employeeId) => {
                          const employee =
                            employees && employees.length > 0
                              ? employees.find((e) => e.id === employeeId)
                              : null;
                          return (
                            <Badge
                              key={employeeId}
                              variant="secondary"
                              className="mr-1 mb-1"
                            >
                              {employee?.name || employeeId}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Location"
                    : "Add Location"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GeofenceLocationDialog;
