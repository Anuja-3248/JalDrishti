import os
import cv2
import numpy as np
from services.image_processor import analyze_sar_image

def generate_and_test_sar():
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    img_path = os.path.join(output_dir, "sample_sar_scene.png")

    print(f"1. Synthesizing realistic Sentinel-1A SAR radar image at: {img_path}")
    
    # Create 800x800 base image representing open ocean SAR backscatter
    # SAR ocean has speckled grey texture (mean ~140 with Gaussian noise)
    h, w = 800, 800
    ocean = np.random.normal(140, 22, (h, w)).clip(60, 220).astype(np.uint8)

    # 1. Draw Primary Oil Slick (dark backscattering patch due to wave dampening)
    # Center around pixel (450, 400)
    slick_mask = np.zeros((h, w), dtype=np.uint8)
    
    # Oil slicks are elongated curved shapes
    pts = np.array([
        [410, 360], [460, 370], [510, 420], [520, 480], 
        [480, 520], [420, 510], [380, 460], [380, 400]
    ], np.int32)
    cv2.fillPoly(slick_mask, [pts], 255)
    
    # Smooth the edges to look natural like real fluid dispersion
    slick_mask = cv2.GaussianBlur(slick_mask, (21, 21), 0)
    
    # Subtract intensity from the ocean where the slick is (make it dark)
    dark_slick_factor = (slick_mask / 255.0) * 85
    ocean = np.clip(ocean - dark_slick_factor, 15, 255).astype(np.uint8)

    # 2. Draw a small natural look-alike biogenic patch (weaker contrast)
    lookalike_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(lookalike_mask, (220, 200), 45, 255, -1)
    lookalike_mask = cv2.GaussianBlur(lookalike_mask, (15, 15), 0)
    ocean = np.clip(ocean - (lookalike_mask / 255.0) * 45, 15, 255).astype(np.uint8)

    # Save image
    cv2.imwrite(img_path, ocean)
    print("[SUCCESS] Satellite SAR image generated successfully.")

    # 2. Run our OpenCV Image Processor
    print("\n2. Running Real OpenCV Computer Vision Pipeline...")
    results = analyze_sar_image(img_path)

    print("\n=== EXTRACTED REAL PROPERTIES ===")
    summary = results["summary"]
    print(f"Patches Detected:  {results['patchesDetected']}")
    print(f"Centroid Lat/Lon:  {summary['centroid']['lat']}° N, {summary['centroid']['lon']}° E")
    print(f"Surface Area:      {summary['areaKm2']} km²")
    print(f"Perimeter:         {summary['perimeterKm']} km")
    print(f"Orientation Axis:  {summary['orientationDeg']}°")
    print(f"Confidence:        {summary['confidence'] * 100}%")
    print(f"GeoJSON Features:  {len(results['slickGeoJSON']['features'])} primary slick, {len(results['lookalikesGeoJSON']['features'])} lookalikes")

if __name__ == "__main__":
    generate_and_test_sar()
