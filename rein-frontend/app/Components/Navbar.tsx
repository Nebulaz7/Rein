"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Gavel,
  X,
  ArrowUpRight,
} from "lucide-react";

const MotionLink = motion(Link);

const DoubleLineIcon = ({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
    className={className}
  >
    <rect x="4" y="9" width="24" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="19" width="24" height="2" rx="1" fill="currentColor" />
  </svg>
);

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { href: "/#about", label: "Features", icon: ShoppingBag },
    { href: "/#how-it-works", label: "How It Works", icon: PlusCircle },
    { href: "/#explore", label: "Explore", icon: LayoutDashboard },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed brutal-card top-0 left-0 right-0 flex justify-center border-gray-500 mx-2 font-sm p-2 bg-background/70 backdrop-blur-xl z-50 lg:rounded-full lg:mt-5 lg:mx-6 lg:py-2 lg:border lg:shadow-md lg:shadow-primary/30"
    >
      <nav className="flex justify-between items-center gap-5 w-full max-w-7xl px-2 md:px-6 h-[3.5rem] mx-auto">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
            <Image
              src="/rein-logo.png"
              className="rounded-md"
              alt="Rein Logo"
              width={24}
              height={24}
            />
          </div>
          <h1 className="text-foreground font-semibold text-xl hidden sm:block">
            <span className="text-primary">Rein</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden text-md font-medium text-center md:flex gap-8 text-muted-foreground">
          {links.map((link) => (
            <li key={link.href}>
              <MotionLink
                href={link.href}
                className="flex items-center gap-2 transition-colors hover:text-primary"
                whileHover={{ y: -4 }}
                layout
              >
                {/* <link.icon className="inline-block mr-1 mb-0.5" size={18} /> */}
                {link.label}
              </MotionLink>
            </li>
          ))}
        </ul>

        {/* Sign in button */}
        <Link
          href="/signin"
          className="hidden md:flex items-center brutal-input gap-2 bg-seconary text-white px-4 py-2 rounded-full font-medium transition-colors"
        >
          Sign In
          <ArrowUpRight size={16} className="inline-block" />
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-foreground p-2 cursor-pointer brutal-button"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMenuOpen ? (
              <X size={30} className="hidden" />
            ) : (
              <DoubleLineIcon />
            )}
          </motion.div>
        </button>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <motion.div
        initial={{ x: "-100%", y: "-100%" }}
        animate={{
          x: isMenuOpen ? 0 : "-100%",
          y: isMenuOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute py-2 top-0 left-0 w-full md:hidden min-h-[50vh] bg-transparent z-30 flex flex-col"
      >
        {/* Menu Header */}
        <div className="flex justify-between bg-transparent items-center p-3">
          <h1 className="font-md text-xl"></h1>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-foreground p-2 cursor-pointer"
          >
            <X size={30} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 brutal-card bg-background pt-4 pb-4 rounded-2xl m-4 shadow-[2px_4px_0px_0px_#3b82f6] border">
          <ul className="flex flex-col gap-6 pl-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl hover:text-primary transition-colors flex items-center gap-2"
                >
                  {link.label}
                  {/* <link.icon className="inline-block" size={24} /> */}
                </Link>
              </li>
            ))}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 w-[85%] brutal-button bg-seconary text-white px-4 py-3 rounded-full font-medium text-center transition-colors"
            >
              Sign In
            </button>
          </ul>
        </div>
      </motion.div>
    </motion.header>
  );
}
