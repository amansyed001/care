import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Download, Share2, ShieldCheck, Calendar, Phone, User } from 'lucide-react';
import { Member } from '../types';
import { format } from 'date-fns';

interface MembershipCardProps {
  member: Member;
}

export default function MembershipCard({ member }: MembershipCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Care_Consultancy_Card_${member.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading card:', err);
    }
  };

  const shareCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Care_Consultancy_Card_${member.id}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Care Consultancy Membership Card',
          text: `Membership Card for ${member.name}`,
        });
      } else {
        alert('Sharing not supported on this browser. Please download the card instead.');
      }
    } catch (err) {
      console.error('Error sharing card:', err);
    }
  };

  const verificationUrl = `${window.location.origin}/verify?id=${member.id}`;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card Template */}
      <div 
        ref={cardRef}
        className="w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative flex flex-col"
        id="membership-card"
      >
        {/* Header */}
        <div className="bg-[#004A99] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span className="text-lg font-bold tracking-tight">Care Consultancy</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest opacity-80">Health Membership</div>
        </div>

        {/* Content */}
        <div className="p-8 flex-grow flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-inner">
            <User className="w-12 h-12 text-[#004A99]/40" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{member.name}</h2>
          <p className="text-slate-500 text-sm mb-6 flex items-center gap-1 justify-center">
            <Phone className="w-3 h-3" /> {member.phone}
          </p>

          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Member ID</div>
              <div className="text-sm font-mono font-bold text-[#004A99]">{member.id}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Status</div>
              <div className={`text-sm font-bold uppercase ${member.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                {member.status}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
            <QRCodeSVG value={verificationUrl} size={120} level="H" />
            <div className="text-[9px] text-slate-400 mt-2 font-mono">Scan to Verify</div>
          </div>

          <div className="w-full space-y-2 text-left">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Issued</span>
              <span className="font-medium text-slate-700">{format(new Date(member.issueDate), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires</span>
              <span className="font-medium text-slate-700">{format(new Date(member.expiryDate), 'dd MMM yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Premium Health Card • ₹249
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={downloadCard}
          className="flex items-center gap-2 px-6 py-3 bg-[#004A99] text-white rounded-xl font-bold hover:bg-[#003d7a] transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Download className="w-5 h-5" />
          Download Card
        </button>
        <button
          onClick={shareCard}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Share2 className="w-5 h-5" />
          Share WhatsApp
        </button>
      </div>
    </div>
  );
}
