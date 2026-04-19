import { useState, useEffect, useRef, useMemo } from 'react';
import { MAPBOX_TOKEN } from '../config';
import styles from './Dashboard.module.css';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import FlightPanel from './FlightPanel';
import NotificationPanel from './NotificationPanel';
import RunwayBoard from './RunwayBoard';
import AnalyticsPanel from './AnalyticsPanel';
import ProfilePage from '../Profile/ProfilePage';
import SettingsPage from '../Settings/SettingsPage';
import FlightHUD from './FlightHUD';
import { soundService } from '../../utils/SoundService';
import { useLocation } from 'react-router-dom';

import { api, connectWebSocket } from '../../services/api';
import { AIRPORTS } from '../../utils/simulationData';

// Helper: Geodesic line generation (Great Circle)
function getGeodesicPoints(start, end, pointsCount = 64) {
  const [lon1, lat1] = start.map(d => d * Math.PI / 180);
  const [lon2, lat2] = end.map(d => d * Math.PI / 180);
  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1-lat2)/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1-lon2)/2), 2)));
  
  const points = [];
  for (let i = 0; i <= pointsCount; i++) {
    const f = i / pointsCount;
    const A = Math.sin((1-f)*d) / Math.sin(d);
    const B = Math.sin(f*d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    const lon = Math.atan2(y, x);
    points.push([lon * 180 / Math.PI, lat * 180 / Math.PI]);
  }
  return points;
}

