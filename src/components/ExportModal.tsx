import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Film,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Video,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReelProject, SubtitleStyle } from '../types/reel';
import { exportReelToVideo, RenderProgress } from '../utils/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ReelProject | null;
  subtitleStyle: SubtitleStyle;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  subtitleStyle,
}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState<RenderProgress>({
    percentage: 0,
    currentScene: 1,
    totalScenes: project?.scenes?.length || 1,
    statusText: 'พร้อมเรนเดอร์',
  });
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger export when modal opens
  const handleStartRender = async () => {
    if (!project) return;
    try {
      setIsRendering(true);
      setErrorMsg(null);
      setVideoBlobUrl(null);
      setProgress({
        percentage: 0,
        currentScene: 1,
        totalScenes: project.scenes.length,
        statusText: 'กำลังเริ่มกระบวนการเรนเดอร์เฟรม...',
      });

      const blob = await exportReelToVideo(project, subtitleStyle, (p) => {
        setProgress(p);
      });

      const url = URL.createObjectURL(blob);
      setVideoBlobUrl(url);
      setIsRendering(false);
      setProgress({
        percentage: 100,
        currentScene: project.scenes.length,
        totalScenes: project.scenes.length,
        statusText: 'เรนเดอร์วิดีโอ 9:16 สำเร็จแล้ว!',
      });

      // Fire confetti burst!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Rendering error:', err);
      setIsRendering(false);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเรนเดอร์วิดีโอ');
    }
  };

  useEffect(() => {
    if (isOpen && !videoBlobUrl && !isRendering) {
      handleStartRender();
    }
    return () => {
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Film className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-white">เรนเดอร์ & ดาวน์โหลดวิดีโอ 9:16</h3>
            <p className="text-xs text-slate-400">
              ขนาดแนวตั้ง 720x1280 (HD Vertical) พร้อมซับไตเติลและดนตรี
            </p>
          </div>
        </div>

        {/* Status & Progress */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-5 text-center">
          {isRendering ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-pink-500 animate-spin" />
                <span className="absolute text-[11px] font-black text-white">
                  {progress.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="text-xs font-semibold text-slate-300">
                {progress.statusText}
              </div>
              <p className="text-[11px] text-slate-500">
                ระบบกำลังวาดแอนิเมชัน Ken Burns, เรนเดอร์ข้อความซับไตเติล และบันทึกเสียงดนตรี...
              </p>
            </div>
          ) : videoBlobUrl ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-bold text-white">วิดีโอสร้างเสร็จสมบูรณ์แล้ว!</h4>
              <p className="text-xs text-slate-400">
                พร้อมนำไปอัปโหลดลง Instagram Reels, Facebook Reels, TikTok หรือ YouTube Shorts
              </p>

              {/* Video Preview Player */}
              <div className="w-44 h-72 mx-auto rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-lg">
                <video
                  src={videoBlobUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="pt-2">
                <a
                  href={videoBlobUrl}
                  download={`reel-${Date.now()}.webm`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  บันทึกวิดีโอลงเครื่อง (.webm / 9:16)
                </a>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="space-y-3 py-2 text-rose-400">
              <AlertCircle className="w-10 h-10 mx-auto" />
              <p className="text-xs font-semibold">{errorMsg}</p>
              <button
                onClick={handleStartRender}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span>ความยาว: ~{project?.estimatedDuration || 30} วินาที</span>
          <span>อัตราส่วน: 9:16 แนวตั้ง</span>
        </div>
      </div>
    </div>
  );
};
