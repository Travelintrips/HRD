import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Upload } from "lucide-react";
import { signUp } from "@/lib/supabaseClient";

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    alias: z.string().optional(),
    placeOfBirth: z.string().min(1, "Place of birth is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    religion: z.string().min(1, "Religion is required"),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    relativePhoneNumber: z
      .string()
      .min(1, "Relative's phone number is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    selfie: z.instanceof(FileList).optional().nullable(),
    ktp: z.instanceof(FileList).optional().nullable(),
    kk: z.instanceof(FileList).optional().nullable(),
    cv: z.instanceof(FileList).optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const selfieRef = useRef<HTMLInputElement>(null);
  const ktpRef = useRef<HTMLInputElement>(null);
  const kkRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      alias: "",
      placeOfBirth: "",
      dateOfBirth: "",
      religion: "",
      address: "",
      phoneNumber: "",
      relativePhoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      selfie: null,
      ktp: null,
      kk: null,
      cv: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: authData, error: authError } = await signUp(
        data.email,
        data.password,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          alias: data.alias,
          placeOfBirth: data.placeOfBirth,
          dateOfBirth: data.dateOfBirth,
          religion: data.religion,
          address: data.address,
          phoneNumber: data.phoneNumber,
          relativePhoneNumber: data.relativePhoneNumber,
        },
        {
          selfie: data.selfie,
          ktp: data.ktp,
          kk: data.kk,
          cv: data.cv,
        },
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData) {
        setSuccess(
          "Registration successful! Please check your email to confirm your account.",
        );
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Register
        </CardTitle>
        <CardDescription className="text-center">
          Create a new account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
            {success}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isLoading || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isLoading || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias (Fuel Name)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nickname"
                      {...field}
                      disabled={isLoading || !!success}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Birth</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jakarta"
                        {...field}
                        disabled={isLoading || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Religion"
                      {...field}
                      disabled={isLoading || !!success}
                    />
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
                      placeholder="Your address"
                      {...field}
                      disabled={isLoading || !!success}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+62..."
                        {...field}
                        disabled={isLoading || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relativePhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relative's Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+62..."
                        {...field}
                        disabled={isLoading || !!success}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      {...field}
                      disabled={isLoading || !!success}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading || !!success}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || !!success}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading || !!success}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading || !!success}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 mt-6">
              <h3 className="text-md font-medium">Document Upload</h3>

              <FormField
                control={form.control}
                name="selfie"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Selfie Photo</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={selfieRef}
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          disabled={isLoading || !!success}
                          className="flex-1"
                          {...rest}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => selfieRef.current?.click()}
                          disabled={isLoading || !!success}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ktp"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>KTP (ID Card)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          ref={ktpRef}
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          disabled={isLoading || !!success}
                          className="flex-1"
                          {...rest}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => ktpRef.current?.click()}
                          disabled={isLoading || !!success}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kk"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>KK (Family Card)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          ref={kkRef}
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          disabled={isLoading || !!success}
                          className="flex-1"
                          {...rest}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => kkRef.current?.click()}
                          disabled={isLoading || !!success}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cv"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>CV (Resume)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          ref={cvRef}
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          disabled={isLoading || !!success}
                          className="flex-1"
                          {...rest}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => cvRef.current?.click()}
                          disabled={isLoading || !!success}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => navigate("/login")}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
