export interface Scene {
  id: string;
  sceneNumber: number;
  durationSeconds: number;
  title: string;
  visualDescription: string;
  visualPrompt: string;
  narrationThai: string;
  captionText: string;
  highlightWords: string[];
  cameraMotion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
  imageUrl?: string;
  isGeneratingImage?: boolean;
  gradientBg?: string;
}

export interface ReelProject {
  id: string;
  title: string;
  hookSentence: string;
  tone: string;
  estimatedDuration: number;
  soundVibe: 'upbeat_electronic' | 'lofi_chill' | 'dramatic_suspense' | 'ambient_tech' | string;
  postCaption: string;
  hashtags: string[];
  callToAction: string;
  scenes: Scene[];
  createdAt: number;
  visualStyle: string;
}

export interface SubtitleStyle {
  id: 'hormozi' | 'neon' | 'clean' | 'cyber' | 'gradient';
  name: string;
  description: string;
  textColor: string;
  highlightColor: string;
  highlightBg?: string;
  strokeColor: string;
  badgeClass: string;
}

export const SUBTITLE_STYLES: SubtitleStyle[] = [
  {
    id: 'hormozi',
    name: 'Hormozi Viral Yellow',
    description: 'ตัวหนังสือสีขาว ตัวเน้นสีเหลืองนีออนขอบดำหนา ดึงดูดสายตาสูงสุด',
    textColor: '#FFFFFF',
    highlightColor: '#FACC15',
    highlightBg: '#000000',
    strokeColor: '#000000',
    badgeClass: 'bg-yellow-400 text-black font-black',
  },
  {
    id: 'neon',
    name: 'Cyber Neon Green',
    description: 'เขียวนีออนเรืองแสง สไตล์เทคโนโลยีและสปอร์ต',
    textColor: '#FFFFFF',
    highlightColor: '#22C55E',
    highlightBg: 'rgba(34, 197, 94, 0.2)',
    strokeColor: '#000000',
    badgeClass: 'bg-green-500 text-black font-bold',
  },
  {
    id: 'cyber',
    name: 'Electric Cyan & Violet',
    description: 'ฟ้าไซเบอร์ผสมม่วง สไตล์เกมมิ่งและโมเดิร์น',
    textColor: '#FFFFFF',
    highlightColor: '#38BDF8',
    highlightBg: 'rgba(56, 189, 248, 0.2)',
    strokeColor: '#0F172A',
    badgeClass: 'bg-sky-400 text-slate-950 font-bold',
  },
  {
    id: 'gradient',
    name: 'TikTok Pop Gradient',
    description: 'ชมพูม่วงสไตล์ TikTok ไวรัล สดใสมีพลัง',
    textColor: '#FFFFFF',
    highlightColor: '#F43F5E',
    highlightBg: 'rgba(244, 63, 94, 0.2)',
    strokeColor: '#000000',
    badgeClass: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold',
  },
  {
    id: 'clean',
    name: 'Minimal Clean White',
    description: 'ขาวสะอาด กรอบดำโปร่งแสง เรียบหรูดูพรีเมียม',
    textColor: '#FFFFFF',
    highlightColor: '#E2E8F0',
    highlightBg: 'rgba(0, 0, 0, 0.6)',
    strokeColor: '#000000',
    badgeClass: 'bg-slate-200 text-slate-900 font-semibold',
  },
];

