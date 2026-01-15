"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Folder,
  Key,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Satellite,
  FileText,
  Plus,
  Wrench,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Download,
} from "lucide-react";

interface Api {
  id: string;
  name: string;
  apiKey: string | null;
  endpointUrl: string;
  httpMethod: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  status: number;
  statusText: string;
  ok: boolean;
  available: boolean;
  timestamp: string;
  error?: string;
}

export default function NewsSourcesPage() {
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    endpointUrl: "",
    httpMethod: "GET",
    description: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const response = await fetch("/api/apis");
      const data = await response.json();
      setApis(data);
    } catch (error) {
      console.error("Error fetching APIs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/apis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: "",
          apiKey: "",
          endpointUrl: "",
          httpMethod: "GET",
          description: "",
        });
        fetchApis();
      }
    } catch (error) {
      console.error("Error creating API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (apiId: string) => {
    setTesting({ ...testing, [apiId]: true });
    try {
      const response = await fetch("/api/apis/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiId }),
      });

      const result = await response.json();
      setTestResults({ ...testResults, [apiId]: result });
    } catch (error) {
      console.error("Error testing API:", error);
      setTestResults({
        ...testResults,
        [apiId]: {
          status: 0,
          statusText: "Test failed",
          ok: false,
          available: false,
          timestamp: new Date().toISOString(),
          error: "Failed to test API",
        },
      });
    } finally {
      setTesting({ ...testing, [apiId]: false });
    }
  };

  const handleDelete = async (apiId: string) => {
    if (!confirm("Are you sure you want to delete this API?")) return;

    try {
      const response = await fetch(`/api/apis/${apiId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApis();
        const newTestResults = { ...testResults };
        delete newTestResults[apiId];
        setTestResults(newTestResults);
      }
    } catch (error) {
      console.error("Error deleting API:", error);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-red-400";
      case "POST":
        return "text-blue-400";
      case "PUT":
        return "text-yellow-400";
      case "DELETE":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getStats = () => {
    const getApis = apis.filter((api) => api.httpMethod.toUpperCase() === "GET").length;
    const postApis = apis.filter((api) => api.httpMethod.toUpperCase() === "POST").length;
    const withApiKey = apis.filter((api) => api.apiKey).length;
    const withDescription = apis.filter((api) => api.description).length;

    return { getApis, postApis, withApiKey, withDescription };
  };

  const stats = getStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Add New API
        </h1>
      </div>

      {/* Add New API Form */}
      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Folder className="w-4 h-4" />
              API Name
              <span className="text-gray-500 text-xs">?</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., CoinGecko, Alpha Vantage"
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* API Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Key className="w-4 h-4" />
              API Key (Optional)
              <span className="text-gray-500 text-xs">?</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter API key if required"
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <LinkIcon className="w-4 h-4" />
              Endpoint URL
              <span className="text-gray-500 text-xs">?</span>
            </label>
            <input
              type="url"
              value={formData.endpointUrl}
              onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
              placeholder="https://api.example.com/v1/data"
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* HTTP Method */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Satellite className="w-4 h-4" />
              HTTP Method
              <span className="text-gray-500 text-xs">?</span>
            </label>
            <select
              value={formData.httpMethod}
              onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4" />
              Description (Optional)
              <span className="text-gray-500 text-xs">?</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this API provides..."
              rows={3}
              className="w-full px-4 py-2 bg-background border border-input rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add API
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading || !formData.endpointUrl}
              onClick={async () => {
                setLoading(true);
                try {
                  // Test first
                  const testResponse = await fetch("/api/apis/test", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      endpointUrl: formData.endpointUrl,
                      httpMethod: formData.httpMethod,
                      apiKey: formData.apiKey,
                    }),
                  });

                  const testResult = await testResponse.json();

                  // If test passes, add the API
                  if (testResult.available) {
                    const createResponse = await fetch("/api/apis", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(formData),
                    });

                    if (createResponse.ok) {
                      setFormData({
                        name: "",
                        apiKey: "",
                        endpointUrl: "",
                        httpMethod: "GET",
                        description: "",
                      });
                      fetchApis();
                    }
                  } else {
                    alert(`Test failed: ${testResult.statusText || testResult.error}`);
                  }
                } catch (error: any) {
                  console.error("Test failed:", error);
                  alert(`Test failed: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Test & Add
            </Button>
          </div>
        </form>
      </div>

      {/* Your Custom APIs */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Your Custom APIs
        </h2>
        <p className="text-gray-400 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Total Custom APIs: {apis.length}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="text-gray-400 text-sm mb-1">GET APIs</div>
          <div className="text-3xl font-bold text-white">{stats.getApis}</div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="text-gray-400 text-sm mb-1">POST APIs</div>
          <div className="text-3xl font-bold text-white">{stats.postApis}</div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="text-gray-400 text-sm mb-1">With API Key</div>
          <div className="text-3xl font-bold text-white">{stats.withApiKey}</div>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="text-gray-400 text-sm mb-1">With Description</div>
          <div className="text-3xl font-bold text-white">{stats.withDescription}</div>
        </div>
      </div>

      {/* API List */}
      <div className="space-y-4">
        {apis.length === 0 ? (
          <div className="bg-card rounded-lg p-8 border border-border text-center">
            <p className="text-gray-400">No APIs added yet. Add your first API above.</p>
          </div>
        ) : (
          apis.map((api) => {
            const testResult = testResults[api.id];
            const isTesting = testing[api.id];

            return (
              <div
                key={api.id}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      {api.name}
                    </h3>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        API Information
                      </div>
                      <div className="text-sm text-gray-300">
                        <div className="mb-2">
                          <span className="text-gray-400">Endpoint URL: </span>
                          <span className="text-white break-all">{api.endpointUrl}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-400">HTTP Method: </span>
                          <span className={getMethodColor(api.httpMethod)}>
                            {api.httpMethod}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-400">Authentication: </span>
                          <span className="text-white">
                            {api.apiKey ? "API Key Required" : "No API Key"}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-400">Added: </span>
                          <span className="text-white">
                            {new Date(api.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {api.description && (
                          <div className="mb-2">
                            <span className="text-gray-400">Description: </span>
                            <span className="text-white">{api.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {testResult && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Last Test Result:
                        </div>
                        <div
                          className={`p-3 rounded-md flex items-center gap-2 ${
                            testResult.available
                              ? "bg-primary/20 border border-primary/30"
                              : "bg-destructive/20 border border-destructive/30"
                          }`}
                        >
                          {testResult.available ? (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span className="text-white font-medium">
                            {testResult.available
                              ? `Available (HTTP ${testResult.status})`
                              : `Failed (${testResult.statusText})`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tested: {new Date(testResult.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTest(api.id)}
                      disabled={isTesting}
                      className="flex-1"
                    >
                      {isTesting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
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
                      variant="outline"
                      onClick={() => handleDelete(api.id)}
                      className="px-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
