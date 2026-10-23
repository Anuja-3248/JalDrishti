import os
import csv
from datetime import datetime, timedelta
import random

def generate_historical_ais():
    dest_dir = "data"
    dest_path = os.path.join(dest_dir, "historical_noaa_dma_sample.csv")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    print(f"Generating mock historical NOAA/DMA AIS dataset at: {dest_path}")
    
    # Let's generate a list of vessels and their tracks
    vessels = [
        {"mmsi": "412345001", "name": "MV KONKAN STAR", "type": "Tanker", "start_lat": 17.05, "start_lon": 72.05, "heading": 305, "speed": 11.5},
        {"mmsi": "412345002", "name": "MT AZURE HORIZON", "type": "Tanker", "start_lat": 17.50, "start_lon": 72.20, "heading": 235, "speed": 9.8},
        {"mmsi": "412345003", "name": "MV SILVER TIDE", "type": "Cargo", "start_lat": 16.90, "start_lon": 71.60, "heading": 20, "speed": 13.2},
        {"mmsi": "412345004", "name": "MV BLUE HERON", "type": "Cargo", "start_lat": 17.70, "start_lon": 71.40, "heading": 150, "speed": 12.0},
    ]
    
    base_time = datetime(2026, 8, 30, 12, 0, 0)
    
    headers = [
        "Timestamp", "MMSI", "Latitude", "Longitude", "SOG", "COG", "Heading", 
        "VesselName", "VesselType", "Status"
    ]
    
    with open(dest_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        # Generate 10 tracking points for each vessel
        for vessel in vessels:
            lat = vessel["start_lat"]
            lon = vessel["start_lon"]
            for i in range(15):
                time_offset = base_time + timedelta(minutes=i * 20)
                time_str = time_offset.strftime("%Y-%m-%d %H:%M:%S")
                
                # Realistic nautical speed calculation:
                # 1 knot = 1 nautical mile per hour
                # 1 nautical mile = 1/60 degree of latitude (~0.01667 degrees)
                dist_nm = vessel["speed"] * (20 / 60.0) # distance in nm for 20 min
                dist_deg = dist_nm / 60.0               # distance in degrees
                
                import math
                rad = math.radians(vessel["heading"])
                lon += (dist_deg / math.cos(math.radians(lat))) * math.sin(rad)
                lat += dist_deg * math.cos(rad)
                
                # Add some slight random variation to coordinates and speed
                actual_lat = round(lat + random.uniform(-0.001, 0.001), 5)
                actual_lon = round(lon + random.uniform(-0.001, 0.001), 5)
                actual_speed = round(vessel["speed"] + random.uniform(-0.5, 0.5), 1)
                actual_cog = round(vessel["heading"] + random.uniform(-5, 5)) % 360
                
                # Write row
                writer.writerow([
                    time_str, 
                    vessel["mmsi"], 
                    actual_lat, 
                    actual_lon, 
                    actual_speed, 
                    actual_cog, 
                    actual_cog, 
                    vessel["name"], 
                    vessel["type"], 
                    "Under way using engine"
                ])
                
    print("Success! Dataset generated.")

if __name__ == "__main__":
    generate_historical_ais()
