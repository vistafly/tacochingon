'use client';

import { useState, useCallback, useRef } from 'react';
import { Bug, ChevronDown, ChevronUp, RotateCw } from 'lucide-react';

interface TimingEntry {
  label: string;
  serverMs: Record<string, number>;
  clientMs: number;
  firebaseInit: { ms: number; status: string };
  extra?: Record<string, string | number>;
  timestamp: number;
}

export function useDebugTiming() {
  const [entries, setEntries] = useState<TimingEntry[]>([]);

  const trackFetch = useCallback(
    async (label: string, url: string, init?: RequestInit) => {
      const clientStart = performance.now();
      const response = await fetch(url, init);
      const clientMs = Math.round(performance.now() - clientStart);
      const data = await response.json();

      const debug = data._debug;
      if (debug) {
        setEntries((prev) => [
          {
            label,
            serverMs: debug.timing || {},
            clientMs,
            firebaseInit: debug.firebaseInit || { ms: 0, status: 'unknown' },
            extra: {
              ...(debug.orderCount !== undefined
                ? { orderCount: debug.orderCount }
                : {}),
            },
            timestamp: Date.now(),
          },
          ...prev.slice(0, 19), // keep last 20
        ]);
      }

      return { response, data };
    },
    []
  );

  return { entries, trackFetch };
}

interface AdminDebugPanelProps {
  entries: TimingEntry[];
}

export function AdminDebugPanel({ entries }: AdminDebugPanelProps) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  const latest = entries[0];
  const networkOverhead = latest
    ? latest.clientMs - (latest.serverMs.total || 0)
    : 0;

  // Color code: green < 500ms, yellow < 2000ms, red >= 2000ms
  const colorFor = (ms: number) =>
    ms < 500 ? 'text-green-400' : ms < 2000 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <div className="pointer-events-auto bg-gray-900/95 backdrop-blur border border-gray-700 rounded-lg shadow-xl text-xs font-mono">
          {/* Toggle bar */}
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bug className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 font-semibold">DEBUG</span>
              {latest && (
                <span className="text-gray-400">
                  Last:{' '}
                  <span className={colorFor(latest.clientMs)}>
                    {latest.clientMs}ms
                  </span>
                  {' total | '}
                  <span className={colorFor(latest.serverMs.total || 0)}>
                    {latest.serverMs.total || '?'}ms
                  </span>
                  {' server | '}
                  <span className={colorFor(networkOverhead)}>
                    {networkOverhead}ms
                  </span>
                  {' network'}
                </span>
              )}
            </div>
            {open ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {/* Expanded details */}
          {open && (
            <div className="px-3 pb-3 space-y-2 max-h-64 overflow-y-auto">
              {/* Firebase status */}
              <div className="flex items-center gap-2 text-gray-400 border-b border-gray-700 pb-2">
                <span>Firebase Admin:</span>
                <span
                  className={
                    latest.firebaseInit.status === 'ok'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }
                >
                  {latest.firebaseInit.status}
                </span>
                <span className="text-gray-500">
                  (init: {latest.firebaseInit.ms}ms)
                </span>
              </div>

              {/* Entries */}
              {entries.map((entry, i) => (
                <div key={entry.timestamp + i} className="border-b border-gray-800 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold">{entry.label}</span>
                    <span className="text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Waterfall */}
                  <div className="space-y-0.5 ml-2">
                    {Object.entries(entry.serverMs).map(([key, ms]) => {
                      const pct =
                        entry.clientMs > 0
                          ? Math.min((ms / entry.clientMs) * 100, 100)
                          : 0;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-gray-400 w-28 truncate">
                            {key}
                          </span>
                          <div className="flex-1 h-3 bg-gray-800 rounded overflow-hidden">
                            <div
                              className={`h-full rounded ${
                                ms < 500
                                  ? 'bg-green-500/70'
                                  : ms < 2000
                                  ? 'bg-yellow-500/70'
                                  : 'bg-red-500/70'
                              }`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                          <span className={`w-16 text-right ${colorFor(ms)}`}>
                            {ms}ms
                          </span>
                        </div>
                      );
                    })}
                    {/* Network bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 w-28 truncate">
                        network
                      </span>
                      <div className="flex-1 h-3 bg-gray-800 rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${
                            networkOverhead < 500
                              ? 'bg-blue-500/70'
                              : 'bg-orange-500/70'
                          }`}
                          style={{
                            width: `${Math.max(
                              entry.clientMs > 0
                                ? ((entry.clientMs -
                                    (entry.serverMs.total || 0)) /
                                    entry.clientMs) *
                                  100
                                : 0,
                              2
                            )}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`w-16 text-right ${colorFor(
                          entry.clientMs - (entry.serverMs.total || 0)
                        )}`}
                      >
                        {entry.clientMs - (entry.serverMs.total || 0)}ms
                      </span>
                    </div>
                  </div>

                  {/* Extra info */}
                  {entry.extra &&
                    Object.keys(entry.extra).length > 0 && (
                      <div className="mt-1 ml-2 text-gray-500">
                        {Object.entries(entry.extra).map(([k, v]) => (
                          <span key={k} className="mr-3">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
