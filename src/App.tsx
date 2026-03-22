import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from './types';
import Layout from './components/Layout';
import ChatBot from './components/ChatBot';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import MembersList from './pages/MembersList';
import Verification from './pages/Verification';
import AdminHospitals from './pages/AdminHospitals';
import HospitalDirectory from './pages/HospitalDirectory';
import { Loader2 } from 'lucide-react';

import LandingPage from './pages/LandingPage';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // User exists in Auth but not in Firestore (shouldn't happen with our login flow)
            setUserProfile(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-[#004A99] rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Care Consultancy Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout userProfile={userProfile}><LandingPage /></Layout>} />
        <Route path="/verify" element={<Layout userProfile={userProfile}><Verification /></Layout>} />
        <Route path="/hospitals" element={<Layout userProfile={userProfile}><HospitalDirectory /></Layout>} />
        <Route path="/login" element={!userProfile ? <Login /> : <Navigate to="/admin" />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/admin/hospitals"
          element={
            userProfile ? (
              <Layout userProfile={userProfile}>
                <AdminHospitals userProfile={userProfile} />
                <ChatBot />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            userProfile ? (
              <Layout userProfile={userProfile}>
                <Dashboard userProfile={userProfile} />
                <ChatBot />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/register"
          element={
            userProfile ? (
              <Layout userProfile={userProfile}>
                <Registration userProfile={userProfile} />
                <ChatBot />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/members"
          element={
            userProfile ? (
              <Layout userProfile={userProfile}>
                <MembersList userProfile={userProfile} />
                <ChatBot />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
