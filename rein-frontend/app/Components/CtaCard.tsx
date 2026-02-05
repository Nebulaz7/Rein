"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const CtaCard = () => {
  return (
    <motion.div
      className="mt-10 mb-20 xl:mt-20 2xl:mt-30 text-center"
      id="explore"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="inline-flex bg-linear-to-b from-transparent to-primary/20 flex-col w-[80%] items-center gap-4 xl:gap-6 p-8 xl:p-10 2xl:p-12 rounded-2xl xl:rounded-3xl bg-card border border-primary/30 brutal-shadow">
        <div className="flex gap-2">
          <Image
            src="/rein-logo.png"
            alt="Rein Logo"
            width={50}
            height={50}
            className="mx-auto mb-4"
          />
          <span className="inline-block mt-2 text-primary text-2xl font-bold">
            REIN
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-foreground">
          Ready to execute your goals?
        </h3>
        <p className="text-muted-foreground max-w-md xl:max-w-lg 2xl:max-w-xl text-base xl:text-lg 2xl:text-xl">
          Join thousands who have transformed their intentions into achievements
          with Rein.
        </p>
        <motion.button
          className="brutal-button cursor-pointer px-8 py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6 rounded-full flex items-center gap-2 xl:gap-3 text-lg xl:text-xl 2xl:text-2xl font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Free
          <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CtaCard;
