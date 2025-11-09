
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        px-6 py-3 font-bold text-white rounded-lg transition-all duration-300
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        focus:outline-none focus:ring-4 focus:ring-purple-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-100
        shadow-lg hover:shadow-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
