import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Voyager. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        href="/explore"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Explore
                    </Link>
                    <Link
                        href="/social"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Social
                    </Link>
                </div>
            </div>
        </footer>
    );
}
