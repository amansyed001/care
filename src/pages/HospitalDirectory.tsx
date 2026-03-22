import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Hospital } from '../types';
import { ShieldCheck, MapPin, Phone, Activity, Stethoscope, ChevronRight, Star, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function HospitalDirectory() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'hospitals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Hospital[] = [];
      snapshot.forEach((doc) => data.push(doc.data() as Hospital));
      setHospitals(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hospitals');
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A99]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#004A99] text-xs font-bold uppercase tracking-widest border border-blue-100"
        >
          <ShieldCheck className="w-4 h-4" />
          Verified Partner Network
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          Premium Hospital Directory
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Explore our network of world-class healthcare facilities offering exclusive benefits to Care Consultancy members.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hospitals.map((hospital, i) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col"
          >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={hospital.image || `https://picsum.photos/seed/${hospital.id}/800/600`}
                alt={hospital.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Verified Badge */}
              {hospital.isVerified && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Verified Partner</span>
                </div>
              )}

              {/* Logo Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-xl flex items-center justify-center">
                  {hospital.logo ? (
                    <img src={hospital.logo} alt="logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#004A99]" />
                  )}
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-lg leading-tight">{hospital.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                    <MapPin className="w-3 h-3" /> {hospital.address.split(',')[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex-grow flex flex-col">
              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-6">
                {hospital.specialists.slice(0, 3).map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-[#004A99] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {spec}
                  </span>
                ))}
              </div>

              {/* Services */}
              <div className="space-y-3 mb-8">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Key Facilities</div>
                <div className="grid grid-cols-2 gap-3">
                  {hospital.services.slice(0, 4).map((service, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <Activity className="w-3 h-3 text-teal-500" />
                      {service}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Info */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                <div className="flex items-center gap-2 text-[#004A99] font-bold text-sm mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  Member Benefit
                </div>
                <p className="text-xs text-slate-500">{hospital.discountInfo || 'Up to 20% discount on OPD & Diagnostics'}</p>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-3">
                <button className="flex-grow py-3 bg-[#004A99] text-white rounded-xl font-bold text-sm hover:bg-[#003d7a] transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  View Facilities
                  <ChevronRight className="w-4 h-4" />
                </button>
                <a
                  href={`tel:${hospital.phone}`}
                  className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}

        {hospitals.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Building2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Hospitals Listed Yet</h3>
            <p className="text-slate-500">Our network is expanding rapidly. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
