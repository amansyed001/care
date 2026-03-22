import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, storage, ref, uploadBytes, getDownloadURL, handleFirestoreError, OperationType } from '../firebase';
import { Hospital, UserProfile } from '../types';
import { Building2, Plus, Trash2, Edit2, ShieldCheck, X, Loader2, Image as ImageIcon, Phone, MapPin, Star, Stethoscope, Activity, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminHospitalsProps {
  userProfile: UserProfile | null;
}

export default function AdminHospitals({ userProfile }: AdminHospitalsProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    image: '',
    specialists: '',
    services: '',
    address: '',
    phone: '',
    discountInfo: '',
    isVerified: true
  });

  useEffect(() => {
    const q = query(collection(db, 'hospitals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Hospital[] = [];
      snapshot.forEach((doc) => data.push({ ...doc.data(), id: doc.id } as Hospital));
      setHospitals(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hospitals');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let logoUrl = formData.logo;

    try {
      if (logoFile) {
        setIsUploading(true);
        const storageRef = ref(storage, `hospitals/logos/${Date.now()}_${logoFile.name}`);
        const snapshot = await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
        setIsUploading(false);
      }

      const hospitalData = {
        ...formData,
        logo: logoUrl,
        specialists: formData.specialists.split(',').map(s => s.trim()).filter(s => s),
        services: formData.services.split(',').map(s => s.trim()).filter(s => s),
        createdAt: new Date().toISOString()
      };

      if (editingHospital) {
        try {
          await updateDoc(doc(db, 'hospitals', editingHospital.id), hospitalData);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `hospitals/${editingHospital.id}`);
        }
      } else {
        try {
          await addDoc(collection(db, 'hospitals'), {
            ...hospitalData,
            id: `HOSP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'hospitals');
        }
      }
      setIsModalOpen(false);
      setEditingHospital(null);
      setLogoFile(null);
      setFormData({
        name: '',
        logo: '',
        image: '',
        specialists: '',
        services: '',
        address: '',
        phone: '',
        discountInfo: '',
        isVerified: true
      });
    } catch (err) {
      console.error('Error saving hospital:', err);
      alert('Failed to save hospital.');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;
    try {
      await deleteDoc(doc(db, 'hospitals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `hospitals/${id}`);
    }
  };

  const openEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name,
      logo: hospital.logo || '',
      image: hospital.image || '',
      specialists: hospital.specialists.join(', '),
      services: hospital.services.join(', '),
      address: hospital.address,
      phone: hospital.phone,
      discountInfo: hospital.discountInfo || '',
      isVerified: hospital.isVerified
    });
    setIsModalOpen(true);
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm italic">Access restricted to administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#004A99]" />
            Hospital Network Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Add and manage partner hospitals in the directory.</p>
        </div>
        <button
          onClick={() => {
            setEditingHospital(null);
            setFormData({
              name: '',
              logo: '',
              image: '',
              specialists: '',
              services: '',
              address: '',
              phone: '',
              discountInfo: '',
              isVerified: true
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#004A99] text-white rounded-2xl font-bold hover:bg-[#003d7a] transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Hospital
        </button>
      </div>

      {/* Hospital List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                {hospital.logo ? (
                  <img src={hospital.logo} alt="logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <Building2 className="w-8 h-8 text-[#004A99]/40" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-slate-800 leading-tight">{hospital.name}</h3>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                  <MapPin className="w-3 h-3" /> {hospital.address.split(',')[0]}
                </div>
              </div>
              {hospital.isVerified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Stethoscope className="w-4 h-4 text-[#004A99]" />
                {hospital.specialists.length} Specialties
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-4 h-4 text-teal-500" />
                {hospital.services.length} Services
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Star className="w-4 h-4 text-amber-500" />
                {hospital.discountInfo || 'Standard Discount'}
              </div>
            </div>

            <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
              <button
                onClick={() => openEdit(hospital)}
                className="flex-grow py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(hospital.id)}
                className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full relative shadow-2xl my-8"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#004A99]" />
                {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hospital Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Apollo Hospital"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Address</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full address of the hospital"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hospital Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden shrink-0">
                        {logoFile ? (
                          <img src={URL.createObjectURL(logoFile)} alt="preview" className="w-full h-full object-contain" />
                        ) : formData.logo ? (
                          <img src={formData.logo} alt="logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <Building2 className="w-8 h-8 text-[#004A99]/40" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-[#004A99] hover:bg-blue-50 transition-all group">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#004A99]" />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-[#004A99]">
                            {logoFile ? logoFile.name : 'Upload Logo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or SVG. Max 2MB.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Building Photo URL</label>
                    <input
                      required
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/building.jpg"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialists (comma separated)</label>
                    <input
                      type="text"
                      value={formData.specialists}
                      onChange={(e) => setFormData({ ...formData, specialists: e.target.value })}
                      placeholder="Cardiology, Neurology, Orthopedics"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Services (comma separated)</label>
                    <input
                      type="text"
                      value={formData.services}
                      onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                      placeholder="24x7 ICU, Dialysis, Lab, Pharmacy"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Info</label>
                    <input
                      type="text"
                      value={formData.discountInfo}
                      onChange={(e) => setFormData({ ...formData, discountInfo: e.target.value })}
                      placeholder="e.g. 20% off on OPD, 10% on Diagnostics"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-4">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-5 h-5 rounded-lg text-[#004A99] focus:ring-[#004A99]/20"
                  />
                  <label htmlFor="isVerified" className="text-sm font-bold text-slate-700">Verified Partner Status</label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="px-10 py-3 bg-[#004A99] text-white rounded-2xl font-bold hover:bg-[#003d7a] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading Logo...
                      </>
                    ) : isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editingHospital ? (
                      'Update Hospital'
                    ) : (
                      'Add Hospital'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
