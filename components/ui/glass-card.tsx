"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> { /**
 * Extends standard HTML div props and Framer Motion props
 */
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={hoverEffect ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
            className={cn(
                "glass-card rounded-[24px] p-6 text-card-foreground",
                "flex flex-col relative overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Subtle top highlighting for depth */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent opacity-50" />

            {children}
        </motion.div>
    );
}
