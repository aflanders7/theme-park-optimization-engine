import { Sparkles, Rat } from "lucide-react";
import React from 'react';
import { Link } from 'react-router-dom'; 

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-12 px-4">
            <div className="max-w-7xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Rat className="w-6 h-6" />
                    <span className="text-xl font-bold">Mouse Days</span>
                </div>

                <p className="text-gray-400 mb-4">
                    Unofficial theme park recommendations
                </p>
                <p className="text-sm text-gray-400 mb-4">
                    Not affiliated with The Walt Disney Company
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-white mb-4">
                    <Link
                        to="/privacy-policy"
                        className="!text-gray-200 hover:text-white transition-colors"
                    >
                        Privacy Policy
                    </Link>
                </div>

                <p className="text-gray-400">
                    &copy; {year} Mouse Days. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
