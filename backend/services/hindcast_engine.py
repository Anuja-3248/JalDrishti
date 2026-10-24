import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple

# Regional hydrodynamic climatology for Arabian Sea / Konkan Coast (Sector 4)
# Surface current typically flows South-Southeast at 0.8 - 1.4 knots
# Surface wind typically blows from NW/WNW at 10 - 16 knots
DEFAULT_METOCEAN = {
    "current_speed_kn": 1.1,      # knots
    "current_dir_deg": 145.0,     # direction current is flowing TOWARDS (degrees from North)
    "wind_speed_kn": 12.5,        # knots
    "wind_dir_deg": 130.0,        # direction wind is blowing TOWARDS (degrees from North)
}

def calculate_drift_vector(current_speed: float, current_dir: float, 
                           wind_speed: float, wind_dir: float) -> Tuple[float, float, float]:
    """
    Computes total surface oil drift velocity using the standard leeway model:
    V_oil = 1.0 * V_current + 0.03 * V_wind
    Returns (speed_knots, direction_deg_towards, speed_m_per_s)
    """
    # Decompose current vector into North and East components (in knots)
    c_rad = math.radians(current_dir)
    c_north = current_speed * math.cos(c_rad)
    c_east = current_speed * math.sin(c_rad)

    # Decompose wind leeway (3% of 10m wind vector)
    w_rad = math.radians(wind_dir)
    w_leeway = 0.03 * wind_speed
    w_north = w_leeway * math.cos(w_rad)
    w_east = w_leeway * math.sin(w_rad)

    # Net drift vector
    net_north = c_north + w_north
    net_east = c_east + w_east
    
    net_speed_kn = math.sqrt(net_north**2 + net_east**2)
    net_dir_rad = math.atan2(net_east, net_north)
    net_dir_deg = (math.degrees(net_dir_rad) + 360.0) % 360.0
    net_speed_mps = net_speed_kn * 0.514444

    return round(net_speed_kn, 2), round(net_dir_deg, 1), round(net_speed_mps, 2)

def run_backward_hindcast(
    slick_lat: float, 
    slick_lon: float, 
    detection_time_iso: str = "2026-08-30T12:00:00Z",
    hours_back: float = 7.5,
    metocean: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Simulates backward hydrodynamic trajectory from the detected slick location
    back to the estimated illegal discharge origin point.
    """
    env = metocean or DEFAULT_METOCEAN
    speed_kn, forward_dir_deg, speed_mps = calculate_drift_vector(
        env["current_speed_kn"], env["current_dir_deg"],
        env["wind_speed_kn"], env["wind_dir_deg"]
    )

    # Backward trajectory travels opposite to forward drift direction
    reverse_dir_deg = (forward_dir_deg + 180.0) % 360.0
    rev_rad = math.radians(reverse_dir_deg)

    # Parse detection time
    try:
        clean_time = detection_time_iso.replace("Z", "+00:00")
        t_detect = datetime.fromisoformat(clean_time)
    except Exception:
        t_detect = datetime(2026, 8, 30, 12, 0, 0)

    # Step backwards hour-by-hour to generate the trajectory path
    steps = max(4, int(hours_back * 2))
    dt_hours = hours_back / steps
    
    trajectory_points = []
    curr_lat, curr_lon = slick_lat, slick_lon
    
    for i in range(steps + 1):
        elapsed_hours = i * dt_hours
        point_time = t_detect - timedelta(hours=elapsed_hours)
        
        trajectory_points.append({
            "step": i,
            "hoursBeforeDetection": round(elapsed_hours, 1),
            "timestamp": point_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "lat": round(curr_lat, 5),
            "lon": round(curr_lon, 5)
        })
        
        # Step coordinates backwards
        # 1 nautical mile = 1/60 degree latitude
        dist_step_nm = speed_kn * dt_hours
        d_lat = (dist_step_nm / 60.0) * math.cos(rev_rad)
        d_lon = (dist_step_nm / (60.0 * max(0.1, math.cos(math.radians(curr_lat))))) * math.sin(rev_rad)
        
        curr_lat += d_lat
        curr_lon += d_lon

    origin_point = trajectory_points[-1]
    origin_lat = origin_point["lat"]
    origin_lon = origin_point["lon"]

    # Calculate origin uncertainty ellipse / circle (radius ~ 2.5 nm due to turbulent diffusion)
    radius_nm = round(1.2 + (hours_back * 0.25), 1)
    radius_deg_lat = radius_nm / 60.0
    radius_deg_lon = radius_nm / (60.0 * math.cos(math.radians(origin_lat)))

    origin_circle_coords = []
    for deg in range(0, 361, 15):
        rad = math.radians(deg)
        p_lat = origin_lat + radius_deg_lat * math.sin(rad)
        p_lon = origin_lon + radius_deg_lon * math.cos(rad)
        origin_circle_coords.append([round(p_lon, 5), round(p_lat, 5)])

    # Estimated release time window (origin time +- 1.5 hours)
    release_center_time = t_detect - timedelta(hours=hours_back)
    release_start = release_center_time - timedelta(hours=1.5)
    release_end = release_center_time + timedelta(hours=1.5)

    # GeoJSON Origin polygon
    origin_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {
                "id": "origin-zone-hindcast",
                "estimatedReleaseTime": release_center_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "releaseWindowStart": release_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "releaseWindowEnd": release_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "confidenceRadiusNm": radius_nm,
                "driftSpeedKnots": speed_kn,
                "driftDirectionDeg": forward_dir_deg,
                "hoursBack": hours_back,
                "method": "reverse_leeway_advection"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [origin_circle_coords]
            }
        }]
    }

    # GeoJSON Backward Drift Trajectory Vector (LineString)
    vector_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {
                "id": "hindcast-trajectory-vector",
                "fromCentroid": [slick_lon, slick_lat],
                "toOrigin": [origin_lon, origin_lat],
                "hours": hours_back
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [[p["lon"], p["lat"]] for p in trajectory_points]
            }
        }]
    }

    return {
        "status": "success",
        "originCenter": {"lat": origin_lat, "lon": origin_lon},
        "uncertaintyRadiusNm": radius_nm,
        "hoursBack": hours_back,
        "estimatedReleaseTime": release_center_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "releaseWindow": {
            "start": release_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end": release_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "durationHours": 3.0
        },
        "driftParameters": {
            "netDriftSpeedKnots": speed_kn,
            "netDriftDirectionDeg": forward_dir_deg,
            "oceanCurrentKnots": env["current_speed_kn"],
            "windSpeedKnots": env["wind_speed_kn"]
        },
        "originGeoJSON": origin_geojson,
        "backwardVectorGeoJSON": vector_geojson,
        "trajectory": trajectory_points
    }
