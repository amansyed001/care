import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Member, Analytics, UserProfile, Hospital } from '../types';
import { TrendingUp, Users, CreditCard, Clock, ArrowUpRight, ArrowDownRight, Activity, Calendar, Building2, Star, Award } from 'lucide-react';
import { format, isToday, isAfter, startOfDay, endOfDay } from 'date-fns';
import { motion } from 'motion/react';

interface DashboardProps {
  userProfile: UserProfile | null;
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalCardsSold: 0,
    revenueTotal: 0,
    revenueToday: 0,
    pendingExpiries: 0,
    totalHospitals: 0,
    agentPerformance: []
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    // Listen to members
    const membersRef = collection(db, 'members');
    let qMembers = query(membersRef);
    if (userProfile.role === 'agent') {
      qMembers = query(membersRef, where('agentId', '==', userProfile.uid));
    }

    const unsubscribeMembers = onSnapshot(qMembers, (snapshot) => {
      const members: Member[] = [];
      let totalRevenue = 0;
      let todayRevenue = 0;
      let pendingExpiries = 0;
      const agentSales: Record<string, number> = {};

      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      snapshot.forEach((doc) => {
        const data = doc.data() as Member;
        members.push(data);
        totalRevenue += 249;
        
        const createdAt = new Date(data.createdAt);
        if (createdAt >= todayStart && createdAt <= todayEnd) {
          todayRevenue += 249;
        }

        const expiryDate = new Date(data.expiryDate);
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        if (isAfter(expiryDate, new Date()) && !isAfter(expiryDate, oneMonthFromNow)) {
          pendingExpiries++;
        }

        // Track agent performance
        agentSales[data.agentName] = (agentSales[data.agentName] || 0) + 1;
      });

      // Listen to hospitals
      const hospitalsRef = collection(db, 'hospitals');
      const unsubscribeHospitals = onSnapshot(hospitalsRef, (hospSnapshot) => {
        setAnalytics(prev => ({
          ...prev,
          totalCardsSold: members.length,
          revenueTotal: totalRevenue,
          revenueToday: todayRevenue,
          pendingExpiries,
          totalHospitals: hospSnapshot.size,
          agentPerformance: Object.entries(agentSales)
            .map(([agentName, sales]) => ({ agentName, sales }))
            .sort((a, b) => b.sales - a.sales)
        }));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'hospitals');
      });

      setRecentMembers(members.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5));
      
      setIsLoading(false);
      return () => unsubscribeHospitals();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });

    return () => unsubscribeMembers();
  }, [userProfile]);

  const stats = [
    { name: 'Total Cards Sold', value: analytics.totalCardsSold, icon: CreditCard, color: 'bg-blue-500', trend: '+12%', trendUp: true },
    { name: 'Total Revenue', value: `₹${analytics.revenueTotal.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-500', trend: '+8%', trendUp: true },
    { name: 'Partner Hospitals', value: analytics.totalHospitals, icon: Building2, color: 'bg-indigo-500', trend: '+2', trendUp: true },
    { name: 'Pending Expiries', value: analytics.pendingExpiries, icon: Clock, color: 'bg-amber-500', trend: '-2%', trendUp: false },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A99]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome back, <span className="text-[#004A99]">{userProfile?.name}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Care Consultancy Health Network Management Dashboard.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <Calendar className="w-4 h-4 text-[#004A99]" />
          <span className="text-sm font-bold text-slate-700">{format(new Date(), 'MMMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</div>
            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Members Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent Memberships</h2>
              <button className="text-[#004A99] text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Agent</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#004A99] font-bold text-xs uppercase">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{member.name}</div>
                            <div className="text-[10px] text-slate-400">{member.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-500">{member.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500">{member.agentName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          member.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent Performance (Admin Only) */}
          {userProfile?.role === 'admin' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Agent Performance</h2>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-4">
                {analytics.agentPerformance.map((agent, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="text-xs font-bold text-slate-400 w-4">#{i+1}</div>
                    <div className="flex-grow">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-slate-700">{agent.agentName}</span>
                        <span className="text-slate-500">{agent.sales} Cards</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#004A99] rounded-full" 
                          style={{ width: `${(agent.sales / analytics.totalCardsSold) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-[#004A99] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Network Growth</h3>
              <p className="text-white/70 text-sm mb-6">We now have {analytics.totalHospitals} partner hospitals across the network.</p>
              <button 
                onClick={() => window.location.href = '/hospitals'}
                className="w-full py-3 bg-white text-[#004A99] rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
              >
                View Directory
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Building2 className="w-32 h-32" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.location.href = '/register'}
                className="p-4 bg-blue-50 text-[#004A99] rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-100 transition-colors"
              >
                <Users className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">New Member</span>
              </button>
              <button 
                onClick={() => window.location.href = '/admin/hospitals'}
                className="p-4 bg-teal-50 text-teal-600 rounded-2xl flex flex-col items-center gap-2 hover:bg-teal-100 transition-colors"
              >
                <Building2 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Add Hosp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
