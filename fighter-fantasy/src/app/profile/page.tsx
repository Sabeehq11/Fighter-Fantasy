'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';
// import { storage } from '@/lib/firebase/client';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfilePage() {
  const router = useRouter();
  const { updateUserProfile, logout } = useAuth();
  const { user, userProfile, isAuthenticated, loading } = useUser();
  
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [favoritesFighters, setFavoritesFighters] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoPreview(userProfile.photoURL || '');
      setFavoritesFighters(userProfile.favoritesFighters || []);
    }
  }, [userProfile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let photoURL = userProfile?.photoURL;

      // Upload photo if changed - TEMPORARILY DISABLED
      // if (photoFile && user) {
      //   const storageRef = ref(storage, `avatars/${user.uid}`);
      //   const snapshot = await uploadBytes(storageRef, photoFile);
      //   photoURL = await getDownloadURL(snapshot.ref);
      // }

      // Update profile
      await updateUserProfile({
        displayName,
        // photoURL, // Temporarily disabled
        favoritesFighters
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setPhotoFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setPhotoFile(null);
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoPreview(userProfile.photoURL || '');
      setFavoritesFighters(userProfile.favoritesFighters || []);
    }
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // Go to login page after logout
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-bg-secondary shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-text-primary">
              User Profile
            </h3>
            
            {success && (
              <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-800 dark:text-green-400">{success}</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Avatar upload temporarily disabled */}
              {/* <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-text-secondary">
                  Profile Photo
                </label>
                <div className="mt-2 flex items-center">
                  <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-bg-tertiary">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-full w-full text-text-tertiary"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </span>
                  {editing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="ml-5 bg-bg-primary py-2 px-3 border border-border rounded-md shadow-sm text-sm leading-4 font-medium text-text-primary hover:bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    />
                  )}
                </div>
              </div> */}

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-border rounded-md bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary">
                  Display Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!editing}
                    className={`shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-border rounded-md ${
                      editing
                        ? 'bg-bg-primary text-text-primary'
                        : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-text-secondary">
                  Account Information
                </label>
                <div className="mt-2 space-y-2 text-sm text-text-secondary">
                  <p>Account created: {new Date(userProfile.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</p>
                  <p>Role: {userProfile.role || 'user'}</p>
                  <p>Email verified: {user.emailVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-bg-tertiary text-right sm:px-6 space-x-3">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex justify-center py-2 px-4 border border-border shadow-sm text-sm font-medium rounded-md text-text-primary bg-bg-secondary hover:bg-bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex justify-center py-2 px-4 border border-border shadow-sm text-sm font-medium rounded-md text-text-primary bg-bg-secondary hover:bg-bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Logout
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 