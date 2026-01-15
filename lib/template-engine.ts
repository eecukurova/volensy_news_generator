// Template engine for replacing placeholders with actual data

export interface NewsData {
  date?: string;
  time?: string;
  crypto?: {
    btc?: { price: string; change: string };
    eth?: { price: string; change: string };
    fearGreed?: number;
  };
  indices?: {
    sp500?: { change: string };
    nasdaq?: { change: string };
  };
  forex?: {
    eurusd?: { change: string };
    gbpusd?: { change: string };
  };
  commodities?: {
    gold?: { change: string };
    silver?: { change: string };
  };
  topStories?: string[];
}

// Sample data for preview
export const sampleNewsData: NewsData = {
  date: "2024-03-21",
  time: "10:30 UTC",
  crypto: {
    btc: { price: "$46,890", change: "+2.5%" },
    eth: { price: "$2,890", change: "+3.1%" },
    fearGreed: 65,
  },
  indices: {
    sp500: { change: "+1.2%" },
    nasdaq: { change: "+1.8%" },
  },
  forex: {
    eurusd: { change: "+0.3%" },
    gbpusd: { change: "-0.2%" },
  },
  commodities: {
    gold: { change: "+0.8%" },
    silver: { change: "-0.5%" },
  },
  topStories: [
    "Federal Reserve Signals Potential Rate Cut in March...",
    "Ethereum ETF Approval Expected by End of Year...",
    "Gold Reaches New All-Time High Amid Economic Uncertainty...",
  ],
};

export function replacePlaceholders(template: string, data: NewsData = sampleNewsData): string {
  // Ensure template is a string
  if (!template || typeof template !== 'string') {
    console.warn('Template is not a valid string, returning empty string');
    return '';
  }
  
  let result = template;

  // Date and time
  result = result.replace(/%%DATE%%/g, data.date || "2024-03-21");
  result = result.replace(/%%TIME%%/g, data.time || "10:30 UTC");
  result = result.replace(/%%DATETIME%%/g, `${data.date || "2024-03-21"} ${data.time || "10:30 UTC"}`);

  // Crypto
  if (data.crypto) {
    result = result.replace(/%%BTC_PRICE%%/g, data.crypto.btc?.price || "$46,890");
    result = result.replace(/%%BTC_CHANGE%%/g, data.crypto.btc?.change || "+2.5%");
    result = result.replace(/%%ETH_PRICE%%/g, data.crypto.eth?.price || "$2,890");
    result = result.replace(/%%ETH_CHANGE%%/g, data.crypto.eth?.change || "+3.1%");
    result = result.replace(/%%FEAR_GREED%%/g, String(data.crypto.fearGreed || 65));
    result = result.replace(/%%FEAR_GREED_STATUS%%/g, getFearGreedStatus(data.crypto.fearGreed || 65));
  }

  // Indices
  if (data.indices) {
    result = result.replace(/%%SP500_CHANGE%%/g, data.indices.sp500?.change || "+1.2%");
    result = result.replace(/%%NASDAQ_CHANGE%%/g, data.indices.nasdaq?.change || "+1.8%");
    result = result.replace(/%%SP500_ICON%%/g, getChangeIcon(data.indices.sp500?.change || "+1.2%"));
    result = result.replace(/%%NASDAQ_ICON%%/g, getChangeIcon(data.indices.nasdaq?.change || "+1.8%"));
  }

  // Forex
  if (data.forex) {
    result = result.replace(/%%EURUSD_CHANGE%%/g, data.forex.eurusd?.change || "+0.3%");
    result = result.replace(/%%GBPUSD_CHANGE%%/g, data.forex.gbpusd?.change || "-0.2%");
    result = result.replace(/%%EURUSD_ICON%%/g, getChangeIcon(data.forex.eurusd?.change || "+0.3%"));
    result = result.replace(/%%GBPUSD_ICON%%/g, getChangeIcon(data.forex.gbpusd?.change || "-0.2%"));
  }

  // Commodities
  if (data.commodities) {
    result = result.replace(/%%GOLD_CHANGE%%/g, data.commodities.gold?.change || "+0.8%");
    result = result.replace(/%%SILVER_CHANGE%%/g, data.commodities.silver?.change || "-0.5%");
    result = result.replace(/%%GOLD_ICON%%/g, getChangeIcon(data.commodities.gold?.change || "+0.8%"));
    result = result.replace(/%%SILVER_ICON%%/g, getChangeIcon(data.commodities.silver?.change || "-0.5%"));
  }

  // Top stories
  if (data.topStories && data.topStories.length > 0) {
    const storiesList = data.topStories.map((story, index) => `${index + 1}. ${story}`).join("\n\n");
    result = result.replace(/%%TOP_STORIES%%/g, storiesList);
    result = result.replace(/%%TOP_STORY_1%%/g, data.topStories[0] || "");
    result = result.replace(/%%TOP_STORY_2%%/g, data.topStories[1] || "");
    result = result.replace(/%%TOP_STORY_3%%/g, data.topStories[2] || "");
  }

  // Generic NEWS placeholder - replace with formatted news summary
  result = result.replace(/%%NEWS%%/g, formatNewsSummary(data));

  return result;
}

