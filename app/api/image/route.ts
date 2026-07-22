import { NextResponse } from 'next/server';
import { characters, type Character } from '@/lib/characters';

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';

const styleMap: Record<string, string> = {
  sophia: 'beautiful young woman with long flowing pink hair, green eyes, warm smile, wearing a soft floral summer dress, golden hour sunset, bokeh background, romantic atmosphere, cinematic portrait, photorealistic',
  elena: 'beautiful young woman with curly brown hair and brown eyes, laughing, wearing colorful streetwear, sunny daytime urban background, playful energetic, photorealistic portrait',
  viktoria: 'beautiful young woman with long black hair and dark eyes, wearing a velvet dress, candlelit room with tarot cards, mystic atmosphere at midnight, photorealistic portrait',
  'luna-night': 'beautiful young woman with silver hair under a starry night sky, moonlight, wearing an ethereal white dress, dreamlike mystical mood, photorealistic portrait',
  mia: 'beautiful young woman with auburn hair in a messy bun and glasses, wearing paint-splattered overalls in an art studio surrounded by canvases, creative atmosphere, photorealistic portrait',
  aria: 'beautiful young woman with athletic body and ponytail, wearing a sports bra and yoga pants in a gym with morning light, fit and energetic, photorealistic portrait',
  nova: 'beautiful tanned woman with beach wavy blonde hair, wearing a sundress on a tropical beach at golden sunset, adventurous paradise vibe, photorealistic portrait',
  zara: 'beautiful young woman with purple hair and headphones, neon gaming setup with RGB lights, cyberpunk aesthetic holding a controller, photorealistic portrait',
  catalina: 'beautiful young woman with sun-kissed skin and beach wavy hair and blue eyes, wearing a swimsuit by ocean waves, adventurous and carefree summer mood, photorealistic portrait',
  natasha: 'beautiful young woman with fiery red hair and intense blue eyes, wearing a leather jacket in a confident pose against a red background, bold and fierce, photorealistic portrait',
  mariana: 'beautiful young woman with dark hair and red lips, wearing an elegant black dress on a theater stage with dramatic lighting, cinematic and passionate, photorealistic portrait',
  rebecca: 'beautiful mature elegant woman with auburn hair updo, wearing a red dress holding a wine glass at a candlelit dinner, sophisticated and sensual, photorealistic portrait',
  yuki: 'beautiful anime style young woman with pink hair, wearing a kawaii school uniform among sakura petals in Tokyo, cute and bubbly anime aesthetic, high quality anime illustration',
  'sofia-c': 'beautiful young woman with violet eyes, wearing a soft purple dress with a gentle smile, soft dreamlike lighting, ethereal and devoted mood, photorealistic portrait',
  riley: 'beautiful young woman with black hair and motorcycle jacket, edgy in a garage background, confident and wild with leather and tattoos, photorealistic portrait',
  emily: 'beautiful mature woman with a warm smile wearing an apron in a cozy kitchen with baked goods, afternoon light, nurturing and motherly, photorealistic portrait',
  serena: 'beautiful young woman with dark features, wearing an elegant black gown in mysterious shadows at a smoky jazz bar, elegant and enigmatic, photorealistic portrait',
  isabella: 'beautiful young woman in a wedding dress with a nervous expression holding a bouquet among rose petals at twilight, romantic and conflicted, photorealistic portrait',
  luna: 'beautiful young woman with silver hair under a starry sky, wearing a soft sweater, cozy nighttime, dreamy and calm, photorealistic portrait',
  mia2: 'beautiful young woman with auburn hair in a messy bun, wearing paint-splattered overalls in an art studio, creative and inspired, photorealistic portrait',
  aria2: 'beautiful young woman with an athletic build, wearing dancewear in a studio with mirrors, graceful and focused, photorealistic portrait',
  nova2: 'beautiful young woman with a travel backpack, standing on a scenic mountain overlook at dawn, adventurous and free, photorealistic portrait',
  zara2: 'beautiful young woman with colorful hair and gaming headset, in a neon-lit gaming room, confident gamer, photorealistic portrait',
  atlas: 'handsome athletic young man with a beard and outdoor gear, standing on a mountain peak at sunrise, adventurous and rugged, photorealistic portrait',
  damien: 'handsome young man with messy hair, holding an acoustic guitar in a recording studio with warm lighting, artistic and soulful, photorealistic portrait',
  rex: "handsome young man in a chef's apron in a modern restaurant kitchen, plating a gourmet dish, passionate and focused, photorealistic portrait",
  phoenix: 'confident young entrepreneur in a modern office with city skyline view, sharp business attire, visionary and driven, photorealistic portrait',
  cipher: 'mysterious figure with dark hoodie and code reflected in glasses, surrounded by holographic data streams, cyberpunk hacker aesthetic, digital art',
  nexus: 'futuristic AI entity with glowing circuit patterns, ethereal blue and purple light, digital consciousness, sci-fi digital art',
  oracle: 'wise mystical woman with glowing eyes and flowing robes, surrounded by floating runes and cosmic energy, fantasy art',
  forge: 'robotic engineer character with mechanical arms and glowing tools, industrial workshop, sci-fi character design',
  vector: 'geometric AI entity made of light patterns, abstract digital consciousness, minimalist sci-fi art',
  volts: 'electric character with lightning energy, tech-wear outfit, dynamic action pose, digital art',
  satoshi: 'stylized crypto trader character with gold coins and charts, futuristic fintech aesthetic, digital art',
  pixie: 'cute digital fairy with glowing wings and colorful hair, fantasy digital art, vibrant',
  yuki2: 'beautiful anime style young woman with long dark hair and a gentle smile, wearing a school uniform, cherry blossom background, anime illustration',
  kaito: 'handsome anime style young man with dark hair and sharp eyes, wearing a school uniform, confident pose, anime illustration',
  miko: 'cute anime style girl with twin tails and big eyes, wearing a shrine maiden outfit, traditional Japanese background, anime illustration',
  ryu: 'rugged anime style man with a scar and intense gaze, wearing a leather jacket, urban night background, anime illustration',
  jaxon: 'confident young man with a buzzcut, wearing a military-style jacket, urban background at night, photorealistic portrait',
  sage: 'wise older woman with silver hair and kind eyes, wearing a knitted shawl, cozy library background, photorealistic portrait',
  marcus: 'athletic young man with short hair and a tank top, in a modern gym, determined and fit, photorealistic portrait',
};

