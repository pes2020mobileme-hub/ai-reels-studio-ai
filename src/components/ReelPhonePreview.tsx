import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Music,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Check,
  Flame,
} from 'lucide-react';
import { ReelProject, SubtitleStyle } from '../types/reel';
import { audioSynth } from '../utils/audioSynth';
import { speechEngine } from '../utils/speechEngine';

interface ReelPhonePreviewProps {
  project: ReelProject | null;
  currentSceneIndex: number;
  onSceneChange: (index: number) => void;
  subtitleStyle: SubtitleStyle;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenExportModal: () => void;
}

export const ReelPhonePreview: React.FC<ReelPhonePreviewProps> = ({
  project,
  currentSceneIndex,
  onSceneChange,
  subtitleStyle,
  isPlaying,
  onTogglePlay,
  onOpenExportModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isCopiedShare, setIsCopiedShare] = useState(false);
  const [userComments, setUserComments] = useState<{ id: string; user: string; text: string; time: string }[]>([]);
  const [newCommentInput, setNewCommentInput] = useState('');

  const sceneProgressIntervalRef = useRef<any>(null);
  const currentScene = project?.scenes?.[currentSceneIndex] || project?.scenes?.[0];

  // Playback coordination
  useEffect(() => {
    if (!isPlaying || !project || !currentScene) {
      audioSynth.stop();
      speechEngine.stop();
      if (sceneProgressIntervalRef.current) {
        clearInterval(sceneProgressIntervalRef.current);
      }
      return;
    }

    // Play Background Synth
    audioSynth.play(project.soundVibe || 'upbeat_electronic');

    // Reset progress
    setSceneProgress(0);
    const duration = (currentScene.durationSeconds || 5) * 1000;
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    sceneProgressIntervalRef.current = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          clearInterval(sceneProgressIntervalRef.current);
          // Advance to next scene or loop
          if (currentSceneIndex < project.scenes.length - 1) {
            onSceneChange(currentSceneIndex + 1);
          } else {
            onSceneChange(0);
          }
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    // Speak Thai narration
    if (!isMuted && currentScene?.narrationThai) {
      speechEngine.speak(currentScene.narrationThai);
    }

    return () => {
      if (sceneProgressIntervalRef.current) {
        clearInterval(sceneProgressIntervalRef.current);
      }
    };
  }, [isPlaying, currentSceneIndex, currentScene, isMuted, project]);

  // Handle Mute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechEngine.setMuted(nextMuted);
    if (nextMuted) {
      audioSynth.setVolume(0);
    } else {
      audioSynth.setVolume(0.2);
    }
  };

  // Handle Like (Real toggle)
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    if (nextLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;
    setUserComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        user: '@คุณ',
        text: newCommentInput.trim(),
        time: 'เมื่อสักครู่',
      },
    ]);
    setNewCommentInput('');
  };

  const handleNextScene = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project || !project.scenes.length) return;
    if (currentSceneIndex < project.scenes.length - 1) {
      onSceneChange(currentSceneIndex + 1);
    } else {
      onSceneChange(0);
    }
  };

  const handlePrevScene = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project || !project.scenes.length) return;
    if (currentSceneIndex > 0) {
      onSceneChange(currentSceneIndex - 1);
    } else {
      onSceneChange(project.scenes.length - 1);
    }
  };

  // Camera Motion Animation class
  const getCameraMotionClass = () => {
    const motion = currentScene?.cameraMotion || 'zoom-in';
    switch (motion) {
      case 'zoom-out':
        return 'scale-100 group-hover:scale-105 transition-transform duration-5000 ease-out';
      case 'pan-left':
        return '-translate-x-3 transition-transform duration-5000 ease-linear';
      case 'pan-right':
        return 'translate-x-3 transition-transform duration-5000 ease-linear';
      case 'zoom-in':
      default:
        return 'scale-110 transition-transform duration-5000 ease-out';
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Phone Hardware Mockup Outer Frame */}
      <div className="relative w-[340px] sm:w-[380px] h-[690px] sm:h-[750px] bg-slate-900 rounded-[50px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_20px_rgba(244,63,94,0.15)] border-4 border-slate-700/80 ring-1 ring-white/10">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-3 border border-white/5 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          <div className="w-3 h-3 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
          </div>
        </div>

        {/* Screen Display Area (9:16 Aspect Ratio) */}
        <div
          onClick={onTogglePlay}
          className="relative w-full h-full bg-black rounded-[38px] overflow-hidden flex flex-col justify-between cursor-pointer group shadow-2xl"
        >
          {/* Background Visual Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
            {!project ? (
              // Standby Studio Screen when no project is generated yet
              <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden">
                {/* Viewfinder 9:16 Grid */}
                <div className="absolute inset-4 border border-dashed border-white/15 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-pink-400">
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                      9:16 VERTICAL
                    </span>
                    <span>STANDBY</span>
                  </div>
                  <div className="self-center w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>AI REELS STUDIO</span>
                    <span>1080x1920</span>
                  </div>
                </div>

                {/* Ambient glowing orbs */}
                <div className="absolute top-1/4 -right-12 w-48 h-48 bg-pink-600/15 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -left-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl"></div>

                {/* Central Standby Card */}
                <div className="my-auto relative z-10 text-center px-2">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-violet-600 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-pink-500/25 border border-white/20">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-white font-black text-lg mb-2 tracking-tight">
                    สตูดิโอสร้างคลิป AI 9:16
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-[240px] mx-auto mb-4">
                    พิมพ์หัวข้อที่คุณต้องการ หรือเลือกเทมเพลตทางซ้าย แล้วกดสร้างคลิปทันที
                  </p>
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-pink-300 font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30">
                      ⚡ โมเดลฟรีความเร็วสูง
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                      🖼️ ภาพสมจริง 9:16
                    </span>
                  </div>
                </div>

                {/* Bottom Standby Info */}
                <div className="relative z-10 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    กดปุ่ม <span className="text-pink-400 font-bold">"สร้างคลิป Reels ด้วย AI"</span> เพื่อเริ่มต้น
                  </span>
                </div>
              </div>
            ) : currentScene?.imageUrl ? (
              <img
                src={currentScene.imageUrl}
                alt={currentScene.title}
                className={`w-full h-full object-cover origin-center ${getCameraMotionClass()}`}
              />
            ) : (
              // Generative Dynamic Studio Canvas
              <div
                className={`w-full h-full bg-gradient-to-b ${
                  (currentScene?.sceneNumber || 1) % 2 === 0
                    ? 'from-indigo-950 via-slate-900 to-purple-950'
                    : 'from-slate-950 via-rose-950/40 to-slate-950'
                } relative flex flex-col items-center justify-center p-6 text-center overflow-hidden`}
              >
                {/* Glowing ambient lights */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                {/* Generative Scene Graphic Card */}
                <div className="relative z-10 w-full max-w-[280px] bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-semibold rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ฉากที่ {currentScene?.sceneNumber}
                  </div>
                  <h4 className="text-white font-bold text-base mb-2 line-clamp-2">
                    {currentScene?.title}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-4">
                    {currentScene?.visualDescription}
                  </p>
                  <div className="text-[11px] text-pink-400 font-mono bg-pink-950/40 border border-pink-500/20 px-2 py-1 rounded">
                    🎬 {currentScene?.cameraMotion} • {currentScene?.durationSeconds}s
                  </div>
                </div>

                <div className="absolute bottom-28 text-center px-4">
                  <span className="text-[11px] text-slate-400 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5">
                    💡 กำลังประมวลผลภาพ AI 9:16...
                  </span>
                </div>
              </div>
            )}

            {/* Dark Cinematic Gradient Vignette for readability */}
            {project && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none"></div>
            )}
          </div>

          {/* Double Click Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-ping">
              <Heart className="w-24 h-24 fill-pink-500 text-pink-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
            </div>
          )}

          {/* Top Story / Reels Scene Segments Indicator */}
          {project && project.scenes && (
            <div className="relative z-20 pt-8 px-3 flex gap-1.5">
              {project.scenes.map((scene, idx) => {
                const isPassed = idx < currentSceneIndex;
                const isCurrent = idx === currentSceneIndex;
                return (
                  <div
                    key={scene.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSceneChange(idx);
                    }}
                    className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden cursor-pointer hover:bg-white/40 transition-colors"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width: isPassed ? '100%' : isCurrent ? `${sceneProgress}%` : '0%',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Header Overlay */}
          {project && (
            <div className="relative z-20 px-4 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                <span className="text-[12px] font-bold text-white tracking-wide">Reels</span>
                <span className="text-[11px] text-pink-300 font-medium">
                  {currentSceneIndex + 1}/{project.scenes.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleMute}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
                  title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Center Play/Pause Indicator */}
          {project && !isPlaying && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-pulse">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Main Animated Subtitles Overlay */}
          {project && currentScene?.captionText && (
            <div className="relative z-20 px-5 mb-auto mt-auto text-center pointer-events-none">
              <div className="inline-block max-w-full">
                <div
                  className={`px-4 py-2.5 rounded-2xl shadow-2xl inline-block transition-transform duration-300 ${
                    subtitleStyle.id === 'hormozi'
                      ? 'bg-black/85 border-2 border-yellow-400'
                      : subtitleStyle.id === 'gradient'
                      ? 'bg-slate-950/85 border-2 border-pink-500'
                      : subtitleStyle.id === 'neon'
                      ? 'bg-black/90 border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                      : 'bg-black/60 backdrop-blur-md border border-white/20'
                  }`}
                >
                  <p
                    className="text-xl sm:text-2xl font-black tracking-tight leading-snug"
                    style={{
                      color: subtitleStyle.textColor,
                      WebkitTextStroke: `1.5px ${subtitleStyle.strokeColor || '#000'}`,
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    }}
                  >
                    {currentScene.captionText.split(' ').map((word, wIdx) => {
                      const isHighlighted = currentScene.highlightWords?.some((hw) =>
                        word.toLowerCase().includes(hw.toLowerCase())
                      );
                      return (
                        <span
                          key={wIdx}
                          className={`inline-block mx-1 transition-all ${
                            isHighlighted ? 'scale-110 font-black' : ''
                          }`}
                          style={{
                            color: isHighlighted
                              ? subtitleStyle.highlightColor
                              : subtitleStyle.textColor,
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Right Action Bar (Instagram Reels Style) */}
          {project && (
            <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4">
              {/* Like */}
              <button
                onClick={handleLike}
                className="flex flex-col items-center gap-1 group/btn"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-75 ${
                    isLiked ? 'text-pink-500' : 'text-white'
                  }`}
                >
                  <Heart
                    className={`w-7 h-7 drop-shadow-md ${
                      isLiked ? 'fill-pink-500 text-pink-500 animate-bounce' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {isLiked ? 1 : 0}
                </span>
              </button>

              {/* Comment */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-75 transition-transform">
                  <MessageCircle className="w-7 h-7 drop-shadow-md" />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {userComments.length}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText(window.location.href);
                  setIsCopiedShare(true);
                  setTimeout(() => setIsCopiedShare(false), 2000);
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-75 transition-transform">
                  {isCopiedShare ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <Share2 className="w-7 h-7 drop-shadow-md" />
                  )}
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {isCopiedShare ? 'คัดลอก' : 'แชร์'}
                </span>
              </button>

              {/* Spinning Music Disc */}
              <div className="w-10 h-10 rounded-full border-2 border-white/60 p-0.5 overflow-hidden shadow-lg mt-1">
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '4s' }}
                >
                  <div className="w-3 h-3 rounded-full bg-black border border-white"></div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Left Post Info Overlay */}
          {project && (
            <div className="relative z-20 p-4 pb-6 max-w-[78%]">
              {/* Creator Profile Badge */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-black text-white">
                    AI
                  </div>
                </div>
                <span className="text-xs font-bold text-white tracking-tight drop-shadow">
                  @AIReelsCreator
                </span>
              </div>

              {/* Caption & Hook */}
              <div className="text-white text-xs leading-snug drop-shadow-md">
                <p className="font-semibold mb-1 line-clamp-2">
                  {project.hookSentence || project.title}
                </p>

                {showFullCaption && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-slate-200 mt-2 p-2 bg-black/75 rounded-lg border border-white/10 max-h-36 overflow-y-auto"
                  >
                    <p className="whitespace-pre-line mb-2">{project.postCaption}</p>
                    <div className="flex flex-wrap gap-1 text-[10px] text-sky-400">
                      {project.hashtags?.map((tag, tIdx) => (
                        <span key={tIdx}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullCaption(!showFullCaption);
                  }}
                  className="text-[11px] text-slate-300 font-medium hover:underline inline-block mt-0.5"
                >
                  {showFullCaption ? 'ย่อลง' : '...ดูเพิ่มเติม'}
                </button>
              </div>

              {/* Audio Track Tag */}
              <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-white/90">
                <Music className="w-3 h-3 animate-pulse text-pink-400" />
                <div className="overflow-hidden whitespace-nowrap w-36">
                  <span className="inline-block animate-marquee">
                    เสียงต้นฉบับ - {project.soundVibe || 'AI Viral Synth'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Comments Drawer */}
          {showComments && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 top-36 z-40 bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-300"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">ความคิดเห็น ({userComments.length})</h4>
                </div>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ปิด
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {userComments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    ยังไม่มีความคิดเห็น พิมพ์ข้อความด้านล่างเพื่อแสดงความคิดเห็น
                  </div>
                ) : (
                  userComments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-pink-500/30 text-pink-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {c.user.slice(1, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-300">{c.user}</span>
                          <span className="text-[10px] text-slate-500">{c.time}</span>
                        </div>
                        <p className="text-xs text-white mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentInput}
                  onChange={(e) => setNewCommentInput(e.target.value)}
                  placeholder="พิมพ์ความคิดเห็นของคุณ..."
                  className="flex-1 bg-slate-800/80 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentInput.trim()}
                  className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-colors"
                >
                  ส่ง
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* External Player Control Toolbar */}
      <div className="w-full max-w-[380px] mt-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevScene}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="ฉากก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                พัก
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white ml-0.5" />
                เล่น
              </>
            )}
          </button>
          <button
            onClick={handleNextScene}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="ฉากถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Flame className="w-4 h-4" />
          ส่งออกวิดีโอ 9:16
        </button>
      </div>
    </div>
  );
};
