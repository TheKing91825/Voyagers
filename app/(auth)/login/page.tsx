import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <h1 className="text-3xl font-bold">Log in to Voyager</h1>
                <p className="text-muted-foreground">Coming soon</p>
                <Link href="/signup" className="text-sm underline">
                    Don&apos;t have an account? Sign up
                </Link>
            </div>
        </main>
    );
}
