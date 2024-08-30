import Link from "next/link";
import { Button2 } from "./ui/moving-border";
import { BackgroundGradientAnimation } from "./ui/background-gradient-animation";

export default function LandingPage() {
    return (
        <BackgroundGradientAnimation>
            <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden mx-auto py-10">

            <div className="p-4 relative z-10 w-full text-center">


                <h1 className="p-6 mt-20 md:mt-0 text-4xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                    The NFT Library
                </h1>  

                <div className="font-extralight text-base md:text-3xl dark:text-neutral-200 py-3">
                An all in one solana-based NFT place
                </div>

                <div className="mt-8">
                    <Link href="/dashboard">
                        <Button2 borderRadius="1.75rem"
                                className="bg-white dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800">
                            Explore Dashboard
                        </Button2>
                    </Link>
                </div>
            </div>
        </div>
        </BackgroundGradientAnimation>
        
    );
}