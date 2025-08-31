'use client';

import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import Link from 'next/link';

export default function LearnMoreButton() {
  const [showLearnMore, setShowLearnMore] = useState(false);

  const aboutInfo = [
    {
      title: "Why DrawTogether?",
      content: "DrawTogether was born from the idea that creativity flourishes when shared. Whether you're brainstorming with colleagues, teaching children, or just having fun with friends, our platform removes barriers and brings people together through art."
    },
    {
      title: "Perfect For",
      content: "• Remote teams conducting visual brainstorming sessions\n• Teachers creating interactive learning experiences\n• Families staying connected through creative activities\n• Friends collaborating on art projects\n• Students working on group assignments"
    },
    {
      title: "Technology",
      content: "Built with cutting-edge web technologies for maximum performance and reliability. Our real-time synchronization engine ensures every stroke appears instantly across all connected devices, creating a truly seamless collaborative experience."
    },
    {
      title: "Privacy & Security",
      content: "Your creativity is protected. All rooms are private by default, accessible only through secure invite links. We don't store your artwork without permission, and you maintain full control over your creations."
    }
  ];

  return (
    <>
      <button 
        onClick={() => setShowLearnMore(true)}
        className="w-full sm:w-auto px-10 py-4 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg font-semibold text-lg transition-all duration-300"
      >
        Learn More
      </button>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/20 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                About DrawTogether
              </h2>
              <button 
                onClick={() => setShowLearnMore(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              {aboutInfo.map((section, index) => (
                <div key={index} className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold mb-4 text-white">{section.title}</h3>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-105">
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}