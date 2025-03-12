import { cn } from "@/lib/utils";

export const buttonStyles = {
  primary: {
    thinkingDesk: "bg-blue-500 hover:bg-blue-600 text-white",
    personalClarity: "bg-violet-500 hover:bg-violet-600 text-white",
    decisionLog: "bg-emerald-500 hover:bg-emerald-600 text-white",
    offerVault: "bg-amber-500 hover:bg-amber-600 text-white"
  },
  secondary: {
    thinkingDesk: "bg-blue-100 hover:bg-blue-200 text-blue-700",
    personalClarity: "bg-violet-100 hover:bg-violet-200 text-violet-700",
    decisionLog: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
    offerVault: "bg-amber-100 hover:bg-amber-200 text-amber-700"
  },
  loading: "opacity-70 cursor-not-allowed",
  disabled: "opacity-50 cursor-not-allowed",
  base: "px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
};

export const getButtonStyles = (
  variant: 'primary' | 'secondary',
  section: 'thinkingDesk' | 'personalClarity' | 'decisionLog' | 'offerVault',
  isLoading?: boolean,
  isDisabled?: boolean
) => {
  return cn(
    buttonStyles.base,
    buttonStyles[variant][section],
    isLoading && buttonStyles.loading,
    isDisabled && buttonStyles.disabled
  );
}; 