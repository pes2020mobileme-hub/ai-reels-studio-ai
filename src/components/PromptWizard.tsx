import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Clock,
  Layers,
  Palette,
  Volume2,
  TrendingUp,
  Brain,
  UtensilsCrossed,
  Coins,
  Smile,
  Sliders,
  RefreshCw,
  Flame,
} from 'lucide-react';
import {
  TEMPLATE_PROMPTS,
  VISUAL_STYLES,
  SUBTITLE_STYLES,
  SubtitleStyle,
} from '../types/reel';

interface PromptWizardProps {
  onGenerate: (config: {
    topic: string;
    tone: string;
    duration: string;
    visualStyle: string;
    targetAudience: string;
    sceneCount: number;
    subtitleStyleId: string;
    soundVibe: string;
  }) => void;
  isLoading: boolean;
  selectedSubtitleStyle: SubtitleStyle;
  onSelectSubtitleStyle: (style: SubtitleStyle) => void;
}

export const PromptWizard: React.FC<PromptWizardProps> = ({
  onGenerate,
  isLoading,
  selectedSubtitleStyle,
  onSelectSubtitleStyle,
}) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('ตื่นเต้น ไวรัล (Viral & Energetic)');
  const [duration, setDuration] = useState('30');
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0].promptStyle);
  const [targetAudience, setTargetAudience] = useState('ผู้ประกอบการรุ่นใหม่ และคอนเทนต์ครีเอเตอร์');
  const [soundVibe, setSoundVibe] = useState('upbeat_electronic');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const handleSelectTemplate = (template: typeof TEMPLATE_PROMPTS[0]) => {
    setSelectedTemplateId(template.id);
    setTopic(template.topic);
    setTone(template.tone);
    setDuration(template.duration);
    setVisualStyle(template.visualStyle);
    setSoundVibe(template.soundVibe);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    const sceneCount = duration === '15' ? 3 : duration === '30' ? 4 : 6;

    onGenerate({
      topic,
      tone,
      duration,
      visualStyle,
      targetAudience,
      sceneCount,
      subtitleStyleId: selectedSubtitleStyle.id,
      soundVibe,
    });
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Brain':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-4 h-4 text-amber-400" />;
      case 'Coins':
        return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold rounded-full mb-2">
            <Flame className="w-3.5 h-3.5 text-pink-500" />
            AI Reels Studio • รองรับ TikTok / IG Reels / Shorts
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            สร้างคลิป Reels ด้วย <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">AI อัตโนมัติ</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            ใส่หัวข้อที่ต้องการ AI จะเขียนสคริปต์ ออกแบบฉาก คำบรรยาย และเสียงพากย์ทันที
          </p>
        </div>
      </div>

      {/* Preset Quick Templates */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          เลือกเทมเพลตไวรัลยอดนิยม (คลิกเดียวเริ่มได้เลย)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {TEMPLATE_PROMPTS.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-pink-950/40 border-pink-500/80 shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-1 ring-pink-500'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-900 border border-white/5 shrink-0">
                  {getTemplateIcon(tmpl.icon)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] font-extrabold text-pink-400">
                      ★ {tmpl.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{tmpl.title}</h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Topic Input */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>💡 หัวข้อคลิป หรือ ไอเดียคอนเทนต์</span>
            <span className="text-slate-500 text-[11px] font-normal">
              ระบุให้เฉพาะเจาะจงเพื่อผลลัพธ์ที่ดีที่สุด
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setSelectedTemplateId('');
              }}
              placeholder="เช่น: 3 เทคนิคสร้างผู้ติดตาม TikTok จาก 0 สู่ 1 แสนคน ใน 30 วัน..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Quick Idea Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              '🔥 3 ข้อห้ามทำก่อนนอนถ้าไม่อยากตื่นมาเพลีย',
              '📈 เคล็ดลับปิดการขายในแชทให้ลูกค้ารีบโอน',
              '🤖 แนะนำ 3 เว็บ AI ช่วยทำงานฟรีที่ต้องเซฟไว้',
              '☕ สูตรชงกาแฟ Dirty ดื่มเองที่บ้านเหมือนคาเฟ่',
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(chip);
                  setSelectedTemplateId('');
                }}
                className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Options Grid: Tone & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tone */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-pink-400" />
              โทนอารมณ์คลิป
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="ตื่นเต้น ไวรัล (Viral & Energetic)">🔥 ตื่นเต้น ไวรัล (Viral & Energetic)</option>
              <option value="เล่าเรื่องน่าติดตาม (Storytelling)">📖 เล่าเรื่องน่าติดตาม (Storytelling)</option>
              <option value="มีสาระ ได้ความรู้ (Informative / Tutorial)">💡 มีสาระ ได้ความรู้ (Informative / Tutorial)</option>
              <option value="เป็นกันเอง สนุกสนาน (Humorous/Casual)">😄 เป็นกันเอง สนุกสนาน (Humorous/Casual)</option>
              <option value="หรูหรา สร้างแรงบันดาลใจ (Inspirational / Luxury)">✨ หรูหรา สร้างแรงบันดาลใจ (Luxury)</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              ความยาวคลิป
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: '15', label: '15 วินาที', desc: 'ฮุคไว 3 ฉาก' },
                { value: '30', label: '30 วินาที', desc: 'มาตรฐาน 4 ฉาก' },
                { value: '60', label: '60 วินาที', desc: 'เจาะลึก 6 ฉาก' },
              ].map((dur) => (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => setDuration(dur.value)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    duration === dur.value
                      ? 'bg-pink-600 border-pink-500 text-white font-bold shadow-md shadow-pink-600/30'
                      : 'bg-slate-950/70 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{dur.label}</div>
                  <div className="text-[10px] opacity-75">{dur.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Style Selection */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            สไตล์ภาพกราฟิก AI (สำหรับฉากวิดีโอ 9:16)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {VISUAL_STYLES.map((style) => {
              const isSelected = visualStyle === style.promptStyle;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setVisualStyle(style.promptStyle)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`h-10 rounded-lg bg-gradient-to-br ${style.previewGradient} mb-2 shadow-inner flex items-center justify-center`}
                  >
                    <span className="text-[10px] font-black text-white/90 drop-shadow">9:16</span>
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">{style.name}</div>
                  <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{style.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subtitle Style Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-yellow-400" />
            สไตล์ซับไตเติลไวรัล (Subtitles / Captions)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SUBTITLE_STYLES.map((st) => {
              const isSelected = selectedSubtitleStyle.id === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectSubtitleStyle(st)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-yellow-950/30 border-yellow-500/80 shadow-md ring-1 ring-yellow-500'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{st.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{st.description}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${st.badgeClass}`}>
                    ตัวอย่าง
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Music Vibe */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            ดนตรีประกอบ (สังเคราะห์แบบ Royalty-Free ไม่มีปัญหาลิขสิทธิ์)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'upbeat_electronic', label: '⚡ Upbeat EDM', desc: 'จังหวะเร็ว ตื่นเต้น ไวรัล' },
              { id: 'lofi_chill', label: '☕ Lo-Fi Chill', desc: 'นุ่มนวล สบาย ผ่อนคลาย' },
              { id: 'dramatic_suspense', label: '🎬 Dramatic Suspense', desc: 'ลุ้นระทึก น่าติดตาม' },
              { id: 'ambient_tech', label: '🚀 Ambient Tech', desc: 'ล้ำสมัย สไตล์เทค' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSoundVibe(v.id)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  soundVibe === v.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 ring-1 ring-teal-500 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs text-white font-bold">{v.label}</div>
                <div className="text-[10px] text-slate-400">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              isLoading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:via-rose-500 hover:to-amber-400 text-white shadow-pink-600/30 hover:shadow-pink-600/50 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                <span>AI กำลังเขียนสคริปต์ & สร้างคลิป Reels...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white" />
                <span>สร้างคลิป Reels ด้วย AI ทันที</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
