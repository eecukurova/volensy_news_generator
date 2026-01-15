"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Save, Eye, Send, Twitter } from "lucide-react";
import { replacePlaceholders, sampleNewsData } from "@/lib/template-engine";

const defaultTelegramTemplate = `📊 Global Market Update | %%DATE%% %%TIME%%



🔹 Crypto Markets:

• BTC: %%BTC_PRICE%% (%%BTC_CHANGE%%)

• ETH: %%ETH_PRICE%% (%%ETH_CHANGE%%)

• Fear & Greed: %%FEAR_GREED%% (%%FEAR_GREED_STATUS%%)



📈 Major Indices:

%%SP500_ICON%% S&P 500: %%SP500_CHANGE%%

%%NASDAQ_ICON%% NASDAQ: %%NASDAQ_CHANGE%%



💱 Forex Markets:

%%EURUSD_ICON%% EUR/USD: %%EURUSD_CHANGE%%

%%GBPUSD_ICON%% GBP/USD: %%GBPUSD_CHANGE%%



🏆 Commodities:

%%GOLD_ICON%% Gold: %%GOLD_CHANGE%%

%%SILVER_ICON%% Silver: %%SILVER_CHANGE%%



#Markets #Trading #GlobalMarkets #Volensy`;

const defaultTwitterTemplate = `📰 Market News Summary | %%DATE%% %%TIME%%



Top stories today:



%%TOP_STORY_1%%

%%TOP_STORY_2%%

%%TOP_STORY_3%%



#MarketNews #Trading #DailySummary #Volensy`;

export default function TemplatesPage() {
  const [telegramTemplate, setTelegramTemplate] = useState(defaultTelegramTemplate);
  const [twitterTemplate, setTwitterTemplate] = useState(defaultTwitterTemplate);
  const [loading, setLoading] = useState(false);
  const [activePreview, setActivePreview] = useState<"telegram" | "twitter">("telegram");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const [telegram, twitter] = await Promise.all([
        fetch("/api/templates?platform=telegram").then((r) => r.json()),
        fetch("/api/templates?platform=twitter").then((r) => r.json()),
      ]);

      if (telegram) setTelegramTemplate(telegram.content);
      if (twitter) setTwitterTemplate(twitter.content);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSave = async (platform: "telegram" | "twitter") => {
    setLoading(true);
    try {
      const content = platform === "telegram" ? telegramTemplate : twitterTemplate;

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, content }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${platform === "telegram" ? "Telegram" : "Twitter/X"} template saved successfully!`);
      } else {
        console.error("Save failed:", data);
        alert(`Failed to save template: ${data.error || data.details || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error saving template:", error);
      alert(`Failed to save template: ${error.message || "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  const getPreview = (platform: "telegram" | "twitter") => {
    const template = platform === "telegram" ? telegramTemplate : twitterTemplate;
    if (!template || typeof template !== 'string') {
      return 'Template is empty or invalid';
    }
    return replacePlaceholders(template, sampleNewsData);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Templates
        </h1>
        <p className="text-gray-400">
          Create and manage templates for social media posts. Use placeholders like %%NEWS%%, %%DATE%%, %%BTC_PRICE%% etc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Telegram Template */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5" />
              Telegram Template
            </h2>
            <Button
              onClick={() => handleSave("telegram")}
              disabled={loading}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
          <textarea
            value={telegramTemplate}
            onChange={(e) => setTelegramTemplate(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
            placeholder="Enter Telegram template..."
          />
          <div className="mt-2 text-xs text-gray-500">
            Available placeholders: %%NEWS%%, %%DATE%%, %%TIME%%, %%BTC_PRICE%%, %%BTC_CHANGE%%, %%ETH_PRICE%%, %%ETH_CHANGE%%, %%FEAR_GREED%%, %%SP500_CHANGE%%, %%NASDAQ_CHANGE%%, etc.
          </div>
        </div>

        {/* Twitter/X Template */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Twitter className="w-5 h-5" />
              Twitter/X Template
            </h2>
            <Button
              onClick={() => handleSave("twitter")}
              disabled={loading}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
          <textarea
            value={twitterTemplate}
            onChange={(e) => setTwitterTemplate(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
            placeholder="Enter Twitter/X template..."
          />
          <div className="mt-2 text-xs text-gray-500">
            Available placeholders: %%NEWS%%, %%DATE%%, %%TIME%%, %%TOP_STORY_1%%, %%TOP_STORY_2%%, %%TOP_STORY_3%%, %%TOP_STORIES%%, etc.
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview
          </h2>
          <div className="flex gap-2">
            <Button
              variant={activePreview === "telegram" ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePreview("telegram")}
            >
              <Send className="w-4 h-4 mr-2" />
              Telegram
            </Button>
            <Button
              variant={activePreview === "twitter" ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePreview("twitter")}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter/X
            </Button>
          </div>
        </div>
        <div className="bg-background rounded-lg p-4 border border-input min-h-[300px]">
          <pre className="text-white whitespace-pre-wrap font-mono text-sm">
            {getPreview(activePreview)}
          </pre>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p className="mb-2">This preview uses sample market data. Actual posts will use real-time data from your API sources.</p>
          <p>Sample data: BTC $46,890 (+2.5%), ETH $2,890 (+3.1%), S&P 500 +1.2%, NASDAQ +1.8%, etc.</p>
        </div>
      </div>

      {/* Placeholder Reference */}
      <div className="mt-6 bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-bold text-white mb-4">Available Placeholders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Date & Time</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li><code className="bg-background px-2 py-1 rounded">%%DATE%%</code> - Date (e.g., 2024-03-21)</li>
              <li><code className="bg-background px-2 py-1 rounded">%%TIME%%</code> - Time (e.g., 10:30 UTC)</li>
              <li><code className="bg-background px-2 py-1 rounded">%%DATETIME%%</code> - Date and time</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Crypto</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li><code className="bg-background px-2 py-1 rounded">%%BTC_PRICE%%</code> - Bitcoin price</li>
              <li><code className="bg-background px-2 py-1 rounded">%%BTC_CHANGE%%</code> - Bitcoin change %</li>
              <li><code className="bg-background px-2 py-1 rounded">%%ETH_PRICE%%</code> - Ethereum price</li>
              <li><code className="bg-background px-2 py-1 rounded">%%ETH_CHANGE%%</code> - Ethereum change %</li>
              <li><code className="bg-background px-2 py-1 rounded">%%FEAR_GREED%%</code> - Fear & Greed index</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Indices</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li><code className="bg-background px-2 py-1 rounded">%%SP500_CHANGE%%</code> - S&P 500 change</li>
              <li><code className="bg-background px-2 py-1 rounded">%%NASDAQ_CHANGE%%</code> - NASDAQ change</li>
              <li><code className="bg-background px-2 py-1 rounded">%%SP500_ICON%%</code> - S&P 500 icon (🟢/🔴)</li>
              <li><code className="bg-background px-2 py-1 rounded">%%NASDAQ_ICON%%</code> - NASDAQ icon</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">News & Stories</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li><code className="bg-background px-2 py-1 rounded">%%NEWS%%</code> - Full formatted news summary</li>
              <li><code className="bg-background px-2 py-1 rounded">%%TOP_STORY_1%%</code> - First top story</li>
              <li><code className="bg-background px-2 py-1 rounded">%%TOP_STORY_2%%</code> - Second top story</li>
              <li><code className="bg-background px-2 py-1 rounded">%%TOP_STORY_3%%</code> - Third top story</li>
              <li><code className="bg-background px-2 py-1 rounded">%%TOP_STORIES%%</code> - All top stories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