function buildCharacterPrompt(character: Character, userPrompt: string): string {
  const baseStyle = styleMap[character.id] || `beautiful portrait of a ${character.age} year old ${character.name}, ${character.specialty}, photorealistic, masterpiece quality`;
  const negative = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, extra fingers, watermark, text, worst quality, cropped';

  if (userPrompt && userPrompt.length > 5) {
    return `${baseStyle}, ${userPrompt}, masterpiece, best quality, ultra detailed, cinematic lighting, 8k`;
  }
  return `${baseStyle}, masterpiece, best quality, ultra detailed, cinematic lighting, shallow depth of field, 8k`;
}

async function generateWithPollinations(prompt: string, width: number, height: number): Promise<{ url: string } | null> {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    return { url };
  } catch {
    return null;
  }
}

function buildWorkflow(prompt: string, width = 512, height = 512, steps = 4, cfg = 1.5) {
  const seed = Math.floor(Math.random() * 4294967295);
  return {
    '3': {
      class_type: 'KSampler',
      inputs: {
        seed, steps, cfg,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
    },
    '4': {
      class_type: 'CheckpointLoaderSimple',
      inputs: { ckpt_name: 'sd_xl_turbo_1.0_fp16.safetensors' },
    },
    '5': {
      class_type: 'EmptyLatentImage',
      inputs: { width, height, batch_size: 1 },
    },
    '6': {
      class_type: 'CLIPTextEncode',
      inputs: { text: prompt, clip: ['4', 1] },
    },
    '7': {
      class_type: 'CLIPTextEncode',
      inputs: { text: 'blurry, low quality, distorted, deformed, ugly, bad anatomy, extra fingers, watermark, text, worst quality, jpeg artifacts', clip: ['4', 1] },
    },
    '8': {
      class_type: 'VAEDecode',
      inputs: { samples: ['3', 0], vae: ['4', 2] },
    },
    '9': {
      class_type: 'SaveImage',
      inputs: { filename_prefix: `candyai_${Date.now()}`, images: ['8', 0] },
    },
  };
}

async function waitForImage(promptId: string, maxWait = 60000): Promise<{ url: string; seed: number } | null> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch(`${COMFYUI_URL}/history/${promptId}`);
      const history = await res.json();
      if (history[promptId]) {
        const outputs = history[promptId].outputs;
        if (outputs?.['9']?.images?.[0]) {
          const img = outputs['9'].images[0];
          const url = `/api/image/view?filename=${encodeURIComponent(img.filename)}`;
          return { url, seed: history[promptId].outputs['9'].images[0].seed || 0 };
        }
        if (history[promptId].status?.status_str === 'error') return null;
      }
    } catch {}
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { prompt, characterId, width = 768, height = 768, steps = 8, cfg = 2.0 } = await req.json();

    const character = characterId ? characters.find(c => c.id === characterId) : undefined;
    if (!prompt && !character) {
      return NextResponse.json({ error: 'Prompt or characterId required' }, { status: 400 });
    }

    const fullPrompt = character ? buildCharacterPrompt(character, prompt || '') : `masterpiece, best quality, ${prompt}, ultra detailed, cinematic lighting, 8k`;

    // Try Pollinations.ai first (free, no API key needed)
    const pollinationsResult = await generateWithPollinations(fullPrompt, width, height);
    if (pollinationsResult) {
      return NextResponse.json({
        url: pollinationsResult.url,
        prompt: fullPrompt,
        model: 'Flux (Pollinations)',
      });
    }

    // Fallback to ComfyUI (SDXL Turbo)
    try {
      const workflow = buildWorkflow(fullPrompt, width, height, steps, cfg);
      const queueRes = await fetch(`${COMFYUI_URL}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workflow }),
      });

      if (!queueRes.ok) {
        return NextResponse.json({ error: 'No image backend available.' }, { status: 503 });
      }

      const { prompt_id } = await queueRes.json();
      if (!prompt_id) return NextResponse.json({ error: 'Failed to queue prompt' }, { status: 500 });

      const result = await waitForImage(prompt_id);
      if (!result) return NextResponse.json({ error: 'Image generation timed out' }, { status: 500 });

      return NextResponse.json({ url: result.url, prompt: fullPrompt, seed: result.seed, model: 'SDXL Turbo' });
    } catch {
      return NextResponse.json({ error: 'ComfyUI not available. Make sure ComfyUI is running on port 8188.' }, { status: 503 });
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}