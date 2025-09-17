import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './GeoMap.css';

// Contract
// props:
// - bucketList: string[] of ISO A3 codes (e.g., "USA", "FRA") to highlight
// behavior:
// - Loads /countries.geojson from public
// - Renders country polygons; hover highlight; click navigates to /country/:code
// - Ignores territories that aren't in REST Countries (e.g., -99, ATF, ATA)

const BLOCKED_CODES = new Set(['-99', 'ATF', 'ATA']);

function GeoMap({ bucketList = [] }) {
  const navigate = useNavigate();
  const [worldData, setWorldData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const bucket = useMemo(() => new Set(bucketList.filter(Boolean)), [bucketList]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/countries.geojson', { cache: 'force-cache' });
        if (!res.ok) throw new Error(`Failed to load countries.geojson (${res.status})`);
        const data = await res.json();
        if (isMounted) setWorldData(data);
      } catch (e) {
        if (isMounted) setError(e.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const countryStyle = (feature) => {
    const id = feature?.id;
    const inBucket = id && bucket.has(id);
    return {
      color: '#2b2b2b',
      weight: 0.6,
      opacity: 0.9,
      fillColor: inBucket ? '#f6ae2d' : '#74c0fc',
      fillOpacity: inBucket ? 0.8 : 0.55,
    };
  };

  const handleFeature = (feature, layer) => {
    const id = feature?.id;
    const name = feature?.properties?.name || id || 'Unknown';

    // Tooltip on hover
    try {
      layer.bindTooltip(name, {
        direction: 'auto',
        sticky: true,
        opacity: 0.9,
        className: 'geomap-tooltip',
      });
    } catch (_) {
      // noop if tooltips fail
    }

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        const inBucket = id && bucket.has(id);
        l.setStyle({
          weight: 1.2,
          fillOpacity: inBucket ? 0.9 : 0.7,
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          l.bringToFront?.();
        }
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(countryStyle(feature));
      },
      click: () => {
        if (!id || BLOCKED_CODES.has(id)) return;
        // Navigate to the country page using its ISO A3 code
        navigate(`/country/${encodeURIComponent(id)}`);
      },
    });
  };

  if (loading) return <div className="geomap-status">Loading map…</div>;
  if (error) return <div className="geomap-status error">Failed to load map: {error}</div>;

  return (
    <div className="geomap-wrapper">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true}
        worldCopyJump={true}
        className="geomap-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {worldData && (
          <GeoJSON data={worldData} style={countryStyle} onEachFeature={handleFeature} />
        )}
      </MapContainer>
      <div className="geomap-legend" role="note" aria-label="Map legend">
        <strong className="legend-title">Legend</strong>
        <span className="legend-item"><span className="legend-swatch swatch-bucket" /> Orange = Bucket List</span>
        <span className="legend-item"><span className="legend-swatch swatch-default" /> Blue = Other Countries</span>
      </div>
    </div>
  );
}

export default GeoMap;
