"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/my-trips", label: "My Trips" },
    { href: "/social", label: "Social" },
    { href: "/profile", label: "Profile" },
] as const;

export function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // TODO: replace with real auth state
    const isLoggedIn = false;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Voyager
                </Link>

                {/* Desktop links */}
                <ul className="hidden md:flex items-center gap-6">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Desktop auth buttons */}
                <div className="hidden md:flex items-center gap-2">
                    {isLoggedIn ? (
                        <Button variant="ghost" size="sm">
                            Log out
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" aria-label="Open menu">
                            {/* Simple hamburger icon */}
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="4" y1="12" x2="20" y2="12" />
                                <line x1="4" y1="18" x2="20" y2="18" />
                            </svg>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64">
                        <div className="flex flex-col gap-4 mt-8">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={`text-lg font-medium ${pathname === link.href
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Separator />
                            {isLoggedIn ? (
                                <Button variant="ghost">Log out</Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login" onClick={() => setOpen(false)}>
                                            Log in
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/signup" onClick={() => setOpen(false)}>
                                            Sign up
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    );
}
