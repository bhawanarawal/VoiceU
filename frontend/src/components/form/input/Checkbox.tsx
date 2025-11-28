import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void; // custom event
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onCheckedChange,
  className,
  disabled = false,
  ...rest
}) => {
  return (
    <label
      className={`flex items-center space-x-3 cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <div className="relative w-5 h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className={`w-5 h-5 appearance-none border border-gray-300 rounded-md checked:bg-brand-500 disabled:opacity-60 ${className}`}
          {...rest} // now supports all standard input props
        />
        {checked && (
          <svg
            className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
