'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';

export default function VerifyEmailPage() {
  const { sendVerificationEmail } = useAuth();
  const { user, isEmailVerified } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendVerificationEmail();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  // If email is already verified, redirect
  if (isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                  Email Verified
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Your email has been successfully verified!</p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/fantasy"
                    className="text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Continue to Fantasy Hub
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            We've sent a verification email to:
          </p>
          <p className="mt-1 text-center text-sm font-medium text-text-primary">
            {user?.email}
          </p>
        </div>

        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Check your inbox
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Please check your email and click the verification link to activate your account.
                  The link will expire in 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-green-800 dark:text-green-400">
              Verification email sent successfully! Please check your inbox.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>

          <div className="text-center space-y-2">
            <Link href="/fantasy" className="block text-sm text-accent hover:text-accent-hover">
              Continue without verifying (limited access)
            </Link>
            <Link href="/login" className="block text-sm text-text-secondary hover:text-text-primary">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 