import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  ChevronDown,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  MapPin,
  Car,
  AlertTriangle,
  Flame,
  Shield,
  Layers,
  ArrowRight,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Radio,
  Eye,
  Camera,
  Building2,
  Clock,
  Compass,
  X,
  Target,
  User as UserIcon,
  Activity,
  Share2,
  Download,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Sliders,
  Send,
  Video
} from 'lucide-react';
import { GeoIntelMap } from '../components/GeoIntelMap';
import type { GeoMarkerItem, SuspectTrack, CctvNode, PoliceStationNode, TriangulationResult } from '../components/GeoIntelMap';
import { api } from '../services/api';
import { useCaseContext } from '../context/CaseContext';
import { logOfficerAction } from '../services/activityLogger';

const CITY_COORDINATES: Record<string, [number, number]> = {
  'ALL': [22.9734, 78.6569], // Central India overview
  'New Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bengaluru': [12.9716, 77.5946],
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

interface GeoIntelligencePageProps {
  onSelectAction?: (action: string) => void;
}

export const GeoIntelligencePage: React.FC<GeoIntelligencePageProps> = ({
  onSelectAction,
}) => {
  const { selectedCaseId, selectedCase, cases, setSelectedCaseId } = useCaseContext();

  // State for data
  const [markers, setMarkers] = useState<GeoMarkerItem[]>([]);
  const [suspectTracks, setSuspectTracks] = useState<SuspectTrack[]>([]);
  const [cctvFeeds, setCctvFeeds] = useState<CctvNode[]>([]);
  const [policeStations, setPoliceStations] = useState<PoliceStationNode[]>([]);
  const [cityClusters, setCityClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & View State
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi');
  const [activeTimeRange, setActiveTimeRange] = useState<string>('Last 7 Days');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState<boolean>(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'hotspots' | 'suspects' | 'playback' | 'cctv' | 'clusters'>('hotspots');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Layer toggles
  const [layers, setLayers] = useState({
    crimeScenes: true,
    suspectMovements: true,
    highRiskAreas: true,
    safeLocations: true,
    cctvCameras: true,
    policeStations: true,
  });

  // Tools & Modals
  const [activeTool, setActiveTool] = useState<'pointer' | 'measure' | 'pin' | 'triangulate'>('pointer');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isTriangulateModalOpen, setIsTriangulateModalOpen] = useState<boolean>(false);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState<boolean>(false);
  const [isCctvModalOpen, setIsCctvModalOpen] = useState<boolean>(false);
  const [selectedCctv, setSelectedCctv] = useState<CctvNode | null>(null);

  // New Pin form state
  const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [newPinForm, setNewPinForm] = useState({
    title: '',
    locationName: '',
    eventType: 'SUSPECT_SIGHTING' as const,
    severity: 'HIGH' as const,
    suspectName: 'Aman Khan',
    description: '',
    radiusMeters: 400,
  });

  // Triangulation state
  const [triangulationResult, setTriangulationResult] = useState<TriangulationResult | null>(null);
  const [triangulationTowers, setTriangulationTowers] = useState<any[]>([
    { latitude: 28.5672, longitude: 77.2433, distance_km: 1.4, name: 'Dwarka / Lajpat BTS 1' },
    { latitude: 28.5830, longitude: 77.2340, distance_km: 2.1, name: 'Jangpura Overbridge BTS 2' },
    { latitude: 28.6012, longitude: 77.2275, distance_km: 1.7, name: 'Khan Market BTS 3' },
  ]);
  const [isCalculatingTriangulation, setIsCalculatingTriangulation] = useState<boolean>(false);

  // 4D Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);

  const maxWaypoints = useMemo(() => {
    if (!suspectTracks || suspectTracks.length === 0) return 4;
    const counts = suspectTracks.map((t) => t.waypoints?.length || 0);
    const maxVal = Math.max(...counts);
    return maxVal > 0 ? maxVal : 4;
  }, [suspectTracks]);

  // Active waypoint info during playback
  const activePlaybackWaypoint = useMemo(() => {
    if (!suspectTracks || suspectTracks.length === 0) return null;
    const track = suspectTracks[0];
    if (!track || !track.waypoints || track.waypoints.length === 0) return null;
    const idx = Math.min(playbackIndex, track.waypoints.length - 1);
    return {
      track,
      waypoint: track.waypoints[idx],
      stepNum: idx + 1,
      totalSteps: track.waypoints.length,
    };
  }, [suspectTracks, playbackIndex]);

  // Keep playbackIndex valid when tracks change
  useEffect(() => {
    setPlaybackIndex((prev) => Math.min(prev, Math.max(maxWaypoints - 1, 0)));
  }, [maxWaypoints]);

  // Fetch all Geo-Intelligence data
  const loadGeoData = useCallback(async () => {
    setLoading(true);
    try {
      const cityQuery = selectedCity !== 'ALL' ? selectedCity : undefined;
      const [hotspotsRes, tracksRes, cctvRes, stationsRes, clustersRes] = await Promise.all([
        api.geo.getHotspots({ case_id: selectedCaseId !== 'ALL' ? selectedCaseId : undefined }),
        api.geo.getSuspectMovements(selectedCaseId !== 'ALL' ? selectedCaseId : undefined),
        api.geo.getCctvFeeds(cityQuery),
        api.geo.getPoliceStations(cityQuery),
        api.geo.getClusters(),
      ]);

      if (hotspotsRes) {
        setMarkers(
          hotspotsRes.map((h: any) => {
            const cleanType = (h.event_type || 'CRIME_SCENE').replace(/_/g, ' ');
            const readableTitle =
              h.title && h.title.trim() && h.title !== h.location_name
                ? h.title
                : cleanType
                    .toLowerCase()
                    .replace(/\b\w/g, (c: string) => c.toUpperCase());

            const formattedLocation =
              h.location_name && h.city && !h.location_name.toLowerCase().includes(h.city.toLowerCase())
                ? `${h.location_name}, ${h.city}`
                : h.location_name || (h.city ? `${h.city}, ${h.state || 'India'}` : 'Field Evidence Coordinate');

            return {
              id: h.id,
              type: h.event_type || 'CRIME_SCENE',
              title: readableTitle,
              description: h.description || '',
              lat: Number(h.latitude),
              lng: Number(h.longitude),
              locationName: formattedLocation,
              severity: h.severity || 'HIGH',
              timestamp: h.timestamp,
              suspectName: h.suspect_name,
              confidence: h.confidence,
              evidenceHash: h.evidence_hash,
              radiusMeters: h.radius_meters || 400,
              caseId: h.case_id,
              caseTitle: h.case_title,
            };
          })
        );
      }

      if (tracksRes && tracksRes.length > 0) {
        const mappedTracks = tracksRes.map((t: any) => ({
          id: t.id,
          suspectId: t.suspect_id,
          suspectName: t.suspect_name,
          caseId: t.case_id,
          city: t.city,
          color: t.color || '#ef4444',
          status: t.status || 'ACTIVE_TRACKING',
          waypoints: t.waypoints || [],
        }));
        setSuspectTracks(mappedTracks);

        // Auto-switch selected city to match the case's active suspect track
        if (mappedTracks[0]?.city && CITY_COORDINATES[mappedTracks[0].city] && selectedCity !== mappedTracks[0].city) {
          setSelectedCity(mappedTracks[0].city);
        }
      } else {
        setSuspectTracks([]);
      }

      if (cctvRes) {
        setCctvFeeds(
          cctvRes.map((c: any) => ({
            id: c.id,
            cameraCode: c.camera_code,
            locationName: c.location_name,
            lat: Number(c.latitude),
            lng: Number(c.longitude),
            status: c.status,
            resolution: c.resolution,
            coverageRadiusMeters: c.coverage_radius_meters || 180,
            lastDetection: c.last_detection,
            streamUrl: c.stream_url,
          }))
        );
      }

      if (stationsRes) {
        setPoliceStations(
          stationsRes.map((p: any) => ({
            id: p.id,
            name: p.name,
            division: p.division,
            lat: Number(p.latitude),
            lng: Number(p.longitude),
            contact: p.contact,
            pcrUnitsAvailable: p.pcr_units_available || 5,
            responseRadiusKm: p.response_radius_km || 4,
          }))
        );
      }

      if (clustersRes) {
        setCityClusters(clustersRes);
      }
    } catch (err) {
      console.error('Failed to fetch geo intelligence data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCaseId, selectedCity]);

  useEffect(() => {
    loadGeoData();
  }, [loadGeoData]);

  // Sync City with selected case jurisdiction & primary active suspect city
  useEffect(() => {
    if (selectedCaseId === 'ALL') {
      setSelectedCity('ALL');
      return;
    }
    const jur = (selectedCase?.jurisdiction_city || '').toLowerCase();
    if (jur.includes('kolkata') || selectedCaseId === 'CASE-2026-004') {
      setSelectedCity('Kolkata');
    } else if (jur.includes('mumbai') || selectedCaseId === 'CASE-2026-002' || selectedCaseId === 'CASE-2026-005') {
      setSelectedCity('Mumbai');
    } else if (jur.includes('bengaluru') || jur.includes('bangalore') || selectedCaseId === 'CASE-2026-003' || selectedCaseId === 'CASE-2026-007') {
      setSelectedCity('Bengaluru');
    } else if (jur.includes('ahmedabad') || jur.includes('surat') || selectedCaseId === 'CASE-2026-006') {
      setSelectedCity('Ahmedabad');
    } else if (jur.includes('pune') || selectedCaseId === 'CASE-2026-008') {
      setSelectedCity('Pune');
    } else if (jur.includes('chennai') || selectedCaseId === 'CASE-2026-009') {
      setSelectedCity('Chennai');
    } else if (jur.includes('hyderabad')) {
      setSelectedCity('Hyderabad');
    } else if (jur.includes('jaipur')) {
      setSelectedCity('Jaipur');
    } else if (jur.includes('delhi') || selectedCaseId === 'CASE-2026-001') {
      setSelectedCity('New Delhi');
    } else if (selectedCase?.jurisdiction_city && CITY_COORDINATES[selectedCase.jurisdiction_city]) {
      setSelectedCity(selectedCase.jurisdiction_city);
    }
  }, [selectedCaseId, selectedCase]);

  // Timeline Auto-play Loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= maxWaypoints - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxWaypoints]);

  // Execute BTS Triangulation via backend API
  const handleCalculateTriangulation = async () => {
    setIsCalculatingTriangulation(true);
    try {
      const res = await api.geo.triangulateBts(triangulationTowers);
      if (res) {
        setTriangulationResult(res);
        logOfficerAction({
          action: 'Computed BTS Cellular Triangulation Centroid',
          module: 'Geo Intelligence',
          details: `Computed centroid at ${res.triangulated_latitude}, ${res.triangulated_longitude} with ${res.confidence_score}% confidence using ${res.towers_utilized} towers.`,
        });
      }
    } catch (err: any) {
      alert(`Triangulation Error: ${err.message}`);
    } finally {
      setIsCalculatingTriangulation(false);
    }
  };

  // Handle Drop Pin on Map Click
  const handleMapClick = (lat: number, lng: number) => {
    if (activeTool === 'pin') {
      setNewPinCoords({ lat, lng });
      setNewPinForm((prev) => ({
        ...prev,
        locationName: `Latitude ${lat.toFixed(4)}, Longitude ${lng.toFixed(4)}`,
      }));
      setIsAddPinModalOpen(true);
      setActiveTool('pointer');
    }
  };

  // Submit New Sighting Pin
  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinForm.title.trim()) return;

    try {
      const payload = {
        case_id: selectedCaseId || 'CASE-2026-001',
        event_type: newPinForm.eventType,
        title: newPinForm.title,
        description: newPinForm.description || 'Field Intelligence recorded by officer on duty.',
        latitude: newPinCoords.lat,
        longitude: newPinCoords.lng,
        location_name: newPinForm.locationName || `${selectedCity} Coordinate Node`,
        city: selectedCity === 'ALL' ? 'New Delhi' : selectedCity,
        state: 'Delhi',
        severity: newPinForm.severity,
        suspect_name: newPinForm.suspectName,
        radius_meters: Number(newPinForm.radiusMeters) || 400,
      };

      const created = await api.geo.createEvent(payload);
      if (created) {
        setMarkers((prev) => [
          {
            id: created.id,
            type: created.event_type,
            title: created.title,
            description: created.description,
            lat: Number(created.latitude),
            lng: Number(created.longitude),
            locationName: created.location_name,
            severity: created.severity,
            timestamp: created.timestamp,
            suspectName: created.suspect_name,
            confidence: created.confidence,
            evidenceHash: created.evidence_hash,
            radiusMeters: created.radius_meters,
            caseId: created.case_id,
            caseTitle: created.case_title,
          },
          ...prev,
        ]);

        logOfficerAction({
          action: 'Pinned Geospatial Sighting',
          module: 'Geo Intelligence',
          details: `Pinned ${created.title} at ${created.latitude}, ${created.longitude} for case ${created.case_id}`,
        });

        setIsAddPinModalOpen(false);
        setNewPinForm({
          title: '',
          locationName: '',
          eventType: 'SUSPECT_SIGHTING',
          severity: 'HIGH',
          suspectName: 'Aman Khan',
          description: '',
          radiusMeters: 400,
        });
      }
    } catch (err: any) {
      alert(`Error creating pin: ${err.message}`);
    }
  };

  // Export GeoJSON / Intelligence Dossier
  const handleExportGeo = () => {
    const geoJsonData = {
      type: 'FeatureCollection',
      metadata: {
        platform: 'CRIMESYNC NATIONAL INTELLIGENCE GIS',
        timestamp: new Date().toISOString(),
        case_scope: selectedCaseId,
        total_hotspots: markers.length,
        suspect_tracks: suspectTracks.length,
      },
      features: [
        ...markers.map((m) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [m.lng, m.lat],
          },
          properties: {
            id: m.id,
            type: m.type,
            title: m.title,
            description: m.description,
            severity: m.severity,
            location: m.locationName,
            suspect: m.suspectName,
            evidence_hash: m.evidenceHash,
          },
        })),
        ...suspectTracks.map((t) => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: t.waypoints.map((w) => [w.longitude, w.latitude]),
          },
          properties: {
            track_id: t.id,
            suspect_name: t.suspectName,
            status: t.status,
            waypoints_count: t.waypoints.length,
          },
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRIMESYNC_GEOINT_${selectedCaseId}_${new Date().toISOString().slice(0, 10)}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Center Coordinates and Zoom
  const currentCenter = useMemo<[number, number]>(() => {
    // If active waypoint is playing or selected, center dynamically on that suspect waypoint
    if (activePlaybackWaypoint?.waypoint?.latitude && activePlaybackWaypoint?.waypoint?.longitude) {
      return [activePlaybackWaypoint.waypoint.latitude, activePlaybackWaypoint.waypoint.longitude];
    }
    // If suspect track exists for this case, center on suspect's starting point
    if (suspectTracks.length > 0 && suspectTracks[0]?.waypoints?.[0]?.latitude && suspectTracks[0]?.waypoints?.[0]?.longitude) {
      return [suspectTracks[0].waypoints[0].latitude, suspectTracks[0].waypoints[0].longitude];
    }
    return CITY_COORDINATES[selectedCity] || CITY_COORDINATES['New Delhi'];
  }, [selectedCity, activePlaybackWaypoint, suspectTracks]);

  const currentZoom = useMemo(() => {
    if (selectedCity === 'ALL') return 5;
    return 13;
  }, [selectedCity]);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredMarkers = useMemo(() => {
    if (!searchQuery.trim()) return markers;
    const q = searchQuery.toLowerCase();
    return markers.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.locationName.toLowerCase().includes(q) ||
        (m.suspectName && m.suspectName.toLowerCase().includes(q)) ||
        m.type.toLowerCase().includes(q)
    );
  }, [markers, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#050811] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#081023] border border-[#142342] rounded-xl p-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-white">
                NATIONAL GEOSPATIAL INTELLIGENCE & GIS
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 border border-cyan-500/60 text-cyan-300">
                OPENSTREETMAP • LEAFLET
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live suspect GPS breadcrumbs, BTS cell tower triangulation, and CCTV surveillance feeds
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Case Selector */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 pointer-events-none text-amber-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="pl-8 pr-8 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] hover:border-amber-500/60 focus:border-amber-500 text-xs font-semibold text-amber-300 font-mono focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
              title="Select Active Investigation Case"
            >
              {cases && cases.length > 0 ? (
                cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#091122] text-slate-200 font-sans">
                    {c.id} — {c.title || c.name || 'Investigation'}
                  </option>
                ))
              ) : (
                <option value={selectedCaseId} className="bg-[#091122] text-slate-200">
                  {selectedCaseId}
                </option>
              )}
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* City / Jurisdiction Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/60 flex items-center gap-2 transition-all shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCity === 'ALL' ? 'All India (National Grid)' : selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#091122] border border-[#1e3866] rounded-lg shadow-2xl p-1.5 z-50 text-xs">
                {Object.keys(CITY_COORDINATES).map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-600/20 hover:text-cyan-300 transition-colors ${
                      selectedCity === city ? 'bg-cyan-600/30 text-cyan-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {city === 'ALL' ? '🌐 All India Overview' : `📍 ${city}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="relative">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-3 py-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-xs font-semibold text-slate-200 hover:text-white hover:border-blue-500/60 flex items-center gap-2 transition-all shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeTimeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#091122] border border-[#1e3866] rounded-lg shadow-2xl p-1.5 z-50 text-xs">
                {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'All Historic Data'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setActiveTimeRange(range);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-600/20 hover:text-blue-300 transition-colors ${
                      activeTimeRange === range ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BTS Triangulation Button */}
          <button
            onClick={() => setIsTriangulateModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-500/50 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>BTS Triangulation</span>
          </button>

          {/* Pin Field Sighting Button */}
          <button
            onClick={() => {
              setActiveTool('pin');
              setNewPinCoords(currentCenter ? { lat: currentCenter[0], lng: currentCenter[1] } : { lat: 28.6139, lng: 77.2090 });
              setIsAddPinModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/40 to-cyan-600/30 border border-blue-500/50 text-blue-200 hover:text-white hover:border-cyan-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Sighting</span>
          </button>

          {/* Export Geo Report */}
          <button
            onClick={handleExportGeo}
            className="p-2 rounded-lg bg-[#0c162b] border border-[#1e335a] text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-sm"
            title="Export GeoJSON / Dossier"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Refresh Data */}
          <button
            onClick={loadGeoData}
            className="p-2 rounded-lg bg-[#0c162b] border border-[#1e335a] text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-sm"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Top 5 KPI Metrics ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1 */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-purple-500/50 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              CRIME SCENES
            </div>
            <div className="text-xl font-extrabold text-white">{markers.length}</div>
            <div className="text-[11px] font-medium text-purple-400 flex items-center gap-1">
              <span>●</span> Active across {cityClusters.length || 3} states
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-cyan-500/50 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              SUSPECT GPS TRACKS
            </div>
            <div className="text-xl font-extrabold text-white">{suspectTracks.length}</div>
            <div className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
              <span>↑</span> {suspectTracks.reduce((sum, t) => sum + (t.waypoints?.length || 0), 0)} Checkpoints
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-red-500/50 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              HIGH RISK HOTSPOTS
            </div>
            <div className="text-xl font-extrabold text-red-400">
              {markers.filter((m) => m.severity === 'CRITICAL' || m.severity === 'HIGH').length}
            </div>
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1">
              <span>⚠</span> Immediate Action
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-emerald-500/50 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              CCTV FEEDS ONLINE
            </div>
            <div className="text-xl font-extrabold text-emerald-400">{cctvFeeds.length}</div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <span>●</span> AI ANPR & Biometrics
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-3 rounded-lg bg-[#081023] border border-[#132240] flex items-center gap-3.5 hover:border-blue-500/50 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              POLICE HQ & PATROLS
            </div>
            <div className="text-xl font-extrabold text-blue-400">{policeStations.length}</div>
            <div className="text-[11px] font-medium text-blue-400 flex items-center gap-1">
              <span>●</span> Fast Response Units
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Map & Intelligence Workspace ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Map View (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 rounded-xl bg-[#070e1f] border border-[#132342] flex flex-col relative overflow-hidden min-h-[580px] shadow-xl">
          {/* Top Bar on Map */}
          <div className="p-3 border-b border-[#12203c] flex flex-wrap items-center justify-between gap-2 z-20 bg-[#070e1f]/95 backdrop-blur-md">
            {/* Layer Filter Toggles */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                onClick={() => toggleLayer('crimeScenes')}
                className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  layers.crimeScenes
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
                <span>Crime Scenes ({markers.length})</span>
              </button>

              <button
                onClick={() => toggleLayer('suspectMovements')}
                className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  layers.suspectMovements
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                <span>Suspect Trails ({suspectTracks.length})</span>
              </button>

              <button
                onClick={() => toggleLayer('cctvCameras')}
                className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  layers.cctvCameras
                    ? 'bg-blue-950/60 border-blue-500/60 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
                <span>CCTV ({cctvFeeds.length})</span>
              </button>

              <button
                onClick={() => toggleLayer('policeStations')}
                className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  layers.policeStations
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>Police ({policeStations.length})</span>
              </button>

              <button
                onClick={() => toggleLayer('highRiskAreas')}
                className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
                  layers.highRiskAreas
                    ? 'bg-red-950/60 border-red-500/60 text-red-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                <span>Risk Radii</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {triangulationResult && (
                <button
                  onClick={() => setTriangulationResult(null)}
                  className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 border border-amber-500/60 text-amber-300 flex items-center gap-1"
                >
                  <span>Clear Triangulation</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="flex-1 relative min-h-[460px] w-full">
            {/* Left Floating Toolbar */}
            <div className="absolute left-3 top-4 flex flex-col gap-1.5 z-[500]">
              <button
                onClick={() => setActiveTool('pointer')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors shadow-lg ${
                  activeTool === 'pointer'
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]'
                    : 'bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white'
                }`}
                title="Select & Inspect"
              >
                <Compass className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsTriangulateModalOpen(true)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors shadow-lg ${
                  isTriangulateModalOpen
                    ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                    : 'bg-[#091124] border border-[#1b2b4e] text-amber-300 hover:text-white'
                }`}
                title="BTS Cellular Triangulator"
              >
                <Radio className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveTool(activeTool === 'pin' ? 'pointer' : 'pin');
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors shadow-lg ${
                  activeTool === 'pin'
                    ? 'bg-cyan-500 text-slate-900 font-bold shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse'
                    : 'bg-[#091124] border border-[#1b2b4e] text-cyan-300 hover:text-white'
                }`}
                title="Drop Sighting Pin on Map"
              >
                <MapPin className="w-4 h-4" />
              </button>

              <div className="h-px bg-[#142340] my-0.5" />

              <button
                onClick={() => {
                  if (suspectTracks.length > 0 && suspectTracks[0]?.waypoints?.[0]) {
                    setPlaybackIndex(0);
                  }
                  if (suspectTracks[0]?.city && CITY_COORDINATES[suspectTracks[0].city]) {
                    setSelectedCity(suspectTracks[0].city);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-[#091124] border border-[#1b2b4e] text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-lg"
                title="Reset Center View"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* Actual Leaflet Map Component */}
            <GeoIntelMap
              markers={filteredMarkers}
              suspectTracks={suspectTracks}
              cctvFeeds={cctvFeeds}
              policeStations={policeStations}
              layers={layers}
              activeTool={activeTool}
              selectedItem={selectedItem}
              onSelectItem={(item) => {
                setSelectedItem(item);
                if (item.cameraCode) {
                  setSelectedCctv(item);
                  setIsCctvModalOpen(true);
                }
              }}
              onMapClick={handleMapClick}
              triangulationData={triangulationResult}
              triangulationTowers={triangulationTowers}
              playbackIndex={playbackIndex}
              centerCoordinates={currentCenter}
              zoom={currentZoom}
            />
          </div>

          {/* 4D Movement Playback Timeline Bar */}
          <div className="p-3 border-t border-[#12203c] bg-[#070e1f]/95 backdrop-blur-md flex flex-col space-y-2 z-20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause Trail' : '4D Playback'}</span>
                </button>

                <button
                  onClick={() => setPlaybackIndex((prev) => Math.max(prev - 1, 0))}
                  className="p-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-slate-300 hover:text-white"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPlaybackIndex((prev) => Math.min(prev + 1, maxWaypoints - 1))}
                  className="p-1.5 rounded-lg bg-[#0c162b] border border-[#1e335a] text-slate-300 hover:text-white"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Timeline Slider */}
              <div className="flex-1 max-w-md flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  {activePlaybackWaypoint?.waypoint?.timestamp || '08:00 AM'}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(maxWaypoints - 1, 1)}
                  value={playbackIndex}
                  onChange={(e) => setPlaybackIndex(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  Step {playbackIndex + 1}/{maxWaypoints}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Synced with Tower CDR & GIS Telemetry</span>
              </div>
            </div>

            {/* Active Checkpoint Readout Card */}
            {activePlaybackWaypoint && activePlaybackWaypoint.waypoint && (
              <div className="flex items-center justify-between text-[11px] bg-[#091224] border border-[#1b2b4e] rounded-lg px-3 py-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activePlaybackWaypoint.track.color }}
                  />
                  <span className="font-bold text-white font-sans">
                    {activePlaybackWaypoint.track.suspectName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-cyan-300 font-sans">
                    {activePlaybackWaypoint.waypoint.location_name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="text-amber-400 font-sans">
                    Activity: {activePlaybackWaypoint.waypoint.activity}
                  </span>
                  <span>Speed: {activePlaybackWaypoint.waypoint.speed_kmh} km/h</span>
                  <span className="text-blue-400">Tower: {activePlaybackWaypoint.waypoint.tower_id}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Panel (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col space-y-3.5">
          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-[#081023] border border-[#132342] p-1 gap-1">
            <button
              onClick={() => setActiveTab('hotspots')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                activeTab === 'hotspots'
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Checkpoints ({suspectTracks[0]?.waypoints?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('suspects')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                activeTab === 'suspects'
                  ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suspects ({suspectTracks.length})
            </button>
            <button
              onClick={() => setActiveTab('playback')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'playback'
                  ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)] font-bold'
                  : 'text-amber-400 hover:text-amber-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>4D Intel</span>
            </button>
            <button
              onClick={() => setActiveTab('cctv')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                activeTab === 'cctv'
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CCTV ({cctvFeeds.length})
            </button>
            <button
              onClick={() => setActiveTab('clusters')}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                activeTab === 'clusters'
                  ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cities
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search location, suspect, evidence hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#081023] border border-[#132342] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Tab 1: 4D Suspect Movement Trail Checkpoints */}
          {activeTab === 'hotspots' && (
            <div className="rounded-xl bg-[#081023] border border-[#132342] p-3 flex flex-col space-y-3 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <div>
                  <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase block">
                    SUSPECT GPS TRAIL & CHECKPOINTS
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Chronological 4D Timeline & Forensic Checkpoints
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {suspectTracks[0]?.waypoints?.length || 0} Checkpoints
                </span>
              </div>

              {/* 4D Suspect Movement Trail Checkpoints */}
              {suspectTracks.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>4D Suspect Trail Timestamps ({suspectTracks[0]?.suspectName})</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Click node to inspect</span>
                  </div>

                  {suspectTracks[0]?.waypoints.map((wp, idx) => {
                    const isCurrent = idx === playbackIndex;
                    return (
                      <div
                        key={wp.sequence}
                        onClick={() => {
                          setPlaybackIndex(idx);
                          setSelectedItem({ ...suspectTracks[0], currentWaypoint: wp });
                        }}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#14264e] to-[#0c1a36] border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-[#091224] border-[#182a4d] hover:border-cyan-500/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              CHECKPOINT #{wp.sequence}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] text-amber-400 font-bold animate-pulse">● LIVE PLAYING</span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-300">
                            ⏱ {wp.timestamp}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white leading-tight">
                          {wp.location_name}
                        </div>

                        <div className="text-[11px] text-slate-300 bg-[#050b16] p-1.5 rounded border border-slate-800/80">
                          <span className="text-amber-400 font-semibold">Forensic Event: </span>
                          <span>{wp.activity}</span>
                        </div>

                        <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                          <span className="text-indigo-300">Tower: {wp.tower_id}</span>
                          <span className="text-emerald-400">Speed: {wp.speed_kmh} km/h</span>
                          {wp.cctv_corroboration && (
                            <span className="text-red-400 font-bold">📹 CCTV {wp.cctv_corroboration.face_match_confidence}% Match</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No suspect movement trails recorded for this case.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Suspect Tracks */}
          {activeTab === 'suspects' && (
            <div className="rounded-xl bg-[#081023] border border-[#132342] p-3 flex flex-col space-y-2.5 max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
                  ACTIVE GPS & CDR TRACKING
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                  {suspectTracks.length} Suspects
                </span>
              </div>

              {suspectTracks.map((track) => (
                <div
                  key={track.id}
                  className="p-2.5 rounded-lg bg-[#0c162b] border border-[#192b4d] hover:border-cyan-500/60 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: track.color, boxShadow: `0 0 8px ${track.color}` }}
                      />
                      <span className="text-xs font-bold text-white">{track.suspectName}</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {track.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-400">Case:</span> {track.caseId}
                  </div>

                  {/* Waypoints Sequence List */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                    {track.waypoints.map((wp) => (
                      <div
                        key={wp.sequence}
                        className="p-1.5 rounded bg-[#070d18] border border-slate-800/80 text-[10px] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">
                            #{wp.sequence} {wp.location_name}
                          </div>
                          <div className="text-slate-400">{wp.activity}</div>
                        </div>
                        <div className="text-right font-mono text-cyan-400">
                          <div>{wp.timestamp}</div>
                          <div className="text-[9px] text-slate-500">{wp.speed_kmh} km/h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: 4D Forensic Node Intelligence */}
          {activeTab === 'playback' && (
            <div className="rounded-xl bg-[#081023] border border-[#132342] p-3 flex flex-col space-y-3 max-h-[520px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>4D NODE FORENSIC INTELLIGENCE</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Step {playbackIndex + 1}/{maxWaypoints}
                </span>
              </div>

              {activePlaybackWaypoint && activePlaybackWaypoint.waypoint ? (
                <div className="space-y-3">
                  {/* Current Node Hero Card */}
                  <div className="p-3 rounded-lg bg-gradient-to-b from-[#0e1b38] to-[#081124] border border-amber-500/50 shadow-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                        CHECKPOINT #{activePlaybackWaypoint.waypoint.sequence} • ACTIVE
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {activePlaybackWaypoint.waypoint.timestamp}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-extrabold text-white leading-tight">
                        {activePlaybackWaypoint.waypoint.location_name}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3 text-red-400" />
                        <span>Suspect: <b className="text-white">{activePlaybackWaypoint.track.suspectName}</b></span>
                      </div>
                    </div>

                    {/* What is happening at this node (Forensic Narrative) */}
                    <div className="p-2.5 rounded-lg bg-[#050b16] border border-slate-700/80 space-y-1">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>What is happening at this node:</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-100 leading-snug">
                        {activePlaybackWaypoint.waypoint.activity}
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                        {activePlaybackWaypoint.waypoint.forensic_narrative ||
                          'Suspect observed actively operating cellular equipment and routing network packets through local infrastructure.'}
                      </div>
                    </div>

                    {/* Telecom & CDR Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#070e1b] p-2 rounded border border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px]">BTS Cell Tower</span>
                        <span className="font-bold text-indigo-300">{activePlaybackWaypoint.waypoint.tower_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Radio Signal (RSSI)</span>
                        <span className="font-bold text-emerald-400">{activePlaybackWaypoint.waypoint.signal_strength_dbm} dBm</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Transit Speed</span>
                        <span className="font-bold text-white">{activePlaybackWaypoint.waypoint.speed_kmh} km/h</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Transit Mode</span>
                        <span className="font-bold text-cyan-300">{activePlaybackWaypoint.waypoint.transit_mode || 'In-Transit'}</span>
                      </div>
                    </div>

                    {/* Telecom Trace (IMEI / IMSI) if available */}
                    {activePlaybackWaypoint.waypoint.telecom_trace && (
                      <div className="p-2 rounded bg-[#060c18] border border-blue-500/20 text-[10px] font-mono space-y-0.5">
                        <div className="text-blue-400 font-bold">TELECOM CDR INTERCEPT:</div>
                        <div className="text-slate-300">Carrier: {activePlaybackWaypoint.waypoint.telecom_trace.carrier} ({activePlaybackWaypoint.waypoint.telecom_trace.band})</div>
                        <div className="text-slate-400">IMEI: {activePlaybackWaypoint.waypoint.telecom_trace.imei}</div>
                        <div className="text-slate-400">IMSI: {activePlaybackWaypoint.waypoint.telecom_trace.imsi}</div>
                      </div>
                    )}

                    {/* CCTV Corroboration if available */}
                    {activePlaybackWaypoint.waypoint.cctv_corroboration && (
                      <div className="p-2 rounded bg-red-950/30 border border-red-500/40 text-[10px] space-y-1">
                        <div className="text-red-400 font-bold flex items-center justify-between">
                          <span>📹 CCTV OPTICAL CORROBORATION</span>
                          <span className="font-mono text-cyan-300">{activePlaybackWaypoint.waypoint.cctv_corroboration.face_match_confidence}% Match</span>
                        </div>
                        <div className="text-slate-300">Camera: {activePlaybackWaypoint.waypoint.cctv_corroboration.camera_code}</div>
                        <div className="text-[9px] font-mono text-slate-500 truncate">Hash: {activePlaybackWaypoint.waypoint.cctv_corroboration.frame_evidence_hash}</div>
                      </div>
                    )}

                    {/* Statutory Legal Sections */}
                    {activePlaybackWaypoint.waypoint.legal_sections && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {activePlaybackWaypoint.waypoint.legal_sections.map((sec, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* All Checkpoints Interactive Stepper */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Case Checkpoints Stepper (Click to Inspect)
                    </div>
                    {activePlaybackWaypoint.track.waypoints.map((wp, idx) => {
                      const isCurrent = idx === playbackIndex;
                      return (
                        <div
                          key={wp.sequence}
                          onClick={() => setPlaybackIndex(idx)}
                          className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${
                            isCurrent
                              ? 'bg-amber-950/60 border border-amber-500/60 text-white shadow-md'
                              : 'bg-[#0c162b] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                              isCurrent ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {wp.sequence}
                            </span>
                            <div>
                              <div className="font-bold text-white text-[11px] leading-tight">{wp.location_name}</div>
                              <div className="text-[10px] text-slate-400">{wp.activity}</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-cyan-400">
                            <div>{wp.timestamp}</div>
                            <div className="text-slate-500">{wp.speed_kmh} km/h</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Select a case with active suspect tracks to view 4D forensic telemetry.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: CCTV Feeds */}
          {activeTab === 'cctv' && (
            <div className="rounded-xl bg-[#081023] border border-[#132342] p-3 flex flex-col space-y-2.5 max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
                  SURVEILLANCE NETWORK
                </span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">
                  {cctvFeeds.length} Cameras
                </span>
              </div>

              {cctvFeeds.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => {
                    setSelectedCctv(cam);
                    setIsCctvModalOpen(true);
                  }}
                  className="p-2.5 rounded-lg bg-[#0c162b] border border-[#192b4d] hover:border-blue-500/60 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{cam.cameraCode}</span>
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        cam.status === 'ALERT_TRIGGERED'
                          ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300">{cam.locationName}</div>

                  {cam.lastDetection && (
                    <div className="p-1.5 rounded bg-red-950/40 border border-red-500/30 text-[10px] text-red-300 flex items-center justify-between">
                      <span>Match: <b>{cam.lastDetection.suspectName}</b></span>
                      <span className="font-mono text-cyan-300">{cam.lastDetection.confidence}% Conf</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>{cam.resolution}</span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Click to Open Live Stream
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: City Spatial Clusters */}
          {activeTab === 'clusters' && (
            <div className="rounded-xl bg-[#081023] border border-[#132342] p-3 flex flex-col space-y-2.5 max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#12203c]">
                <span className="text-xs font-extrabold text-slate-200 tracking-wider uppercase">
                  STATE & CITY CLUSTERS
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Spatial Aggregates</span>
              </div>

              {cityClusters.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCity(c.city)}
                  className="p-2.5 rounded-lg bg-[#0c162b] border border-[#192b4d] hover:border-emerald-500/60 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">📍 {c.city}, {c.state}</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{c.event_count} Events</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min((c.event_count / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Center: {Number(c.center_lat).toFixed(4)}, {Number(c.center_lng).toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL 1: BTS Cellular Triangulation ─── */}
      {isTriangulateModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081023] border border-[#1c335e] rounded-xl w-full max-w-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#142647]">
              <div className="flex items-center gap-2 text-amber-400">
                <Radio className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">BTS CELL TOWER TRILATERATION ENGINE</h3>
              </div>
              <button
                onClick={() => setIsTriangulateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Performs Non-Linear Weighted Least Squares (WLS) Trilateration across minimum 3 cell tower handoffs to calculate real-time suspect coordinates and confidence error circle.
            </p>

            {/* Towers Configuration */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase">Input Cell Towers & Distance</span>
              {triangulationTowers.map((tower, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[#0c162b] border border-[#182a4c] grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Tower #{i + 1} Lat</label>
                    <input
                      type="number"
                      step="any"
                      value={tower.latitude}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTriangulationTowers((prev) =>
                          prev.map((t, idx) => (idx === i ? { ...t, latitude: val } : t))
                        );
                      }}
                      className="w-full bg-[#070e1b] border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Tower #{i + 1} Lng</label>
                    <input
                      type="number"
                      step="any"
                      value={tower.longitude}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTriangulationTowers((prev) =>
                          prev.map((t, idx) => (idx === i ? { ...t, longitude: val } : t))
                        );
                      }}
                      className="w-full bg-[#070e1b] border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tower.distance_km}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTriangulationTowers((prev) =>
                          prev.map((t, idx) => (idx === i ? { ...t, distance_km: val } : t))
                        );
                      }}
                      className="w-full bg-[#070e1b] border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Triangulation Result Display if available */}
            {triangulationResult && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 space-y-1.5">
                <div className="flex items-center justify-between text-amber-300 font-bold text-xs">
                  <span>✔ Centroid Calculated Successfully</span>
                  <span>Confidence: {triangulationResult.confidence_score}%</span>
                </div>
                <div className="text-xs text-white font-mono">
                  Coordinates: {triangulationResult.triangulated_latitude}, {triangulationResult.triangulated_longitude}
                </div>
                <div className="text-[11px] text-slate-300">
                  Confidence Error Radius: ±{triangulationResult.confidence_radius_meters} meters
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#142647]">
              <button
                onClick={() => setIsTriangulateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await handleCalculateTriangulation();
                }}
                disabled={isCalculatingTriangulation}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all flex items-center gap-1.5"
              >
                {isCalculatingTriangulation ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Target className="w-3.5 h-3.5" />
                )}
                <span>Compute & Draw on Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Add Sighting / Pin Event ─── */}
      {isAddPinModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePin}
            className="bg-[#081023] border border-[#1c335e] rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#142647]">
              <div className="flex items-center gap-2 text-cyan-400">
                <MapPin className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">PIN FIELD SIGHTING / EVIDENCE NODE</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPinModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Title / Event Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optical Facial Sighting at Metro Gate 2"
                  value={newPinForm.title}
                  onChange={(e) => setNewPinForm({ ...newPinForm, title: e.target.value })}
                  className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Event Type</label>
                  <select
                    value={newPinForm.eventType}
                    onChange={(e: any) => setNewPinForm({ ...newPinForm, eventType: e.target.value })}
                    className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="SUSPECT_SIGHTING">Suspect Sighting</option>
                    <option value="CRIME_SCENE">Crime Scene</option>
                    <option value="HAWALA_HUB">Hawala Cash Drop</option>
                    <option value="RAID_TARGET">Raid Target</option>
                    <option value="BTS_TOWER_PING">BTS Tower Ping</option>
                    <option value="SAFE_ZONE">Safe Zone</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Severity</label>
                  <select
                    value={newPinForm.severity}
                    onChange={(e: any) => setNewPinForm({ ...newPinForm, severity: e.target.value })}
                    className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newPinCoords.lat}
                    onChange={(e) => setNewPinCoords({ ...newPinCoords, lat: Number(e.target.value) })}
                    className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newPinCoords.lng}
                    onChange={(e) => setNewPinCoords({ ...newPinCoords, lng: Number(e.target.value) })}
                    className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Linked Suspect</label>
                  <input
                    type="text"
                    value={newPinForm.suspectName}
                    onChange={(e) => setNewPinForm({ ...newPinForm, suspectName: e.target.value })}
                    className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Proximity Radius (meters)</label>
                  <input
                    type="number"
                    value={newPinForm.radiusMeters}
                    onChange={(e) => setNewPinForm({ ...newPinForm, radiusMeters: Number(e.target.value) })}
                    className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description & Evidence Details</label>
                <textarea
                  rows={2}
                  value={newPinForm.description}
                  onChange={(e) => setNewPinForm({ ...newPinForm, description: e.target.value })}
                  placeholder="Additional contextual intelligence, vehicle number, weapon sighted..."
                  className="w-full bg-[#0c162b] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#142647]">
              <button
                type="button"
                onClick={() => setIsAddPinModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save to Central Registry</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL 3: CCTV Live Stream Preview ─── */}
      {isCctvModalOpen && selectedCctv && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081023] border border-[#1c335e] rounded-xl w-full max-w-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#142647]">
              <div className="flex items-center gap-2 text-cyan-400">
                <Video className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>LIVE STREAM: {selectedCctv.cameraCode}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-500/50">
                      LIVE • {selectedCctv.resolution}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedCctv.locationName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCctvModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Snapshot with AI Detection Box Overlay */}
            <div className="relative rounded-lg overflow-hidden border border-[#1e345e] aspect-video bg-black flex items-center justify-center">
              {selectedCctv.streamUrl ? (
                <img
                  src={selectedCctv.streamUrl}
                  alt={selectedCctv.cameraCode}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs">Video Feed Connected</div>
              )}

              {/* AI Bounding Box Overlay */}
              {selectedCctv.lastDetection && (
                <div className="absolute top-1/4 left-1/3 w-28 h-36 border-2 border-red-500 rounded bg-red-500/10 flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
                  <div className="bg-red-900/90 text-white text-[9px] font-bold px-1 rounded">
                    MATCH: {selectedCctv.lastDetection.suspectName}
                  </div>
                  <div className="bg-black/80 text-cyan-300 text-[8px] font-mono px-1 rounded self-end">
                    {selectedCctv.lastDetection.confidence}% CONF
                  </div>
                </div>
              )}

              {/* Camera Status Watermark */}
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[10px] text-slate-300 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>SEC-65B BSA TAMPER-PROOF REC</span>
              </div>
            </div>

            {/* Camera Details */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-[#0c162b] p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Coverage Radius</span>
                <span className="font-bold text-white">{selectedCctv.coverageRadiusMeters} meters</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">PTZ Field of View</span>
                <span className="font-bold text-cyan-400">120° Wide Angle IR</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Biometric Matching</span>
                <span className="font-bold text-emerald-400">Active (DeepFace V4)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#142647]">
              <button
                onClick={() => setIsCctvModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
