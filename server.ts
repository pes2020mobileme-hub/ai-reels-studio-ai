import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Health check for Render / uptime monitors. Never leaks the key — only
// reports whether GEMINI_API_KEY is configured so a 200 means the app is alive.
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ai-reels-studio',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Server-side Gemini initialization with recommended User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate Full Reel Script, Storyboard & Post Metadata
app.post('/api/reels/generate-script', async (req, res) => {
  try {
    const {
      topic = '5 ทริคการตลาดดันยอดขายออนไลน์',
      tone = 'ตื่นเต้น ไวรัล (Viral & Energetic)',
      duration = '30',
      visualStyle = 'hyper-realistic 3D cinematic',
      targetAudience = 'ผู้ประกอบการรุ่นใหม่ และคอนเทนต์ครีเอเตอร์',
      sceneCount = 4,
    } = req.body;

    const systemPrompt = `You are a master viral short-form video producer, scriptwriter, and creative director for Instagram Reels, TikTok, and YouTube Shorts in Thailand.
Your job is to generate a high-retention, high-engagement 9:16 vertical Reel video project in Thai language.
Key viral video rules:
1. Hook in the first 2-3 seconds: Must immediately provoke curiosity, state a counter-intuitive fact, or ask a burning question.
2. Fast-paced scenes: 3 to 6 seconds per scene.
3. Natural, energetic Thai voiceover narration: Conversational, impactful, not robotic.
4. Catchy on-screen captions: Short punchy subtitles with 1-3 highlight keyword tags.
5. Rich English visualPrompt for each scene: Detailed prompt describing the scene in 9:16 aspect ratio suitable for image generation, adhering to the requested visual style (${visualStyle}).
6. Complete social media caption: Include headline, emojis, bullet summaries, call to action (CTA), and 15+ trending hashtags.`;

    const userPrompt = `หัวข้อคลิป Reel: "${topic}"
โทนอารมณ์: "${tone}"
ความยาวเป้าหมาย: ประมาณ ${duration} วินาที
กลุ่มผู้ชมเป้าหมาย: "${targetAudience}"
สไตล์ภาพที่ต้องการ: "${visualStyle}"
จำนวนฉากที่เหมาะสม: ประมาณ ${sceneCount} ฉาก

โปรดสร้างสคริปต์คลิป Reels ไวรัลแบบเต็มรูปแบบพร้อมรายละเอียดทุกฉากตามโครงสร้าง JSON`;

    // Use free high-throughput model (gemini-3.1-flash-lite) with graceful fallback to gemini-3.8-flash
    let responseText: string | undefined;
    const modelCandidates = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    const schemaConfig = {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'ชื่อคลิปสั้นที่สะดุดตา',
          },
          hookSentence: {
            type: Type.STRING,
            description: 'ประโยคฮุค 3 วินาทีแรกที่ดึงดูดความสนใจทันที',
          },
          tone: {
            type: Type.STRING,
            description: 'โทนอารมณ์ของคลิป',
          },
          estimatedDuration: {
            type: Type.NUMBER,
            description: 'ความยาวรวมโดยประมาณเป็นวินาที',
          },
          soundVibe: {
            type: Type.STRING,
            description: 'แนวเพลงประกอบ เช่น upbeat_electronic, lofi_chill, dramatic_suspense, ambient_tech',
          },
          postCaption: {
            type: Type.STRING,
            description: 'แคปชั่นสำหรับโพสต์ Instagram/Facebook Reels/TikTok พร้อมอิโมจิและการชวนคอมเมนต์',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'แฮชแท็กติดเทรนด์ 10-18 แท็ก เช่น #ReelsTH #คลิปสั้น',
          },
          callToAction: {
            type: Type.STRING,
            description: 'ประโยคปิดท้ายให้กดติดตามหรือคอมเมนต์',
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                durationSeconds: { type: Type.NUMBER },
                title: { type: Type.STRING, description: 'ชื่อตอนของฉากนี้' },
                visualDescription: { type: Type.STRING, description: 'คำอธิบายภาพในฉากภาษาไทย' },
                visualPrompt: {
                  type: Type.STRING,
                  description: 'English visual prompt for 9:16 vertical image generation, vivid, cinematic lighting',
                },
                narrationThai: { type: Type.STRING, description: 'บทพากย์ภาษาไทยสำหรับฉากนี้' },
                captionText: { type: Type.STRING, description: 'ข้อความซับไตเติลสั้นๆ บนหน้าจอ' },
                highlightWords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'คำเด่นที่ต้องเน้นสีในซับไตเติล 1-3 คำ',
                },
                cameraMotion: {
                  type: Type.STRING,
                  description: 'zoom-in, zoom-out, pan-left, or pan-right',
                },
              },
              required: [
                'sceneNumber',
                'durationSeconds',
                'title',
                'visualDescription',
                'visualPrompt',
                'narrationThai',
                'captionText',
                'highlightWords',
                'cameraMotion',
              ],
            },
          },
        },
        required: [
          'title',
          'hookSentence',
          'tone',
          'estimatedDuration',
          'soundVibe',
          'postCaption',
          'hashtags',
          'callToAction',
          'scenes',
        ],
      },
    };

    for (const modelName of modelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: schemaConfig,
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} warning: ${err.message}. Trying next candidate if available...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error('No text returned from AI models');
    }

    const parsedData = JSON.parse(responseText);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating reel script:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate script',
    });
  }
});

// Endpoint: Generate 9:16 Vertical Scene Image (Free, unlimited rate limits, real photorealistic render)
app.post('/api/reels/generate-scene-image', async (req, res) => {
  try {
    const { visualPrompt, visualStyle = 'cinematic 3D render' } = req.body;

    if (!visualPrompt) {
      return res.status(400).json({ success: false, error: 'visualPrompt is required' });
    }

    const cleanPrompt = `${visualPrompt.trim()}, ${visualStyle}, 9:16 vertical smartphone ratio, clean composition, high detail, masterpiece, 8k`.replace(/["\n\r]/g, ' ');
    const seed = Math.floor(Math.random() * 10000000);
    const encoded = encodeURIComponent(cleanPrompt.slice(0, 500));
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=720&height=1280&nologo=true&seed=${seed}&model=flux`;

    // Fetch and convert to base64 so Canvas export can process it with no CORS tainting
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const fetchRes = await fetch(imageUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AI-Reels-Studio/2.0' },
      });
      clearTimeout(timeoutId);

      if (fetchRes.ok) {
        const arrayBuffer = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
        return res.json({
          success: true,
          imageUrl: `data:${contentType};base64,${base64}`,
        });
      }
    } catch (fetchErr: any) {
      console.warn('Direct buffer fetch timeout or notice, passing direct url:', fetchErr.message);
    }

    // Return direct reliable URL if buffer took longer
    return res.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error('Error generating scene image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation failed',
    });
  }
});

// Endpoint: Generate Speech Voiceover using Gemini TTS (optional enhancement)
app.post('/api/reels/generate-speech', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Energetic, engaging, friendly, viral video narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        success: true,
        audioData: base64Audio,
        mimeType: 'audio/mp3',
      });
    }

    res.json({ success: false, message: 'No audio returned' });
  } catch (error: any) {
    console.warn('Gemini TTS endpoint notice:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Vite Middleware for development / static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (http://localhost:${port})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
