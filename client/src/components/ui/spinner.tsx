import { cn } from "@/lib/utils";
import { Loader2Icon, LucideProps } from "lucide-react";

const Spinner = ({ className, ...props }: LucideProps) => (
  <Loader2Icon
    className={cn("animate-spin", className)}
    data-slot="spinner"
    {...props}
  />
);

export { Spinner };
