import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, CreditCard, Activity, ArrowRight, Heart, CheckCircle2, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#004A99] py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" fill="none" viewBox="0 0 400 400">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-300 text-sm font-bold mb-8 backdrop-blur-sm border border-white/10"
            >
              <ShieldCheck className="w-4 h-4" />
              Trusted by 500+ Hospitals
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6"
            >
              Affordable Health <br />
              <span className="text-teal-400">For Every Family.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-xl text-blue-100 mb-10 leading-relaxed"
            >
              Get the Care Consultancy Health Membership Card for just ₹249 and unlock premium discounts at top hospitals across the country.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/verify"
                className="w-full sm:w-auto px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold text-lg hover:bg-teal-600 transition-all shadow-xl hover:shadow-teal-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Verify Membership
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center gap-2"
              >
                Agent Portal
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', damping: 20 }}
          className="mt-20 max-w-4xl mx-auto px-4"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
            <img 
              src="https://picsum.photos/seed/hospital/1200/600?blur=2" 
              alt="Healthcare Dashboard" 
              className="rounded-2xl shadow-inner opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Care Consultancy?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We bridge the gap between quality healthcare and affordability with our unique membership system.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Issuance', desc: 'Get your digital health card within minutes of registration.', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100' },
              { title: 'Hospital Network', desc: 'Access discounts at a wide range of partner hospitals and clinics.', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-100' },
              { title: 'Secure QR Code', desc: 'Every card features a unique QR for instant hospital verification.', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className={`${feature.bg} ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Call to Action */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#004A99] rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">One Card. <br />Infinite Benefits.</h2>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  <span>Valid for 1 Full Year</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  <span>Up to 30% Discount on OPD & Diagnostics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  <span>Digital Card on your Phone</span>
                </li>
              </ul>
              <div className="flex items-center gap-6">
                <div className="text-5xl font-black">₹249</div>
                <div className="text-blue-200 text-sm">Annual <br />Membership</div>
              </div>
            </div>
            
            <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 w-full md:w-80">
              <h3 className="text-xl font-bold mb-4">Contact Support</h3>
              <p className="text-blue-100 text-sm mb-6">Have questions? Our team is here to help you 24/7.</p>
              <a 
                href="tel:+910000000000" 
                className="flex items-center justify-center gap-3 w-full py-4 bg-white text-[#004A99] rounded-2xl font-bold shadow-lg hover:bg-slate-100 transition-colors"
              >
                <PhoneCall className="w-5 h-5" />
                Call Now
              </a>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-12">Our Partner Network</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <ShieldCheck className="w-12 h-12" />
            <Heart className="w-12 h-12" />
            <Activity className="w-12 h-12" />
            <ShieldCheck className="w-12 h-12" />
            <Heart className="w-12 h-12" />
          </div>
        </div>
      </section>
    </div>
  );
}
