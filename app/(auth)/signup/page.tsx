import Link from "next/link";

export default function SignupPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <h1 className="text-3xl font-bold">Create your account</h1>
                <p className="text-muted-foreground">Coming soon</p>
                <Link href="/login" className="text-sm underline">
                    Already have an account? Log in
                </Link>
            </div>
        </main>
    );
}
