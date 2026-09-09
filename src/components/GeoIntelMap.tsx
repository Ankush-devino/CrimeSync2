import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface GeoMarkerItem {
  id: string;
  type: 'CRIME_SCENE' | 'SUSPECT_SIGHTING' | 'BTS_TOWER_PING' | 'CCTV_DETECTION' | 'SAFE_ZONE' | 'HAWALA_HUB' | 'RAID_TARGET';
  title: string;
  description: string;
  lat: number;
  lng: number;
  locationName: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp?: string;
  suspectName?: string;
  confidence?: number;
  evidenceHash?: string;
  radiusMeters?: number;
  caseId?: string;
  caseTitle?: string;
}

export interface SuspectWaypoint {
  sequence: number;
  latitude: number;
  longitude: number;
  location_name: string;
  timestamp: string;
  speed_kmh: number;
  activity: string;
  activity_type?: string;
  forensic_narrative?: string;
  tower_id: string;
  cell_id?: string;
  signal_strength_dbm: number;
  transit_mode?: string;
  vehicle_plate?: string;
  cctv_corroboration?: {
    camera_code: string;
    face_match_confidence: number;
    frame_evidence_hash: string;
  };
  telecom_trace?: {
    imei: string;
    imsi: string;
    carrier: string;
    band: string;
  };
  legal_sections?: string[];
}

export interface SuspectTrack {
  id: string;
  suspectId: string;
  suspectName: string;
  caseId: string;
  city?: string;
  color: string;
  status: string;
  waypoints: SuspectWaypoint[];
}

export interface CctvNode {
  id: string;
  cameraCode: string;
  locationName: string;
  lat: number;
  lng: number;
  status: string;
  resolution: string;
  coverageRadiusMeters: number;
  lastDetection?: {
    suspectName: string;
    confidence: number;
    timestamp: string;
  };
  streamUrl?: string;
}

export interface PoliceStationNode {
  id: string;
  name: string;
  division: string;
  lat: number;
  lng: number;
  contact: string;
  pcrUnitsAvailable: number;
  responseRadiusKm: number;
}

export interface TriangulationResult {
  triangulated_latitude: number;
  triangulated_longitude: number;
  confidence_radius_meters: number;
  towers_utilized: number;
  confidence_score: number;
  algorithm: string;
}

interface GeoIntelMapProps {
  markers: GeoMarkerItem[];
  suspectTracks: SuspectTrack[];
  cctvFeeds: CctvNode[];
  policeStations: PoliceStationNode[];
  layers: {
    crimeScenes: boolean;
    suspectMovements: boolean;
    highRiskAreas: boolean;
    safeLocations: boolean;
    cctvCameras: boolean;
    policeStations: boolean;
  };
  activeTool: 'pointer' | 'measure' | 'pin' | 'triangulate';
  selectedItem: any | null;
  onSelectItem: (item: any) => void;
  onMapClick?: (lat: number, lng: number) => void;
  triangulationData?: TriangulationResult | null;
  triangulationTowers?: { latitude: number; longitude: number; distance_km: number; name?: string }[];
  playbackIndex?: number;
  centerCoordinates?: [number, number];
  zoom?: number;
}

