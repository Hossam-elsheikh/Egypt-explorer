import Link from "next/link";
import { Compass, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";

const FOOTER_LINKS = {
    Explore: [
        { label: "Places & Landmarks", href: "/explore/places" },
        { label: "Restaurants", href: "/explore/restaurant" },
        { label: "Food & Cuisine", href: "/explore/food" },
        { label: "Drinks & Cafes", href: "/explore/drinks" },
        { label: "Activities", href: "/explore/activities" },
        { label: "Hotels", href: "/explore/hotels" },
        { label: "Services", href: "/explore/services" },
    ],
    Destinations: [
        { label: "Cairo", href: "/explore/places?location=cairo" },
        { label: "Luxor", href: "/explore/places?location=luxor" },
        { label: "Aswan", href: "/explore/places?location=aswan" },
        { label: "Hurghada", href: "/explore/places?location=hurghada" },
        { label: "Sharm El-Sheikh", href: "/explore/places?location=sharm" },
        { label: "Alexandria", href: "/explore/places?location=alexandria" },
        { label: "Siwa Oasis", href: "/explore/places?location=siwa" },
    ],
    Community: [
        { label: "Suggest a Place", href: "/suggest" },
        { label: "Favorites", href: "/favorites" },
        { label: "Sign Up Free", href: "/auth/sign-up" },
        { label: "Sign In", href: "/auth/login" },
    ],
};

const SOCIAL_LINKS = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
    return (
        <footer className="bg-egypt-hieroglyph dark:bg-gray-950 text-white">
            {/* Decorative top border */}
            <div className="h-1 gradient-egypt" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                            <div className="w-10 h-10 rounded-xl gradient-egypt flex items-center justify-center shadow-lg">
                                <Image src="/logo.png" alt="Egypt Explorer Logo" width={24} height={24} className="w-6 h-6 object-contain" unoptimized />
                            </div>
                            <div>
                                <span className="font-display font-bold text-xl text-white block leading-none">Egypt</span>
                                <span className="text-xs text-egypt-gold font-semibold tracking-widest">EXPLORER</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                            Your ultimate guide to exploring the land of pharaohs. Discover ancient wonders,
                            authentic flavors, and unforgettable experiences across Egypt.
                        </p>

                        {/* Contact */}
                        <div className="space-y-2.5">
                            <p className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail className="w-4 h-4 text-egypt-gold flex-shrink-0" />
                                hello@egyptexplorer.com
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone className="w-4 h-4 text-egypt-gold flex-shrink-0" />
                                +20 100 000 0000
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin className="w-4 h-4 text-egypt-gold flex-shrink-0" />
                                Cairo, Egypt
                            </p>
                        </div>

                        {/* Social */}
                        <div className="flex items-center gap-3 mt-6">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-egypt-gold transition-colors duration-200"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                        <div key={section}>
                            <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">
                                {section}
                            </h3>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 hover:text-egypt-gold transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Egypt Explorer. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-sm text-gray-500 hover:text-egypt-gold transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm text-gray-500 hover:text-egypt-gold transition-colors">
                            Terms of Use
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
