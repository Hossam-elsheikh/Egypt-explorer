import Link from "next/link";
import { Compass, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";

const FOOTER_LINKS = {
    Explore: [
        { label: "Places & Landmarks", href: "/explore/place" },
        { label: "Restaurants", href: "/explore/restaurant" },
        { label: "Food & Cuisine", href: "/explore/food" },
        { label: "Drinks & Cafes", href: "/explore/drink" },
        { label: "Activities", href: "/explore/activity" },
        { label: "Hotels", href: "/explore/hotel" },
        { label: "Services", href: "/explore/service" },
    ],
    Destinations: [
        { label: "Cairo", href: "/explore/place?location=cairo" },
        { label: "Luxor", href: "/explore/place?location=luxor" },
        { label: "Aswan", href: "/explore/place?location=aswan" },
        { label: "Hurghada", href: "/explore/place?location=hurghada" },
        { label: "Sharm El-Sheikh", href: "/explore/place?location=sharm" },
        { label: "Alexandria", href: "/explore/place?location=alexandria" },
        { label: "Siwa Oasis", href: "/explore/place?location=siwa" },
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
                        <Link href="/" className="flex items-center gap-1.5 mb-5 group">
                            <span className="font-display font-bold text-2xl tracking-tight text-egypt-gold">EGYPT</span>
                            <span className="font-display font-bold text-2xl tracking-tight text-white">Explorer</span>
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
