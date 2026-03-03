import React from 'react';
import Link from 'next/link';
import { Coffee } from 'lucide-react';
import { AppConfig } from '@/lib/config';

export function Footer() {
    return (
        <footer className="bg-sb-black text-white relative z-20 pt-40 px-4 pb-10">
            {/* <div className="torn-paper-black-up z-20 h-[30px] absolute top-[-29px] left-0 w-full"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'30\'%3E%3Cpath d=\'M0,30 L0,20 L15,12 L30,22 L45,8 L55,20 L70,5 L85,18 L100,2 L110,15 L125,5 L140,22 L155,10 L165,18 L180,5 L195,25 L210,8 L225,20 L240,2 L255,15 L270,8 L285,22 L300,12 L300,30 Z\' fill=\'%23111111\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', backgroundSize: '300px 30px' }}>
            </div> */}
            <div className="max-w-[1400px] mx-auto relative z-10">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">

                    {/* Brand */}
                    <div className="space-y-8">
                        <h1 className="font-display text-2xl lg:text-3xl tracking-tight uppercase leading-none">
                            {AppConfig.brand.name}
                            <br />
                            <span className="text-base font-sans font-bold tracking-[0.2em] opacity-80 mt-1 block">{AppConfig.brand.tagline}</span>
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            {AppConfig.brand.description}
                        </p>
                        <div className="flex space-x-3">
                            {AppConfig.socials.map((social) => (
                                <button key={social.name} className="w-10 h-10 bg-white/5 hover:bg-sb-green border border-white/10 hover:border-sb-green rounded-full flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-all duration-300">
                                    {social.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-white">Quick Links</h4>
                        <ul className="space-y-4 flex flex-col items-start">
                            <li><Link href="/" className="text-gray-400 hover:text-sb-green transition-colors text-sm">Home</Link></li>
                            <li><Link href="/visit-shop" className="text-gray-400 hover:text-sb-green transition-colors text-sm">Visit Shop</Link></li>
                            <li><Link href="/brew-guide" className="text-gray-400 hover:text-sb-green transition-colors text-sm">Brew Guide</Link></li>
                            <li><Link href="/shop" className="text-gray-400 hover:text-sb-green transition-colors text-sm">Shop</Link></li>
                            <li><Link href="/wholesale" className="text-gray-400 hover:text-sb-green transition-colors text-sm">Wholesale</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-sb-green transition-colors text-sm">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-white">Support</h4>
                        <ul className="space-y-4">
                            {AppConfig.supportLinks.map((link) => (
                                <li key={link.label}><Link href={link.url} className="text-gray-400 hover:text-sb-green transition-colors text-sm">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-xs tracking-[0.2em] uppercase mb-8 text-white">Stay Connected</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">Subscribe to get special offers, early access & brewing tips.</p>
                        <div className="flex">
                            <input type="email" placeholder="Your email" className="flex-1 bg-white/5 border border-white/10 rounded-l-full px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-sb-green transition-colors" />
                            <button className="bg-sb-green hover:bg-[#2C6345] text-white px-6 py-3 rounded-r-full text-xs font-bold tracking-widest uppercase transition-colors">
                                Join
                            </button>
                        </div>
                        <div className="mt-8 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-sb-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Coffee className="w-5 h-5 text-sb-green" />
                            </div>
                            <div>
                                <div className="text-sm font-bold">Free Shipping</div>
                                <div className="text-xs text-gray-500">On orders over $50</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-xs tracking-widest uppercase">© {AppConfig.brand.copyrightYear} {AppConfig.brand.name}. All Rights Reserved.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        {['Privacy', 'Terms', 'Cookies'].map((link) => (
                            <button key={link} className="text-gray-500 hover:text-white text-xs tracking-widest uppercase transition-colors">{link}</button>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
