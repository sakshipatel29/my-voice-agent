"use client";

import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "@/components/auth/form-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type FormType = "sign-in" | "sign-up";
type UserType = "doctor" | "patient";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
    userType: type === "sign-up" ? z.enum(["doctor", "patient"]) : z.enum(["doctor", "patient"]).optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: "patient",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Submitting:", data);
    try {
      if (type === "sign-up") {
        const { name, email, password, userType } = data;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
          userType: userType as UserType,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        const result = await signIn({ email, idToken });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        // ✅ Set session cookie via API route
        const sessionRes = await fetch("/api/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!sessionRes.ok) {
          toast.error("Failed to set session.");
          return;
        }

        toast.success("Signed in successfully.");
        // Force a hard refresh to update the session state
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border w-full max-w-md mx-auto">
      <div className="card px-8 py-12 flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-user-primary">Sunrise</h2>
          <h3 className="text-lg text-user-primary">Medical Hospital</h3>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full form"
          >
            {!isSignIn && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Your Name"
                  type="text"
                />
                <div className="space-y-3">
                  <label className="label text-user-primary text-lg">User Type</label>
                  <Controller
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="patient" id="patient" className="w-5 h-5" />
                          <label htmlFor="patient" className="text-black text-lg">Patient</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="doctor" id="doctor" className="w-5 h-5" />
                          <label htmlFor="doctor" className="text-black text-lg">Doctor</label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
              </>
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Your password"
              type="password"
            />

            <Button className="btn w-full min-h-12 text-lg font-semibold" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-base text-black">
          {isSignIn ? "No account yet?" : "Already have an account?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="ml-2 font-semibold text-black hover:underline"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
