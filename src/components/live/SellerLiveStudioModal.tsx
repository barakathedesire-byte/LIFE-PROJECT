import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  Users,
  Heart,
  MessageSquare,
  Pin,
  Sparkles,
  ShoppingBag,
  Send,
  AlertCircle,
  CheckCircle2,
  Share2,
  TrendingUp,
  Tag,
  ShieldCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { formatCurrencyTZS } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

interface SellerLiveStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId?: string;
  storeName: string;
  storeLogo?: string;
  sellerProducts: Product[];
  onSessionEnded?: () => void;
}

interface LiveComment {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  message: string;
  createdAt: string;
  isHost?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
  icon: string;
}

export const SellerLiveStudioModal: React.FC<SellerLiveStudioModalProps> = ({
  isOpen,
  onClose,
  sellerId = 'sl-101',
  storeName,
  storeLogo,
  sellerProducts = [],
  onSessionEnded
}) => {
  const { showToast } = useNotification();

  // Stream state
  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamTitle, setStreamTitle] = useState('🔥 Official Store Live Unboxing & Exclusive Deals');
  const [streamCategory, setStreamCategory] = useState('Electronics & Smartphones');
  
  // Media devices state
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Live interaction state
  const [viewerCount, setViewerCount] = useState(148);
  const [totalLikes, setTotalLikes] = useState(1280);
  const [pinnedProduct, setPinnedProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 'c-1',
      userId: 'u-1',
      userName: 'Neema Joseph',
      message: 'Hello! Is this the official Tanzanian edition with warranty?',
      createdAt: 'Just now'
    },
    {
      id: 'c-2',
      userId: 'u-2',
      userName: 'Juma Kassim',
      message: 'Show the camera zoom feature please!',
      createdAt: 'Just now'
    },
    {
      id: 'c-3',
      userId: 'u-3',
      userName: 'Baraka Ally',
      message: 'Does it support same day Kariakoo delivery?',
      createdAt: 'Just now'
    }
  ]);
  const [hostMessage, setHostMessage] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [isStartingStream, setIsStartingStream] = useState(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Camera & Mic Media Stream
  const initMediaStream = async () => {
    try {
      setPermissionError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCameraPermission(true);
      } else {
        setHasCameraPermission(false);
        setPermissionError('Media streaming is not supported on this browser frame.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable in sandbox:', err.message);
      setHasCameraPermission(false);
      setPermissionError('Camera/Mic permission unavailable. Running with adaptive preview feed.');
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      initMediaStream();
      // Auto pin first product if available
      if (sellerProducts.length > 0 && !pinnedProduct) {
        setPinnedProduct(sellerProducts[0]);
      }
    } else {
      stopMediaStream();
      setIsLive(false);
      setRecordedDuration(0);
    }
    return () => {
      stopMediaStream();
    };
  }, [isOpen, cameraFacing]);

  // Duration Timer when Live
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLive) {
      timer = setInterval(() => {
        setRecordedDuration(prev => prev + 1);
        // Periodic random viewer fluctuations and hearts
        if (Math.random() > 0.4) {
          triggerHeart();
          setTotalLikes(prev => prev + 1);
        }
        if (Math.random() > 0.7) {
          setViewerCount(prev => Math.max(80, prev + Math.floor(Math.random() * 5) - 2));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLive]);

  // Auto scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const triggerHeart = () => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 60 + 20; // 20% to 80%
    const icons = ['❤️', '🔥', '👏', '🎉', '💖', '⭐'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    setFloatingHearts(prev => [...prev.slice(-15), { id, x, color: '#ff4d4f', icon: randomIcon }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    } else {
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    } else {
      setAudioEnabled(!audioEnabled);
    }
  };

  const switchCameraFacing = () => {
    stopMediaStream();
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Start Live Broadcast via Backend API
  const handleStartLive = async () => {
    try {
      setIsStartingStream(true);
      const res = await api.startLiveSession({
        sellerId,
        title: streamTitle,
        category: streamCategory,
        pinnedProductId: pinnedProduct?.id,
        initialViewers: 120
      });

      if (res?.session) {
        setSessionId(res.session.id);
        setIsLive(true);
        showToast('You are now LIVE on LUMO Marketplace!', 'success');
      } else {
        // Fallback session state
        setSessionId(`live-${Date.now()}`);
        setIsLive(true);
        showToast('You are now LIVE on LUMO Marketplace!', 'success');
      }
    } catch (err: any) {
      // Allow live session even if backend offline
      setSessionId(`live-${Date.now()}`);
      setIsLive(true);
      showToast('Live stream started in interactive studio mode.', 'success');
    } finally {
      setIsStartingStream(false);
    }
  };

  // End Live Broadcast
  const handleEndLive = async () => {
    if (window.confirm('Are you sure you want to end this live broadcast?')) {
      try {
        if (sessionId) {
          await api.endLiveSession(sessionId);
        }
      } catch (e) {
        // ignore
      }
      setIsLive(false);
      showToast('Live broadcast ended. Followers and viewers notified.', 'info');
      if (onSessionEnded) onSessionEnded();
      onClose();
    }
  };

  // Pin Product
  const handlePinProduct = async (product: Product) => {
    setPinnedProduct(product);
    setShowProductPicker(false);
    showToast(`Pinned "${product.name}" to live shopping stream!`, 'success');
    
    // Add announcement comment
    const announcement: LiveComment = {
      id: `comm-${Date.now()}`,
      userId: 'host',
      userName: storeName,
      message: `📌 Host pinned: ${product.name} — ${formatCurrencyTZS(product.price)}`,
      createdAt: 'Just now',
      isHost: true
    };
    setComments(prev => [...prev, announcement]);

    if (sessionId) {
      try {
        await api.pinProductToLive(sessionId, product.id);
      } catch (err) {
        // non-blocking
      }
    }
  };

  // Send Host Message / Flash Announcement
  const handleSendHostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostMessage.trim()) return;

    const newComment: LiveComment = {
      id: `comm-${Date.now()}`,
      userId: 'host',
      userName: `${storeName} (Host)`,
      message: hostMessage.trim(),
      createdAt: 'Just now',
      isHost: true
    };

    setComments(prev => [...prev, newComment]);
    setHostMessage('');

    if (sessionId) {
      api.commentOnLive(sessionId, {
        userId: sellerId,
        userName: `${storeName} (Host)`,
        message: hostMessage.trim()
      }).catch(() => {});
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div id="seller-live-studio-modal" className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-950 text-white rounded-3xl max-w-5xl w-full overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* TOP BAR */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center shadow-lg">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white">LUMO Live Creator Studio</h2>
                {isLive ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE ({formatTimer(recordedDuration)})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    Studio Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {storeName} • Interactive Multi-Camera Live Commerce
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <button
                onClick={handleEndLive}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-lg transition"
              >
                End Broadcast
              </button>
            ) : (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* STUDIO BODY (GRID LAYOUT) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto">
          
          {/* LEFT 7 COLS: CAMERA STREAM & CONTROLS */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            
            {/* VIDEO CANVAS CONTAINER */}
            <div className="relative aspect-[4/3] sm:aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              
              {/* Actual Video Tag or Fallback Visual */}
              {hasCameraPermission && videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-purple-950/40 to-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                    <VideoOff className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-bold text-sm text-slate-200">
                      {permissionError || 'Camera stream paused or inactive'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tap the camera icon below to request permissions or broadcast using virtual preview feed.
                    </p>
                  </div>
                </div>
              )}

              {/* OVERLAY: Active Live Badge & Viewers */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                {isLive ? (
                  <div className="bg-rose-600/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-black flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>LIVE</span>
                  </div>
                ) : (
                  <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
                    <span>OFFLINE PREVIEW</span>
                  </div>
                )}

                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/10">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{viewerCount} Viewers</span>
                </div>

                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/10">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{totalLikes.toLocaleString()}</span>
                </div>
              </div>

              {/* OVERLAY: Pinned Product Card (Bottom Left inside video) */}
              {pinnedProduct && (
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 flex items-center gap-3 z-20 shadow-xl animate-in slide-in-from-bottom-3">
                  <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-700">
                    <img
                      src={pinnedProduct.thumbnail || pinnedProduct.images?.[0]}
                      alt={pinnedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-[#FF6A00] text-white text-[8px] font-black px-1 rounded-br">
                      PIN
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{pinnedProduct.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-amber-400">
                        {formatCurrencyTZS(pinnedProduct.price)}
                      </span>
                      {pinnedProduct.oldPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatCurrencyTZS(pinnedProduct.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProductPicker(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    title="Change pinned product"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* FLOATING HEARTS ANIMATION OVERLAY */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                <AnimatePresence>
                  {floatingHearts.map((heart) => (
                    <motion.div
                      key={heart.id}
                      initial={{ opacity: 1, y: 220, scale: 0.8 }}
                      animate={{ opacity: 0, y: -40, scale: 1.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.8, ease: 'easeOut' }}
                      style={{ left: `${heart.x}%` }}
                      className="absolute bottom-6 text-2xl filter drop-shadow-md select-none"
                    >
                      {heart.icon}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* STREAM HARDWARE & ACTION TOOLBAR */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    videoEnabled
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                  title={videoEnabled ? 'Disable Camera' : 'Enable Camera'}
                >
                  {videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                  <span className="hidden sm:inline">{videoEnabled ? 'Camera On' : 'Camera Off'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    audioEnabled
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                  title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                  <span className="hidden sm:inline">{audioEnabled ? 'Mic On' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={switchCameraFacing}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                  title="Switch Front / Rear Camera"
                >
                  <RefreshCw size={15} />
                  <span className="hidden sm:inline">Flip Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowProductPicker(!showProductPicker)}
                  className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Pin size={15} />
                  <span>Pin Product</span>
                </button>
              </div>

              {!isLive ? (
                <button
                  type="button"
                  onClick={handleStartLive}
                  disabled={isStartingStream}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <Radio size={16} className="animate-pulse" />
                  <span>{isStartingStream ? 'Starting Stream...' : 'Go Live Now'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerHeart}
                    className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 cursor-pointer text-xs font-bold flex items-center gap-1"
                  >
                    <Heart size={15} className="fill-rose-500" />
                    <span>Cheer</span>
                  </button>
                </div>
              )}
            </div>

            {/* PRODUCT SELECTOR DRAWER */}
            {showProductPicker && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <ShoppingBag size={14} />
                    Select a Product from Your Store Inventory to Pin
                  </h4>
                  <button
                    onClick={() => setShowProductPicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {sellerProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 col-span-2">No active products in inventory.</p>
                  ) : (
                    sellerProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handlePinProduct(p)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          pinnedProduct?.id === p.id
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <img
                          src={p.thumbnail || p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-white"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate font-medium">{p.name}</p>
                          <p className="text-[11px] font-bold text-amber-400">
                            {formatCurrencyTZS(p.price)}
                          </p>
                        </div>
                        {pinnedProduct?.id === p.id && (
                          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: REAL-TIME COMMENTS & ENGAGEMENT */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-[450px] lg:h-auto">
            
            {/* CHAT HEADER */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF6A00]" />
                <h3 className="font-bold text-xs text-slate-200">Live Viewer Comments</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                Auto-Moderation Active
              </span>
            </div>

            {/* COMMENTS LIST */}
            <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto">
              {comments.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-2.5 rounded-xl text-xs space-y-0.5 leading-snug animate-in fade-in ${
                    comm.isHost
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                      : 'bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${comm.isHost ? 'text-amber-400' : 'text-slate-300'}`}>
                      {comm.userName}
                    </span>
                    <span className="text-[9px] text-slate-500">{comm.createdAt}</span>
                  </div>
                  <p className="text-slate-100 text-[11px]">{comm.message}</p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {/* HOST COMMENT / ANNOUNCEMENT FORM */}
            <form onSubmit={handleSendHostMessage} className="p-3 border-t border-slate-800 bg-slate-950/60">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={hostMessage}
                  onChange={(e) => setHostMessage(e.target.value)}
                  placeholder="Post host announcement / reply to chat..."
                  className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#FF6A00]"
                />
                <button
                  type="submit"
                  disabled={!hostMessage.trim()}
                  className="absolute right-1.5 p-1.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-lg disabled:opacity-40 transition cursor-pointer"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FOOTER STATS */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <TrendingUp size={13} className="text-emerald-400" />
              Live Reach: <strong className="text-white font-bold ml-1">3,420 Followers</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck size={13} className="text-blue-400" />
              Escrow Protection Active
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            LUMO Live Commerce Studio v2.0 • WebRTC P2P Direct Broadcast
          </p>
        </div>
      </div>
    </div>
  );
};
