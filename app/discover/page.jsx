import React from 'react';
import Image from 'next/image';

export default function DiscoverPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">FaizuRrehman</h1>
        <h2 className="text-lg text-blue-600 font-semibold mb-2">Owner & CEO</h2>
        <div className="text-gray-600 text-center">
          <p className="mb-1">16 y/o &middot; Pakistan</p>
          <p className="mb-1">Experienced in <span className="font-semibold text-blue-700">web development</span></p>
          <p className="mb-1">A little bit of <span className="font-semibold text-blue-700">software engineering</span></p>
        </div>
      </div>
      <div className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Company</h3>
        <p className="text-gray-500 italic">To be announced soon...</p>
      </div>
    </div>
  );
} 