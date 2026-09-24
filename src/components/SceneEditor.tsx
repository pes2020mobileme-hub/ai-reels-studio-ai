import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Volume2,
  Clock,
  Video,
  Image as ImageIcon,
  Edit3,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Move,
} from 'lucide-react';
import { Scene, ReelProject } from '../types/reel';
import { speechEngine } from '../utils/speechEngine';

interface SceneEditorProps {
  project: ReelProject | null;
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (sceneIndex: number, updatedScene: Partial<Scene>) => void;
  onGenerateSceneImage: (sceneIndex: number) => Promise<void>;
  visualStyle: string;
  onGoToWizard?: () => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  project,
  currentSceneIndex,
  onSelectScene,
  onUpdateScene,
  onGenerateSceneImage,
  visualStyle,
  onGoToWizard,
}) => {
  const [playingSceneIdx, setPlayingSceneIdx] = useState<number | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  if (!project || !project.scenes || project.scenes.length === 0) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-pink-500/20 text-pink-400 mx-auto flex items-center justify-center mb-4 border border-pink-500/30">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">ยังไม่มีโปรเจกต์คลิปในสตอรี่บอร์ด</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
          คุณสามารถระบุหัวข้อคลิปที่ต้องการใน AI Wizard เพื่อให้ AI สร้างสคริปต์ ฉาก และภาพ 9:16 ได้ทันที
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

  // Play audio preview for single scene
  const handlePlaySceneAudio = (index: number, text: string) => {
    setPlayingSceneIdx(index);
    speechEngine.speak(text, {
      onEnd: () => setPlayingSceneIdx(null),
    });
  };

  // Generate all scene images sequentially
  const handleGenerateAllImages = async () => {
    if (isBulkGenerating) return;
    setIsBulkGenerating(true);
    for (let i = 0; i < project.scenes.length; i++) {
      if (!project.scenes[i].imageUrl) {
        await onGenerateSceneImage(i);
      }
    }
    setIsBulkGenerating(false);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              🎬 สตอรี่บอร์ด & ฉากทั้งหมด ({project.scenes.length} ฉาก)
            </h3>
            <span className="text-xs bg-slate-800 text-pink-400 font-bold px-2.5 py-1 rounded-full border border-slate-700">
              รวม ~{project.estimatedDuration || 30} วินาที
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            ปรับแต่งบทพากย์ ซับไตเติล เวลา และกดสร้างภาพ AI 9:16 ได้ทีละฉาก
          </p>
        </div>

        <button
          onClick={handleGenerateAllImages}
          disabled={isBulkGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all self-start sm:self-auto cursor-pointer"
        >
          {isBulkGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              กำลังสร้างภาพ AI ทุกฉาก...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              สร้างภาพ AI ทุกฉากอัตโนมัติ
            </>
          )}
        </button>
      </div>

      {/* Scenes List */}
      <div className="space-y-4">
        {project.scenes.map((scene, idx) => {
          const isSelected = idx === currentSceneIndex;
          const isAudioPlaying = playingSceneIdx === idx;

          return (
            <div
              key={scene.id || idx}
              onClick={() => onSelectScene(idx)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-pink-500/80 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-pink-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-4 items-start">
                {/* Left: 9:16 Visual Thumbnail & AI Generator Button */}
                <div className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 group flex flex-col justify-between p-2 shadow-lg">
                  {scene.imageUrl ? (
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-2 text-center">
                      <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-[10px] text-slate-400 font-medium">ไม่มีภาพ</span>
                    </div>
                  )}

                  {/* Gradient shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

                  {/* Scene Number Badge */}
                  <div className="relative z-10 self-start">
                    <span className="px-2 py-0.5 rounded-md bg-pink-600/90 text-white font-black text-[10px] shadow">
                      ฉาก {scene.sceneNumber || idx + 1}
                    </span>
                  </div>

                  {/* Generate / Regenerate AI Image Button */}
                  <div className="relative z-10 w-full">
                    <button
                      type="button"
                      disabled={scene.isGeneratingImage}
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateSceneImage(idx);
                      }}
                      className="w-full py-1.5 px-1 rounded-lg bg-black/75 hover:bg-pink-600/90 text-white text-[10px] font-bold backdrop-blur-md border border-white/20 flex items-center justify-center gap-1 transition-all shadow"
                    >
                      {scene.isGeneratingImage ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-pink-300" />
                          <span>สร้างภาพ...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-pink-400" />
                          <span>{scene.imageUrl ? 'เปลี่ยนภาพ AI' : 'สร้างภาพ 9:16'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Scene Details & Content Editors */}
                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {scene.title || `ฉากที่ ${idx + 1}`}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                          🔥 ช่วงเปิดฮุค 3 วิแรก
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audio Narration Test */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySceneAudio(idx, scene.narrationThai);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          isAudioPlaying
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="ฟังเสียงพากย์"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isAudioPlaying ? 'กำลังอ่าน...' : 'ฟังเสียง'}</span>
                      </button>

                      {/* Duration */}
                      <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={scene.durationSeconds || 5}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 5;
                            onUpdateScene(idx, { durationSeconds: val });
                          }}
                          className="w-8 bg-transparent text-white font-bold text-center focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">วิ</span>
                      </div>

                      {/* Camera Motion */}
                      <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300">
                        <Video className="w-3 h-3 text-sky-400" />
                        <select
                          value={scene.cameraMotion || 'zoom-in'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onUpdateScene(idx, {
                              cameraMotion: e.target.value as any,
                            })
                          }
                          className="bg-transparent text-slate-300 text-[11px] focus:outline-none"
                        >
                          <option value="zoom-in" className="bg-slate-900 text-white">Zoom In (ซูมเข้า)</option>
                          <option value="zoom-out" className="bg-slate-900 text-white">Zoom Out (ซูมออก)</option>
                          <option value="pan-left" className="bg-slate-900 text-white">Pan Left (เลื่อนซ้าย)</option>
                          <option value="pan-right" className="bg-slate-900 text-white">Pan Right (เลื่อนขวา)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Thai Narration Textarea */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between mb-1">
                      <span>🗣️ เสียงพากย์ภาษาไทย (Narration Script)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={scene.narrationThai || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        onUpdateScene(idx, { narrationThai: e.target.value })
                      }
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 leading-relaxed resize-none"
                      placeholder="บทพากย์ในฉากนี้..."
                    />
                  </div>

                  {/* On-screen Subtitle / Caption */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                        💬 ข้อความซับไตเติลบนหน้าจอ (Captions)
                      </label>
                      <input
                        type="text"
                        value={scene.captionText || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onUpdateScene(idx, { captionText: e.target.value })
                        }
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                        placeholder="ข้อความสั้นๆ บนหน้าจอ..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                        ✨ คำที่เน้นสีพิเศษ (Highlight Keywords)
                      </label>
                      <input
                        type="text"
                        value={scene.highlightWords?.join(', ') || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const words = e.target.value
                            .split(',')
                            .map((w) => w.trim())
                            .filter(Boolean);
                          onUpdateScene(idx, { highlightWords: words });
                        }}
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                        placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น ยอดขาย, ทันที"
                      />
                    </div>
                  </div>

                  {/* Visual Prompt for Image generation */}
                  <details className="text-[11px] text-slate-400">
                    <summary className="cursor-pointer hover:text-slate-300 transition-colors">
                      🎨 ดู Prompt ภาพฉากนี้ (English Visual Prompt)
                    </summary>
                    <div className="mt-1.5 p-2 bg-slate-950/90 rounded-lg border border-slate-800">
                      <p className="font-mono text-[10px] text-slate-300 leading-normal">
                        {scene.visualPrompt}
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
