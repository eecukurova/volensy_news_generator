"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  Key,
  BarChart3,
  Globe,
  Clock,
  Copy,
  CheckSquare,
  Newspaper,
  Send,
  Twitter,
  Save,
  HelpCircle,
} from "lucide-react";

interface PlatformSettings {
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  dailyPostCount: number;
  timeRangeStart: string;
  timeRangeEnd: string;
}

interface ProcessConfig {
  id?: string;
  highPriorityKeywords: string;
  volatilityThreshold: number;
  language: string;
  newsTimeWindow: number;
  duplicateThreshold: number;
  cacheDuration: number;
  platformSettings: string | { telegram: PlatformSettings; twitter: PlatformSettings };
}

export default function ProcessesPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ProcessConfig>({
    highPriorityKeywords: "bitcoin\nethereum\nfed\ninterest rates\nsec\netf",
    volatilityThreshold: 2.0,
    language: "en",
    newsTimeWindow: 2,
    duplicateThreshold: 80.0,
    cacheDuration: 300,
    platformSettings: {
      telegram: {
        dailyEnabled: false,
        weeklyEnabled: false,
        dailyPostCount: 5,
        timeRangeStart: "09:00",
        timeRangeEnd: "16:00",
      },
      twitter: {
        dailyEnabled: false,
        weeklyEnabled: false,
        dailyPostCount: 5,
        timeRangeStart: "09:00",
        timeRangeEnd: "16:00",
      },
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/process-config");
      const data = await response.json();

      if (data) {
        const platformSettings =
          typeof data.platformSettings === "string"
            ? JSON.parse(data.platformSettings)
            : data.platformSettings;

        setConfig({
          ...data,
          platformSettings,
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/process-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...config,
          platformSettings: typeof config.platformSettings === "string"
            ? config.platformSettings
            : JSON.stringify(config.platformSettings),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Configuration saved successfully!");
      } else {
        console.error("Save failed:", data);
        alert(`Failed to save configuration: ${data.error || data.details || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error saving config:", error);
      alert(`Failed to save configuration: ${error.message || "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const updatePlatformSettings = (
    platform: "telegram" | "twitter",
    updates: Partial<PlatformSettings>
  ) => {
    const currentSettings =
      typeof config.platformSettings === "string"
        ? JSON.parse(config.platformSettings)
        : config.platformSettings;

    setConfig({
      ...config,
      platformSettings: {
        ...currentSettings,
        [platform]: {
          ...currentSettings[platform],
          ...updates,
        },
      },
    });
  };

  const getPlatformSettings = (platform: "telegram" | "twitter"): PlatformSettings => {
    const settings =
      typeof config.platformSettings === "string"
        ? JSON.parse(config.platformSettings)
        : config.platformSettings;
    return settings[platform] || {
      dailyEnabled: false,
      weeklyEnabled: false,
      dailyPostCount: 5,
      timeRangeStart: "09:00",
      timeRangeEnd: "16:00",
    };
  };

  const adjustNumber = (
    field: keyof ProcessConfig,
    delta: number,
    min: number = 0,
    max: number = 100
  ) => {
    const currentValue = Number(config[field]) || 0;
    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    setConfig({ ...config, [field]: newValue });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Newspaper className="w-8 h-8" />
          News Criteria Configuration
        </h1>
        <p className="text-gray-400 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configure news filtering criteria and impact keywords
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* News Filtering Settings */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              News Filtering Settings
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                High Priority Keywords
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </label>
              <p className="text-xs text-gray-500 mb-2">
                High Priority Keywords (one per line)
              </p>
              <textarea
                value={config.highPriorityKeywords}
                onChange={(e) =>
                  setConfig({ ...config, highPriorityKeywords: e.target.value })
                }
                className="w-full h-32 px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                placeholder="bitcoin&#10;ethereum&#10;fed"
              />
            </div>
          </div>

          {/* Volatility Configuration */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Volatility Configuration
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Volatility Threshold (%)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustNumber("volatilityThreshold", -0.1, 0, 100)}
                  className="w-8 h-8 flex items-center justify-center bg-background border border-input rounded-md text-white hover:bg-accent"
                >
                  -
                </button>
                <input
                  type="number"
                  value={config.volatilityThreshold.toFixed(2)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      volatilityThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.1"
                  min="0"
                  max="100"
                  className="flex-1 px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => adjustNumber("volatilityThreshold", 0.1, 0, 100)}
                  className="w-8 h-8 flex items-center justify-center bg-background border border-input rounded-md text-white hover:bg-accent"
                >
                  +
                </button>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Language Filter */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language Filter
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                News Language
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </label>
              <select
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="en">English (en)</option>
                <option value="tr">Turkish (tr)</option>
                <option value="es">Spanish (es)</option>
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
                <option value="it">Italian (it)</option>
                <option value="pt">Portuguese (pt)</option>
                <option value="ru">Russian (ru)</option>
                <option value="zh">Chinese (zh)</option>
                <option value="ja">Japanese (ja)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Time Filter */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Filter
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                News Time Window (hours)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustNumber("newsTimeWindow", -1, 1, 24)}
                  className="w-8 h-8 flex items-center justify-center bg-background border border-input rounded-md text-white hover:bg-accent"
                >
                  -
                </button>
                <input
                  type="number"
                  value={config.newsTimeWindow}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      newsTimeWindow: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="24"
                  className="flex-1 px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => adjustNumber("newsTimeWindow", 1, 1, 24)}
                  className="w-8 h-8 flex items-center justify-center bg-background border border-input rounded-md text-white hover:bg-accent"
                >
                  +
                </button>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Duplicate Detection */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Duplicate Detection
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                Duplicate Detection Threshold (%)
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </label>
              <Slider
                value={config.duplicateThreshold}
                onChange={(value) =>
                  setConfig({ ...config, duplicateThreshold: value })
                }
                min={50}
                max={95}
                step={1}
              />
            </div>
          </div>

          {/* Cache Duration */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Cache Duration
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cache Duration (seconds)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustNumber("cacheDuration", -60, 60, 3600)}
                  className="w-8 h-8 flex items-center justify-center bg-background border border-input rounded-md text-white hover:bg-accent"
                >
                  -
                </button>
                <input
                  type="number"
                  value={config.cacheDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cacheDuration: parseInt(e.target.value) || 60,
                    })
                  }
                  min="60"
                  max="3600"
                  step="60"
                  className="flex-1 px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => adjustNumber("cacheDuration", 60, 60, 3600)}
                  className="w-8 h-8 flex items-center justify-center bg-background border border-input rounded-md text-white hover:bg-accent"
                >
                  +
                </button>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Process Settings */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Platform Process Settings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Telegram Settings */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Telegram
            </h3>
            <PlatformProcessSettings
              platform="telegram"
              settings={getPlatformSettings("telegram")}
              onUpdate={(updates) => updatePlatformSettings("telegram", updates)}
            />
          </div>

          {/* Twitter/X Settings */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Twitter className="w-5 h-5" />
              Twitter/X
            </h3>
            <PlatformProcessSettings
              platform="twitter"
              settings={getPlatformSettings("twitter")}
              onUpdate={(updates) => updatePlatformSettings("twitter", updates)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}

function PlatformProcessSettings({
  platform,
  settings,
  onUpdate,
}: {
  platform: "telegram" | "twitter";
  settings: PlatformSettings;
  onUpdate: (updates: Partial<PlatformSettings>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Daily Process */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Daily Process</label>
        <button
          type="button"
          onClick={() => onUpdate({ dailyEnabled: !settings.dailyEnabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.dailyEnabled ? "bg-primary" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.dailyEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Weekly Process */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Weekly Process</label>
        <button
          type="button"
          onClick={() => onUpdate({ weeklyEnabled: !settings.weeklyEnabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.weeklyEnabled ? "bg-primary" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.weeklyEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Daily Post Count */}
      {settings.dailyEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Daily Post Count
          </label>
          <select
            value={settings.dailyPostCount}
            onChange={(e) =>
              onUpdate({ dailyPostCount: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 24].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "post" : "posts"} per day
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Time Range */}
      {settings.dailyEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Time Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={settings.timeRangeStart}
              onChange={(e) => onUpdate({ timeRangeStart: e.target.value })}
              className="flex-1 px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="time"
              value={settings.timeRangeEnd}
              onChange={(e) => onUpdate({ timeRangeEnd: e.target.value })}
              className="flex-1 px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
