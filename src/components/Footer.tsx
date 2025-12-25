"use client";

import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="bg-linear-to-r from-green-600 to-green-700 text-white mt-20"
    >
      {/* TOP CONTENT */}
      <div className="w-[90%] md:w-[80%] mx-auto py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 border-b border-green-500/40">
        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold mb-3">SnapCart</h2>
          <p className="text-sm text-green-100 leading-relaxed">
            Your one-stop destination for fresh groceries delivered fast and
            safely.
          </p>

          {/* SOCIALS */}
          <div className="flex gap-4 mt-5">
            <Link href="https://facebook.com" target="_blank">
              <Facebook className="w-5 h-5 hover:scale-110 hover:text-white transition" />
            </Link>
            <Link href="https://instagram.com" target="_blank">
              <Instagram className="w-5 h-5 hover:scale-110 hover:text-white transition" />
            </Link>
            <Link href="https://twitter.com" target="_blank">
              <Twitter className="w-5 h-5 hover:scale-110 hover:text-white transition" />
            </Link>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-green-100 text-sm">
            <li>
              <Link
                href="/"
                className="hover:text-white transition hover:underline"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="hover:text-white transition hover:underline"
              >
                Cart
              </Link>
            </li>
            <li>
              <Link
                href="/my-orders"
                className="hover:text-white transition hover:underline"
              >
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-green-100 text-sm">
            <li className="flex items-center gap-3">
              <MapPin size={16} />
              Ahmedabad, India
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} />
              +91 78252 25000
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} />
              support@snapcart.com
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="text-center py-4 text-sm text-green-100 bg-green-800/40">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-white">SnapCart</span>. All rights
        reserved.
      </div>
    </motion.footer>
  );
}

export default Footer;
