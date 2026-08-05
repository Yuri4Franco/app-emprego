import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">
                    {label}
                </label>

                <div className="relative group">
                    {/* Container do Ícone */}
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={twMerge(
                            "w-full py-3 rounded-lg border bg-white outline-none transition-all duration-200",
                            "placeholder:text-gray-400 focus:ring-2",
                            icon ? "pl-12 pr-4" : "px-4",
                            error
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-gray-200 focus:border-primary focus:ring-blue-50 hover:border-blue-300",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <span className="text-xs text-red-500 font-medium animate-fade-in block ml-1">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";