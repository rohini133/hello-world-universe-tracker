
import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-4">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Vivaas Retail System. All rights reserved.</p>
      </div>
    </footer>
  );
};
