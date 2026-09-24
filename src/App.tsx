import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Film,
  Layers,
  Share2,
  Sliders,
  Flame,
  CheckCircle,
  HelpCircle,
  Video,
  Download,
  Volume2,
  Wand2,
} from 'lucide-react';
import { ReelProject, Scene, SUBTITLE_STYLES, SubtitleStyle } from './types/reel';
import { ReelPhonePreview } from './components/ReelPhonePreview';
import { PromptWizard } from './components/PromptWizard';
import { SceneEditor } from './components/SceneEditor';
import { PostMetadataCard } from './components/PostMetadataCard';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [project, setProject] = useState<ReelProject | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedSubtitleStyle, setSelectedSubtitleStyle] = useState<SubtitleStyle>(
    SUBTITLE_STYLES[0]
  );
  const [activeTab, setActiveTab] = useState<'wizard' | 'editor' | 'metadata'>('wizard');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Generate Reel Script via Server-side Gemini API (using fast free model gemini-3.1-flash-lite)
  const handleGenerateReel = async (config: {
    topic: string;
    tone: string;
    duration: string;
    visualStyle: string;
    targetAudience: string;
    sceneCount: number;
    subtitleStyleId: string;
    soundVibe: string;
  }) => {
    try {
      setIsLoading(true);
      setIsPlaying(false);

      const res = await fetch('/api/reels/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'ไม่สามารถสร้างสคริปต์ได้');
      }

      const generated = json.data;
      const scenesWithIds: Scene[] = (generated.scenes || []).map((sc: any, idx: number) => ({
        id: `gen_scene_${Date.now()}_${idx}`,
        sceneNumber: sc.sceneNumber || idx + 1,
        durationSeconds: sc.durationSeconds || 5,
        title: sc.title || `ฉากที่ ${idx + 1}`,
        visualDescription: sc.visualDescription || '',
        visualPrompt: sc.visualPrompt || '',
        narrationThai: sc.narrationThai || '',
        captionText: sc.captionText || '',
        highlightWords: sc.highlightWords || [],
        cameraMotion: sc.cameraMotion || 'zoom-in',
      }));

      const newProject: ReelProject = {
        id: `reel_${Date.now()}`,
        title: generated.title || config.topic,
        hookSentence: generated.hookSentence || '',
        tone: generated.tone || config.tone,
        estimatedDuration: generated.estimatedDuration || parseInt(config.duration, 10),
        soundVibe: generated.soundVibe || config.soundVibe,
        postCaption: generated.postCaption || '',
        hashtags: generated.hashtags || [],
        callToAction: generated.callToAction || '',
        scenes: scenesWithIds,
        createdAt: Date.now(),
        visualStyle: config.visualStyle,
      };

      setProject(newProject);
      setCurrentSceneIndex(0);
      setActiveTab('editor');
      setIsLoading(false);
      showNotification('🎉 สร้างสคริปต์และฉากคลิปสำเร็จ กำลังสร้างภาพ 9:16 ด้วย AI...');

      // Immediately generate real AI 9:16 images for each scene
      scenesWithIds.forEach((sc, idx) => {
        if (sc.visualPrompt) {
          fetch('/api/reels/generate-scene-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visualPrompt: sc.visualPrompt,
              visualStyle: newProject.visualStyle,
            }),
          })
            .then((r) => r.json())
            .then((imgData) => {
              if (imgData.success && imgData.imageUrl) {
                setProject((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    scenes: prev.scenes.map((s, sIdx) =>
                      sIdx === idx ? { ...s, imageUrl: imgData.imageUrl } : s
                    ),
                  };
                });
              }
            })
            .catch((err) => console.warn('Background image generation notice:', err));
        }
      });
    } catch (err: any) {
      console.error('Error generating reel:', err);
      setIsLoading(false);
      showNotification(`⚠️ เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  // Generate 9:16 Scene Image via Server-side Gemini API
  const handleGenerateSceneImage = async (sceneIndex: number) => {
    if (!project) return;
    const scene = project.scenes[sceneIndex];
    if (!scene) return;

    // Set loading indicator on that scene
    setProject((prev) => {
      if (!prev) return prev;
      const copy = { ...prev };
      copy.scenes = copy.scenes.map((s, idx) =>
        idx === sceneIndex ? { ...s, isGeneratingImage: true } : s
      );
      return copy;
    });

    try {
      const res = await fetch('/api/reels/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualPrompt: scene.visualPrompt,
          visualStyle: project.visualStyle,
        }),
      });

      const json = await res.json();
      if (json.success && json.imageUrl) {
        setProject((prev) => {
          if (!prev) return prev;
          const copy = { ...prev };
          copy.scenes = copy.scenes.map((s, idx) =>
            idx === sceneIndex
              ? { ...s, imageUrl: json.imageUrl, isGeneratingImage: false }
              : s
          );
          return copy;
        });
        showNotification(`✨ สร้างภาพ AI สำหรับฉากที่ ${sceneIndex + 1} สำเร็จ!`);
      } else {
        setProject((prev) => {
          if (!prev) return prev;
          const copy = { ...prev };
          copy.scenes = copy.scenes.map((s, idx) =>
            idx === sceneIndex ? { ...s, isGeneratingImage: false } : s
          );
          return copy;
        });
      }
    } catch (err: any) {
      console.warn('Scene image error:', err);
      setProject((prev) => {
        if (!prev) return prev;
        const copy = { ...prev };
        copy.scenes = copy.scenes.map((s, idx) =>
          idx === sceneIndex ? { ...s, isGeneratingImage: false } : s
        );
        return copy;
      });
    }
  };

  // Update Scene data
  const handleUpdateScene = (sceneIndex: number, updatedProps: Partial<Scene>) => {
    setProject((prev) => {
      if (!prev) return prev;
      const copy = { ...prev };
      copy.scenes = copy.scenes.map((s, idx) =>
        idx === sceneIndex ? { ...s, ...updatedProps } : s
      );
      return copy;
    });
  };

  const handleStartNewReel = () => {
    setIsPlaying(false);
    setProject(null);
    setCurrentSceneIndex(0);
    setActiveTab('wizard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Kanit',sans-serif]">
      {/* Top Floating Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-pink-500/80 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-pink-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Film className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  AI Reels Studio
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold uppercase tracking-wide">
                  TH AI 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                สร้างคลิป Reels, TikTok, Shorts 9:16 ด้วย AI ครบวงจร
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {project && (
              <button
                onClick={handleStartNewReel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border border-pink-500/40 text-pink-300 hover:bg-pink-500/10 transition-colors cursor-pointer"
                title="เริ่มสร้างคลิปใหม่"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ สร้างคลิปใหม่</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!project) return;
                setIsPlaying(!isPlaying);
              }}
              disabled={!project}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                !project
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                  : isPlaying
                  ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-600/30 cursor-pointer'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 cursor-pointer'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlaying ? 'กำลังเล่น' : 'เล่นคลิป'}</span>
            </button>

            <button
              onClick={() => {
                if (!project) return;
                setIsExportModalOpen(true);
              }}
              disabled={!project}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs shadow-lg transition-all ${
                !project
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 active:scale-95 cursor-pointer'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดวิดีโอ 9:16</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Studio Workspace Tabs & Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setActiveTab('wizard')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'wizard'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>1. สร้างคลิปใหม่ (AI)</span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. สตอรี่บอร์ด {project ? `(${project.scenes.length})` : ''}</span>
              </button>

              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'metadata'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>3. แคปชั่น & แท็ก</span>
              </button>
            </div>

            {/* Tab 1: AI Prompt Wizard */}
            {activeTab === 'wizard' && (
              <PromptWizard
                onGenerate={handleGenerateReel}
                isLoading={isLoading}
                selectedSubtitleStyle={selectedSubtitleStyle}
                onSelectSubtitleStyle={setSelectedSubtitleStyle}
              />
            )}

            {/* Tab 2: Scene Editor & Storyboard */}
            {activeTab === 'editor' && (
              <SceneEditor
                project={project}
                currentSceneIndex={currentSceneIndex}
                onSelectScene={(idx) => {
                  setCurrentSceneIndex(idx);
                }}
                onUpdateScene={handleUpdateScene}
                onGenerateSceneImage={handleGenerateSceneImage}
                visualStyle={project?.visualStyle || 'hyper-realistic 3D cinematic render'}
                onGoToWizard={() => setActiveTab('wizard')}
              />
            )}

            {/* Tab 3: Post Metadata, Caption & Hashtags */}
            {activeTab === 'metadata' && (
              <PostMetadataCard
                project={project}
                onGoToWizard={() => setActiveTab('wizard')}
              />
            )}
          </div>

          {/* Right Column: 9:16 Phone Simulator Sticky Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-24">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-pink-500" />
                พรีวิว Reels เสมือนจริง (9:16 Live Preview)
              </span>
              <span className="text-[11px] text-slate-400">
                คลิกที่จอเพื่อ เล่น/หยุด
              </span>
            </div>

            <ReelPhonePreview
              project={project}
              currentSceneIndex={currentSceneIndex}
              onSceneChange={setCurrentSceneIndex}
              subtitleStyle={selectedSubtitleStyle}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Export & Video Render Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        subtitleStyle={selectedSubtitleStyle}
      />
    </div>
  );
}