export const GeoIntelMap: React.FC<GeoIntelMapProps> = ({
  markers,
  suspectTracks,
  cctvFeeds,
  policeStations,
  layers,
  activeTool,
  onSelectItem,
  onMapClick,
  triangulationData,
  triangulationTowers,
  playbackIndex,
  centerCoordinates = [28.6139, 77.2090], // New Delhi default
  zoom = 12,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    crimeScenes: L.LayerGroup;
    suspects: L.LayerGroup;
    cctv: L.LayerGroup;
    police: L.LayerGroup;
    triangulation: L.LayerGroup;
    proximity: L.LayerGroup;
  }>({
    crimeScenes: L.layerGroup(),
    suspects: L.layerGroup(),
    cctv: L.layerGroup(),
    police: L.layerGroup(),
    triangulation: L.layerGroup(),
    proximity: L.layerGroup(),
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: centerCoordinates,
      zoom: zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Official OpenStreetMap Tile Layer (No API Key Required)
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'osm-cyber-tiles',
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add layer groups
    Object.values(layerGroupsRef.current).forEach((group) => group.addTo(map));

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Center or zoom update
  useEffect(() => {
    if (mapInstanceRef.current && centerCoordinates) {
      mapInstanceRef.current.flyTo(centerCoordinates, zoom, { duration: 1.2 });
    }
  }, [centerCoordinates, zoom]);

  // Render Crime Scenes & Hotspot Markers
  useEffect(() => {
    const group = layerGroupsRef.current.crimeScenes;
    group.clearLayers();

    if (!layers.crimeScenes && !layers.highRiskAreas && !layers.safeLocations) return;

    markers.forEach((m) => {
      const isCrimeScene = m.type === 'CRIME_SCENE' || m.type === 'RAID_TARGET';
      const isHighRisk = m.type === 'HAWALA_HUB' || m.severity === 'CRITICAL' || m.severity === 'HIGH';
      const isSafe = m.type === 'SAFE_ZONE';

      if (isCrimeScene && !layers.crimeScenes) return;
      if (isHighRisk && !layers.highRiskAreas && !isCrimeScene) return;
      if (isSafe && !layers.safeLocations) return;

      const pinColor = isSafe ? '#10b981' : isCrimeScene ? '#a855f7' : '#ef4444';
      const glowColor = isSafe ? 'rgba(16,185,129,0.5)' : isCrimeScene ? 'rgba(168,85,247,0.5)' : 'rgba(239,68,68,0.5)';

      const customIcon = L.divIcon({
        className: 'custom-geo-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${glowColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.7;"></div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #081120; border: 2px solid ${pinColor}; box-shadow: 0 0 10px ${pinColor}; display: flex; align-items: center; justify-content: center; color: ${pinColor}; font-size: 11px; font-weight: bold; z-index: 2;">
              ${isCrimeScene ? '⚠' : isSafe ? '🛡' : '●'}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon });

      // Proximity Heat Circle
      if (layers.highRiskAreas && (m.radiusMeters || 400) > 0) {
        L.circle([m.lat, m.lng], {
          radius: m.radiusMeters || 400,
          color: pinColor,
          fillColor: pinColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(group);
      }

      // Popup Content
      const popupHtml = `
        <div style="padding: 12px; min-width: 220px; font-family: Inter, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: ${pinColor}; background: ${glowColor}; padding: 2px 6px; border-radius: 4px;">
              ${m.type.replace(/_/g, ' ')}
            </span>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ACTIVE'}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${m.title}</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">${m.locationName}</div>
          <div style="font-size: 10px; color: #94a3b8; line-height: 1.4; margin-bottom: 8px; border-top: 1px solid #1e293b; padding-top: 6px;">
            ${m.description}
          </div>
          ${
            m.suspectName
              ? `<div style="font-size: 11px; color: #f87171; font-weight: 600; margin-bottom: 4px;">Suspect: ${m.suspectName}</div>`
              : ''
          }
          ${
            m.confidence
              ? `<div style="font-size: 10px; color: #38bdf8;">AI Confidence: ${m.confidence}%</div>`
              : ''
          }
          ${
            m.evidenceHash
              ? `<div style="font-size: 9px; color: #64748b; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 6px;">Hash: ${m.evidenceHash.slice(0, 18)}...</div>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'cyber-leaflet-popup' });
      marker.on('click', () => onSelectItem(m));
      marker.addTo(group);
    });
  }, [markers, layers]);

  // Render Suspect Movements & GPS Trails
  useEffect(() => {
    const group = layerGroupsRef.current.suspects;
    group.clearLayers();

    if (!layers.suspectMovements) return;

    suspectTracks.forEach((track) => {
      const waypoints = track.waypoints || [];
      if (waypoints.length === 0) return;

      const activeWaypoints =
        playbackIndex !== undefined ? waypoints.slice(0, playbackIndex + 1) : waypoints;

      const latLngs: [number, number][] = activeWaypoints.map((wp) => [wp.latitude, wp.longitude]);

      if (latLngs.length > 1) {
        // Glowing Polyline Trail
        L.polyline(latLngs, {
          color: track.color || '#ef4444',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 6',
          lineCap: 'round',
        }).addTo(group);
      }

      // Waypoint Dots
      activeWaypoints.forEach((wp, idx) => {
        const isLatest = idx === activeWaypoints.length - 1;
        const icon = L.divIcon({
          className: 'suspect-wp-icon',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ${
                isLatest
                  ? `<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${track.color}; opacity: 0.7; animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>`
                  : ''
              }
              <div style="width: ${isLatest ? '24px' : '18px'}; height: ${isLatest ? '24px' : '18px'}; border-radius: 50%; background: #081120; border: 2px solid ${track.color}; box-shadow: 0 0 12px ${track.color}; display: flex; align-items: center; justify-content: center; font-size: ${isLatest ? '10px' : '8px'}; color: #fff; font-weight: 800; font-family: monospace; z-index: 5;">
                ${wp.sequence}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([wp.latitude, wp.longitude], { icon });
        const popupContent = `
          <div style="padding: 12px; min-width: 260px; max-width: 320px; font-family: Inter, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 9px; font-weight: 800; color: ${track.color}; text-transform: uppercase; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 4px; letter-spacing: 0.05em;">
                ${track.suspectName} • Checkpoint #${wp.sequence}
              </span>
              <span style="font-size: 11px; font-weight: bold; color: #38bdf8; font-family: monospace;">${wp.timestamp}</span>
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin: 4px 0 2px 0;">${wp.location_name}</div>
            
            <div style="font-size: 10px; color: #e2e8f0; background: rgba(8,16,34,0.95); border: 1px solid #1e2e4a; border-radius: 6px; padding: 7px; margin: 6px 0; line-height: 1.4;">
              <div style="color: #f59e0b; font-weight: 700; margin-bottom: 2px;">⚡ ${wp.activity}</div>
              ${wp.forensic_narrative ? `<div style="color: #94a3b8; font-size: 9.5px; margin-top: 4px; line-height: 1.4;">${wp.forensic_narrative}</div>` : ''}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9.5px; margin: 6px 0; font-family: monospace;">
              <div style="color: #94a3b8;">Speed: <b style="color: #fff;">${wp.speed_kmh} km/h</b></div>
              <div style="color: #94a3b8;">Transit: <b style="color: #38bdf8;">${wp.transit_mode || 'In-Transit'}</b></div>
              <div style="color: #94a3b8;">Tower: <b style="color: #818cf8;">${wp.tower_id}</b></div>
              <div style="color: #94a3b8;">Signal: <b style="color: #10b981;">${wp.signal_strength_dbm} dBm</b></div>
            </div>

            ${wp.telecom_trace ? `
              <div style="font-size: 9px; color: #64748b; font-family: monospace; border-top: 1px solid #1e293b; padding-top: 4px; margin-top: 4px;">
                IMEI: <b style="color: #94a3b8;">${wp.telecom_trace.imei}</b> | ${wp.telecom_trace.carrier}
              </div>
            ` : ''}

            ${wp.cctv_corroboration ? `
              <div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35); border-radius: 4px; padding: 5px; margin-top: 5px; font-size: 9.5px; color: #f87171;">
                📹 CCTV Match: <b>${wp.cctv_corroboration.camera_code}</b> (${wp.cctv_corroboration.face_match_confidence}%)
              </div>
            ` : ''}
          </div>
        `;
        marker.bindPopup(popupContent, { className: 'cyber-leaflet-popup', autoPan: false, offset: [0, -14] });
        marker.on('click', () => onSelectItem({ ...track, currentWaypoint: wp }));
        marker.addTo(group);

        if (isLatest) {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([wp.latitude, wp.longitude], { animate: true, duration: 0.8 });
          }
        }
      });
    });
  }, [suspectTracks, layers.suspectMovements, playbackIndex]);

  // Render CCTV Feeds
  useEffect(() => {
    const group = layerGroupsRef.current.cctv;
    group.clearLayers();

    if (!layers.cctvCameras) return;

    cctvFeeds.forEach((cam) => {
      const isAlert = cam.status === 'ALERT_TRIGGERED';
      const icon = L.divIcon({
        className: 'cctv-cam-icon',
        html: `
          <div style="width: 28px; height: 28px; border-radius: 6px; background: #07101e; border: 1.5px solid ${isAlert ? '#ef4444' : '#38bdf8'}; box-shadow: 0 0 10px ${isAlert ? '#ef4444' : '#38bdf8'}; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${isAlert ? '#ef4444' : '#38bdf8'}; font-size: 12px;">
            📹
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([cam.lat, cam.lng], { icon });
      const popupContent = `
        <div style="padding: 10px; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 9px; font-weight: bold; color: ${isAlert ? '#ef4444' : '#38bdf8'};">${cam.cameraCode}</span>
            <span style="font-size: 9px; color: #94a3b8;">${cam.resolution}</span>
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #fff; margin: 3px 0;">${cam.locationName}</div>
          ${
            cam.lastDetection
              ? `<div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 4px 6px; margin: 6px 0; font-size: 10px; color: #f87171;">
                  ⚠ Match: <b>${cam.lastDetection.suspectName}</b> (${cam.lastDetection.confidence}%)
                 </div>`
              : `<div style="font-size: 10px; color: #10b981; margin: 4px 0;">● Feed Live & Clear</div>`
          }
          <div style="font-size: 9px; color: #64748b;">Coverage: ${cam.coverageRadiusMeters}m radius</div>
        </div>
      `;
      marker.bindPopup(popupContent, { className: 'cyber-leaflet-popup' });
      marker.on('click', () => onSelectItem(cam));
      marker.addTo(group);
    });
  }, [cctvFeeds, layers.cctvCameras]);

  // Render Police Stations & Patrols
  useEffect(() => {
    const group = layerGroupsRef.current.police;
    group.clearLayers();

    if (!layers.policeStations) return;

    policeStations.forEach((ps) => {
      const icon = L.divIcon({
        className: 'police-station-icon',
        html: `
          <div style="width: 28px; height: 28px; border-radius: 6px; background: #0b172a; border: 1.5px solid #3b82f6; box-shadow: 0 0 10px #3b82f6; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #60a5fa; font-size: 12px;">
            🚓
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([ps.lat, ps.lng], { icon });

      // Patrol response circle
      L.circle([ps.lat, ps.lng], {
        radius: ps.responseRadiusKm * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '3, 5',
      }).addTo(group);

      const popupContent = `
        <div style="padding: 10px; min-width: 200px;">
          <div style="font-size: 9px; font-weight: bold; color: #60a5fa; text-transform: uppercase;">POLICE HEADQUARTERS</div>
          <div style="font-size: 12px; font-weight: bold; color: #fff; margin: 3px 0;">${ps.name}</div>
          <div style="font-size: 10px; color: #94a3b8;">${ps.division}</div>
          <div style="font-size: 10px; color: #10b981; margin-top: 4px;">PCR Units on Alert: ${ps.pcrUnitsAvailable} Vehicles</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Contact: ${ps.contact}</div>
        </div>
      `;
      marker.bindPopup(popupContent, { className: 'cyber-leaflet-popup' });
      marker.on('click', () => onSelectItem(ps));
      marker.addTo(group);
    });
  }, [policeStations, layers.policeStations]);

  // Render Triangulation Centroid & Polygon
  useEffect(() => {
    const group = layerGroupsRef.current.triangulation;
    group.clearLayers();

    if (!triangulationData) return;

    const centroidLat = triangulationData.triangulated_latitude;
    const centroidLng = triangulationData.triangulated_longitude;

    // Draw Triangulation Towers & Circles if available
    if (triangulationTowers && triangulationTowers.length > 0) {
      const towerCoords: [number, number][] = [];

      triangulationTowers.forEach((tower, idx) => {
        towerCoords.push([tower.latitude, tower.longitude]);

        // Tower Icon
        const towerIcon = L.divIcon({
          className: 'bts-tower-icon',
          html: `
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #1e1b4b; border: 2px solid #818cf8; display: flex; align-items: center; justify-content: center; color: #a5b4fc; font-size: 10px;">
              📡
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([tower.latitude, tower.longitude], { icon: towerIcon })
          .bindPopup(`<b>BTS Cell Tower #${idx + 1}</b><br>Distance: ${tower.distance_km} km`, {
            className: 'cyber-leaflet-popup',
          })
          .addTo(group);

        // Tower signal radius
        L.circle([tower.latitude, tower.longitude], {
          radius: tower.distance_km * 1000,
          color: '#818cf8',
          fillOpacity: 0.04,
          weight: 1.2,
          dashArray: '5, 5',
        }).addTo(group);
      });

      // Triangulation Centroid Connecting Lines
      towerCoords.forEach((coord) => {
        L.polyline([coord, [centroidLat, centroidLng]], {
          color: '#f59e0b',
          weight: 1.5,
          dashArray: '3, 4',
        }).addTo(group);
      });
    }

    // Centroid Marker
    const centroidIcon = L.divIcon({
      className: 'triangulation-centroid-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(245,158,11,0.4); animation: ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #0f172a; border: 2px solid #f59e0b; box-shadow: 0 0 14px #f59e0b; display: flex; align-items: center; justify-content: center; color: #f59e0b; font-size: 12px; font-weight: bold;">
            🎯
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const centroidMarker = L.marker([centroidLat, centroidLng], { icon: centroidIcon });
    centroidMarker.bindPopup(
      `
      <div style="padding: 10px;">
        <div style="font-size: 9px; font-weight: bold; color: #f59e0b; text-transform: uppercase;">
          TRIANGULATED POSITION
        </div>
        <div style="font-size: 12px; font-weight: bold; color: #fff; margin: 3px 0;">
          Centroid Coordinates: ${centroidLat.toFixed(5)}, ${centroidLng.toFixed(5)}
        </div>
        <div style="font-size: 10px; color: #38bdf8;">Confidence Score: ${triangulationData.confidence_score}%</div>
        <div style="font-size: 10px; color: #94a3b8;">Error Radius: ±${triangulationData.confidence_radius_meters}m</div>
        <div style="font-size: 9px; color: #64748b; margin-top: 4px;">Method: ${triangulationData.algorithm}</div>
      </div>
    `,
      { className: 'cyber-leaflet-popup' }
    );
    centroidMarker.addTo(group);

    // Centroid Error Circle
    L.circle([centroidLat, centroidLng], {
      radius: triangulationData.confidence_radius_meters,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.18,
      weight: 2,
    }).addTo(group);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centroidLat, centroidLng], 14, { duration: 1.2 });
    }
  }, [triangulationData, triangulationTowers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] rounded-lg overflow-hidden" />
      {/* Dynamic Crosshair Indicator for Pin Mode */}
      {activeTool === 'pin' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-blue-900/90 border border-blue-500/80 text-blue-200 text-xs font-semibold shadow-lg backdrop-blur-md z-[1000] flex items-center gap-2 pointer-events-none animate-pulse">
          <span>📍</span> Click anywhere on map to drop a new Field Intelligence pin
        </div>
      )}
    </div>
  );
};
