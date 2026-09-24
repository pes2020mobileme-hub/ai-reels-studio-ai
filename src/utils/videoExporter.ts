import { ReelProject, SubtitleStyle } from '../types/reel';
import { audioSynth } from './audioSynth';

export interface RenderProgress {
  percentage: number;
  currentScene: number;
  totalScenes: number;
  statusText: string;
}

export async function exportReelToVideo(
  project: ReelProject,
  subtitleStyle: SubtitleStyle,
  onProgress: (progress: RenderProgress) => void
): Promise<Blob> {
  const width = 720;
  const height = 1280;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) throw new Error('Cannot get canvas context');
  const ctx: CanvasRenderingContext2D = rawCtx;

  // Preload scene images if available
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    project.scenes.map((scene) => {
      if (!scene.imageUrl) return Promise.resolve(null);
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = scene.imageUrl!;
      });
    })
  );

  // Setup media recorder
  const stream = canvas.captureStream(fps);

  // Connect audio from synth if available
  const audioDestination = audioSynth.getStreamDestination();
  if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    stream.addTrack(audioTrack);
  }

  // Check supported mime types
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 3_500_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  const totalDuration = project.scenes.reduce(
    (acc, s) => acc + (s.durationSeconds || 4),
    0
  );
  const totalFrames = Math.floor(totalDuration * fps);

  // Start background synth for recording
  audioSynth.play(project.soundVibe || 'upbeat_electronic');
  recorder.start();

  let frameCount = 0;
  let currentSceneIdx = 0;
  let sceneStartFrame = 0;

  return new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      audioSynth.stop();
      const videoBlob = new Blob(recordedChunks, { type: mimeType });
      resolve(videoBlob);
    };

    recorder.onerror = (err) => {
      audioSynth.stop();
      reject(err);
    };

    function renderNextFrame() {
      if (frameCount >= totalFrames) {
        recorder.stop();
        return;
      }

      const currentScene = project.scenes[currentSceneIdx];
      const sceneFrames = Math.floor((currentScene.durationSeconds || 4) * fps);
      const frameInScene = frameCount - sceneStartFrame;
      const sceneProgress = Math.min(1, Math.max(0, frameInScene / sceneFrames));

      // Draw Scene Background with Ken Burns Pan/Zoom
      const img = loadedImages[currentSceneIdx];
      drawSceneBackground(ctx, width, height, img, currentScene, sceneProgress, frameCount);

      // Draw Top Progress Bar
      drawProgressBar(ctx, width, currentSceneIdx, project.scenes.length, sceneProgress);

      // Draw Subtitles
      drawSubtitles(ctx, width, height, currentScene, subtitleStyle, sceneProgress);

      // Draw Reel Branding watermark
      drawWatermark(ctx, width, height);

      frameCount++;

      // Progress reporting
      if (frameCount % 6 === 0) {
        const pct = Math.floor((frameCount / totalFrames) * 100);
        onProgress({
          percentage: pct,
          currentScene: currentSceneIdx + 1,
          totalScenes: project.scenes.length,
          statusText: `กำลังเรนเดอร์ฉากที่ ${currentSceneIdx + 1}/${project.scenes.length} (${pct}%)`,
        });
      }

      // Check if scene transition
      if (frameInScene >= sceneFrames - 1 && currentSceneIdx < project.scenes.length - 1) {
        currentSceneIdx++;
        sceneStartFrame = frameCount;
      }

      // Schedule next frame with animation frame or timeout for smooth timing
      requestAnimationFrame(renderNextFrame);
    }

    renderNextFrame();
  });
}

function drawSceneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  img: HTMLImageElement | null,
  scene: any,
  progress: number,
  frame: number
) {
  ctx.save();

  if (img) {
    // Ken Burns effect: scale from 1.0 to 1.15
    const motion = scene.cameraMotion || 'zoom-in';
    let scale = 1.0 + progress * 0.15;
    let dx = 0;
    let dy = 0;

    if (motion === 'zoom-out') {
      scale = 1.15 - progress * 0.15;
    } else if (motion === 'pan-left') {
      dx = -progress * 40;
    } else if (motion === 'pan-right') {
      dx = progress * 40;
    }

    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2 + dx, -h / 2 + dy);

    // Cover crop
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let sw = img.width;
    let sh = img.height;
    let sx = 0;
    let sy = 0;

    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();

    // Dark gradient overlay for text readability
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Generative abstract studio background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    const sceneNum = scene.sceneNumber || 1;
    const palettes = [
      ['#0f172a', '#1e1b4b', '#312e81'],
      ['#18181b', '#3b0764', '#4c0519'],
      ['#022c22', '#064e3b', '#0f172a'],
      ['#1e293b', '#0369a1', '#0c4a6e'],
    ];
    const pal = palettes[(sceneNum - 1) % palettes.length];
    grad.addColorStop(0, pal[0]);
    grad.addColorStop(0.5, pal[1]);
    grad.addColorStop(1, pal[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ambient floating glow orbs
    const t = frame * 0.03;
    const orbX = w * 0.5 + Math.sin(t) * 120;
    const orbY = h * 0.4 + Math.cos(t * 0.8) * 100;
    const radGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 350);
    radGrad.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
    radGrad.addColorStop(0.6, 'rgba(147, 51, 234, 0.15)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle scene card illustration
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 200, w - 80, h * 0.45, 24);
    ctx.fill();
    ctx.stroke();

    // Scene Badge
    ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.beginPath();
    ctx.roundRect(65, 225, 140, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Kanit, sans-serif';
    ctx.fillText(`SCENE 0${sceneNum}`, 82, 250);

    // Scene Description text preview
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '22px Kanit, sans-serif';
    wrapText(ctx, scene.visualDescription || scene.title, 65, 300, w - 130, 34);

    ctx.restore();
  }
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  currentScene: number,
  totalScenes: number,
  sceneProgress: number
) {
  const padding = 16;
  const gap = 6;
  const barHeight = 4;
  const y = 35;
  const availableWidth = w - padding * 2 - gap * (totalScenes - 1);
  const segmentWidth = availableWidth / totalScenes;

  for (let i = 0; i < totalScenes; i++) {
    const x = padding + i * (segmentWidth + gap);

    // Background track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x, y, segmentWidth, barHeight, 2);
    ctx.fill();

    // Filled track
    if (i < currentScene) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(x, y, segmentWidth, barHeight, 2);
      ctx.fill();
    } else if (i === currentScene) {
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.roundRect(x, y, segmentWidth * sceneProgress, barHeight, 2);
      ctx.fill();
    }
  }
}

function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: any,
  style: SubtitleStyle,
  progress: number
) {
  const text = scene.captionText || scene.narrationThai || '';
  if (!text) return;

  // Pop-in bounce scale
  const popScale = progress < 0.15 ? 0.8 + (progress / 0.15) * 0.2 : 1.0;

  ctx.save();
  ctx.translate(w / 2, h * 0.72);
  ctx.scale(popScale, popScale);

  ctx.font = '900 38px Kanit, Prompt, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const highlightWords = scene.highlightWords || [];

  // Subtitle background pill if Hormozi or clean
  const metrics = ctx.measureText(text);
  const boxW = Math.min(w - 60, metrics.width + 50);
  const boxH = 90;

  if (style.id === 'hormozi') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (style.id === 'gradient') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Draw Stroke
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = style.strokeColor || '#000000';
  ctx.strokeText(text, 0, 0);

  // Fill text with highlight color
  ctx.fillStyle = style.highlightColor || '#FACC15';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.font = '500 16px Kanit, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'left';
  ctx.fillText('@AI_Reels_TH', 30, h - 50);

  // Reel icon
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.arc(w - 45, h - 55, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI', w - 45, h - 51);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}
