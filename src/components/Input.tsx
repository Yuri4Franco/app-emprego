import { forwardRef, InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={twMerge(
                        "w-full px-4 py-3 rounded-lg border bg-white outline-none transition-all duration-200",
                        "placeholder:text-gray-400 focus:ring-2",
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-200 focus:border-primary focus:ring-blue-50 hover:border-blue-300",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-red-500 font-medium animate-fade-in block">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";