"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase/config";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const syncUserWithBackend = async (token: string, username: string) => {
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create account in database");
            }
            return true;
        } catch (error) {
            console.error("Backend sync failed:", error);
            throw error;
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create User in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // 2. Update Firebase Profile with Username
            await updateProfile(userCredential.user, {
                displayName: formData.username
            });

            const token = await userCredential.user.getIdToken();

            // 3. Sync with Supabase (Create user record)
            await syncUserWithBackend(token, formData.username);

            toast.success("Account created successfully!");
            router.push("/explore");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const token = await userCredential.user.getIdToken();

            // Use Google display name as username (or email prefix if no display name)
            const username = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || "user";

            await syncUserWithBackend(token, username);

            toast.success("Account created successfully!");
            router.push("/explore");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to sign up with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-white">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-white">Create Account</h1>
                <p className="text-white/70 text-sm">Join Voyager for free and start planning</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/90">Username</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="johndoe"
                            required
                            minLength={3}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="hello@example.com"
                            required
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 transition-all border-none"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-secondary text-primary hover:bg-secondary/90 font-bold"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/50">Or continue with</span>
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-none"
                onClick={handleGoogleSignup}
                disabled={loading}
            >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
            </Button>

            <p className="text-center text-sm text-white/70">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-secondary hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}
