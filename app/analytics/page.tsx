"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Share2,
  Twitter,
  Eye,
  Heart,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Sample data - In production, this would come from API
const generateSampleData = () => {
  const dates = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return {
    engagementRate: dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
      rate: Math.random() * 10 + 5 + Math.sin(index / 5) * 2,
    })),
    platformComparison: [
      { name: "Twitter/X", posts: 145, engagement: 2340, reach: 12500 },
      { name: "Telegram", posts: 98, engagement: 1890, reach: 8900 },
    ],
    trendAnalysis: dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
      twitter: Math.floor(Math.random() * 20 + 10 + Math.sin(index / 3) * 5),
      telegram: Math.floor(Math.random() * 15 + 8 + Math.cos(index / 3) * 3),
    })),
  };
};

const COLORS = ["#00b486", "#10b981", "#34d399", "#6ee7b7"];

export default function AnalyticsPage() {
  const [data, setData] = useState(generateSampleData());

  // Calculate metrics
  const totalPosts = data.platformComparison.reduce((sum, p) => sum + p.posts, 0);
  const totalEngagement = data.platformComparison.reduce((sum, p) => sum + p.engagement, 0);
  const averageEngagement = totalPosts > 0 ? (totalEngagement / totalPosts).toFixed(1) : "0";
  const totalReach = data.platformComparison.reduce((sum, p) => sum + p.reach, 0);
  const averageEngagementRate =
    data.engagementRate.length > 0
      ? (
          data.engagementRate.reduce((sum, d) => sum + d.rate, 0) / data.engagementRate.length
        ).toFixed(1)
      : "0";

  useEffect(() => {
    // In production, fetch real data from API
    // fetch('/api/analytics').then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Analytics
        </h1>
        <p className="text-gray-400">
          Track performance metrics and engagement across platforms
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Toplam Yayınlanan Haber</h3>
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-white">{totalPosts}</p>
          <p className="text-xs text-gray-500 mt-1">Son 30 gün</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Ortalama Etkileşim</h3>
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-white">{averageEngagement}</p>
          <p className="text-xs text-gray-500 mt-1">Post başına</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Toplam Erişim</h3>
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-white">
            {(totalReach / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">Son 30 gün</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Ortalama Etkileşim Oranı</h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-white">{averageEngagementRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Son 30 gün ortalaması</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Engagement Rate Chart */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Etkileşim Oranı
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.engagementRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
                label={{ value: "Oran (%)", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a1a14",
                  border: "1px solid #00b486",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#00b486"
                strokeWidth={2}
                dot={{ fill: "#00b486", r: 4 }}
                name="Etkileşim Oranı (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Comparison Chart */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Platform Karşılaştırması
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.platformComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a1a14",
                  border: "1px solid #00b486",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="posts" fill="#00b486" name="Post Sayısı" />
              <Bar dataKey="engagement" fill="#10b981" name="Etkileşim" />
              <Bar dataKey="reach" fill="#34d399" name="Erişim" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Analysis - Full Width */}
      <div className="bg-card rounded-lg p-6 border border-border mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Trend Analizi (Son 30 Gün)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.trendAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: "11px" }}
              tick={{ fill: "#9ca3af" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#9ca3af" }}
              label={{ value: "Post Sayısı", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a1a14",
                border: "1px solid #00b486",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend wrapperStyle={{ color: "#9ca3af" }} />
            <Line
              type="monotone"
              dataKey="twitter"
              stroke="#1DA1F2"
              strokeWidth={2}
              dot={{ fill: "#1DA1F2", r: 3 }}
              name="Twitter/X"
            />
            <Line
              type="monotone"
              dataKey="telegram"
              stroke="#0088cc"
              strokeWidth={2}
              dot={{ fill: "#0088cc", r: 3 }}
              name="Telegram"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Dağılımı (Post Sayısı)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.platformComparison}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="posts"
              >
                {data.platformComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a1a14",
                  border: "1px solid #00b486",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Platform Dağılımı (Etkileşim)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.platformComparison}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="engagement"
              >
                {data.platformComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a1a14",
                  border: "1px solid #00b486",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Posted Messages Table */}
      <PostedMessagesTable />
    </div>
  );
}

interface PostedMessage {
  id: string;
  postedAt: string;
  platform: string;
  messageText: string;
  keywords: string;
  apiResponse: string;
}

function PostedMessagesTable() {
  const [messages, setMessages] = useState<PostedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const limit = 50;

  useEffect(() => {
    fetchMessages();
  }, [page, selectedPlatform]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const platformParam = selectedPlatform !== "all" ? `&platform=${selectedPlatform}` : "";
      const response = await fetch(`/api/posted-messages?page=${page}&limit=${limit}${platformParam}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseKeywords = (keywords: string): string[] => {
    try {
      const parsed = JSON.parse(keywords);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return keywords.split(",").map((k) => k.trim());
    }
  };

  const parseApiResponse = (apiResponse: string): any => {
    try {
      return JSON.parse(apiResponse);
    } catch {
      return apiResponse;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Posted Messages
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedPlatform}
            onChange={(e) => {
              setSelectedPlatform(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="twitter">Twitter/X</option>
            <option value="telegram">Telegram</option>
          </select>
          <div className="text-sm text-gray-400">
            Total: {total} messages
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No messages found. Messages will appear here once they are posted.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-white font-semibold">Posted Date</TableHead>
                  <TableHead className="text-white font-semibold">Platform</TableHead>
                  <TableHead className="text-white font-semibold">Message Text</TableHead>
                  <TableHead className="text-white font-semibold">Keywords</TableHead>
                  <TableHead className="text-white font-semibold">API Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => {
                  const keywords = parseKeywords(message.keywords);
                  const apiResponse = parseApiResponse(message.apiResponse);
                  const isExpanded = expandedRow === message.id;

                  return (
                    <React.Fragment key={message.id}>
                      <TableRow className="border-border hover:bg-accent/10">
                        <TableCell className="text-gray-300 text-sm">
                          {formatDate(message.postedAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              message.platform === "twitter"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-cyan-500/20 text-cyan-300"
                            }`}
                          >
                            {message.platform === "twitter" ? (
                              <Twitter className="w-3 h-3" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            {message.platform === "twitter" ? "X" : "Telegram"}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-md">
                          <div className="line-clamp-2">{message.messageText}</div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {keywords.slice(0, 3).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                            {keywords.length > 3 && (
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                                +{keywords.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : message.id)
                            }
                            className="text-primary hover:text-primary"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="border-border bg-background/50">
                          <TableCell colSpan={5} className="p-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">
                                  Full Message Text:
                                </h4>
                                <div className="bg-background p-3 rounded border border-input text-gray-300 whitespace-pre-wrap text-sm">
                                  {message.messageText}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">
                                  All Keywords:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {keywords.map((keyword, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">
                                  API Response:
                                </h4>
                                <div className="bg-background p-3 rounded border border-input overflow-x-auto">
                                  <pre className="text-xs text-gray-300">
                                    {JSON.stringify(apiResponse, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="text-sm text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} messages
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-gray-300 px-4">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
