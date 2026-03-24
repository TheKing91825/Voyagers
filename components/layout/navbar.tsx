"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, UserCircle } from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/my-trips", label: "My Trips" },
    { href: "/social", label: "Social" },
    { href: "/profile", label: "Profile" },
] as const;

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Listen to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const isHome = pathname === "/";

    const navClass = cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isHome && !scrolled
            ? "bg-transparent border-transparent py-6"
            : "bg-background/80 backdrop-blur-md border-border py-4 shadow-sm"
    );

    const textColor = isHome && !scrolled ? "text-white" : "text-foreground";
    const logoColor = isHome && !scrolled ? "text-white" : "text-primary";

    return (
        <header className={navClass}>
            <nav className="container mx-auto flex items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className={cn("text-2xl font-bold font-display tracking-tight transition-colors", logoColor)}
                >
                    Voyager
                </Link>

                {/* Desktop Links */}
                <ul className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary/80",
                                    pathname === link.href ? "text-primary font-bold" : textColor
                                )}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-4">
                    {authLoading ? null : user ? (
                        <div className="flex items-center gap-3">
                            <span className={cn("text-sm font-medium hidden lg:inline", textColor)}>
                                {user.displayName || user.email?.split("@")[0]}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className={cn("hover:bg-white/10", textColor)}
                            >
                                <LogOut className="w-4 h-4 mr-1" /> Log out
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className={cn("hover:bg-white/10", textColor)}
                            >
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                                asChild
                            >
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className={textColor}>
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 p-0 border-l border-border bg-background/95 backdrop-blur-xl">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-display font-bold text-primary">Voyager</span>
                                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <Separator />
                            <div className="flex flex-col gap-4">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "text-lg font-medium py-2 px-4 rounded-lg transition-colors",
                                            pathname === link.href
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <Separator />
                            <div className="pt-2">
                                {user ? (
                                    <Button
                                        className="w-full rounded-full"
                                        variant="outline"
                                        size="lg"
                                        onClick={() => { handleLogout(); setOpen(false); }}
                                    >
                                        <LogOut className="w-4 h-4 mr-2" /> Log out
                                    </Button>
                                ) : (
                                    <Button className="w-full rounded-full bg-primary text-white" size="lg" asChild>
                                        <Link href="/signup" onClick={() => setOpen(false)}>Get Started</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    );
}
