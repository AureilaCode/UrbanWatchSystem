import { useState } from 'react';
import { MapPin, AlertTriangle, Car, Waves, ExternalLink, Filter } from 'lucide-react';
import { Link } from 'wouter';

export type MapMarkerItem = {
  id: string;
  type: 'POTHOLE' | 'ROAD_HAZARD' | 'TRAFFIC' | 'FLOOD' | 'CIVIC' | 'USER_LOCATION';
  title: string;
  issue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  department?: string | null;
  status?: string | null;
  reportedTime: string;
  latitude: number;
  longitude: number;
  complaintId?: string | null;
};

export type CivicUnifiedMapProps = {
  items: MapMarkerItem[];
  userLocation?: { latitude: number; longitude: number } | null;
  className?: string;
};

export function CivicUnifiedMap({ items, userLocation, className = '' }: CivicUnifiedMapProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(items[0] ?? null);

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ROADS') return item.type === 'POTHOLE' || item.type === 'ROAD_HAZARD';
    if (filterType === 'TRAFFIC') return item.type === 'TRAFFIC';
    if (filterType === 'FLOOD') return item.type === 'FLOOD';
    return true;
  });

  const activeFocus = selectedItem ?? filteredItems[0] ?? (userLocation ? {
    id: 'user',
    type: 'USER_LOCATION' as const,
    title: 'Your Location',
    issue: 'Current Location',
    severity: 'LOW' as const,
    location: 'Current Position',
    reportedTime: 'Live',
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
  } : {
    id: 'default',
    type: 'CIVIC' as const,
    title: 'City Center',
    issue: 'Civic Hub',
    severity: 'LOW' as const,
    location: 'Municipal Boundary',
    reportedTime: 'Now',
    latitude: 19.076,
    longitude: 72.8777,
  });

  const delta = 0.02;
  const bbox = [
    activeFocus.longitude - delta,
    activeFocus.latitude - delta,
    activeFocus.longitude + delta,
    activeFocus.latitude + delta,
  ].join(',');

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${activeFocus.latitude}%2C${activeFocus.longitude}`;

  const largerMapUrl = `https://www.openstreetmap.org/?mlat=${activeFocus.latitude}&mlon=${activeFocus.longitude}#map=15/${activeFocus.latitude}/${activeFocus.longitude}`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f5ed] border-2 border-[#15353c] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#ed735e]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15353c]">
            Display Layer:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: `All (${items.length})` },
            { id: 'ROADS', label: 'Potholes & Roads' },
            { id: 'TRAFFIC', label: 'Traffic Alerts' },
            { id: 'FLOOD', label: 'Flood & Rain' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filterType === tab.id
                  ? 'bg-[#15353c] text-[#fffdf8]'
                  : 'bg-[#fffdf8] text-[#15353c] border border-[#15353c]/30 hover:bg-[#eee9de]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Map Container */}
        <div className="relative overflow-hidden rounded-xl border-[3px] border-[#15353c] bg-[#e7f3f0] shadow-[6px_6px_0_#15353c]">
          <iframe
            title={`Civic hazard map centered at ${activeFocus.latitude}, ${activeFocus.longitude}`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[360px] sm:h-[420px] w-full border-0"
          />

          {/* Bottom Coordinate Bar */}
          <div className="flex items-center justify-between border-t-2 border-[#15353c] bg-[#fffdf8] px-4 py-2.5">
            <span className="text-[10px] font-mono font-bold text-[#15353c]">
              Pinned: {activeFocus.title} ({activeFocus.latitude.toFixed(4)}, {activeFocus.longitude.toFixed(4)})
            </span>
            <a
              href={largerMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#17675e] hover:underline"
            >
              Expand Map <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Selected Marker Detail Card & Marker Selector */}
        <div className="space-y-4">
          <div className="rounded-xl border-[3px] border-[#15353c] bg-[#fffdf8] p-5 shadow-[4px_4px_0_#15353c]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ed735e]">
              Selected Marker Intel
            </p>
            <h4 className="mt-1 font-mono text-lg font-bold uppercase tracking-tight text-[#15353c]">
              {activeFocus.title}
            </h4>

            <dl className="mt-4 space-y-2 border-t-2 border-[#15353c]/15 pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#52706d]">Issue:</dt>
                <dd className="font-bold text-[#15353c]">{activeFocus.issue}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#52706d]">Severity:</dt>
                <dd>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                      activeFocus.severity === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : activeFocus.severity === 'HIGH'
                        ? 'bg-orange-500 text-white'
                        : activeFocus.severity === 'MEDIUM'
                        ? 'bg-amber-400 text-black'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activeFocus.severity}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#52706d]">Department:</dt>
                <dd className="font-bold text-[#17675e]">{activeFocus.department || 'Public Works'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#52706d]">Status:</dt>
                <dd className="font-bold text-[#15353c]">{activeFocus.status || 'Active'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#52706d]">Reported:</dt>
                <dd className="font-mono text-[#52706d]">{activeFocus.reportedTime}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#52706d]">Location:</dt>
                <dd className="text-right font-medium text-[#15353c] max-w-[170px] truncate">
                  {activeFocus.location}
                </dd>
              </div>
            </dl>

            {activeFocus.complaintId && (
              <Link
                href={`/complaints/${activeFocus.complaintId}`}
                className="mt-4 block w-full text-center rounded border-2 border-[#15353c] bg-[#ed735e] py-2 text-xs font-bold uppercase tracking-widest text-[#fffdf8] hover:bg-[#15353c] transition-colors"
              >
                Inspect Report
              </Link>
            )}
          </div>

          {/* Quick List of Markers */}
          <div className="rounded-xl border-[2px] border-[#15353c] bg-[#f8f5ed] p-3 max-h-[190px] overflow-y-auto space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#52706d] mb-1">
              Active Map Pins ({filteredItems.length}):
            </p>
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left rounded p-2 text-xs transition-colors flex items-center justify-between border ${
                  activeFocus.id === item.id
                    ? 'border-[#15353c] bg-[#fffdf8] font-bold text-[#15353c] shadow-sm'
                    : 'border-transparent hover:bg-white/60 text-[#52706d]'
                }`}
              >
                <span className="truncate pr-2">{item.title}</span>
                <span className="text-[9px] font-mono shrink-0 uppercase tracking-wider">
                  {item.severity}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
