import { Sparkles, Rat } from "lucide-react";
import React from 'react';
import { Link } from 'react-router-dom'; 

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white py-12 px-4">
            <div className="max-w-7xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Rat className="w-6 h-6" />
                    <span className="text-xl font-bold">MouseDays</span>
                </div>

                <p className="text-gray-400 mb-4">
                    Unofficial theme park recommendations
                </p>
                <p className="text-xs text-gray-400 mb-4 mx-auto">
                    MouseDays is an independent project and is not affiliated with, endorsed by, or officially connected to Walt Disney World, Disneyland, Disney Enterprises Inc, or any of its affiliates or subsidiaries. All trademarks, names, and related properties are the sole property of their respective owners. 
                    References to third-party names or trademarks are for identification and informational purposes only. Icons by Lucide (ISC).
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-sm text-white mb-4">
                    <Link
                        to="/privacy-policy"
                        className="!text-gray-200 hover:!text-[var(--rose)] transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <p>|</p>
                    <Link
                        to="/terms"
                        className="!text-gray-200 hover:!text-[var(--rose)] transition-colors"
                    >
                        Terms & Conditions
                    </Link>
                </div>

                <p className="text-gray-400">
                    &copy;{year} MouseDays.com. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
