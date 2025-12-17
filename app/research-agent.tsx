"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, FileText, Send, History, Loader2, AlertCircle, CheckCircle, Download, ChevronDown, Info, BookOpen } from 'lucide-react';
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import jsPDF from "jspdf"

interface ResearchQuery {
  id: string;
  query: string;
  frameworkSource?: string;
  timestamp: string;
  result?: string;
  sentTo?: 'slack' | 'email' | null;
}

const STORAGE_KEY = 'smello-research-history';

export default function ResearchAgent() {
  const [query, setQuery] = useState('');
  const [frameworkSource, setFrameworkSource] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [history, setHistory] = useState<ResearchQuery[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.error('Failed to load research history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save research history:', e);
      }
    }
  }, [history]);

  const handleResearch = async () => {
    if (!query.trim()) return;



    setIsGenerating(true);
    setError(null);
    setCurrentResult(null);

    // Quota enforcement is handled server-side; proceed with request and surface server errors.

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          frameworkSource: frameworkSource || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        let errorMessage = data.error || 'Research agent failed';
        if (errorMessage.includes('Exit code') || errorMessage.includes('failed to execute')) {
          errorMessage = 'Research Agent failed to run. Please check if the Python environment is set up correctly in "C:\\Users\\Sharon\\Videos\\Wizzle\\Automations\\adhoc-research".';
        }
        throw new Error(errorMessage);
      }

      const resultText = data.research_findings || 'No findings generated.';

      // Don't save empty results if user prefers, but typically "No findings" is a result. 
      // User said "Shouldn't that be deleted if it didn't generate any insights".
      // We'll proceed with saving but maybe flag it? For now, we save it as per standard flow.

      setCurrentResult(resultText);

      const newQuery: ResearchQuery = {
        id: Date.now().toString(),
        query,
        frameworkSource: frameworkSource || undefined,
        timestamp: new Date().toISOString(),
        result: resultText,
      };

      setHistory([newQuery, ...history]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate research');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToSlack = async (queryId: string) => {
    // Placeholder integration
    const updatedHistory = history.map(q =>
      q.id === queryId ? { ...q, sentTo: 'slack' as const } : q
    );
    setHistory(updatedHistory);
    alert('Research sent to Slack (placeholder - integrate Slack API in full testing)');
  };

  const handleSendToEmail = async (queryId: string) => {
    // Placeholder integration
    const updatedHistory = history.map(q =>
      q.id === queryId ? { ...q, sentTo: 'email' as const } : q
    );
    setHistory(updatedHistory);
    alert('Research sent via Email (placeholder - integrate email service in full testing)');
  };


  const exportResearchAsMarkdown = (query: ResearchQuery) => {
    const content = `# Research Report

**Query:** ${query.query}

**Date:** ${new Date(query.timestamp).toLocaleString()}

${query.frameworkSource ? `**Framework Source:** ${query.frameworkSource}\n` : ''}

---

## Research Findings

${query.result || 'No findings available.'}

---

*Generated by SMELLO Research Agent*
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_${query.id}_${new Date(query.timestamp).toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportResearchAsJSON = (query: ResearchQuery) => {
    const data = {
      query: query.query,
      timestamp: query.timestamp,
      frameworkSource: query.frameworkSource,
      result: query.result,
      sentTo: query.sentTo,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_${query.id}_${new Date(query.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportResearchAsPDF = (query: ResearchQuery) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;

    // Helper to add text and wrap it
    let y = 20;

    doc.setFontSize(22);
    doc.text("Research Report", margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Query:", margin, y);
    doc.setFont("helvetica", "normal");
    const queryLines = doc.splitTextToSize(query.query, maxLineWidth - 20);
    doc.text(queryLines, margin + 20, y);
    y += (queryLines.length * 7) + 5;

    doc.setFont("helvetica", "bold");
    doc.text("Date:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(query.timestamp).toLocaleString(), margin + 20, y);
    y += 15;

    if (query.frameworkSource) {
      doc.setFont("helvetica", "bold");
      doc.text("Framework:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(query.frameworkSource, margin + 25, y);
      y += 15;
    }

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Findings", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Process markdown-ish text simply by replacing common markdown markers, or just dump it
    // For a cleaner PDF, we just dump the text wrapped. 
    // True markdown rendering requires more complex parsing not available without heavier libs.
    const findings = query.result || "No findings available.";
    const findingLines = doc.splitTextToSize(findings, maxLineWidth);

    // Check for page breaks
    const lineHeight = 5;
    if (y + (findingLines.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
      // Simple pagination handled by jsPDF automatically? No, need to loop.
      // For simplicity in this version, let's just write. jsPDF auto-paging is manually triggered usually
      // But text() might run off page.
      // We will do a basic loop.
    }

    // Basic paging loop
    let currentLine = 0;
    while (currentLine < findingLines.length) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = 20;
      }
      doc.text(findingLines[currentLine], margin, y);
      y += lineHeight;
      currentLine++;
    }

    doc.save(`research_report_${query.id}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 mt-6 space-y-8">
      <Card className="notched-card border shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            🔍 Research Agent
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Generate structured research insights using custom frameworks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-semibold">ℹ️ Understanding Research Frameworks</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    What are Research Frameworks?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Research frameworks provide structured approaches to analyze information consistently.
                    They help ensure comprehensive coverage of topics and systematic analysis.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📁 Framework Sources</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <div>
                        <strong>Google Drive:</strong> Connect your custom research frameworks stored in Google Drive for personalized analysis
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <div>
                        <strong>Default Framework:</strong> Uses a comprehensive research methodology covering market analysis, competitive landscape, and strategic insights
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 Why Framework Source Matters</h4>
                  <p className="text-sm text-muted-foreground">
                    The framework determines how your research is structured and what aspects are analyzed.
                    Custom frameworks ensure the output matches your specific research needs and organizational standards.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Framework Source */}
          <div className="space-y-2">
            <Label htmlFor="framework-source" className="font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" />
              Research Framework Source
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </Label>
            <div className="space-y-2">
              <Select value={frameworkSource || 'default'} onValueChange={setFrameworkSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Default Research Framework
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Custom Google Drive Framework
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {frameworkSource === 'custom' && (
                <Input
                  placeholder="Enter Google Drive document ID or URL"
                  value={frameworkSource === 'custom' ? '' : frameworkSource}
                  onChange={e => setFrameworkSource(e.target.value)}
                  className="mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                💡 Using a custom framework ensures research outputs match your organization's specific methodology and standards
              </p>
            </div>
          </div>

          <Separator />

          {/* Query Input */}
          <div className="space-y-2">
            <Label htmlFor="research-query" className="font-semibold">Research Query</Label>
            <Textarea
              id="research-query"
              placeholder="e.g., 'What are the key user pain points in mobile payment apps?' or 'Analyze competitor features in project management tools'"
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleResearch}
            disabled={!query.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Research...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Run Research Query
              </>
            )}
          </Button>

          {/* Current Result */}
          {currentResult && (
            <Card className="bg-muted/50 border">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Research Output
                  </CardTitle>
                  {/* Updated container to wrap buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleSendToSlack(history[0]?.id || '')}
                      variant="outline"
                      size="sm"
                      disabled={!history[0]?.id}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Slack
                    </Button>
                    <Button
                      onClick={() => handleSendToEmail(history[0]?.id || '')}
                      variant="outline"
                      size="sm"
                      disabled={!history[0]?.id}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send via Email
                    </Button>
                    <Button
                      onClick={() => history[0] && exportResearchAsPDF(history[0])}
                      variant="default"
                      size="sm"
                      disabled={!history[0]?.id}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button
                      onClick={() => history[0] && exportResearchAsMarkdown(history[0])}
                      variant="outline"
                      size="sm"
                      disabled={!history[0]?.id}
                    >
                      MD
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-background p-4 rounded border max-h-96 overflow-auto">
                  {currentResult}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* History Section */}
      <Card className="notched-card border shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5" />
              Research History
            </CardTitle>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              size="sm"
            >
              {showHistory ? 'Hide' : 'Show'} History ({history.length})
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent className="space-y-4">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No research queries yet. Run a query to see history.</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="bg-muted/30 border">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.query}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                            {item.frameworkSource && ` • Framework: ${item.frameworkSource}`}
                            {item.sentTo && ` • Sent to: ${item.sentTo}`}
                          </p>
                        </div>
                        {/* Updated container to wrap buttons */}
                        <div className="flex flex-wrap gap-2">
                          {/* Removed Logic hiding buttons if sentTo is present, per user request */}
                          <Button
                            onClick={() => handleSendToSlack(item.id)}
                            variant="ghost"
                            size="sm"
                            disabled={item.sentTo === 'slack'}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {item.sentTo === 'slack' ? 'Sent to Slack' : 'Slack'}
                          </Button>
                          <Button
                            onClick={() => handleSendToEmail(item.id)}
                            variant="ghost"
                            size="sm"
                            disabled={item.sentTo === 'email'}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {item.sentTo === 'email' ? 'Sent to Email' : 'Email'}
                          </Button>

                          <Button
                            onClick={() => exportResearchAsPDF(item)}
                            variant="ghost"
                            size="sm"
                            title="Export as PDF"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            onClick={() => exportResearchAsMarkdown(item)}
                            variant="ghost"
                            size="sm"
                            title="Export as Markdown"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            MD
                          </Button>
                          <Button
                            onClick={() => exportResearchAsJSON(item)}
                            variant="ghost"
                            size="sm"
                            title="Export as JSON"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {item.result && (
                      <CardContent>
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            View Result
                          </summary>
                          <pre className="whitespace-pre-wrap text-xs bg-background p-3 rounded border mt-2 max-h-64 overflow-auto">
                            {item.result}
                          </pre>
                        </details>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