function getChangeIcon(change: string): string {
  const num = parseFloat(change);
  if (num > 0) return "🟢";
  if (num < 0) return "🔴";
  return "⚪";
}

function getFearGreedStatus(value: number): string {
  if (value >= 75) return "Extreme Greed";
  if (value >= 55) return "Greed";
  if (value >= 45) return "Neutral";
  if (value >= 25) return "Fear";
  return "Extreme Fear";
}

function formatNewsSummary(data: NewsData): string {
  const parts: string[] = [];

  if (data.crypto) {
    parts.push("🔹 Crypto Markets:");
    if (data.crypto.btc) {
      parts.push(`• BTC: ${data.crypto.btc.price} (${data.crypto.btc.change})`);
    }
    if (data.crypto.eth) {
      parts.push(`• ETH: ${data.crypto.eth.price} (${data.crypto.eth.change})`);
    }
    if (data.crypto.fearGreed !== undefined) {
      parts.push(`• Fear & Greed: ${data.crypto.fearGreed} (${getFearGreedStatus(data.crypto.fearGreed)})`);
    }
    parts.push("");
  }

  if (data.indices) {
    parts.push("📈 Major Indices:");
    if (data.indices.sp500) {
      parts.push(`${getChangeIcon(data.indices.sp500.change)} S&P 500: ${data.indices.sp500.change}`);
    }
    if (data.indices.nasdaq) {
      parts.push(`${getChangeIcon(data.indices.nasdaq.change)} NASDAQ: ${data.indices.nasdaq.change}`);
    }
    parts.push("");
  }

  if (data.forex) {
    parts.push("💱 Forex Markets:");
    if (data.forex.eurusd) {
      parts.push(`${getChangeIcon(data.forex.eurusd.change)} EUR/USD: ${data.forex.eurusd.change}`);
    }
    if (data.forex.gbpusd) {
      parts.push(`${getChangeIcon(data.forex.gbpusd.change)} GBP/USD: ${data.forex.gbpusd.change}`);
    }
    parts.push("");
  }

  if (data.commodities) {
    parts.push("🏆 Commodities:");
    if (data.commodities.gold) {
      parts.push(`${getChangeIcon(data.commodities.gold.change)} Gold: ${data.commodities.gold.change}`);
    }
    if (data.commodities.silver) {
      parts.push(`${getChangeIcon(data.commodities.silver.change)} Silver: ${data.commodities.silver.change}`);
    }
    parts.push("");
  }

  if (data.topStories && data.topStories.length > 0) {
    parts.push("Top stories today:");
    parts.push("");
    data.topStories.forEach((story) => {
      parts.push(story);
    });
  }

  return parts.join("\n");
}