// Helper: Haversine distance in km
function getDistance(coord1, coord2) {
  const R = 6371;
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Dashboard() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const airportMarkers = useRef({});
  const trailLayers = useRef(new Set());
  const location = useLocation();
  
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().split(' ')[4]);
  const [searchResults, setSearchResults] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true); // Default collapsed
  const [currentStyle, setCurrentStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
  const [systemMessage, setSystemMessage] = useState(null);
  const [trackedFlightId, setTrackedFlightId] = useState(null);
  
  // Operational States
  const [alerts, setAlerts] = useState([]);
  const [runways, setRunways] = useState([]);
  const [proximityWarning, setProximityWarning] = useState(null); 
  const [activePanel, setActivePanel] = useState(null); // 'notif' | 'runway' | 'analytics'

  const safeFlights = useMemo(() => Array.isArray(flights) ? flights : [], [flights]);
  const safeAlerts = useMemo(() => Array.isArray(alerts) ? alerts : [], [alerts]);
  const safeRunways = useMemo(() => Array.isArray(runways) ? runways : [], [runways]);

  const groupedRunways = useMemo(() => {
    const grouped = {};
    safeRunways.forEach(r => {
      const airport = r.airport_name || 'Unknown';
      if (!grouped[airport]) grouped[airport] = [];
      grouped[airport].push(r);
    });
    return grouped;
  }, [safeRunways]);

  const analyticsData = useMemo(() => ({
    total: safeFlights.length,
    emergencies: safeFlights.filter(f => f.status === 'emergency').length,
    avgAlt: 34500,
    avgSpeed: 465,
    routes: [
      { route: 'LHR-JFK', count: 142, percent: 85 },
      { route: 'DXB-LHR', count: 98, percent: 65 },
      { route: 'DEL-BOM', count: 186, percent: 95 },
      { route: 'SIN-SYD', count: 74, percent: 45 },
      { route: 'CDG-AMS', count: 112, percent: 75 }
    ],
    regions: { 'Asia': 1432, 'Europe': 982, 'Americas': 847, 'Africa': 312, 'Oceania': 112 },
    trafficDensity: [20, 35, 55, 80, 95, 90, 75, 60, 45, 30] 
  }), [safeFlights]);

  const globalAlertCount = useRef(0);
  const globalLastAlertTime = useRef(0);
  const activeProxyRef = useRef(null);

  useEffect(() => {
    const clockTimer = setInterval(() => setUtcTime(new Date().toUTCString().split(' ')[4]), 1000);
    
    // Initial fetch of Operational Data — use allSettled so one failure doesn't block all
    const fetchData = async () => {
      const [flightsResult, alertsResult, runwaysResult] = await Promise.allSettled([
        api.getFlights(),
        api.getAlerts(),
        api.getRunways()
      ]);
      
      if (flightsResult.status === 'fulfilled') {
        const d = flightsResult.value;
        setFlights(Array.isArray(d) ? d : Array.isArray(d?.flights) ? d.flights : Array.isArray(d?.data) ? d.data : []);
      }
      if (alertsResult.status === 'fulfilled') {
        const d = alertsResult.value;
        setAlerts(Array.isArray(d) ? d : Array.isArray(d?.alerts) ? d.alerts : Array.isArray(d?.data) ? d.data : []);
      }
      if (runwaysResult.status === 'fulfilled') {
        const d = runwaysResult.value;
        setRunways(Array.isArray(d) ? d : Array.isArray(d?.runways) ? d.runways : Array.isArray(d?.data) ? d.data : []);
      }
    };
    fetchData();

    // Secondary polling for operational boards (30s)
    const pollTimer = setInterval(async () => {
      try {
        const [alertsResult, runwaysResult] = await Promise.allSettled([
          api.getAlerts(),
          api.getRunways()
        ]);
        
        if (alertsResult.status === 'fulfilled') {
          const alertArray = Array.isArray(alertsResult.value) ? alertsResult.value
            : Array.isArray(alertsResult.value?.alerts) ? alertsResult.value.alerts
            : Array.isArray(alertsResult.value?.data) ? alertsResult.value.data
            : [];
          setAlerts(alertArray);
        }
        if (runwaysResult.status === 'fulfilled') {
          const runwayArray = Array.isArray(runwaysResult.value) ? runwaysResult.value
            : Array.isArray(runwaysResult.value?.runways) ? runwaysResult.value.runways
            : Array.isArray(runwaysResult.value?.data) ? runwaysResult.value.data
            : [];
          setRunways(runwayArray);
        }
      } catch (err) {
        console.warn('Polling error (non-fatal):', err);
      }
    }, 30000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(pollTimer);
    };
  }, []);

  // Effect: Global Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTrackedFlightId(null);
        setSelectedFlight(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Effect: WebSocket Connection
  useEffect(() => {
    let ws;
    if (mapLoaded) {
      ws = connectWebSocket((data) => {
        if (data.type === 'flight_update') {
          // Sync flights state with real-time stream
          const flightArray = Array.isArray(data.flights) ? data.flights
            : Array.isArray(data.data) ? data.data
            : Array.isArray(data) ? data
            : [];
          setFlights(flightArray);
          
          // Local Proximity Detection (Reactive UI Banner)
          let warningTriggered = false;
          for (let i = 0; i < flightArray.length; i++) {
            for (let j = i + 1; j < flightArray.length; j++) {
              const f1 = flightArray[i];
              const f2 = flightArray[j];
              const dist = getDistance([f1.lng, f1.lat], [f2.lng, f2.lat]);
              if (dist < 80) {
                const proxObj = { f1: f1.flightNumber, f2: f2.flightNumber, dist: Math.round(dist), id: Date.now() };
                activeProxyRef.current = proxObj;
                setProximityWarning(proxObj);
                warningTriggered = true;
                break;
              }
            }
            if (warningTriggered) break;
          }
          if (!warningTriggered) {
             activeProxyRef.current = null;
             setProximityWarning(null);
          }
        }
      });
    }
    return () => ws?.close();
  }, [mapLoaded]);

  useEffect(() => {
    if (map.current) return;
    
    const initTimeout = setTimeout(() => {
      try {
        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: currentStyle,
          center: [0, 20],
          zoom: 2
        });
        
        map.current.on('load', () => {
          setMapLoaded(true);
          if (mapContainer.current) mapContainer.current.setAttribute('data-zoom', Math.floor(map.current.getZoom()));
          
          map.current.on('zoom', () => {
             if (mapContainer.current) mapContainer.current.setAttribute('data-zoom', Math.floor(map.current.getZoom()));
          });

          map.current.on('click', (e) => {
            setTrackedFlightId(null);
            setSelectedFlight(null);
          });

          // Airport Markers
          AIRPORTS.forEach(airport => {
            const el = document.createElement('div');
            el.className = styles.airportMarker;
            el.innerHTML = `
              <div class="${styles.airportDot}"></div>
              <span class="${styles.icao}">${airport.id}</span>
              <span class="${styles.fullname}">${airport.name}</span>
            `;
            
            const popup = new window.mapboxgl.Popup({ offset: 15, closeButton: false, closeOnClick: false })
            .setHTML(`<div class="${styles.airportPopup}"><h4>🏢 ${airport.name} (${airport.id})</h4></div>`);

            const marker = new window.mapboxgl.Marker(el).setLngLat(airport.coords).addTo(map.current);
            el.addEventListener('mouseenter', () => popup.setLngLat(airport.coords).addTo(map.current));
            el.addEventListener('mouseleave', () => popup.remove());
            airportMarkers.current[airport.id] = marker;
          });
        });
      } catch (err) { console.error('Mapbox Init Failed', err); }
    }, 100);
    return () => { clearTimeout(initTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount — style changes go through handleLayerChange

  useEffect(() => {
    if (map.current) {
      const timer = setTimeout(() => map.current.resize(), 350);
      return () => clearTimeout(timer);
    }
  }, [leftSidebarCollapsed, rightSidebarCollapsed]);

  const renderFlightMarkers = () => {
    if (!map.current || !mapLoaded) return;
    // Guard: ensure map container still exists in DOM
    try { if (!map.current.getContainer()) return; } catch { return; }
    
    const container = mapContainer.current;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    safeFlights.forEach(f => {
      // Visibility check using Mapbox projection
      const pos = map.current.project([f.lng, f.lat]);
      const isVisible = pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= height;

      if (!markers.current[f.id]) {
        const el = document.createElement('div');
        el.className = styles.planeMarker;
        el.setAttribute('data-status', f.status);
        el.innerHTML = `<span>✈</span>`;
        
        // Hide if not in viewport initially
        if (!isVisible) el.style.display = 'none';

        markers.current[f.id] = new window.mapboxgl.Marker(el).setLngLat([f.lng, f.lat]).addTo(map.current);
        el.addEventListener('click', () => { setSelectedFlight(f); map.current.flyTo({ center: [f.lng, f.lat], zoom: 6, duration: 1500 }); });
      } else {
        const marker = markers.current[f.id];
        marker.setLngLat([f.lng, f.lat]);
        const el = marker.getElement();
        
        // Dynamic visibility toggle via CSS projection check
        el.style.display = isVisible ? 'block' : 'none';
        
        el.setAttribute('data-status', f.status);
        const icon = el.querySelector('span');
        icon.style.transform = `rotate(${f.heading}deg)`;
        
        if (f.status === 'emergency' || (proximityWarning && (proximityWarning.f1 === f.flightNumber || proximityWarning.f2 === f.flightNumber))) {
          el.className = `${styles.planeMarker} ${styles.pulseEmergency}`;
        } else if (f.status === 'low-fuel') {
          el.className = `${styles.planeMarker} ${styles.pulseLowFuel}`;
        } else if (f.id === trackedFlightId) {
          el.className = `${styles.planeMarker} ${styles.pulseTracked}`;
        } else {
          el.className = styles.planeMarker;
        }
      }

      const trailId = `trail-${f.id}`;
      if (f.history && f.history.length > 1 && map.current.getSource(trailId) && isVisible) {
        map.current.getSource(trailId).setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [...f.history, [f.lng, f.lat]] } });
      }
    });
  };

  useEffect(() => {
    renderFlightMarkers();
  }, [safeFlights, proximityWarning, mapLoaded]);

  const handleLayerChange = (styleUrl) => { 
    if (map.current) { 
      setCurrentStyle(styleUrl); 
      map.current.setStyle(styleUrl); 
      
      // Re-add markers after style loads
      map.current.once('styledata', () => {
        // Clear existing marker tracking to force re-creation
        markers.current = {};
        renderFlightMarkers();
      });
    } 
  };

  const handleTrackFlight = (flightOrNumber) => {
    if (!flightOrNumber) return;

    let flight;
    if (typeof flightOrNumber === 'string') {
      flight = safeFlights.find(f => 
        (f.flight_number || f.callsign || f.flightNumber || "").toUpperCase() === flightOrNumber.toUpperCase() ||
        (f.flight_number || f.callsign || f.flightNumber || "").replace('-', '').toUpperCase() === flightOrNumber.toUpperCase()
      );
    } else {
      flight = flightOrNumber;
    }

    if (flight) {
      setTrackedFlightId(flight.id);
      map.current?.flyTo({ center: [flight.lng, flight.lat], zoom: 8, speed: 1.2 });
    }
  };

  const handleResolveAlert = async (alertToResolve, actionText) => {
    try {
      // 1. Backend Resolve
      await api.resolveAlert(alertToResolve.id);

      // 2. Immediately kill the top-level warning if it involves these flights
      if (proximityWarning && (proximityWarning.f1 === alertToResolve.data.f1 || proximityWarning.f1 === alertToResolve.data.f2)) {
        activeProxyRef.current = null;
        setProximityWarning(null);
      }

      // 3. Remove the alert from the array
      setAlerts(prev => (Array.isArray(prev) ? prev : []).filter(a => a.id !== alertToResolve.id));

      // 4. Dispatch AI Message
      const botMsg = {
        id: Date.now(),
        type: 'bot',
        text: `✅ Operational resolution confirmed for sector anomaly ${alertToResolve.data.f1}. Action: ${actionText}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        systemFooter: "ATC AI · Resolution Executed"
      };
      setSystemMessage(botMsg);
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href="/" className={styles.logo}>✈ ATC</a>
          <button className={styles.navActionBtn} onClick={() => setActivePanel('runway')}>Runway Board</button>
          <button className={styles.navActionBtn} onClick={() => setActivePanel('analytics')}>Analytics</button>
        </div>
        <div className={styles.navCenter}>
          <div className={styles.statusDot}></div>
          <span>{safeFlights.length} Active Flights</span>
        </div>
        <div className={styles.navRight}>
          <div className={styles.navControls}>
            <div className={styles.utcClock}>{utcTime} UTC</div>
            <button className={styles.iconBtn} onClick={() => setActivePanel(activePanel === 'notif' ? null : 'notif')}>
              🔔
              {safeAlerts.filter(a => !a.resolved).length > 0 && <span className={styles.notificationBadge}>{safeAlerts.filter(a => !a.resolved).length}</span>}
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.mainLayout}>
        <Sidebar 
          onNavigate={(coords, zoom) => map.current?.flyTo({ center: coords, zoom, duration: 2500, essential: true })} 
          onTrackFlight={handleTrackFlight}
          flights={safeFlights}
          isCollapsed={leftSidebarCollapsed}
          onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          systemMessage={systemMessage}
          activeFlightToTrack={selectedFlight}
        />

        <div className={styles.mapWrapper}>
          <div ref={mapContainer} className={styles.mapContainer} />
          
          {proximityWarning && (
            <div className={styles.collisionAlertCard}>
              <span>⚠️ PROXIMITY ALERT</span>
              <span>{proximityWarning.f1} & {proximityWarning.f2}</span>
              <span style={{ color: '#ffeb3b' }}>{proximityWarning.dist}km</span>
            </div>
          )}

          {trackedFlightId && (
            <FlightHUD 
              flight={safeFlights.find(f => f.id === trackedFlightId)} 
              map={map.current} 
              onClose={() => setTrackedFlightId(null)} 
            />
          )}

          <div className={styles.liveStatusPanel}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Emergencies</span>
              <span className={styles.statusValue + ' ' + styles.emergency}>{analyticsData.emergencies}</span>
            </div>
          </div>

          <FlightPanel flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
          
          {activePanel === 'notif' && (
            <NotificationPanel 
              alerts={safeAlerts} 
              onDismiss={(id) => setAlerts(prev => (Array.isArray(prev) ? prev : []).filter(a => a.id !== id))}
              onClearAll={() => setAlerts([])}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {activePanel === 'runway' && <RunwayBoard runways={groupedRunways} onClose={() => setActivePanel(null)} onAutoAssign={() => {}} />}
          {activePanel === 'analytics' && <AnalyticsPanel data={analyticsData} onClose={() => setActivePanel(null)} />}
        </div>

        <RightSidebar 
          isCollapsed={rightSidebarCollapsed}
          onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          onLayerChange={handleLayerChange}
          currentLayer={currentStyle}
        />
      </div>
    </div>
  );
}
