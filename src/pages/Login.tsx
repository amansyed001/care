import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Default new users to 'agent' role
        // Unless it's the admin email
        const isAdmin = user.email === 'amansyed998799@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: isAdmin ? 'admin' : 'agent',
          createdAt: new Date().toISOString()
        });
      }
      
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-[#004A99] p-12 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-12 h-12 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Care Consultancy</h1>
          <p className="text-white/60 text-sm uppercase tracking-widest font-medium">Health Membership System</p>
        </div>

        <div className="p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Sign in with your Google account to access the management dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#004A99]" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Sign in with Google
              </>
            )}
          </button>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Trusted by Hospitals</p>
            <div className="flex justify-center gap-6 opacity-30 grayscale">
              <ShieldCheck className="w-8 h-8" />
              <ShieldCheck className="w-8 h-8" />
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
