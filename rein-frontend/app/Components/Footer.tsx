"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-black/50 border-t border-border py-8 lg:py-10 xl:py-10 2xl:py-12">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 xl:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
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
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 xl:gap-8">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-sm xl:text-base transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-sm xl:text-base transition-colors duration-200"
            >
              Terms
            </Link>
            <a
              href="https://www.comet.com/site/products/opik/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 text-sm xl:text-base transition-colors duration-200"
            >
              Powered by Opik
            </a>
          </div>

          {/* Copyright */}
          <div className="text-muted-foreground/70 text-sm xl:text-base">
            © 2026 Rein. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
