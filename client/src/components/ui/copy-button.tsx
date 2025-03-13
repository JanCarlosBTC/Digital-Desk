
import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export function CopyButton({ 
  text, 
  className, 
  variant = "secondary", 
  size = "icon",
  showIcon = true
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("transition-all", className)}
      aria-label="Copy to clipboard"
    >
      {showIcon && (
        isCopied 
          ? <CheckIcon className="h-4 w-4" /> 
          : <CopyIcon className="h-4 w-4" />
      )}
      {!showIcon && (isCopied ? "Copied!" : "Copy")}
    </Button>
  );
}
