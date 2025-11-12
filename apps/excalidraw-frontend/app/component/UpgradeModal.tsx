import React from "react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  onClose: () => void;
  show: boolean;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, show }) => {
  const router = useRouter();

  if (!show) return null;

  const handleUpgrade = () => {
    router.push("/pricing");
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Room Limit Reached
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 pt-4">
          <p className="text-gray-400 text-center mb-6">
            As a free user, you can only create up to{" "}
            <span className="text-white font-semibold">2 personal rooms</span>.
            Upgrade to Pro to create get 10 rooms and unlock premium features.
          </p>

          {/* Features list */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">
              Pro Plan includes:
            </p>
            <ul className="space-y-2">
              {[
                "10 personal rooms",
                "Advanced collaboration features",
                "Priority support",
                "Extended storage & history",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-400">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-[#1a1a1a] border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                Upgrade to Pro
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
