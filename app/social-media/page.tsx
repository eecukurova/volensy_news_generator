"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Grid,
  Wrench,
  Twitter,
  Send,
  Instagram,
  BarChart3,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface SocialMediaConfig {
  id?: string;
  platform: string;
  enabled: boolean;
  twitterApiKey?: string | null;
  twitterApiSecret?: string | null;
  twitterAccessToken?: string | null;
  twitterAccessTokenSecret?: string | null;
  twitterBearerToken?: string | null;
  telegramBotToken?: string | null;
  telegramChannelId?: string | null;
  telegramChannelUsername?: string | null;
  instagramAccessToken?: string | null;
  instagramAppId?: string | null;
  instagramAppSecret?: string | null;
  lastTestResult?: string | null;
  lastTestTimestamp?: string | null;
}

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState("twitter");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const [twitterConfig, setTwitterConfig] = useState<SocialMediaConfig>({
    platform: "twitter",
    enabled: false,
  });

  const [telegramConfig, setTelegramConfig] = useState<SocialMediaConfig>({
    platform: "telegram",
    enabled: false,
  });

  const [instagramConfig, setInstagramConfig] = useState<SocialMediaConfig>({
    platform: "instagram",
    enabled: false,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const [twitter, telegram, instagram] = await Promise.all([
        fetch("/api/social-media?platform=twitter").then((r) => r.json()),
        fetch("/api/social-media?platform=telegram").then((r) => r.json()),
        fetch("/api/social-media?platform=instagram").then((r) => r.json()),
      ]);

      if (twitter) {
        setTwitterConfig({ ...twitterConfig, ...twitter, platform: "twitter" });
      }
      if (telegram) {
        setTelegramConfig({ ...telegramConfig, ...telegram, platform: "telegram" });
      }
      if (instagram) {
        setInstagramConfig({ ...instagramConfig, ...instagram, platform: "instagram" });
      }
    } catch (error) {
      console.error("Error fetching configs:", error);
    }
  };

  const handleSave = async (platform: string) => {
    setLoading(true);
    try {
      const config =
        platform === "twitter"
          ? twitterConfig
          : platform === "telegram"
          ? telegramConfig
          : instagramConfig;

      // Ensure platform is set
      const configToSave = {
        ...config,
        platform: platform,
      };

      console.log("Saving config for platform:", platform, configToSave);

      const response = await fetch("/api/social-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configToSave),
      });

      const data = await response.json();

      if (response.ok) {
        const savedConfig = { ...data, platform: platform };
        if (platform === "twitter") setTwitterConfig(savedConfig);
        else if (platform === "telegram") setTelegramConfig(savedConfig);
        else setInstagramConfig(savedConfig);
        alert("Configuration saved successfully!");
      } else {
        console.error("Save failed - Status:", response.status, "Data:", data);
        const errorMsg = data.details || data.error || `HTTP ${response.status}: ${response.statusText}`;
        alert(`Failed to save configuration: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error("Error saving config:", error);
      alert(`Failed to save configuration: ${error.message || "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (platform: string) => {
    setTesting(true);
    try {
      console.log("Testing platform:", platform);

      // Get current config
      const config =
        platform === "twitter"
          ? twitterConfig
          : platform === "telegram"
          ? telegramConfig
          : instagramConfig;

      // Check if required fields are filled
      if (platform === "telegram" && !config.telegramBotToken?.trim()) {
        alert("Please enter Bot Token before testing.");
        setTesting(false);
        return;
      }

      if (platform === "twitter" && !config.twitterBearerToken?.trim() && !config.twitterAccessToken?.trim()) {
        alert("Please enter Bearer Token or Access Token before testing.");
        setTesting(false);
        return;
      }

      // First save the config silently if it has values
      try {
        const configToSave = {
          ...config,
          platform: platform,
        };

        const saveResponse = await fetch("/api/social-media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configToSave),
        });

        if (saveResponse.ok) {
          const saved = await saveResponse.json();
          const savedConfig = { ...saved, platform: platform };
          if (platform === "twitter") setTwitterConfig(savedConfig);
          else if (platform === "telegram") setTelegramConfig(savedConfig);
          else setInstagramConfig(savedConfig);
          console.log("Config saved before test");
        } else {
          const errorData = await saveResponse.json();
          console.error("Failed to save before test:", errorData);
        }
      } catch (saveError) {
        console.error("Error saving before test:", saveError);
      }

      // Wait a bit for the save to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check if config exists in database
      const configResponse = await fetch(`/api/social-media?platform=${platform}`);
      const existingConfig = await configResponse.json();

      if (!existingConfig) {
        alert("Please save the configuration first before testing.");
        setTesting(false);
        return;
      }

      const response = await fetch("/api/social-media/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });

      const result = await response.json();
      console.log("Test result:", result);

      // Update config with test result
      await fetchConfigs();

      if (result.success) {
        alert(`Test successful: ${result.message}`);
      } else {
        const errorMsg = result.message || result.error || result.details || "Unknown error";
        console.error("Test failed details:", result);
        alert(`Test failed: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error("Error testing:", error);
      alert(`Test failed: ${error.message || "Network error"}`);
    } finally {
      setTesting(false);
    }
  };

  const handleClear = async (platform: string) => {
    if (!confirm("Are you sure you want to clear all configuration?")) return;

    try {
      const response = await fetch("/api/social-media/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        await fetchConfigs();
        alert("Configuration cleared");
      }
    } catch (error) {
      console.error("Error clearing config:", error);
      alert("Failed to clear configuration");
    }
  };

  const toggleSecret = (field: string) => {
    setShowSecrets({ ...showSecrets, [field]: !showSecrets[field] });
  };

  const getTestResult = (config: SocialMediaConfig) => {
    if (!config.lastTestResult) return null;
    try {
      return JSON.parse(config.lastTestResult);
    } catch {
      return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Grid className="w-8 h-8" />
          Social Media API Management
        </h1>
        <p className="text-gray-400 flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Configure and test social media platform APIs - Twitter/X, Telegram, Instagram
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            Twitter/X
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Twitter/X Tab */}
        <TabsContent value="twitter">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Twitter className="w-6 h-6" />
              Twitter/X API Configuration
            </h2>
            <p className="text-gray-400 mb-6">
              Configure Twitter API v2 credentials for posting and engagement tracking.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets["twitterApiKey"] ? "text" : "password"}
                    value={twitterConfig.twitterApiKey || ""}
                    onChange={(e) =>
                      setTwitterConfig({
                        ...twitterConfig,
                        twitterApiKey: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Enter API Key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("twitterApiKey")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets["twitterApiKey"] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets["twitterApiSecret"] ? "text" : "password"}
                    value={twitterConfig.twitterApiSecret || ""}
                    onChange={(e) =>
                      setTwitterConfig({
                        ...twitterConfig,
                        twitterApiSecret: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Enter API Secret"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("twitterApiSecret")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets["twitterApiSecret"] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets["twitterAccessToken"] ? "text" : "password"}
                    value={twitterConfig.twitterAccessToken || ""}
                    onChange={(e) =>
                      setTwitterConfig({
                        ...twitterConfig,
                        twitterAccessToken: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Enter Access Token"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("twitterAccessToken")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets["twitterAccessToken"] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Token Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets["twitterAccessTokenSecret"] ? "text" : "password"}
                    value={twitterConfig.twitterAccessTokenSecret || ""}
                    onChange={(e) =>
                      setTwitterConfig({
                        ...twitterConfig,
                        twitterAccessTokenSecret: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Enter Access Token Secret"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("twitterAccessTokenSecret")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets["twitterAccessTokenSecret"] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bearer Token (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showSecrets["twitterBearerToken"] ? "text" : "password"}
                    value={twitterConfig.twitterBearerToken || ""}
                    onChange={(e) =>
                      setTwitterConfig({
                        ...twitterConfig,
                        twitterBearerToken: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Enter Bearer Token"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("twitterBearerToken")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets["twitterBearerToken"] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="twitterEnabled"
                  checked={twitterConfig.enabled}
                  onChange={(e) =>
                    setTwitterConfig({ ...twitterConfig, enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-600 bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="twitterEnabled" className="text-sm text-gray-300">
                  Enable Twitter API
                </label>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => handleSave("twitter")}
                disabled={loading}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button
                onClick={() => handleTest("twitter")}
                disabled={testing}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleClear("twitter")}
                variant="outline"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {getTestResult(twitterConfig) && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Last Test Results:</div>
                <div
                  className={`p-3 rounded-md flex items-center gap-2 ${
                    getTestResult(twitterConfig)?.success
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-destructive/20 border border-destructive/30"
                  }`}
                >
                  {getTestResult(twitterConfig)?.success ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className="text-white">
                    {getTestResult(twitterConfig)?.message}
                  </span>
                </div>
                {twitterConfig.lastTestTimestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last tested: {new Date(twitterConfig.lastTestTimestamp).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Telegram Tab */}
        <TabsContent value="telegram">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Send className="w-6 h-6" />
              Telegram Bot API Configuration
            </h2>
            <p className="text-gray-400 mb-6">
              Configure Telegram Bot API for channel posting and management.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bot Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets["telegramBotToken"] ? "text" : "password"}
                    value={telegramConfig.telegramBotToken || ""}
                    onChange={(e) =>
                      setTelegramConfig({
                        ...telegramConfig,
                        telegramBotToken: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder="Enter Bot Token"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret("telegramBotToken")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets["telegramBotToken"] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Channel ID (e.g., -1001234567890)
                </label>
                <input
                  type="text"
                  value={telegramConfig.telegramChannelId || ""}
                  onChange={(e) =>
                    setTelegramConfig({
                      ...telegramConfig,
                      telegramChannelId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="-1001234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Channel Username (e.g., @volensynews)
                </label>
                <input
                  type="text"
                  value={telegramConfig.telegramChannelUsername || ""}
                  onChange={(e) =>
                    setTelegramConfig({
                      ...telegramConfig,
                      telegramChannelUsername: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="@volensynews"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="telegramEnabled"
                  checked={telegramConfig.enabled}
                  onChange={(e) =>
                    setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-600 bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="telegramEnabled" className="text-sm text-gray-300">
                  Enable Telegram API
                </label>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => handleSave("telegram")}
                disabled={loading}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button
                onClick={() => handleTest("telegram")}
                disabled={testing}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleClear("telegram")}
                variant="outline"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {getTestResult(telegramConfig) && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Last Test Results:</div>
                <div
                  className={`p-3 rounded-md flex items-center gap-2 ${
                    getTestResult(telegramConfig)?.success
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-destructive/20 border border-destructive/30"
                  }`}
                >
                  {getTestResult(telegramConfig)?.success ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className="text-white">
                    {getTestResult(telegramConfig)?.message}
                  </span>
                </div>
                {telegramConfig.lastTestTimestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last tested: {new Date(telegramConfig.lastTestTimestamp).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Instagram className="w-6 h-6" />
              Instagram API Configuration
            </h2>
            <p className="text-gray-400 mb-6">
              Configure Instagram API credentials (Coming soon).
            </p>
            <div className="text-gray-400 text-center py-8">
              Instagram API configuration will be available soon.
            </div>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="text-gray-400 text-sm mb-1">Twitter/X</div>
                <div className="text-2xl font-bold text-white">
                  {twitterConfig.enabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="text-gray-400 text-sm mb-1">Telegram</div>
                <div className="text-2xl font-bold text-white">
                  {telegramConfig.enabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="text-gray-400 text-sm mb-1">Instagram</div>
                <div className="text-2xl font-bold text-white">
                  {instagramConfig.enabled ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
