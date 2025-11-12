// frontend/src/components/BrevoForm.tsx
import React from "react";
import { Mail, Sparkles } from "lucide-react";

const BrevoForm: React.FC = () => {
    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--blue)] rounded-full mb-4 shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Get Disney Travel Tips & Updates
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join our community and receive resort recommendations, travel tips, and feature updates — straight to your inbox.
                    </p>
                </div>

                {/* Form Container */}
                <div className="relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full blur-2xl opacity-30"></div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full blur-2xl opacity-30"></div>
                    
                    {/* Form Card */}
                    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-100">
                        
                        {/* Form Content */}
                        <div className="p-8">
                            <iframe 
                                width="100%" 
                                height="680" 
                                src="https://ab1eeccf.sibforms.com/serve/MUIFAO5wTxGlVQRFTWzrgx7UtG23UOKXqODLVZJq0wmVCjT2sgHhn3E9rTteZazdx7UrgplDJAtPccYBq5eRsgB-jtkUrfU3pJja6_yNctKjLy-U1860542iKrPGisC3sbJYc6T8yKjdygnGBhof_8Gmj14uSmmu9LeZud5nT-7IAXbscaFESZ1P0TRRhjb68E-t3lxsoHvpb8e6aw=="
                                frameBorder="0"
                                scrolling="auto" 
                                allowFullScreen 
                                className="rounded-lg"
                                title="Newsletter Signup Form"
                            />
                        </div>

                        {/* Benefits Footer */}
                        <div className="bg-gradient-to-br from-orange-50 to-pink-50 px-8 py-6 border-t-2 border-orange-100">
                            <div className="flex flex-wrap justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Sparkles className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium">Free to join</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Sparkles className="w-4 h-4 text-pink-500" />
                                    <span className="font-medium">Unsubscribe anytime</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    <span className="font-medium">No spam</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Your privacy is important to us. Read our{' '}
                        <a href="/privacy-policy" className="text-orange-600 hover:underline font-medium">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BrevoForm;