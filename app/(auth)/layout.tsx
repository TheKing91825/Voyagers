import Image from "next/image";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2921&auto=format&fit=crop"
                    alt="Travel Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Overlay - Darker for readability */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Glassmorphic Container */}
            <div className="relative z-10 w-full max-w-md p-4">
                <div className="glass-panel p-8 rounded-2xl shadow-2xl backdrop-blur-xl bg-black/30 border-white/10 animate-in fade-in zoom-in duration-500">
                    {children}
                </div>
            </div>
        </div>
    );
}
