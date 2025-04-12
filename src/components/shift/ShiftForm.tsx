import React, { useEffect, useState } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Building, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient";
import { Branch } from "@/types/database.types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Shift name is required" }),
  branch: z.string().min(1, { message: "Branch is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  capacity: z.coerce
    .number()
    .min(1, { message: "Capacity must be at least 1" }),
  status: z.enum(["open", "full", "closed"]),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.string()).optional(),
  recurringEndDate: z.date().optional(),
  recurringFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ShiftFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  initialData?: any;
  editMode?: boolean;
  branches?: Branch[];
}

const ShiftForm = ({
  open = true,
  onClose,
  onSubmit,
  initialData = null,
  editMode = false,
  branches: propBranches = [],
}: ShiftFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>(propBranches);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      branch: "",
      startTime: "",
      endTime: "",
      capacity: 1,
      status: "open" as const,
      isRecurring: false,
      recurringDays: [],
      recurringFrequency: "weekly" as const,
    },
  });

  // Fetch branches from Supabase if not provided as props
  useEffect(() => {
    if (propBranches.length === 0) {
      const fetchBranches = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("branches")
            .select("*")
            .order("name");

          if (error) {
            console.error("Error fetching branches:", error);
            return;
          }

          if (data) {
            setBranches(data);
          }
        } catch (error) {
          console.error("Unexpected error fetching branches:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBranches();
    }
  }, [propBranches]);

  // Set form values if editing an existing shift
  useEffect(() => {
    if (initialData && editMode) {
      console.log("Setting form values for editing:", initialData);
      form.reset({
        name: initialData.name || "",
        branch: initialData.branch || "",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        capacity: initialData.capacity || 1,
        status: initialData.status || "open",
        isRecurring: initialData.isRecurring || false,
        recurringDays: initialData.recurringDays || [],
        recurringFrequency: initialData.recurringFrequency || "weekly",
        recurringEndDate: initialData.recurringEndDate
          ? new Date(initialData.recurringEndDate)
          : undefined,
      });
    }
  }, [initialData, editMode, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      console.log(editMode ? "Updating shift:" : "Creating new shift:", data);

      // Format the data for Supabase
      const shiftData = {
        name: data.name,
        branch: data.branch,
        date: format(data.date, "yyyy-MM-dd"),
        start_time: data.startTime,
        end_time: data.endTime,
        capacity: data.capacity,
        status: data.status,
        is_recurring: data.isRecurring,
        recurring_days: data.isRecurring ? data.recurringDays : null,
        recurring_frequency: data.isRecurring ? data.recurringFrequency : null,
        recurring_end_date:
          data.isRecurring && data.recurringEndDate
            ? format(data.recurringEndDate, "yyyy-MM-dd")
            : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editMode && initialData?.id) {
        // Update existing shift
        result = await supabase
          .from("shifts")
          .update({
            ...shiftData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
      } else if (
        data.isRecurring &&
        data.recurringDays &&
        data.recurringDays.length > 0
      ) {
        // Create recurring shifts
        const shifts = [];
        const startDate = new Date(data.date);
        const endDate =
          data.recurringEndDate ||
          new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days if no end date

        const dayMap = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        // Create a shift for each selected day of the week until the end date
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          const dayName = Object.keys(dayMap).find(
            (key) => dayMap[key as keyof typeof dayMap] === dayOfWeek,
          );

          if (dayName && data.recurringDays.includes(dayName)) {
            shifts.push({
              ...shiftData,
              date: format(currentDate, "yyyy-MM-dd"),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Insert all recurring shifts
        if (shifts.length > 0) {
          result = await supabase.from("shifts").insert(shifts);
        } else {
          result = { error: { message: "No valid recurring days selected" } };
        }
      } else {
        // Create new single shift
        result = await supabase.from("shifts").insert([shiftData]);
      }

      if (result.error) {
        console.error("Error saving shift:", result.error);
        alert(`Error: ${result.error.message}`);
        return;
      }

      onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Unexpected error saving shift:", error);
      alert(
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Shift" : "Create New Shift"}
          </DialogTitle>
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
                  <FormLabel>Shift Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Shift" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoading
                                ? "Loading branches..."
                                : "Select branch"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.length > 0 ? (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.name}>
                              {branch.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-branches-found" disabled>
                            {isLoading ? "Loading..." : "No branches found"}
                          </SelectItem>
                        )}
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) field.onChange(date);
                        }}
                        disabled={(date) =>
                          !editMode &&
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Number of Employees)</FormLabel>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Shift</FormLabel>
                    <FormDescription>
                      Create this shift for multiple days
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && (
              <div className="space-y-4 p-3 border rounded-md bg-gray-50">
                <FormField
                  control={form.control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("recurringFrequency") === "weekly" && (
                  <FormField
                    control={form.control}
                    name="recurringDays"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Days of Week
                          </FormLabel>
                          <FormDescription>
                            Select which days of the week this shift should
                            recur on.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ].map((day) => (
                            <FormField
                              key={day}
                              control={form.control}
                              name="recurringDays"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={day}
                                    className="flex flex-row items-start space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(day)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                day,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== day,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal capitalize">
                                      {day}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="recurringEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date (30 days default)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) field.onChange(date);
                            }}
                            disabled={(date) =>
                              date < new Date(form.getValues().date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        If not specified, shifts will be created for 30 days
                        from the start date.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit">
                {editMode ? "Update Shift" : "Create Shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftForm;
