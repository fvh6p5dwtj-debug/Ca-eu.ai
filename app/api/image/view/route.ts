import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const COMFYUI_OUTPUT = process.env.COMFYUI_OUTPUT || 'C:/Users/adu_s/ComfyUI/output';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');
    if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 });

    const filePath = path.join(COMFYUI_OUTPUT, filename);
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
