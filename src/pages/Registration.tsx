import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, Member } from '../types';
import { UserPlus, User, Phone, MapPin, CreditCard, Calendar, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { addYears, format } from 'date-fns';
import MembershipCard from '../components/MembershipCard';
import { motion, AnimatePresence } from 'motion/react';

interface RegistrationProps {
  userProfile: UserProfile | null;
}

export default function Registration({ userProfile }: RegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    aadhar: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Member | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const memberId = `CC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const issueDate = new Date(formData.issueDate);
      const expiryDate = addYears(issueDate, 1);

      const memberData: Member = {
        id: memberId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        aadhar: formData.aadhar,
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        agentId: userProfile.uid,
        agentName: userProfile.name,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'members', memberId), memberData);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `members/${memberId}`);
      }
      setNewMember(memberData);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (newMember) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto py-8"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Registration Successful!</h1>
          <p className="text-slate-500">Digital Membership Card has been generated for {newMember.name}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <MembershipCard member={newMember} />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Next Steps</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-slate-600 text-sm">Download the digital card as an image for the member.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-slate-600 text-sm">Share the card directly with the member via WhatsApp.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <p className="text-slate-600 text-sm">Instruct the member to present this QR code at any partner hospital.</p>
                </li>
              </ul>
              <button 
                onClick={() => setNewMember(null)}
                className="w-full mt-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                Register Another Member
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-[#004A99]" />
          New Member Registration
        </h1>
        <p className="text-slate-500 mt-2">Enter member details to issue a new health membership card.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter member's full name"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3" /> Mobile Number
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter 10-digit mobile"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full residential address"
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Aadhar No (Optional)
              </label>
              <input
                type="text"
                value={formData.aadhar}
                onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                placeholder="12-digit Aadhar number"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Issue Date
              </label>
              <input
                required
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#004A99] shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#004A99] mb-1">Automatic Expiry Calculation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The membership will be valid for exactly 1 year from the issue date. 
                Expiry: <span className="font-bold text-slate-700">{format(addYears(new Date(formData.issueDate), 1), 'dd MMMM yyyy')}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-3 px-10 py-4 bg-[#004A99] text-white rounded-2xl font-bold hover:bg-[#003d7a] transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Confirm & Generate Card
                <CheckCircle2 className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
