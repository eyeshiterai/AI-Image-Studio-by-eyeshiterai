
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center border-b border-gray-700/50">
      <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        AI Image Studio
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Create and Transform Images with the Power of AI
      </p>
    </header>
  );
};

export default Header;
