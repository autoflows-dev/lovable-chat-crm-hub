
import React, { forwardRef } from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ startAdornment, endAdornment, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {startAdornment && (
          <div className="absolute left-3 flex items-center pointer-events-none">
            {startAdornment}
          </div>
        )}
        <ShadcnInput
          ref={ref}
          className={`${startAdornment ? 'pl-10' : ''} ${endAdornment ? 'pr-10' : ''} ${className || ''}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export { CustomInput };
