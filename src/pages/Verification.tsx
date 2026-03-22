import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Member, Hospital } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Loader2, Search, Calendar, User, Phone, Building2, ChevronRight, MapPin } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Verification() {
  const [searchParams] = useSearchParams();
  const [memberId, setMemberId] = useState(searchParams.get('id') || '');
  const [member, setMember] = useState<Member | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch some hospitals for the showcase
    const fetchHospitals = async () => {
      try {
        const q = query(collection(db, 'hospitals'), limit(3));
        const snap = await getDocs(q);
        const data: Hospital[] = [];
        snap.forEach(doc => data.push(doc.data() as Hospital));
        setHospitals(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'hospitals');
      }
    };
    fetchHospitals();
  }, []);

  const verifyMember = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setMember(null);

    try {
      const docRef = doc(db, 'members', id.toUpperCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Member;
        const isExpired = isAfter(new Date(), new Date(data.expiryDate));
        setMember({
          ...data,
          status: isExpired ? 'expired' : 'active'
        });
      } else {
        setError('Invalid Membership ID. No record found.');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `members/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      verifyMember(searchParams.get('id')!);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMember(memberId);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#004A99]/10 text-[#004A99] rounded-3xl mb-6">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">Membership Verification</h1>
        <p className="text-slate-500">Secure portal for hospitals to verify Care Consultancy health cards.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-12 relative group max-w-2xl mx-auto">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-[#004A99] transition-colors">
          <Search className="w-6 h-6" />
        </div>
        <input
          type="text"
          placeholder="Enter Membership ID (e.g. CC-XXXXXX)"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="w-full pl-16 pr-32 py-6 bg-white border-2 border-slate-100 rounded-3xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#004A99]/10 focus:border-[#004A99] transition-all shadow-xl"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 top-3 bottom-3 px-8 bg-[#004A99] text-white rounded-2xl font-bold hover:bg-[#003d7a] transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify'}
        </button>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-12"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[#004A99]" />
            <p className="text-slate-400 font-medium italic">Verifying credentials with secure server...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-100 p-10 rounded-3xl text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h2>
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {member && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className={`p-10 rounded-[3rem] border-2 shadow-2xl max-w-2xl mx-auto ${
              member.status === 'active' 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-red-50 border-red-100'
            }`}>
              <div className="flex flex-col items-center text-center mb-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                  member.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {member.status === 'active' ? <CheckCircle2 className="w-14 h-14" /> : <XCircle className="w-14 h-14" />}
                </div>
                <h2 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${
                  member.status === 'active' ? 'text-emerald-800' : 'text-red-800'
                }`}>
                  {member.status === 'active' ? 'Active Member' : 'Expired Card'}
                </h2>
                <p className={`text-sm font-bold uppercase tracking-widest ${
                  member.status === 'active' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  Care Consultancy Health Network
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 space-y-6 border border-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-widest flex items-center gap-1">
                      <User className="w-3 h-3" /> Member Name
                    </div>
                    <div className="text-lg font-bold text-slate-800">{member.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Membership ID
                    </div>
                    <div className="text-lg font-mono font-bold text-[#004A99]">{member.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-widest flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Registered Mobile
                    </div>
                    <div className="text-lg font-bold text-slate-800">XXXXXX{member.phone.slice(-4)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Expiry Date
                    </div>
                    <div className={`text-lg font-bold ${member.status === 'active' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {format(new Date(member.expiryDate), 'dd MMMM yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Hospitals Showcase */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">Nearest Partner Hospitals</h3>
                <Link to="/hospitals" className="text-[#004A99] font-bold text-sm flex items-center gap-1 hover:underline">
                  View Full Directory <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 relative">
                      <img 
                        src={hospital.image} 
                        alt={hospital.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white font-bold text-sm">{hospital.name}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <MapPin className="w-3 h-3" /> {hospital.address.split(',')[0]}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">
                        {hospital.specialists.join(', ')}
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                          {hospital.discountInfo || '20% Discount'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