export const TEMPLATE_PROMPTS = [
  {
    id: 'marketing_10x',
    title: '5 ทริคการตลาดดันยอดขายออนไลน์ x10',
    category: 'ธุรกิจ & การตลาด',
    icon: 'TrendingUp',
    badge: 'ยอดฮิต',
    topic: '5 เทคนิคจิตวิทยาการตลาดออนไลน์ที่ช่วยเพิ่มยอดขายและอัตราการสั่งซื้อซ้ำให้ธุรกิจ SME และพ่อค้าแม่ค้าออนไลน์ทันที',
    tone: 'ตื่นเต้น ไวรัล (Viral & Energetic)',
    duration: '30',
    visualStyle: '3D isometric business graphics, glossy neon lighting, futuristic studio',
    soundVibe: 'upbeat_electronic',
  },
  {
    id: 'secrets_psychology',
    title: '3 ความลับจิตวิทยาที่คนสำเร็จไม่เคยบอก',
    category: 'พัฒนาตนเอง',
    icon: 'Brain',
    badge: 'ไวรัล',
    topic: '3 กฎจิตวิทยาที่ทำให้คนฟังเชื่อมั่นและประทับใจตั้งแต่ 5 วินาทีแรกที่คุยกัน',
    tone: 'เล่าเรื่องน่าติดตาม (Storytelling)',
    duration: '30',
    visualStyle: 'cinematic noir portrait photography, dramatic moody rim light, bokeh',
    soundVibe: 'dramatic_suspense',
  },
  {
    id: 'street_food_bkk',
    title: 'พากินสตรีทฟู้ดลับกรุงเทพฯ ใน 30 วินาที',
    category: 'อาหาร & ท่องเที่ยว',
    icon: 'UtensilsCrossed',
    badge: 'ชวนหิว',
    topic: 'พิกัดร้านสตรีทฟู้ดลับในเยาวราช กรอบนอกนุ่มใน คิวยาวแต่คุ้มค่า พร้อมเคล็ดลับการสั่ง',
    tone: 'เป็นกันเอง สนุกสนาน (Humorous/Casual)',
    duration: '30',
    visualStyle: 'vibrant mouthwatering food photography, steam rising, warm night market neon lights',
    soundVibe: 'lofi_chill',
  },
  {
    id: 'ai_trends_2026',
    title: 'สรุปเทรนด์ AI ปี 2026 ที่จะเปลี่ยนการทำงาน',
    category: 'เทคโนโลยี',
    icon: 'Sparkles',
    badge: 'มาแรง',
    topic: 'สรุป 3 เทคโนโลยี Generative AI ล่าสุดปี 2026 ที่คนทำงานและครีเอเตอร์ต้องรีบปรับตัวใช้ก่อนตกขบวน',
    tone: 'มีสาระ ได้ความรู้ (Informative / Tutorial)',
    duration: '30',
    visualStyle: 'futuristic cybernetic interfaces, hologram data streams, clean tech aesthetic',
    soundVibe: 'ambient_tech',
  },
  {
    id: 'wealth_saving',
    title: 'วิธีเก็บเงินล้านแรกฉบับวัย 25 ปี',
    category: 'การเงิน & การลงทุน',
    icon: 'Coins',
    badge: 'การเงิน',
    topic: 'สูตรแบ่งเงิน 50-30-20 และเคล็ดลับการสร้างกระแสเงินสดให้ถึงล้านแรกอย่างปลอดภัย',
    tone: 'มีสาระ ได้ความรู้ (Informative / Tutorial)',
    duration: '30',
    visualStyle: 'luxury modern financial aesthetics, golden coins, sleek minimal skyscraper office',
    soundVibe: 'upbeat_electronic',
  },
];

export const VISUAL_STYLES = [
  {
    id: 'hyper-realistic-3d',
    name: '3D Hyper-Realistic',
    desc: 'โมเดล 3D มันวาว แสงสะท้อนเนียนตา โมเดิร์นระดับสตูดิโอ',
    promptStyle: 'hyper-realistic 3D cinematic render, octane render, soft ambient occlusion, clean lighting',
    previewGradient: 'from-blue-600 via-indigo-600 to-purple-800',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    desc: 'แสงนีออนสีสด ล้ำยุค ไฮเทค คอนทราสต์จัดจ้าน',
    promptStyle: 'cyberpunk neon aesthetic, glowing electric lights, futuristic cityscape, dramatic reflections',
    previewGradient: 'from-pink-600 via-purple-700 to-cyan-500',
  },
  {
    id: 'cinematic-photo',
    name: 'Cinematic Photography',
    desc: 'ภาพถ่ายภาพยนตร์ คอนทราสต์นุ่มนวล แสงธรรมชาติระดับภาพยนตร์',
    promptStyle: 'cinematic 35mm film photography, shallow depth of field, dramatic atmospheric lighting, high fidelity',
    previewGradient: 'from-amber-700 via-stone-800 to-zinc-950',
  },
  {
    id: 'anime-vibrant',
    name: 'Anime & Manga Art',
    desc: 'ลายเส้นอนิเมะญี่ปุ่น สีสันจัดจ้าน รายละเอียดคมชัด สไตล์ Makoto Shinkai',
    promptStyle: 'modern anime illustration, Makoto Shinkai style, vibrant sky, beautiful volumetric rays, detailed art',
    previewGradient: 'from-sky-500 via-indigo-500 to-pink-500',
  },
  {
    id: 'minimalist-vector',
    name: 'Minimal Graphic & Pastel',
    desc: 'กราฟิกคลีน มินิมอล โทนสีละมุน เหมาะกับคลิปให้ความรู้',
    promptStyle: 'minimalist clean vector art, soft pastel color palette, elegant typography, modern editorial layout',
    previewGradient: 'from-teal-600 via-emerald-700 to-slate-900',
  },
];
