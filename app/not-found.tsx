// pages/404.js
import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-white mb-8">404</h1>
      <p className="text-3xl text-white mb-12">Halaman tidak ditemukan</p>
      <div className="bg-slate-900/20 backdrop-blur-lg shadow-inner p-8 rounded-lg shadow-md">
        <p className="text-lg text-gray-200 mb-6">
          Sepertinya kamu tersesat. Jangan khawatir, kami akan membantumu kembali ke jalan yang benar.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;