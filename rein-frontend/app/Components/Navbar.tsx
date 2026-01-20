"use client";
import Link from "next/link";

const NavBar = () => {
  return (
    <header className="pb-2 sticky top-0 w-full shrink-0 bg-muted/50 backdrop-blur-xl z-30">
      <div className="flex justify-between items-center gap-5 w-full max-w-7xl px-2 md:px-6 h-[3.5rem] mx-auto">
        <div
          role="link"
          tabIndex={0}
          className="select-none cursor-pointer outline-0"
        >
          <Link href="/" className="text-[24px] pl-2">
            Rein{" "}
            {/* <span className="text-sm text-white  p-[6px] border-solid border-[1.3px] border-white rounded-full">
              Beta
            </span> */}
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/get-started"
            className="appearance-none cursor-pointer px-6 py-1 font-heading rounded-full text-sm bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 focus-visible:bg-white/20 text-green-500 backdrop-blur-sm transition-all duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
};

export default NavBar;