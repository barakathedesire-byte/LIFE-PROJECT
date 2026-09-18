import React, { useState } from 'react';
import { Award, Star, TrendingUp, CheckCircle, ShieldCheck, Zap, ThumbsUp, Clock, Medal, MessageSquare, Sparkles } from 'lucide-react';
import { RiderRankingComponent } from './RiderRankingComponent';

interface RiderPerformanceViewProps {
  rating?: number;
  acceptanceRate?: number;
  onTimeRate?: number;
  completedCount?: number;
  isLight?: boolean;
}

export const RiderPerformanceView: React.FC<RiderPerformanceViewProps> = ({
  rating = 4.88,
  acceptanceRate = 96.0,
  onTimeRate = 98.2,
  completedCount = 1420,
  isLight = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'RANKING' | 'METRICS' | 'REVIEWS'>('RANKING');

  const badges = [
    { title: 'Top Rated Rider', desc: '4.88+ rating across 280+ verified reviews', icon: Star, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
    { title: 'Fast Mover', desc: '< 20 min average delivery SLA', icon: Zap, color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
    { title: 'Zero Dispute Champion', desc: '100% successful OTP customer verifications', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
    { title: 'Diamond Tier Perk', desc: '+12% surge bonus active on all deliveries', icon: Award, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  ];

  const recentReviews = [
    { customer: 'Amina Juma', zone: 'Mikocheni', rating: 5, comment: 'Arrived in 15 mins! Very courteous rider and handled fragile electronics with extreme care.', time: '1 hour ago', tag: 'Fast & Polite' },
    { customer: 'David Kweka', zone: 'Oysterbay', rating: 5, comment: 'Great communication. Called ahead before reaching gate and confirmed OTP seamlessly.', time: '4 hours ago', tag: 'Great Communication' },
    { customer: 'Salma Mohamed', zone: 'Kijitonyama', rating: 5, comment: 'Super fast dropoff. Lumo express delivery is on another level with Alex.', time: 'Yesterday', tag: 'Super Fast' },
    { customer: 'Bakari Mwenda', zone: 'Kinondoni', rating: 4, comment: 'Prompt delivery and change was ready for cash on delivery.', time: '2 days ago', tag: 'Careful Handling' },
  ];

  return (
    <div className="w-full px-4 py-3 space-y-4 pb-28">
      {/* Tab Navigation Pill Bar */}
      <div className={`p-1 rounded-2xl border flex items-center gap-1 text-xs font-bold ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <button
          onClick={() => setActiveSubTab('RANKING')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'RANKING'
              ? 'bg-purple-600 text-white shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Medal className="w-3.5 h-3.5" />
          <span>Fleet Ranking</span>
        </button>

        <button
          onClick={() => setActiveSubTab('METRICS')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'METRICS'
              ? 'bg-purple-600 text-white shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Lumo Pulse</span>
        </button>

        <button
          onClick={() => setActiveSubTab('REVIEWS')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'REVIEWS'
              ? 'bg-purple-600 text-white shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews (284)</span>
        </button>
      </div>

      {/* 1. RANKING VIEW (Default & Primary Focus) */}
      {activeSubTab === 'RANKING' && (
        <RiderRankingComponent
          currentRiderName="Alex Mwita"
          currentRating={rating}
          currentOnTimeRate={onTimeRate}
          currentAcceptanceRate={acceptanceRate}
          currentCompletedCount={completedCount}
          isLight={isLight}
        />
      )}

      {/* 2. METRICS & PULSE PILLARS VIEW */}
      {activeSubTab === 'METRICS' && (
        <div className="space-y-4">
          {/* Lumo Pulse Score Banner */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-200">
                  LUMO PULSE SCORE
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-4xl font-extrabold">98</h2>
                  <span className="text-sm font-semibold text-emerald-200">/ 100</span>
                </div>
                <p className="text-xs font-bold text-emerald-100 mt-1 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-300" /> Diamond Star Fleet Tier
                </p>
              </div>

              <div className="w-16 h-16 rounded-full border-4 border-emerald-400/80 flex items-center justify-center bg-emerald-900/40 text-center">
                <div>
                  <span className="text-sm font-extrabold text-amber-300 block leading-tight">TOP</span>
                  <span className="text-base font-black text-white leading-none">2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Performance Pillar Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`p-3.5 rounded-xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Customer Review Score</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{rating.toFixed(2)} / 5.0</p>
              <span className="text-[10px] text-amber-600 font-bold">284 verified reviews (35% wgt)</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">On-Time SLA Delivery</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{onTimeRate}%</p>
              <span className="text-[10px] text-sky-600 font-bold">Target: &gt; 92% (30% wgt)</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Dispatch Acceptance</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{acceptanceRate}%</p>
              <span className="text-[10px] text-emerald-600 font-bold">Target: &gt; 85% (20% wgt)</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Avg Dropoff Speed</span>
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">18.4 min</p>
              <span className="text-[10px] text-purple-600 font-bold">City benchmark 26 min</span>
            </div>
          </div>

          {/* Fleet Badges */}
          <div className="space-y-2">
            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Fleet Badges & Achievements
            </h3>

            <div className="space-y-2">
              {badges.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${b.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</p>
                      <p className="text-[11px] text-slate-500">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER REVIEWS & SENTIMENT FEED VIEW */}
      {activeSubTab === 'REVIEWS' && (
        <div className="space-y-4">
          {/* Rating Summary Card */}
          <div className={`p-4 rounded-2xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">{rating.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">Based on 284 customer reviews</p>
              </div>

              {/* Star Distribution Breakdown */}
              <div className="space-y-1 text-[10px] w-36">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 text-slate-400">5★</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[92%]" />
                  </div>
                  <span className="text-slate-400 font-bold">92%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 text-slate-400">4★</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[7%]" />
                  </div>
                  <span className="text-slate-400 font-bold">7%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 text-slate-400">3★</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[1%]" />
                  </div>
                  <span className="text-slate-400 font-bold">1%</span>
                </div>
              </div>
            </div>

            {/* Popular Customer Tags */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Top Tags:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ⚡ Fast & On-Time (184)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                🤝 Courteous & Polite (142)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                🛡️ Safe Handling (98)
              </span>
            </div>
          </div>

          {/* Customer Reviews Feed */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Recent Customer Feedback
            </h3>

            {recentReviews.map((rev, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border shadow-sm space-y-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">
                      {rev.customer.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block leading-tight">{rev.customer}</span>
                      <span className="text-[10px] text-slate-400">{rev.zone} • {rev.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {rev.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified Delivery
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

