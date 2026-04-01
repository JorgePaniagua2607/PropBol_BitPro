'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, Eye, FileText, Map, ArrowRightLeft, LogOut } from "lucide-react";
import type { User } from "../layout/Navbar";

type UserMenuProps = {
  user: User | null;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onClosePanel: () => void;
  onLogin: () => void;
  onOpenLogoutModal: () => void;
};

export default function UserMenu({
  isPanelOpen,
  onTogglePanel,
  onClosePanel,
  onLogin,
  onOpenLogoutModal,
}: UserMenuProps) {

  // --- 🧪 SIMULADOR FRONTEND GLOBAL ---
  const isAuthenticated = true; 
  
  // Estado reactivo para la cabecera
  const [currentUser, setCurrentUser] = useState({
    name: "Condesa",
    email: "condesa@gmail.com",
    avatarUrl: ""
  });

  // Efecto para escuchar cuando el Perfil guarda cambios
  useEffect(() => {
    const loadUserData = () => {
      const storedData = localStorage.getItem('mockUserData');
      if (storedData) {
        setCurrentUser(JSON.parse(storedData));
      }
    };

    loadUserData(); // Carga inicial

    // Escuchamos el evento personalizado que disparará el ProfileCard
    window.addEventListener('profileUpdated', loadUserData);
    return () => window.removeEventListener('profileUpdated', loadUserData);
  }, []);

  const menuOptions = [
    { name: "Mi cuenta", href: "/profile", icon: <UserIcon className="w-5 h-5" /> },
    { name: "Propiedades vistas", href: "#", icon: <Eye className="w-5 h-5" /> },
    { name: "Mis publicaciones", href: "#", icon: <FileText className="w-5 h-5" /> },
    { name: "Mis zonas", href: "#", icon: <Map className="w-5 h-5" /> },
    { name: "Mis comparaciones", href: "#", icon: <ArrowRightLeft className="w-5 h-5" /> },
  ];

  return (
    <div className="relative">
      <button
        onClick={onTogglePanel}
        className="flex items-center gap-2 p-1.5 pr-3 text-stone-700 rounded-full hover:bg-stone-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
      >
        <div className="w-9 h-9 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm overflow-hidden border border-amber-700">
          {isAuthenticated ? (
            currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
        </div>
        {isAuthenticated && (
          <span className="hidden sm:block font-medium text-sm uppercase">
            Hola, {currentUser.name.split(' ')[0]}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-[90vw] sm:w-72 max-h-[80vh] overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white shadow-xl z-50 transition-all duration-200 origin-top-right ${
          isPanelOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-2 pointer-events-none"
        }`}
      >
        {isAuthenticated ? (
          <div className="flex flex-col w-full p-2">
            <div className="flex justify-between items-center p-3 mb-1 border-b border-stone-100">
              <div className="flex flex-col">
                <span className="font-bold text-stone-900 text-sm uppercase">{currentUser.name}</span>
                <span className="text-xs text-stone-500">{currentUser.email}</span>
              </div>
              <button onClick={onClosePanel} className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded p-1 transition">✕</button>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              {menuOptions.map((option, index) => (
                <Link key={index} href={option.href} onClick={onClosePanel} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors">
                  <span className="text-stone-400 group-hover:text-amber-600">{option.icon}</span>
                  {option.name}
                </Link>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-stone-100">
              <button onClick={() => { onClosePanel(); onOpenLogoutModal(); }} className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-5 flex flex-col items-center">
             <p>Vista Visitante...</p>
          </div>
        )}
      </div>
    </div>
  );
}