import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Radio, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Flame,
  Shield,
  Layers,
  Crosshair
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { getActiveCaseIntelligence } from '../data/activeCaseNetworks';
import { api } from '../services/api';

const CITY_COORDINATES: Record<string, [number, number]> = {
  'ALL': [22.9734, 78.6569], // Central India overview
  'New Delhi': [28.6139, 77.2090],
  'Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bengaluru': [12.9716, 77.5946],
  'Bangalore': [12.9716, 77.5946],
  'Hyderabad': [17.3850, 78.4867],
  'Kolkata': [22.5726, 88.3639],
  'Ahmedabad': [23.0225, 72.5714],
  'Pune': [18.5204, 73.8567],
  'Jaipur': [26.9124, 75.7873],
  'Chennai': [13.0827, 80.2707],
  'Surat': [21.1702, 72.8311],
  'Noida': [28.5355, 77.3910],
  'Gurugram': [28.4595, 77.0266],
};

function getCaseCoordinates(caseItem: any, fallbackCity = 'New Delhi'): [number, number] {
  if (!caseItem) return CITY_COORDINATES[fallbackCity] || [28.6139, 77.2090];
  const jur = (caseItem.jurisdiction_city || caseItem.city || fallbackCity).toLowerCase();
  
  if (jur.includes('mumbai') || caseItem.id === 'CASE-2026-002' || caseItem.id === 'CASE-2026-005') return CITY_COORDINATES['Mumbai'];
  if (jur.includes('kolkata') || caseItem.id === 'CASE-2026-004') return CITY_COORDINATES['Kolkata'];
  if (jur.includes('bengaluru') || jur.includes('bangalore') || caseItem.id === 'CASE-2026-003' || caseItem.id === 'CASE-2026-007') return CITY_COORDINATES['Bengaluru'];
  if (jur.includes('ahmedabad') || jur.includes('surat') || caseItem.id === 'CASE-2026-006') return CITY_COORDINATES['Ahmedabad'];
  if (jur.includes('pune') || caseItem.id === 'CASE-2026-008') return CITY_COORDINATES['Pune'];
  if (jur.includes('chennai') || caseItem.id === 'CASE-2026-009') return CITY_COORDINATES['Chennai'];
  if (jur.includes('hyderabad')) return CITY_COORDINATES['Hyderabad'];
  if (jur.includes('jaipur')) return CITY_COORDINATES['Jaipur'];
  if (jur.includes('delhi') || caseItem.id === 'CASE-2026-001') return CITY_COORDINATES['New Delhi'];

  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    if (jur.includes(cityName.toLowerCase())) return coords;
  }
  return CITY_COORDINATES['New Delhi'];
}

interface ThreatHeatmapProps {
  onNavigateTab?: (tab: string) => void;
}

