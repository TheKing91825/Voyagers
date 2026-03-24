"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { auth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const syncUserWithBackend = async (token: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to sync user with backend");
            }
            return true;
        } catch (error) {
            console.error("Backend sync failed:", error);
            return false;
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const token = await userCredential.user.getIdToken();

            // Sync with our backend
            await syncUserWithBackend(token);

            toast.success("Welcome back!");
            router.push("/explore");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const token = await userCredential.user.getIdToken();

            await syncUserWithBackend(token);

            toast.success("Welcome back!");
            router.push("/explore");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-white">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-white">Welcome Back</h1>
                <p className="text-white/70 text-sm">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
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
                onClick={handleGoogleLogin}
                disabled={loading}
            >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
            </Button>

            <p className="text-center text-sm text-white/70">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-secondary hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
