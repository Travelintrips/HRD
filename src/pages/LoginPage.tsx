import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <CardContent className="p-0">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">HRD Attendance System</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
