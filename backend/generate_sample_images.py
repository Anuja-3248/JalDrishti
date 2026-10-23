import os
import cv2
import numpy as np

def generate_test_satellite_scenes():
    out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_satellite_images")
    os.makedirs(out_dir, exist_ok=True)
    
    h, w = 800, 800

    # 1. SCENE 1: Severe Elongated Oil Spill (Tanker discharge along shipping lane)
    print("Generating Scene 1: Major Tanker Spill (sample_oil_spill_severe.png)...")
    ocean1 = np.random.normal(135, 20, (h, w)).clip(60, 220).astype(np.uint8)
    slick1 = np.zeros((h, w), dtype=np.uint8)
    
    # Elongated slick along course 315 deg
    pts1 = np.array([
        [320, 280], [380, 260], [470, 340], [560, 440], 
        [590, 520], [550, 550], [480, 480], [390, 390], [330, 320]
    ], np.int32)
    cv2.fillPoly(slick1, [pts1], 255)
    slick1 = cv2.GaussianBlur(slick1, (25, 25), 0)
    ocean1 = np.clip(ocean1 - (slick1 / 255.0) * 95, 10, 255).astype(np.uint8)
    
    path1 = os.path.join(out_dir, "sample_oil_spill_severe.png")
    cv2.imwrite(path1, ocean1)

    # 2. SCENE 2: Moderate Curved Coastal Spill (Turning tanker)
    print("Generating Scene 2: Curved Spill (sample_oil_spill_curved.png)...")
    ocean2 = np.random.normal(142, 22, (h, w)).clip(60, 220).astype(np.uint8)
    slick2 = np.zeros((h, w), dtype=np.uint8)
    
    # Curved banana-like slick
    for rad in np.linspace(0.8, 2.4, 60):
        cx = int(400 + 160 * np.cos(rad))
        cy = int(380 + 160 * np.sin(rad))
        cv2.circle(slick2, (cx, cy), 32, 255, -1)
    slick2 = cv2.GaussianBlur(slick2, (21, 21), 0)
    ocean2 = np.clip(ocean2 - (slick2 / 255.0) * 88, 15, 255).astype(np.uint8)
    
    path2 = os.path.join(out_dir, "sample_oil_spill_curved.png")
    cv2.imwrite(path2, ocean2)

    # 3. SCENE 3: Natural Biogenic Look-alike (Algal bloom / low wind calm sea - rejected)
    print("Generating Scene 3: Natural Look-alike (sample_natural_lookalike.png)...")
    ocean3 = np.random.normal(140, 24, (h, w)).clip(60, 220).astype(np.uint8)
    lookalike3 = np.zeros((h, w), dtype=np.uint8)
    
    # Diffuse, circular/patchy low wind areas
    cv2.circle(lookalike3, (300, 320), 65, 255, -1)
    cv2.circle(lookalike3, (520, 480), 50, 255, -1)
    lookalike3 = cv2.GaussianBlur(lookalike3, (35, 35), 0)
    ocean3 = np.clip(ocean3 - (lookalike3 / 255.0) * 45, 20, 255).astype(np.uint8)
    
    path3 = os.path.join(out_dir, "sample_natural_lookalike.png")
    cv2.imwrite(path3, ocean3)

    print(f"[SUCCESS] All 3 sample satellite SAR images generated in: {out_dir}")

if __name__ == "__main__":
    generate_test_satellite_scenes()