export const ThreatHeatmap: React.FC<ThreatHeatmapProps> = ({ onNavigateTab }) => {
  const { selectedCase, selectedCaseId } = useCaseContext();

  const caseIntel = useMemo(() => {
    return getActiveCaseIntelligence(selectedCase || { id: selectedCaseId });
  }, [selectedCase, selectedCaseId]);

  const activeHotspot = caseIntel.geoHotspot;
  const targetCoords = useMemo(() => {
    return getCaseCoordinates(selectedCase, activeHotspot.cityName);
  }, [selectedCase, activeHotspot.cityName]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  const [hotspotCount, setHotspotCount] = useState(4);
  const [activeTracksCount, setActiveTracksCount] = useState(1);

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: targetCoords,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // Dark-mode OpenStreetMap cyber tile layer (same as Geo Intelligence)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'osm-cyber-tiles',
    }).addTo(map);

    layerGroupRef.current.addTo(map);
    mapInstanceRef.current = map;

    // Trigger invalidateSize after initial mount to prevent tile clipping
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Smoothly Fly and Zoom to active case location whenever active investigation changes
  useEffect(() => {
    if (mapInstanceRef.current && targetCoords) {
      mapInstanceRef.current.flyTo(targetCoords, 13, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [targetCoords, selectedCaseId]);

  // Load and render real case markers, heat circles & trails from Geo API / activeCaseNetworks
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const group = layerGroupRef.current;
    group.clearLayers();

    let isSubscribed = true;

    async function loadCaseGeoData() {
      try {
        const [hotspotsRes, tracksRes] = await Promise.all([
          api.geo.getHotspots({ case_id: selectedCaseId !== 'ALL' ? selectedCaseId : undefined }),
          api.geo.getSuspectMovements(selectedCaseId !== 'ALL' ? selectedCaseId : undefined),
        ]);

        if (!isSubscribed) return;

        let markersToRender: Array<{
          lat: number;
          lng: number;
          title: string;
          type: string;
          severity: string;
          radius: number;
          suspect?: string;
        }> = [];

        if (hotspotsRes && hotspotsRes.length > 0) {
          markersToRender = hotspotsRes.map((h: any) => ({
            lat: Number(h.latitude),
            lng: Number(h.longitude),
            title: h.title || h.location_name || 'Crime Hotspot',
            type: h.event_type || 'CRIME_SCENE',
            severity: h.severity || 'HIGH',
            radius: Number(h.radius_meters) || 450,
            suspect: h.suspect_name,
          }));
          setHotspotCount(markersToRender.length);
        } else {
          // Fallback dynamic synthesis around center coordinates
          const [centerLat, centerLng] = targetCoords;
          markersToRender = [
            {
              lat: centerLat + 0.008,
              lng: centerLng - 0.006,
              title: `${activeHotspot.cityName} Primary Incident Area`,
              type: 'CRIME_SCENE',
              severity: 'CRITICAL',
              radius: 600,
              suspect: selectedCase?.lead_suspect || 'Primary Suspect',
            },
            {
              lat: centerLat - 0.012,
              lng: centerLng + 0.009,
              title: 'Hawala Transit & C2 Endpoint',
              type: 'HAWALA_HUB',
              severity: 'HIGH',
              radius: 400,
            },
            {
              lat: centerLat + 0.015,
              lng: centerLng + 0.018,
              title: 'Intercepted Cell Tower BTS Node',
              type: 'BTS_TOWER_PING',
              severity: 'MEDIUM',
              radius: 300,
            },
          ];
          setHotspotCount(markersToRender.length);
        }

        // Render markers with glowing divs and pulsing circles
        markersToRender.forEach((m) => {
          const isCritical = m.severity === 'CRITICAL';
          const pinColor = isCritical ? '#ef4444' : '#06b6d4';
          const glowColor = isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)';

          const icon = L.divIcon({
            className: 'mini-geo-pin',
            html: `
              <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${glowColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
                <div style="width: 16px; height: 16px; border-radius: 50%; background: #081120; border: 2px solid ${pinColor}; box-shadow: 0 0 10px ${pinColor}; display: flex; align-items: center; justify-content: center; color: ${pinColor}; font-size: 8px; font-weight: 900; z-index: 2;">
                  ${isCritical ? '⚠' : '●'}
                </div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          // Heat Radius Circle
          L.circle([m.lat, m.lng], {
            radius: m.radius,
            color: pinColor,
            fillColor: pinColor,
            fillOpacity: isCritical ? 0.18 : 0.1,
            weight: 1.2,
            dashArray: '4, 4',
          }).addTo(group);

          // Marker & Mini Popup
          const marker = L.marker([m.lat, m.lng], { icon });
          marker.bindPopup(`
            <div style="padding: 8px; font-family: Inter, sans-serif; min-width: 170px;">
              <div style="font-size: 8.5px; font-weight: 800; color: ${pinColor}; text-transform: uppercase;">
                ${m.type.replace(/_/g, ' ')}
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #fff; margin: 2px 0;">${m.title}</div>
              <div style="font-size: 9px; color: #94a3b8;">${activeHotspot.cityName} Sector • ${m.severity} Risk</div>
            </div>
          `, { className: 'cyber-leaflet-popup', offset: [0, -10] });

          marker.addTo(group);
        });

        // Render Suspect GPS Trails if available
        if (tracksRes && tracksRes.length > 0) {
          setActiveTracksCount(tracksRes.length);
          tracksRes.forEach((track: any) => {
            const waypoints = track.waypoints || [];
            if (waypoints.length > 1) {
              const latLngs: [number, number][] = waypoints.map((w: any) => [w.latitude, w.longitude]);
              L.polyline(latLngs, {
                color: track.color || '#ef4444',
                weight: 3,
                opacity: 0.85,
                dashArray: '6, 6',
              }).addTo(group);

              // Waypoint points
              waypoints.forEach((w: any) => {
                const wpIcon = L.divIcon({
                  className: 'mini-wp-icon',
                  html: `
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #081120; border: 2px solid ${track.color || '#ef4444'}; box-shadow: 0 0 6px ${track.color || '#ef4444'};"></div>
                  `,
                  iconSize: [10, 10],
                  iconAnchor: [5, 5],
                });
                L.marker([w.latitude, w.longitude], { icon: wpIcon }).addTo(group);
              });
            }
          });
        } else {
          setActiveTracksCount(1);
        }

      } catch (err) {
        console.warn('Threat heatmap geo sync error:', err);
      }
    }

    loadCaseGeoData();

    return () => {
      isSubscribed = false;
    };
  }, [selectedCaseId, targetCoords, activeHotspot]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current && targetCoords) {
      mapInstanceRef.current.flyTo(targetCoords, 13, { duration: 1.2 });
    }
  };

  return (
    <div 
      className="p-4 rounded-2xl bg-gradient-to-b from-[#081326]/95 via-[#040c1a]/95 to-[#020610]/95 border border-cyan-500/30 hover:border-cyan-400/70 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-250 isolate"
    >
      {/* Background Cyber Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                NATIONAL GEO MAP
              </span>
              <span className="text-[9px] text-slate-400 block">Live Case Coordinates & Hotspot Density</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold">
            <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
            <span>OpenStreetMap</span>
          </div>
        </div>

        {/* Active Case Jurisdiction Highlight Pill */}
        <div className="mt-2 px-2.5 py-1 rounded-lg bg-[#07192e] border border-cyan-500/40 flex items-center justify-between">
          <span className="text-[10px] text-slate-300">
            Case Sector: <strong className="text-cyan-300">{activeHotspot.cityName}</strong> ({activeHotspot.state})
          </span>
          <span className="text-[9px] font-mono font-bold text-red-400 bg-red-950/80 px-1.5 py-0.2 rounded border border-red-500/40">
            {activeHotspot.riskLevel} DENSITY
          </span>
        </div>
      </div>

      {/* ─── LIVE LEAFLET OPENSTREETMAP CONTAINER (ZOOMING INTO CASE LOCATION) ─── */}
      <div className="relative flex-1 min-h-[170px] w-full my-2 bg-[#030814] rounded-xl border border-slate-900/90 overflow-hidden shadow-inner isolate">
        <div ref={mapContainerRef} className="w-full h-full min-h-[170px]" />

        {/* Mini Map Navigation Overlay Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          <button
            onClick={handleZoomIn}
            className="w-6 h-6 rounded-md bg-[#081122]/90 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-white flex items-center justify-center shadow-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-6 h-6 rounded-md bg-[#081122]/90 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-white flex items-center justify-center shadow-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-cyan-300" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-6 h-6 rounded-md bg-[#081122]/90 border border-slate-700/80 hover:border-amber-400 text-slate-200 hover:text-white flex items-center justify-center shadow-md transition-colors"
            title="Recenter on Active Investigation"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>

        {/* Coordinates Watermark */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 border border-slate-800 text-[8.5px] font-mono text-cyan-300 pointer-events-none z-20 backdrop-blur-sm">
          {targetCoords[0].toFixed(4)}° N, {targetCoords[1].toFixed(4)}° E • {hotspotCount} Nodes
        </div>
      </div>

      {/* Footer Action */}
      <div 
        onClick={() => onNavigateTab && onNavigateTab('geo-intelligence')}
        className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs cursor-pointer hover:text-white transition-colors"
      >
        <span className="text-[10px] text-slate-400 font-mono">
          {activeHotspot.activeSurveillanceUnit}
        </span>
        <button
          className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]"
        >
          <span>Full Geo Map</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
