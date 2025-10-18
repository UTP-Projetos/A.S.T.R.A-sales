import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (typeof value === "string") {
        setDisplayValue(formatPhoneDisplay(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      
      // Limitar a 13 dígitos
      const limitedValue = rawValue.slice(0, 13);
      
      setDisplayValue(formatPhoneDisplay(limitedValue));
      
      if (onChange) {
        onChange(limitedValue);
      }
    };

    return (
      <Input
        type="text"
        className={cn(className)}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

// Formata para exibição: 55 48 99999-9999
function formatPhoneDisplay(value: string): string {
  if (!value) return "";

  const cleaned = value.replace(/\D/g, "");
  
  // 55 48 99999-9999 (13 dígitos)
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9, 13)}`;
  }
}

export { PhoneInput };
