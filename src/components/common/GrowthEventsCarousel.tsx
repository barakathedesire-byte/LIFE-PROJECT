import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, ChevronRight, ArrowRight, BookOpen, Award, TrendingUp, Megaphone, Video } from 'lucide-react';

export interface EventCardItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaAction?: () => void;
  badge?: string;
  type: 'training' | 'webinar' | 'tips' | 'announcement' | 'campaign' | 'challenge';
}

interface GrowthEventsCarouselProps {
  title: string;
  subtitle: string;
  events: EventCardItem[];
  theme?: 'orange' | 'blue' | 'purple' | 'emerald';
}

export const GrowthEventsCarousel: React.FC<GrowthEventsCarouselProps> = ({
  title,
  subtitle,
  events,
  theme = 'orange'
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCardItem | null>(null);

  useEffect(() => {
    if (isPaused || events.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, events.length]);

  const themeColors = {
    orange: {
      badge: 'bg-orange-100 text-[#ff6a00] border-orange-200',
      accent: 'text-[#ff6a00]',
      button: 'bg-[#ff6a00] hover:bg-[#e05d00] text-white',
      border: 'hover:border-orange-300',
      activeDot: 'bg-[#ff6a00]'
    },
    blue: {
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      accent: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'hover:border-blue-300',
      activeDot: 'bg-blue-600'
    },
    purple: {
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      accent: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
      border: 'hover:border-purple-300',
      activeDot: 'bg-purple-600'
    },
    emerald: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      accent: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'hover:border-emerald-300',
      activeDot: 'bg-emerald-600'
    }
  }[theme];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {events.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? `w-5 ${themeColors.activeDot}` : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Event Cards Carousel Display */}
      <div
        className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.slice(0, 3).map((evt, idx) => {
            const isFeatured = idx === activeIndex % Math.min(events.length, 3);
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`group relative bg-white rounded-xl border p-3.5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isFeatured
                    ? 'border-slate-300 shadow-md ring-2 ring-slate-900/5'
                    : 'border-slate-200 hover:shadow-sm opacity-90'
                } ${themeColors.border}`}
              >
                {/* Event Image & Badge */}
                <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs backdrop-blur-md ${themeColors.badge}`}>
                      {evt?.category || 'General'}
                    </span>
                  </div>
                  {evt.badge && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                        {evt.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {evt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {evt.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 group-hover:text-[#ff6a00] transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className={`text-[11px] flex items-center gap-1 ${themeColors.accent}`}>
                    {evt.ctaText} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
              <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border shadow-sm bg-white text-slate-900`}>
                  {selectedEvent?.category || 'General'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedEvent.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedEvent.time}</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedEvent.ctaAction) selectedEvent.ctaAction();
                  alert(`Successfully registered for: ${selectedEvent.title}`);
                  setSelectedEvent(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm cursor-pointer ${themeColors.button}`}
              >
                {selectedEvent.ctaText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
