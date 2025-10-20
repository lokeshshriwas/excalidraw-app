import React from 'react';
import { Pencil, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { MobileMenu } from '../component/MobileMenu';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DrawTogether</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Home
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign in
              </Link>
              <Link href="/login" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                Start for free
              </Link>
            </div>

            <MobileMenu />
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start for free with 2 rooms. Upgrade to Pro when you need more space to create.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600">Perfect for personal projects and trying out DrawTogether</p>
            </div>

            <Link href="/login" className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors mb-8 text-center">
              Start for free
            </Link>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">2 collaborative rooms</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Unlimited collaborators per room</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Real-time synchronization</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Infinite canvas</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic drawing tools</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold">$10</span>
                <span className="text-blue-100 ml-2">/month</span>
              </div>
              <p className="text-blue-100">For professionals and growing teams who need more rooms</p>
            </div>

            <Link href="/login" className="block w-full py-3 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-colors mb-8 text-center">
              Upgrade to Pro
            </Link>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span className="font-semibold">10 collaborative rooms</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Unlimited collaborators per room</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Real-time synchronization</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Infinite canvas</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Advanced drawing tools</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently asked questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade to Pro or downgrade to Free at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my rooms if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your rooms remain accessible in read-only mode. You'll need to delete rooms to get back to the 2-room limit or upgrade again.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How many people can collaborate in one room?
              </h3>
              <p className="text-gray-600">
                There's no limit! Invite as many collaborators as you need to any room, on both Free and Pro plans.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>© 2025 DrawTogether. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}