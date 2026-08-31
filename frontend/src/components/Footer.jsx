import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                SR
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Smart<span className="text-blue-500">Rental</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Final Year Engineering Capstone Project. A modern, AI-powered platform for rental discovery, owner property governance, and digital rent payments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/properties" className="hover:text-white transition">
                  Browse All Houses
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Bangalore" className="hover:text-white transition">
                  Bangalore Homes
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Mumbai" className="hover:text-white transition">
                  Mumbai Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Hyderabad" className="hover:text-white transition">
                  Hyderabad IT Corridors
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform Highlights</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• FastAPI AI Recommendation Scoring</li>
              <li>• Interactive OpenStreetMap Coordinates</li>
              <li>• Verified Property & Owner Badges</li>
              <li>• Automated Monthly Rent Invoicing</li>
              <li>• Razorpay Sandbox Online Payments</li>
            </ul>
          </div>

          {/* Demo Credentials */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-xs">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Viva Demo Credentials
            </h4>
            <p className="text-[11px] text-gray-400 mb-2">Passwords are identical: <span className="text-amber-300 font-mono">Role@12345</span></p>
            <div className="space-y-1 font-mono text-[11px] text-gray-300">
              <div>Admin: <span className="text-blue-400">admin@smartrental.com</span></div>
              <div>Owner: <span className="text-blue-400">owner1@smartrental.com</span></div>
              <div>Tenant: <span className="text-blue-400">tenant1@smartrental.com</span></div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Smart Rental Platform. Built with React 18, Node.js Express, PostgreSQL & FastAPI.</p>
          <p className="flex items-center gap-1">
            Engineered for Final Year Review & Project Defense
          </p>
        </div>
      </div>
    </footer>
  );
}
