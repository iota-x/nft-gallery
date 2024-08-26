import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const buttonClass = classNames(
    'inline-flex items-center justify-center font-semibold rounded-md transition duration-200 ease-in-out',
    {
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
      'bg-gray-600 text-white hover:bg-gray-700': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-100': variant === 'outline',
      'py-1 px-3 text-sm': size === 'small',
      'py-2 px-4 text-base': size === 'medium',
      'py-3 px-6 text-lg': size === 'large',
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': isLoading,
    },
    className
  );

  return (
    <button className={buttonClass} disabled={isLoading} {...props}>
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zM12 20a8 8 0 01-8-8H0c0 6.627 5.373 12 12 12v-4z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
