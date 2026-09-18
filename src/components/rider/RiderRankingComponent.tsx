import React, { useState } from 'react';
import {
  Award,
  Star,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  Medal,
  CheckCircle2,
  Users,
  Sparkles,
  Filter,
  ArrowUpRight,
  ThumbsUp,
  MessageSquare,
  BadgeCheck
} from 'lucide-react';

export interface RiderRankingItem {
  rank: number;
  riderId: string;
  name: string;
  avatarUrl?: string;
  zone: string;
  rating: number;
  reviewCount: number;
  onTimeRate: number;
  acceptanceRate: number;
  completedDeliveries: number;
  pulseScore: number;
  tier: 'Diamond Star' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  isCurrentRider?: boolean;
  positiveFeedbackTag: string;
}

interface RiderRankingComponentProps {
  currentRiderName?: string;
  currentRating?: number;
  currentOnTimeRate?: number;
  currentAcceptanceRate?: number;
  currentCompletedCount?: number;
  isLight?: boolean;
}

export const RiderRankingComponent: React.FC<RiderRankingComponentProps> = ({
  currentRiderName = 'Alex Mwita',
  currentRating = 4.88,
  currentOnTimeRate = 98.2,
  currentAcceptanceRate = 96.0,
  currentCompletedCount = 1420,
  isLight = false,
}) => {
  // Filters State
  const [timeframe, setTimeframe] = useState<'WEEKLY' | 'MONTHLY' | 'ALL_TIME'>('MONTHLY');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [selectedRiderDetail, setSelectedRiderDetail] = useState<RiderRankingItem | null>(null);

  // Dynamic calculation for active rider Pulse Score:
  // Reviews & Rating Weight: 35%
  // On-time SLA Weight: 30%
  // Acceptance Rate Weight: 20%
  // Completion/Zero Dispute Weight: 15% (assumed 99.2%)
  const reviewWeight = 35;
  const onTimeWeight = 30;
  const acceptanceWeight = 20;
  const completionWeight = 15;

  const calculatePulseScore = (rating: number, onTime: number, acceptance: number, completion: number = 99.0): number => {
    const ratingComponent = (rating / 5.0) * reviewWeight;
    const onTimeComponent = (onTime / 100) * onTimeWeight;
    const acceptanceComponent = (acceptance / 100) * acceptanceWeight;
    const completionComponent = (completion / 100) * completionWeight;
    return parseFloat((ratingComponent + onTimeComponent + acceptanceComponent + completionComponent).toFixed(1));
  };

  const currentRiderScore = calculatePulseScore(currentRating, currentOnTimeRate, currentAcceptanceRate, 99.4);

  // Fleet Leaderboard Data based on combined Review Score and Delivery Performance metrics
  const initialRiders: RiderRankingItem[] = [
    {
      rank: 1,
      riderId: 'RD-1002',
      name: 'Juma Hassan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      zone: 'Dar Central & Kariakoo',
      rating: 4.98,
      reviewCount: 342,
      onTimeRate: 99.4,
      acceptanceRate: 98.5,
      completedDeliveries: 1820,
      pulseScore: 99.2,
      tier: 'Diamond Star',
      positiveFeedbackTag: 'Super Fast & Polite'
    },
    {
      rank: 2,
      riderId: 'RD-1044',
      name: 'Rashid Bakari',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      zone: 'Kinondoni & Mikocheni',
      rating: 4.92,
      reviewCount: 310,
      onTimeRate: 98.8,
      acceptanceRate: 97.0,
      completedDeliveries: 1590,
      pulseScore: 98.4,
      tier: 'Diamond Star',
      positiveFeedbackTag: 'Careful Handling'
    },
    {
      rank: 3,
      riderId: 'RD-8942',
      name: currentRiderName,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
      zone: 'Kinondoni & Kijitonyama',
      rating: currentRating,
      reviewCount: 284,
      onTimeRate: currentOnTimeRate,
      acceptanceRate: currentAcceptanceRate,
      completedDeliveries: currentCompletedCount,
      pulseScore: currentRiderScore,
      tier: 'Diamond Star',
      isCurrentRider: true,
      positiveFeedbackTag: 'Reliable & Friendly'
    },
    {
      rank: 4,
      riderId: 'RD-2091',
      name: 'Emmanuel Mussa',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120',
      zone: 'Ilala & City Center',
      rating: 4.82,
      reviewCount: 215,
      onTimeRate: 97.5,
      acceptanceRate: 95.0,
      completedDeliveries: 1180,
      pulseScore: 96.1,
      tier: 'Platinum',
      positiveFeedbackTag: 'Prompt Communication'
    },
    {
      rank: 5,
      riderId: 'RD-3104',
      name: 'Baraka John',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120',
      zone: 'Oysterbay & Masaki',
      rating: 4.79,
      reviewCount: 198,
      onTimeRate: 96.9,
      acceptanceRate: 94.2,
      completedDeliveries: 980,
      pulseScore: 95.3,
      tier: 'Platinum',
      positiveFeedbackTag: 'Always on Time'
    },
    {
      rank: 6,
      riderId: 'RD-4119',
      name: 'Neema Shabani',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
      zone: 'Kariakoo Commercial',
      rating: 4.75,
      reviewCount: 175,
      onTimeRate: 96.0,
      acceptanceRate: 93.0,
      completedDeliveries: 840,
      pulseScore: 94.0,
      tier: 'Gold',
      positiveFeedbackTag: 'Smooth Handover'
    },
    {
      rank: 7,
      riderId: 'RD-5201',
      name: 'Faraji Ally',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120',
      zone: 'Temeke & Kigamboni',
      rating: 4.70,
      reviewCount: 160,
      onTimeRate: 95.5,
      acceptanceRate: 92.5,
      completedDeliveries: 790,
      pulseScore: 93.2,
      tier: 'Gold',
      positiveFeedbackTag: 'Courteous Rider'
    },
    {
      rank: 8,
      riderId: 'RD-6033',
      name: 'Kelvin Mushi',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120',
      zone: 'Ubungo & Sinza',
      rating: 4.65,
      reviewCount: 135,
      onTimeRate: 94.8,
      acceptanceRate: 91.0,
      completedDeliveries: 620,
      pulseScore: 91.5,
      tier: 'Gold',
      positiveFeedbackTag: 'Fast Delivery'
    }
  ];

  // Filter list by selected zone
  const filteredRiders = initialRiders.filter(r => {
    if (selectedZone === 'ALL') return true;
    if (selectedZone === 'KINONDONI') return r.zone.includes('Kinondoni') || r.zone.includes('Mikocheni') || r.zone.includes('Kijitonyama');
    if (selectedZone === 'CENTRAL') return r.zone.includes('Central') || r.zone.includes('Kariakoo') || r.zone.includes('Ilala');
    if (selectedZone === 'TEMEKE') return r.zone.includes('Temeke') || r.zone.includes('Kigamboni');
    return true;
  });

  const activeRiderItem = initialRiders.find(r => r.isCurrentRider) || initialRiders[2];

  return (
    <div className="w-full space-y-4">
      {/* 1. Header & Live Ranking Summary Card */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/70 to-slate-900 border border-purple-800/40 text-white p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                <Medal className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-purple-300 block">
                  LUMO FLEET LEADERBOARD
                </span>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  Rider Ranking & Performance
                </h2>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/30 text-purple-200 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="View Ranking Calculation Formula"
            >
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>How it's Ranked</span>
            </button>
          </div>

          {/* Active Rider Hero Position Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-slate-800">
                  <img
                    src={activeRiderItem.avatarUrl}
                    alt={activeRiderItem.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white">
                  #3
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-white text-sm truncate">{activeRiderItem.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                    Diamond Tier
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Rank <strong className="text-amber-400 font-black">#3</strong> of 148 riders in Dar es Salaam
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pulse Score</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 leading-none mt-0.5">
                {activeRiderItem.pulseScore}
                <span className="text-xs font-semibold text-slate-400">/100</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">Top 2% Fleet</span>
            </div>
          </div>

          {/* Active Rider 3 Key Drivers: Reviews, On-time SLA, Acceptance */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-black text-white text-xs">{activeRiderItem.rating.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">{activeRiderItem.reviewCount} Reviews</span>
              <span className="text-[9px] font-bold text-amber-400 uppercase">35% Weight</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-sky-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-black text-white text-xs">{activeRiderItem.onTimeRate}%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">On-Time SLA</span>
              <span className="text-[9px] font-bold text-sky-400 uppercase">30% Weight</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-black text-white text-xs">{activeRiderItem.acceptanceRate}%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Acceptance</span>
              <span className="text-[9px] font-bold text-emerald-400 uppercase">20% Weight</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Leaderboard Navigation Filter Bar */}
      <div className={`p-3 rounded-2xl border shadow-sm space-y-2.5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <button
              onClick={() => setTimeframe('WEEKLY')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                timeframe === 'WEEKLY' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('MONTHLY')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                timeframe === 'MONTHLY' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('ALL_TIME')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                timeframe === 'ALL_TIME' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <option value="ALL">All City Zones</option>
              <option value="KINONDONI">Kinondoni & Mikocheni</option>
              <option value="CENTRAL">Dar Central & Ilala</option>
              <option value="TEMEKE">Temeke & Kigamboni</option>
            </select>
          </div>
        </div>

        {/* 3. Rider Leaderboard Ranking List */}
        <div className="space-y-2 pt-1">
          {filteredRiders.map((item) => {
            const isTop1 = item.rank === 1;
            const isTop2 = item.rank === 2;
            const isTop3 = item.rank === 3;
            const isCurrent = item.isCurrentRider;

            return (
              <div
                key={item.riderId}
                onClick={() => setSelectedRiderDetail(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/50 shadow-md'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  {/* Rank Badge + Avatar + Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isTop1
                          ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300'
                          : isTop2
                          ? 'bg-slate-300 text-slate-950 shadow-sm ring-2 ring-slate-200'
                          : isTop3
                          ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-600'
                          : isLight
                          ? 'bg-slate-200 text-slate-700 font-bold'
                          : 'bg-slate-800 text-slate-400 font-bold'
                      }`}
                    >
                      {item.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-slate-600">
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Name, Zone, Feedback Tag */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs truncate ${isCurrent ? 'text-purple-300 font-extrabold' : isLight ? 'text-slate-900' : 'text-white'}`}>
                          {item.name} {isCurrent && '(You)'}
                        </span>
                        {item.tier === 'Diamond Star' && (
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <span>{item.zone}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">"{item.positiveFeedbackTag}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Rating + SLA + Pulse Score */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="hidden xs:block">
                      <div className="flex items-center justify-end gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{item.rating.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.reviewCount} revs</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400 leading-tight">
                        {item.pulseScore}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter block">
                        PTS
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" /> SLA: <strong className="text-slate-200">{item.onTimeRate}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Accept: <strong className="text-slate-200">{item.acceptanceRate}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-purple-400" /> Drops: <strong className="text-slate-200">{item.completedDeliveries}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tier Perks & Surge Multipliers Card */}
      <div className={`p-4 rounded-2xl border shadow-sm space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Fleet Tier Perks & Surge Multipliers
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Active: Diamond Star
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            {
              tier: 'Diamond Star (96 - 100 PTS)',
              perk: '+12% Surge Bonus per delivery, Instant Free M-Pesa Withdrawals, Priority Dispatch Radar',
              active: true,
              color: 'border-amber-500/50 bg-amber-500/10 text-amber-300'
            },
            {
              tier: 'Platinum Tier (90 - 95 PTS)',
              perk: '+8% Surge Bonus per delivery, Express Support Dispatch, Fuel Subsidy Voucher',
              active: false,
              color: 'border-slate-700 bg-slate-800/40 text-slate-300'
            },
            {
              tier: 'Gold Tier (80 - 89 PTS)',
              perk: '+4% Base Delivery Bonus, Standard Dispatch Allocation',
              active: false,
              color: 'border-slate-700 bg-slate-800/40 text-slate-300'
            }
          ].map((t, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${t.color}`}
            >
              <div className={`p-1 rounded-lg shrink-0 ${t.active ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-400 font-bold'} text-[10px]`}>
                {t.active ? 'YOU' : `${idx + 1}`}
              </div>
              <div>
                <p className="font-bold text-xs">{t.tier}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.perk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: HOW RANKING IS CALCULATED FORMULA */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">LUMO Pulse Ranking Formula</h3>
                  <p className="text-xs text-slate-400">Transparent & Review-Weighted Score Model</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Rider ranking is computed objectively using real customer reviews and rigorous operational performance metrics:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400" /> 1. Customer Reviews & Ratings
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-black">35% Weight</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Average star rating (1.0 to 5.0) from verified recipient customer reviews and dispute-free feedback.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> 2. On-Time Delivery SLA
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-[10px] font-black">30% Weight</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Percentage of orders delivered within target delivery SLA window (under 30 minutes for Express drops).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> 3. Dispatch Acceptance Rate
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-black">20% Weight</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ratio of assigned orders accepted without unnecessary timeout rejections.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> 4. OTP Confirmation & Zero Incidents
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] font-black">15% Weight</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    100% correct cash on delivery (COD) reconciliations and verified customer OTP handovers.
                  </p>
                </div>
              </div>

              {/* Actionable Pro-Tip */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-xs text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> How to Overtake Rank #2
                </span>
                <p className="text-[11px] text-slate-300">
                  Earn 8 more 5-star reviews this week with zero order cancellations to overtake Rashid Bakari for the #2 spot!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: INDIVIDUAL RIDER PROFILE METRICS DETAIL */}
      {selectedRiderDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedRiderDetail.avatarUrl}
                  alt={selectedRiderDetail.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <h3 className="font-extrabold text-white text-sm">{selectedRiderDetail.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedRiderDetail.zone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRiderDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fleet Rank</span>
                  <strong className="text-amber-400 font-black text-base">#{selectedRiderDetail.rank}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Pulse Score</span>
                  <strong className="text-emerald-400 font-black text-base">{selectedRiderDetail.pulseScore}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Rating:</span>
                  <strong className="text-amber-400 flex items-center gap-1 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" /> {selectedRiderDetail.rating.toFixed(2)} ({selectedRiderDetail.reviewCount} revs)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">On-Time SLA:</span>
                  <strong className="text-sky-400 font-bold">{selectedRiderDetail.onTimeRate}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Acceptance Rate:</span>
                  <strong className="text-emerald-400 font-bold">{selectedRiderDetail.acceptanceRate}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Completed Drops:</span>
                  <strong className="text-white font-bold">{selectedRiderDetail.completedDeliveries} drops</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top Compliment:</span>
                  <strong className="text-purple-300 font-bold">"{selectedRiderDetail.positiveFeedbackTag}"</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRiderDetail(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
