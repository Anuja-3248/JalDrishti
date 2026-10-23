import urllib.request
import os

def download_ais_sample():
    # A public URL hosting a small historical AIS sample CSV file
    url = "https://raw.githubusercontent.com/dma-ais/AisLib/master/aislib-messages/src/test/resources/nmea-messages.txt"
    dest_dir = "data"
    dest_path = os.path.join(dest_dir, "historical_sample.nmea")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    print(f"Downloading historical AIS sample data to {dest_path}...")
    try:
        urllib.request.urlretrieve(url, dest_path)
        print("Success! Sample dataset downloaded.")
    except Exception as e:
        print(f"Error downloading: {e}")

if __name__ == "__main__":
    download_ais_sample()
