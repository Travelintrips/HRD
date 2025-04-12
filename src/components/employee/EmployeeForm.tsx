import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { Branch, City, WorkArea, WorkPlace } from "@/types/database.types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  branchId: z.string().min(1, { message: "Branch is required" }),
  cityId: z.string().optional(),
  workAreaId: z.string().optional(),
  workPlaceId: z.string().optional(),
  division: z.string().min(1, { message: "Division is required" }),
  status: z.enum(["permanent", "freelance"]),
});

type FormValues = z.infer<typeof formSchema>;

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  branch: string;
  division: string;
  status: "permanent" | "freelance";
  attendanceStatus: "present" | "absent" | "late" | "leave";
  avatar: string;
}

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  employee?: Employee;
  title?: string;
}

const EmployeeForm = ({
  open = true,
  onClose,
  onSubmit,
  employee,
  title = "Add Employee",
}: EmployeeFormProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [workAreas, setWorkAreas] = useState<WorkArea[]>([]);
  const [workPlaces, setWorkPlaces] = useState<WorkPlace[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredWorkAreas, setFilteredWorkAreas] = useState<WorkArea[]>([]);
  const [filteredWorkPlaces, setFilteredWorkPlaces] = useState<WorkPlace[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);

  // Fetch location data from Supabase
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch cities
        const { data: cityData, error: cityError } = await supabase
          .from("cities")
          .select("*")
          .order("name");

        if (cityError) throw cityError;
        setCities(cityData || []);

        // Fetch work areas
        const { data: workAreaData, error: workAreaError } = await supabase
          .from("work_areas")
          .select("*, cities!inner(name)")
          .order("name");

        if (workAreaError) throw workAreaError;
        setWorkAreas(workAreaData || []);

        // Fetch work places
        const { data: workPlaceData, error: workPlaceError } = await supabase
          .from("work_places")
          .select("*, work_areas!inner(name, city_id, cities!inner(name))")
          .order("name");

        if (workPlaceError) throw workPlaceError;
        setWorkPlaces(workPlaceData || []);

        // Fetch branches
        const { data: branchData, error: branchError } = await supabase
          .from("branches")
          .select(
            "*, work_places!inner(name, work_area_id, work_areas!inner(name, city_id, cities!inner(name)))",
          )
          .order("name");

        if (branchError) throw branchError;
        setBranches(branchData || []);

        // If employee has a branch, set up the cascading dropdowns
        if (employee?.branch) {
          // Find the branch by name
          const branch = branchData?.find((b) => b.name === employee.branch);
          if (branch) {
            // Extract work_place data
            const workPlace = branch.work_places || {};
            const workArea = workPlace.work_areas || {};
            const city = workArea.cities || {};

            // Set the form values
            form.setValue("branchId", branch.id);
            if (workArea.city_id) {
              form.setValue("cityId", workArea.city_id);
              handleCityChange(workArea.city_id);
            }
            if (workPlace.work_area_id) {
              form.setValue("workAreaId", workPlace.work_area_id);
              handleWorkAreaChange(workPlace.work_area_id);
            }
            if (branch.work_place_id) {
              form.setValue("workPlaceId", branch.work_place_id);
              handleWorkPlaceChange(branch.work_place_id);
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching location data:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchLocationData();
  }, [employee, toast]);

  // Handlers for cascading dropdowns
  const handleCityChange = (cityId: string) => {
    const filtered = workAreas.filter((area) => area.city_id === cityId);
    setFilteredWorkAreas(filtered);
    setFilteredWorkPlaces([]);
    setFilteredBranches([]);
    form.setValue("workAreaId", "");
    form.setValue("workPlaceId", "");
    form.setValue("branchId", "");
  };

  const handleWorkAreaChange = (workAreaId: string) => {
    const filtered = workPlaces.filter(
      (place) => place.work_area_id === workAreaId,
    );
    setFilteredWorkPlaces(filtered);
    setFilteredBranches([]);
    form.setValue("workPlaceId", "");
    form.setValue("branchId", "");
  };

  const handleWorkPlaceChange = (workPlaceId: string) => {
    if (workPlaceId) {
      const filtered = branches.filter(
        (branch) => branch.work_place_id === workPlaceId,
      );
      setFilteredBranches(filtered);
      // Only reset branch if we're changing to a different workplace
      if (form.getValues().branchId && filtered.length > 0) {
        const currentBranchStillValid = filtered.some(
          (branch) => branch.id === form.getValues().branchId,
        );
        if (!currentBranchStillValid) {
          form.setValue("branchId", "");
        }
      }
    } else {
      // If no workplace selected, show all branches
      setFilteredBranches([]);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name || "",
      employeeId: employee?.employeeId || "",
      branchId: "",
      cityId: "",
      workAreaId: "",
      workPlaceId: "",
      division: employee?.division || "",
      status: employee?.status || "permanent",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      // If no avatar is provided, generate one using DiceBear Avatars
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`;

      // Get branch name from branch ID
      const selectedBranch = branches.find((b) => b.id === data.branchId);
      const branchName = selectedBranch ? selectedBranch.name : "";

      // Save to Supabase
      if (employee) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update({
            name: data.name,
            employee_id: data.employeeId,
            branch: branchName,
            branch_id: data.branchId,
            division: data.division,
            status: data.status,
            avatar: avatar,
            updated_at: new Date().toISOString(),
          })
          .eq("id", employee.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Check if employee ID already exists
        const { data: existingEmployee, error: checkError } = await supabase
          .from("employees")
          .select("id")
          .eq("employee_id", data.employeeId)
          .maybeSingle();

        if (checkError) {
          console.error("Check error:", checkError);
          throw checkError;
        }

        if (existingEmployee) {
          throw new Error(`Employee ID ${data.employeeId} already exists`);
        }

        // Add new employee
        console.log("Adding new employee:", {
          name: data.name,
          employee_id: data.employeeId,
          branch: branchName,
          branch_id: data.branchId,
          division: data.division,
          status: data.status,
          avatar: avatar,
        });

        const { data: newEmployee, error } = await supabase
          .from("employees")
          .insert({
            name: data.name,
            employee_id: data.employeeId,
            branch: branchName,
            branch_id: data.branchId,
            division: data.division,
            status: data.status,
            avatar: avatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        console.log("New employee created:", newEmployee);

        toast({
          title: "Success",
          description: "Employee added successfully",
        });
      }

      onSubmit(data);
    } catch (err: any) {
      console.error("Error saving employee:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2 text-sm"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleCityChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workAreaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Area</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleWorkAreaChange(value);
                    }}
                    value={field.value}
                    disabled={!form.getValues().cityId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(filteredWorkAreas.length > 0
                        ? filteredWorkAreas
                        : workAreas
                      )
                        .filter(
                          (area) =>
                            !form.getValues().cityId ||
                            area.city_id === form.getValues().cityId,
                        )
                        .map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workPlaceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Place</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleWorkPlaceChange(value);
                    }}
                    value={field.value}
                    disabled={!form.getValues().workAreaId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work place" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(filteredWorkPlaces.length > 0
                        ? filteredWorkPlaces
                        : workPlaces
                      )
                        .filter(
                          (place) =>
                            !form.getValues().workAreaId ||
                            place.work_area_id === form.getValues().workAreaId,
                        )
                        .map((place) => (
                          <SelectItem key={place.id} value={place.id}>
                            {place.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      !form.getValues().workPlaceId &&
                      filteredBranches.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* If we have filtered branches, show those, otherwise show all branches */}
                      {(filteredBranches.length > 0
                        ? filteredBranches
                        : branches
                      ).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Human Resources">
                        Human Resources
                      </SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {employee ? "Updating..." : "Adding..."}
                  </>
                ) : employee ? (
                  "Update Employee"
                ) : (
                  "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
