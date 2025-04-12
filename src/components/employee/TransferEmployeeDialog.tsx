import React, { useState } from "react";
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

const formSchema = z.object({
  branch: z.string().min(1, { message: "Branch is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransferEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  employeeName: string;
  currentBranch: string;
}

const TransferEmployeeDialog = ({
  open = true,
  onClose,
  onSubmit,
  employeeName,
  currentBranch,
}: TransferEmployeeDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      // The actual transfer is handled in the parent component
      // This is just to show the loading state and provide feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: `Employee transferred to ${data.branch} successfully`,
      });

      onSubmit(data);
    } catch (err: any) {
      console.error("Error transferring employee:", err);
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Transfer Employee</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-gray-500 mb-4">
            Transfer <span className="font-medium">{employeeName}</span> from{" "}
            <span className="font-medium">{currentBranch}</span> to a new
            branch:
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Headquarters">
                          Headquarters
                        </SelectItem>
                        <SelectItem value="North Branch">
                          North Branch
                        </SelectItem>
                        <SelectItem value="South Branch">
                          South Branch
                        </SelectItem>
                        <SelectItem value="East Branch">East Branch</SelectItem>
                        <SelectItem value="West Branch">West Branch</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
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
                      Transferring...
                    </>
                  ) : (
                    "Transfer Employee"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferEmployeeDialog;
