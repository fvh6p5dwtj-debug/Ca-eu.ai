"""Generate images using ComfyUI + SDXL Turbo (4 steps, ~3 seconds on RTX 3060 Ti)"""
import json, urllib.request, urllib.parse, websocket, uuid, time, os, base64, io
from PIL import Image

COMFYUI_URL = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188")

def generate_image(prompt: str, width: int = 1024, height: int = 1024, steps: int = 4, seed: int = -1) -> dict:
    """Generate image with SDXL Turbo via ComfyUI. Returns dict with image bytes."""
    if seed == -1:
        seed = int.from_bytes(os.urandom(4), "big")

    workflow = {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": 0.0,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0]
            }
        },
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": "sd_xl_turbo_1.0_fp16.safetensors"}
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": width, "height": height, "batch_size": 1}
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt, "clip": ["4", 1]}
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": "blurry, low quality, distorted, ugly, watermark, text, logo", "clip": ["4", 1]}
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["3", 0], "vae": ["4", 2]}
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": "candyai", "images": ["8", 0]}
        }
    }

    client_id = str(uuid.uuid4())
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")

    req = urllib.request.Request(f"{COMFYUI_URL}/prompt", data=payload, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    prompt_id = result["prompt_id"]

    # Poll for completion
    for _ in range(60):
        time.sleep(0.5)
        hist_resp = urllib.request.urlopen(f"{COMFYUI_URL}/history/{prompt_id}")
        history = json.loads(hist_resp.read())
        if prompt_id in history:
            outputs = history[prompt_id]["outputs"]
            if "9" in outputs and outputs["9"]["images"]:
                img_info = outputs["9"]["images"][0]
                img_url = f"{COMFYUI_URL}/view?filename={urllib.parse.quote(img_info['filename'])}&subfolder={urllib.parse.quote(img_info.get('subfolder', ''))}&type=output"
                img_data = urllib.request.urlopen(img_url).read()
                return {"success": True, "image_data": img_data, "prompt": prompt, "seed": seed}

    return {"success": False, "error": "Generation timed out", "prompt": prompt}


if __name__ == "__main__":
    import sys
    prompt = sys.argv[1] if len(sys.argv) > 1 else "a beautiful sunset over the ocean, digital art"
    start = time.time()
    result = generate_image(prompt, steps=4)
    elapsed = time.time() - start
    if result["success"]:
        img = Image.open(io.BytesIO(result["image_data"]))
        out_path = os.path.join(os.path.dirname(__file__), "test_output.png")
        img.save(out_path)
        print(f"Generated in {elapsed:.1f}s -> {out_path}")
    else:
        print(f"Failed: {result['error']}")
