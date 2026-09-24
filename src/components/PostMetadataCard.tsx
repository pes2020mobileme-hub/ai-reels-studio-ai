import React, { useState } from 'react';
import {
  Copy,
  Check,
  Hash,
  FileText,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { ReelProject } from '../types/reel';

interface PostMetadataCardProps {
  project: ReelProject | null;
  onGoToWizard?: () => void;
}

export const PostMetadataCard: React.FC<PostMetadataCardProps> = ({ project, onGoToWizard }) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!project) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-pink-500/20 text-pink-400 mx-auto flex items-center justify-center mb-4 border border-pink-500/30">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีแคปชั่นและแฮชแท็ก</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
          เมื่อคุณสร้างคลิป Reels ด้วย AI แคปชั่นติดเทรนด์และแฮชแท็กไวรัลจะถูกสร้างให้อัตโนมัติที่นี่
        </p>
        {onGoToWizard && (
          <button
            onClick={onGoToWizard}
            className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-600/30 transition-all cursor-pointer"
          >
            ไปยังหน้าสร้างคลิป (AI Wizard)
          </button>
        )}
      </div>
    );
  }

  const fullPostText = `${project.title} 🚀\n\n${project.hookSentence}\n\n${project.postCaption}\n\n${project.callToAction}\n\n${project.hashtags?.join(' ') || ''}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(project.postCaption || '');
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(project.hashtags?.join(' ') || '');
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullPostText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadScript = () => {
    let scriptContent = `# สคริปต์คลิป Reels: ${project.title}\n\n`;
    scriptContent += `> โทนอารมณ์: ${project.tone} | ความยาวโดยประมาณ: ${project.estimatedDuration} วินาที\n\n`;
    scriptContent += `## ประโยคฮุค 3 วินาทีแรก\n${project.hookSentence}\n\n`;
    scriptContent += `## ลำดับฉาก (Storyboard)\n`;

    project.scenes.forEach((scene, i) => {
      scriptContent += `\n### ฉากที่ ${scene.sceneNumber || i + 1}: ${scene.title} (${scene.durationSeconds} วินาที)\n`;
      scriptContent += `- **คำอธิบายภาพ:** ${scene.visualDescription}\n`;
      scriptContent += `- **Visual Prompt (AI):** ${scene.visualPrompt}\n`;
      scriptContent += `- **บทพากย์:** "${scene.narrationThai}"\n`;
      scriptContent += `- **ซับไตเติลหน้าจอ:** "${scene.captionText}"\n`;
      scriptContent += `- **คำที่เน้น:** ${scene.highlightWords?.join(', ') || '-'}\n`;
      scriptContent += `- **มุมกล้อง:** ${scene.cameraMotion}\n`;
    });

    scriptContent += `\n## แคปชั่นสำหรับโพสต์\n${project.postCaption}\n\n`;
    scriptContent += `## แฮชแท็ก\n${project.hashtags?.join(' ') || ''}\n`;

    const blob = new Blob([scriptContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reel-script-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            ข้อมูลพร้อมโพสต์ (IG Reels / TikTok / Shorts)
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            แคปชั่น แฮชแท็กติดเทรนด์ และช่วงเวลาลงคลิปที่แนะนำ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            ดาวน์โหลดสคริปต์ (.md)
          </button>
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 transition-colors"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                คัดลอกทั้งหมดแล้ว!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                คัดลอกโพสต์ทั้งหมด
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Caption */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-pink-400" />
                แคปชั่นโพสต์ (Post Caption)
              </span>
              <button
                onClick={handleCopyCaption}
                className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copiedCaption ? 'คัดลอกแล้ว' : 'คัดลอกแคปชั่น'}
              </button>
            </div>
            <div className="bg-slate-900/90 border border-white/5 rounded-xl p-3.5 text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto font-sans">
              {project.postCaption || 'ยังไม่มีแคปชั่น'}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CTA ชวนคุย: {project.callToAction}</span>
          </div>
        </div>

        {/* Right: Hashtags & Posting Tips */}
        <div className="space-y-4">
          {/* Hashtags */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                แฮชแท็กติดเทรนด์ ({project.hashtags?.length || 0} แท็ก)
              </span>
              <button
                onClick={handleCopyHashtags}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                {copiedHashtags ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copiedHashtags ? 'คัดลอกแล้ว' : 'คัดลอกแท็ก'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.hashtags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-sky-950/40 text-sky-300 border border-sky-500/20 text-xs rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Posting Tips for Thailand */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-bold">
              <Clock className="w-4 h-4 text-indigo-400" />
              ช่วงเวลาลงคลิป Reels / TikTok แนะนำในไทย
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-white font-bold">☀️ กลางวัน (11:30 - 13:30)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ช่วงพักเที่ยง คนเปิดดูคลิปสั้นเยอะ</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-white font-bold">🌙 ช่วงค่ำ (18:30 - 21:30)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ช่วง Golden Time ยอดวิวพุ่งสูงสุด</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
