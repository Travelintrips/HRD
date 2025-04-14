import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("Sign in response:", { data, error });
    return { data, error };
  } catch (e) {
    console.error("Sign in error:", e);
    return { data: null, error: e as any };
  }
}

interface UserMetadata {
  firstName: string;
  lastName: string;
  alias?: string;
  placeOfBirth: string;
  dateOfBirth: string;
  religion: string;
  address: string;
  phoneNumber: string;
  relativePhoneNumber: string;
}

interface FileUploads {
  selfie?: FileList | null;
  ktp?: FileList | null;
  kk?: FileList | null;
  cv?: FileList | null;
}

async function uploadFile(file: File, userId: string, fileType: string) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${fileType}.${fileExt}`;
  const filePath = `documents/${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from("user-documents")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error(`Error uploading ${fileType}:`, uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("user-documents")
    .getPublicUrl(filePath);

  return urlData?.publicUrl || null;
}

export async function signUp(
  email: string,
  password: string,
  metadata?: UserMetadata,
  files?: FileUploads,
) {
  try {
    // First, sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
          ? {
              ...metadata,
              fuel_name: metadata.alias, // Connect alias to fuel_name
              full_name: `${metadata.firstName} ${metadata.lastName}`,
            }
          : undefined,
      },
    });

    console.log("Sign up response:", { data, error });

    // If auth signup was successful and we have user metadata, store additional data
    if (data?.user && metadata) {
      // Upload files if provided
      let selfieUrl = null;
      let ktpUrl = null;
      let kkUrl = null;
      let cvUrl = null;

      if (files) {
        // Upload selfie if provided
        if (files.selfie && files.selfie.length > 0) {
          selfieUrl = await uploadFile(files.selfie[0], data.user.id, "selfie");
        }

        // Upload KTP if provided
        if (files.ktp && files.ktp.length > 0) {
          ktpUrl = await uploadFile(files.ktp[0], data.user.id, "ktp");
        }

        // Upload KK if provided
        if (files.kk && files.kk.length > 0) {
          kkUrl = await uploadFile(files.kk[0], data.user.id, "kk");
        }

        // Upload CV if provided
        if (files.cv && files.cv.length > 0) {
          cvUrl = await uploadFile(files.cv[0], data.user.id, "cv");
        }
      }

      // Store additional user data in a profiles table or similar
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        alias: metadata.alias,
        fuel_name: metadata.alias,
        place_of_birth: metadata.placeOfBirth,
        date_of_birth: metadata.dateOfBirth,
        religion: metadata.religion,
        address: metadata.address,
        phone_number: metadata.phoneNumber,
        relative_phone_number: metadata.relativePhoneNumber,
        selfie_url: selfieUrl,
        ktp_url: ktpUrl,
        kk_url: kkUrl,
        cv_url: cvUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Error storing user profile:", profileError);
        // We don't return this error as the auth signup was successful
      }
    }

    return { data, error };
  } catch (e) {
    console.error("Sign up error:", e);
    return { data: null, error: e as any };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    console.log("Sign out response:", { error });
    return { error };
  } catch (e) {
    console.error("Sign out error:", e);
    return { error: e as any };
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}
