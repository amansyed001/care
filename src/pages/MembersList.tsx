import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Member, UserProfile } from '../types';
import { Search, Filter, Download, Trash2, Eye, ShieldCheck, X, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import MembershipCard from '../components/MembershipCard';
import { motion, AnimatePresence } from 'motion/react';

interface MembersListProps {
  userProfile: UserProfile | null;
}

export default function MembersList({ userProfile }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    const membersRef = collection(db, 'members');
    let q = query(membersRef, orderBy('createdAt', 'desc'));

    if (userProfile.role === 'agent') {
      q = query(membersRef, where('agentId', '==', userProfile.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData: Member[] = [];
      snapshot.forEach((doc) => {
        membersData.push(doc.data() as Member);
      });
      setMembers(membersData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A99]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Members Management</h1>
          <p className="text-slate-500 text-sm mt-1">Search and manage all issued health membership cards.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Phone or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-5">Member Details</th>
                <th className="px-6 py-5">ID & Phone</th>
                <th className="px-6 py-5">Validity</th>
                <th className="px-6 py-5">Agent</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#004A99]/5 flex items-center justify-center text-[#004A99] font-bold text-sm uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{member.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{member.address || 'No Address'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-mono font-bold text-[#004A99] mb-1">{member.id}</div>
                    <div className="text-xs text-slate-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs text-slate-800 font-medium">{format(new Date(member.issueDate), 'dd MMM yyyy')}</div>
                    <div className="text-[10px] text-slate-400">to {format(new Date(member.expiryDate), 'dd MMM yyyy')}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs text-slate-500">{member.agentName}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      member.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedMember(member)}
                        className="p-2 text-slate-400 hover:text-[#004A99] hover:bg-[#004A99]/5 rounded-lg transition-all"
                        title="View Card"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {userProfile?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(member.id)}
                          disabled={isDeleting === member.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          {isDeleting === member.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <AlertCircle className="w-12 h-12 opacity-20" />
                      <p className="text-sm italic">No members found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Card Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center">
                <MembershipCard member={selectedMember} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
