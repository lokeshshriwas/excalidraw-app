"use client";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { BASE_URL } from "../config";

interface OAuthProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
}

const OAuth: React.FC<OAuthProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState<{ google: boolean; github: boolean }>({
    google: false,
    github: false,
  });

  const openOAuthPopup = (
    provider: "google" | "github",
    successType: "GOOGLE_OAUTH_SUCCESS" | "GITHUB_OAUTH_SUCCESS",
    errorType: "GOOGLE_OAUTH_ERROR" | "GITHUB_OAUTH_ERROR"
  ) => {
    setLoading((prev) => ({ ...prev, [provider]: true }));

    // The backend initiation route handles the redirect to the OAuth provider.
    // BASE_URL already includes /v1 (e.g. http://localhost:3002/v1 or https://drawapp.bylokesh.in/v1)
    const popupUrl = `${BASE_URL}/auth/${provider}`;
    const popup = window.open(
      popupUrl,
      `${provider}_oauth`,
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setLoading((prev) => ({ ...prev, [provider]: false }));
      }
    }, 1000);

    const messageListener = (event: MessageEvent) => {
      // The postMessage HTML is returned by the backend callback route, so the
      // popup's origin is the BACKEND origin (e.g. http://localhost:3002), not
      // the frontend origin. Accept messages from either origin and rely on
      // the known message type as the integrity check instead.
      const isKnownType =
        event.data?.type === successType || event.data?.type === errorType;
      if (!isKnownType) return;

      clearInterval(checkClosed);
      window.removeEventListener("message", messageListener);

      if (event.data.type === successType) {
        setLoading((prev) => ({ ...prev, [provider]: false }));
        onSuccess(event.data.token, event.data.user);
      } else {
        setLoading((prev) => ({ ...prev, [provider]: false }));
        onError(event.data.message || "Authentication failed");
      }
    };

    window.addEventListener("message", messageListener);
  };


  const handleGoogleAuth = () => {
    openOAuthPopup("google", "GOOGLE_OAUTH_SUCCESS", "GOOGLE_OAUTH_ERROR");
  };

  const handleGitHubAuth = () => {
    openOAuthPopup("github", "GITHUB_OAUTH_SUCCESS", "GITHUB_OAUTH_ERROR");
  };

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading.google || loading.github}
        className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading.google ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <FcGoogle className="w-5 h-5" />
        )}
        Continue with Google
      </button>

      {/* GitHub OAuth Button */}
      <button
        type="button"
        onClick={handleGitHubAuth}
        disabled={loading.google || loading.github}
        className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading.github ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <FaGithub className="w-5 h-5" />
        )}
        Continue with GitHub
      </button>
    </div>
  );
};

export default OAuth;
