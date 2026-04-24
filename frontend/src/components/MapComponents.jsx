import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from "@vis.gl/react-google-maps";

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;

// ─── REAL GOOGLE MAP ──────────────────────────────────────────────
// Notes on the Maps config:
// - We always pass a mapId because <AdvancedMarker> requires one.
// - We do NOT pass `styles` — Maps ignores it when mapId is present and logs a
//   warning. Day/night styling should be configured on the mapId itself in the
//   Google Cloud console (Map Styles), which is why this component accepts the
//   `theme` prop but only uses it for marker colors.
// - APIProvider owns the loader so Google's SDK is loaded asynchronously with
//   options set — do NOT add a <script> tag for maps in index.html.
export const RealMap = ({ bounties = [], scanning = false, center, theme, onRouteInfo }) => {
  const [selected, setSelected] = useState(null);
  const mapCenter = center || (bounties[0] ? { lat: bounties[0].lat, lng: bounties[0].lng } : { lat: 40.4168, lng: -3.7038 });
  const zoom = bounties.length > 0 ? 14 : 13;

  return (
    <APIProvider apiKey={MAPS_API_KEY} solutionChannel="GMP_visgl_rgmlibrary_v1_default">
      <Map
        defaultCenter={mapCenter}
        defaultZoom={zoom}
        mapId="DEMO_MAP_ID"
        disableDefaultUI={false}
        gestureHandling="greedy"
        style={{ width:"100%", height:"100%", borderRadius:"16px" }}
      >
        {bounties.map((b, i) => (
          <AdvancedMarker
            key={b.place_id || i}
            position={{ lat: b.lat, lng: b.lng }}
            onClick={() => setSelected(selected?.place_id === b.place_id ? null : b)}
          >
            <div style={{
              background: theme?.numberBadgeBg || "#8B2020",
              color: "white", width:"32px", height:"32px",
              borderRadius:"50% 50% 50% 0", transform:"rotate(-45deg)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"2px solid rgba(255,255,255,0.3)",
              boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
              cursor:"pointer",
            }}>
              <span style={{ transform:"rotate(45deg)", fontSize:"13px", fontWeight:700 }}>{i+1}</span>
            </div>
          </AdvancedMarker>
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ padding:"4px 8px", maxWidth:"200px" }}>
              <div style={{ fontWeight:700, fontSize:"14px", color:"#0F2747", marginBottom:"2px" }}>{selected.pirate_name}</div>
              <div style={{ fontSize:"12px", color:"#666" }}>{selected.address}</div>
              {selected.maps_url && (
                <a href={selected.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"#0F2747", fontWeight:600, textDecoration:"none", display:"block", marginTop:"6px" }}>⚓ Open in Maps →</a>
              )}
            </div>
          </InfoWindow>
        )}
        <RoutePolyline bounties={bounties} onRouteInfo={onRouteInfo} />
        {scanning && (
          <AdvancedMarker position={{ lat:40.4168, lng:-3.7038 }}>
            <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"#D4A96A", boxShadow:"0 0 0 0 rgba(212,169,106,0.7)", animation:"scanPulse 1.5s ease-out infinite" }}/>
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
};

// ─── ROUTE POLYLINE ───────────────────────────────────────────────
export function RoutePolyline({ bounties, onRouteInfo }) {
  const map = useMap();
  const polylineRef = useRef(null);
  const onRouteInfoRef = useRef(onRouteInfo);
  useEffect(() => { onRouteInfoRef.current = onRouteInfo; }, [onRouteInfo]);

  useEffect(() => {
    if (!map || !window.google?.maps || bounties.length < 2) return;

    const dashedIcon = [{
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 3, fillColor: '#D4A96A', fillOpacity: 0.85, strokeWeight: 0 },
      offset: '0', repeat: '16px',
    }];

    const fallback = () => {
      polylineRef.current = new window.google.maps.Polyline({
        path: bounties.map(b => ({ lat: b.lat, lng: b.lng })),
        strokeOpacity: 0, icons: dashedIcon, map,
      });
    };

    if (!window.google.maps.DirectionsService) {
      fallback();
      return () => polylineRef.current?.setMap(null);
    }

    const ds = new window.google.maps.DirectionsService();
    const waypoints = bounties.slice(1, -1).map(b => ({ location: { lat: b.lat, lng: b.lng }, stopover: true }));
    ds.route({
      origin: { lat: bounties[0].lat, lng: bounties[0].lng },
      destination: { lat: bounties[bounties.length - 1].lat, lng: bounties[bounties.length - 1].lng },
      waypoints,
      travelMode: window.google.maps.TravelMode.WALKING,
    }, (result, status) => {
      if (status !== 'OK') { fallback(); return; }
      polylineRef.current = new window.google.maps.Polyline({
        path: result.routes[0].overview_path,
        strokeOpacity: 0, icons: dashedIcon, map,
      });
      let totalMeters = 0, totalSeconds = 0;
      result.routes[0].legs.forEach(leg => { totalMeters += leg.distance.value; totalSeconds += leg.duration.value; });
      if (onRouteInfoRef.current) onRouteInfoRef.current({ km: (totalMeters / 1000).toFixed(1), mins: Math.round(totalSeconds / 60) });
    });

    return () => { if (polylineRef.current) polylineRef.current.setMap(null); };
  }, [map, bounties]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
