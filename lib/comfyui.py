"""Fast image generation via ComfyUI API — SDXL Turbo (4 steps, ~3s on 3060 Ti)"""
import json, urllib.request, urllib.parse, time, uuid, os, random

COMFYUI_URL = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188")

def generate_image(prompt: str, width: int = 512, height: int = 512, steps: int = 4, cfg: float = 1.5, seed: int | None = None) -> dict:
    """Generate image via SDXL Turbo in ComfyUI. Returns dict with image URL and metadata."""
    if seed is None:
        seed = random.randint(0, 2**32 - 1)

    workflow = {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
            },
        },
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": "sd_xl_turbo_1.0_fp16.safetensors"},
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": width, "height": height, "batch_size": 1},
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt, "clip": ["4", 1]},
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": "blurry, low quality, distorted, deformed, ugly, bad anatomy", "clip": ["4", 1]},
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": f"candyai_{uuid.uuid4().hex[:8]}", "images": ["8", 0]},
        },
    }

    payload = json.dumps({"prompt": workflow}).encode("utf-8")
    req = urllib.request.Request(f"{COMFYUI_URL}/prompt", data=payload, headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    prompt_id = result.get("prompt_id")

    if not prompt_id:
        return {"error": "Failed to queue prompt"}

    for _ in range(60):
        time.sleep(0.5)
        hist_req = urllib.request.Request(f"{COMFYUI_URL}/history/{prompt_id}")
        hist_resp = urllib.request.urlopen(hist_req)
        history = json.loads(hist_resp.read())
        if prompt_id in history:
            outputs = history[prompt_id].get("outputs", {})
            if "9" in outputs and outputs["9"].get("images"):
                img = outputs["9"]["images"][0]
                filename = img["filename"]
                subfolder = img.get("subfolder", "")
                url = f"{COMFYUI_URL}/view?filename={urllib.parse.quote(filename)}&subfolder={urllib.parse.quote(subfolder)}&type=output"
                return {"url": url, "prompt": prompt, "seed": seed, "steps": steps}
            if history[prompt_id].get("status", {}).get("status_str") == "error":
                return {"error": "ComfyUI generation failed"}

    return {"error": "Timeout waiting for image"}


if __name__ == "__main__":
    import sys
    prompt = sys.argv[1] if len(sys.argv) > 1 else "a beautiful woman, portrait, soft lighting, detailed face"
    print(f"Generating: {prompt}")
    t0 = time.time()
    result = generate_image(prompt, steps=4)
    elapsed = time.time() - t0
    print(f"Done in {elapsed:.1f}s: {json.dumps(result, indent=2)}")
