"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Plus, Trash2, Info, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { FeatureIntegrationModal } from '@/components/feature-integration-modal';
import type { StoredProject } from '@/lib/storage';
import { saveFeaturePrioritizationToProject } from '@/lib/project-artifacts-manager';

// Google Sheet Formula Implementation
const VALUE_METRICS = [
  {
    key: 'userValue',
    label: 'User Value',
    description: 'How much value does this feature provide to end users? (1-5 scale)'
  },
  {
    key: 'strategicFit',
    label: 'Strategic Fit',
    description: 'How well does this align with our business strategy and goals? (1-5 scale)'
  },
  {
    key: 'customerDemand',
    label: 'Customer Demand',
    description: 'How much demand exists from customers for this feature? (1-5 scale)'
  },
  {
    key: 'timeToValue',
    label: 'Time to Value',
    description: 'How quickly will users see value after implementation? (1-5 scale, 5=fast)'
  },
  {
    key: 'competitorGap',
    label: 'Competitor Gap',
    description: 'How much does this give us an advantage over competitors? (1-5 scale)'
  },
  {
    key: 'userTypeImpact',
    label: 'User Type Impact',
    description: 'How many user types will this feature benefit? (1-5 scale)'
  },
];

const EFFORT_METRICS = [
  {
    key: 'devEffort',
    label: 'Dev Effort',
    description: 'How much development effort is required? (1-5 scale, 5=high effort)'
  },
  {
    key: 'techRisk',
    label: 'Tech Risk',
    description: 'What is the technical risk or complexity? (1-5 scale, 5=high risk)'
  },
  {
    key: 'crossFeatureDependency',
    label: 'Cross-Feature Dependency',
    description: 'How many other features does this depend on? (1-5 scale)'
  },
  {
    key: 'maintenanceCost',
    label: 'Maintenance Cost',
    description: 'What is the ongoing maintenance cost? (1-5 scale, 5=high cost)'
  },
];

// Calculate Total Value Score = AVERAGE of all value metrics
function calculateTotalValueScore(feature: Feature): number {
  const values = VALUE_METRICS.map(m => {
    const val = parseFloat(feature.scores[m.key] || '0');
    return isNaN(val) ? null : val;
  }).filter(v => v !== null) as number[];

  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Calculate Total Effort Score = AVERAGE of all effort metrics
function calculateTotalEffortScore(feature: Feature): number {
  const values = EFFORT_METRICS.map(m => {
    const val = parseFloat(feature.scores[m.key] || '0');
    return isNaN(val) ? null : val;
  }).filter(v => v !== null) as number[];

  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Calculate Priority Score = Total Value / Total Effort
function calculatePriorityScore(feature: Feature): number | string {
  const totalValue = calculateTotalValueScore(feature);
  const totalEffort = calculateTotalEffortScore(feature);

  if (totalValue === 0 || totalEffort === 0) return 'Fill in scores';
  if (!isFinite(totalValue) || !isFinite(totalEffort)) return 'Invalid scores';

  return totalValue / totalEffort;
}

// Determine Action based on Priority Score
function getAction(priorityScore: number | string): string {
  if (typeof priorityScore === 'string') return priorityScore;
  if (!isFinite(priorityScore)) return 'Fill in Priority Score';

  if (priorityScore < 1) return '❌ Drop';
  if (priorityScore < 2) return '🔍 Investigate';
  if (priorityScore < 3) return '🤷‍♂️ Backlog';
  if (priorityScore < 4) return '🗓️ Plan Soon';
  return '🚀 Build Now';
}

const FEATURE_PRIORITIZATION_STORAGE_KEY = 'smello-feature-prioritization';

// Define types for better type safety
interface FeatureScores {
  [key: string]: string | undefined;
}

interface Feature {
  id: number;
  name: string;
  description: string;
  source: string;
  scores: FeatureScores;
  notes: string;
}

interface FeaturePrioritizationProps {
  project?: StoredProject | null;
  onBack?: () => void;
}

export default function FeaturePrioritization({ project, onBack }: FeaturePrioritizationProps) {
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: '', description: '', source: '', scores: {}, notes: '' },
  ]);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from project or localStorage on mount
  useEffect(() => {
    if (project?.featurePrioritization && Array.isArray(project.featurePrioritization) && project.featurePrioritization.length > 0) {
      setFeatures(project.featurePrioritization);
    } else if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FEATURE_PRIORITIZATION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.features) && parsed.features.length > 0) {
            setFeatures(parsed.features);
          }
        }
      } catch (e) {
        console.error('Failed to load feature prioritization data:', e);
      }
    }
  }, [project]);

  // Save to localStorage whenever features changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FEATURE_PRIORITIZATION_STORAGE_KEY, JSON.stringify({
          features: features.filter(f => f.name.trim() || f.description.trim()), // Only save non-empty features
        }));
      } catch (e) {
        console.error('Failed to save feature prioritization data:', e);
      }
    }
  }, [features]);

  const addFeature = () => setFeatures([...features, { id: Date.now(), name: '', description: '', source: '', scores: {}, notes: '' }]);
  const updateFeature = (id: number, updates: Partial<Feature>) => setFeatures(features.map(f => f.id === id ? { ...f, ...updates } : f));
  const removeFeature = (id: number) => setFeatures(features.filter(f => f.id !== id));

  const handleSaveToProject = async () => {
    if (!project?.id) return
    setIsSaving(true)
    try {
      await saveFeaturePrioritizationToProject(project.id, features)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving prioritization:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Sort by Priority Score (descending)
  const sortedFeatures = [...features].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    const numA = typeof scoreA === 'number' ? scoreA : -Infinity;
    const numB = typeof scoreB === 'number' ? scoreB : -Infinity;
    return numB - numA;
  });

  return (
    <div className="w-full h-full p-0 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            📋 Feature Prioritization
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Score and prioritize features using a data-driven approach based on value vs effort analysis
          </p>
        </div>
        <div className="flex gap-2">
          {onBack && (
            <Button variant="ghost" className="gap-2" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {project && (
            <Button
              onClick={handleSaveToProject}
              disabled={features.length === 0 || isSaving}
              variant={saveSuccess ? "default" : "outline"}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Project"}
            </Button>
          )}
          <Button onClick={addFeature} variant="default">+ Add Feature</Button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto bg-card">
        <Collapsible className="mb-6 border rounded-lg p-4 bg-muted/10">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <span className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-accent" />
                Understanding the Prioritization Framework
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold mb-2">📊 How It Works</h4>
                <p className="text-sm text-muted-foreground">
                  This framework calculates a Priority Score by dividing the Total Value Score by the Total Effort Score.
                  Higher scores indicate features that deliver more value relative to the effort required.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">🎯 Value Metrics (What you gain)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    {VALUE_METRICS.map(metric => (
                      <li key={metric.key} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <div>
                          <strong>{metric.label}:</strong> {metric.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">⚡ Effort Metrics (What it costs)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    {EFFORT_METRICS.map(metric => (
                      <li key={metric.key} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <div>
                          <strong>{metric.label}:</strong> {metric.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="border rounded-xl overflow-hidden shadow-sm bg-background">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
            <table className="min-w-full border-collapse text-xs relative z-10">
              <thead className="bg-muted/80 backdrop-blur-sm font-semibold sticky top-0 z-20">
                <tr>
                  <th className="py-3 px-3 border-b border-r text-center sticky left-0 bg-muted z-30">Idx</th>
                  <th className="py-3 px-3 border-b border-r min-w-[150px]">Source</th>
                  <th className="py-3 px-3 border-b border-r min-w-[250px]">Feature Description</th>
                  <th className="py-3 px-3 border-b border-r text-center min-w-[120px]">Recommendation</th>
                  <th className="py-3 px-3 border-b border-r text-center min-w-[100px] bg-accent/5">Priority</th>
                  <th className="py-3 px-3 border-b border-r text-center min-w-[100px] text-blue-600">Total Value</th>
                  <th className="py-3 px-3 border-b border-r text-center min-w-[100px] text-orange-600">Total Effort</th>
                  <th colSpan={VALUE_METRICS.length} className="py-3 px-3 border-b border-r text-center bg-blue-50/50 dark:bg-blue-950/20">Value Metrics (1-5)</th>
                  <th colSpan={EFFORT_METRICS.length} className="py-3 px-3 border-b border-r text-center bg-orange-50/50 dark:bg-orange-950/20">Effort Metrics (1-5)</th>
                  <th className="py-2 px-2 border-b"></th>
                </tr>
                <tr>
                  <th colSpan={7} className="border-b border-r bg-muted/30"></th>
                  {VALUE_METRICS.map(m => (
                    <th key={m.key} className="py-2 px-1 border-b border-r text-center bg-blue-50/30 dark:bg-blue-950/10 text-[10px] whitespace-nowrap">{m.label}</th>
                  ))}
                  {EFFORT_METRICS.map(m => (
                    <th key={m.key} className="py-2 px-1 border-b border-r text-center bg-orange-50/30 dark:bg-orange-950/10 text-[10px] whitespace-nowrap">{m.label}</th>
                  ))}
                  <th className="border-b"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedFeatures.map((feature, index) => {
                  const totalValue = calculateTotalValueScore(feature);
                  const totalEffort = calculateTotalEffortScore(feature);
                  const priorityScore = calculatePriorityScore(feature);
                  const action = getAction(priorityScore);

                  return (
                    <tr key={feature.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="border-r px-3 py-3 text-center font-mono text-xs sticky left-0 bg-background group-hover:bg-accent/5 z-10">{index + 1}</td>
                      <td className="border-r px-3 py-3">
                        <Input
                          placeholder="e.g. Sales, User Feedback"
                          value={feature.source}
                          onChange={e => updateFeature(feature.id, { source: e.target.value })}
                          className="w-full text-xs h-8 bg-transparent border-transparent hover:border-input focus:bg-background"
                        />
                      </td>
                      <td className="border-r px-3 py-3">
                        <Input
                          placeholder="Feature title"
                          value={feature.name}
                          onChange={e => updateFeature(feature.id, { name: e.target.value })}
                          className="w-full text-xs font-semibold mb-1 bg-transparent border-transparent hover:border-input focus:bg-background h-8"
                        />
                        <Textarea
                          placeholder="Short description..."
                          value={feature.description}
                          onChange={e => updateFeature(feature.id, { description: e.target.value })}
                          className="w-full text-[10px] min-h-[40px] bg-muted/30 border-none resize-none px-2 py-1"
                        />
                      </td>
                      <td className="border-r px-3 py-3 text-center">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {action}
                        </Badge>
                      </td>
                      <td className="border-r px-3 py-3 text-center font-bold text-base bg-accent/5">
                        {typeof priorityScore === 'number' ? priorityScore.toFixed(2) : <span className="text-[10px] text-muted-foreground whitespace-nowrap">{priorityScore}</span>}
                      </td>
                      <td className="border-r px-3 py-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                        {totalValue > 0 ? totalValue.toFixed(2) : '-'}
                      </td>
                      <td className="border-r px-3 py-3 text-center font-semibold text-orange-600 dark:text-orange-400">
                        {totalEffort > 0 ? totalEffort.toFixed(2) : '-'}
                      </td>
                      {VALUE_METRICS.map(m => (
                        <td key={m.key} className="border-r px-2 py-3 bg-blue-50/20 dark:bg-blue-950/5">
                          <Input
                            type="number"
                            min={1} max={5}
                            value={feature.scores[m.key] || ''}
                            onChange={e => updateFeature(feature.id, { scores: { ...feature.scores, [m.key]: e.target.value } })}
                            className="w-12 text-center text-xs h-8 mx-auto"
                            placeholder="-"
                          />
                        </td>
                      ))}
                      {EFFORT_METRICS.map(m => (
                        <td key={m.key} className="border-r px-2 py-3 bg-orange-50/20 dark:bg-orange-950/5">
                          <Input
                            type="number"
                            min={1} max={5}
                            value={feature.scores[m.key] || ''}
                            onChange={e => updateFeature(feature.id, { scores: { ...feature.scores, [m.key]: e.target.value } })}
                            className="w-12 text-center text-xs h-8 mx-auto"
                            placeholder="-"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex gap-1 justify-end">
                          <Button
                            onClick={() => removeFeature(feature.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {feature.name && typeof priorityScore === 'number' && priorityScore >= 3 && (
                            <Button
                              onClick={() => {
                                setSelectedFeature(feature);
                                setIntegrationModalOpen(true);
                              }}
                              variant="default"
                              size="icon"
                              className="h-8 w-8 bg-green-600 hover:bg-green-700"
                              title="Promote to Epic"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FeatureIntegrationModal
        isOpen={integrationModalOpen}
        onClose={() => {
          setIntegrationModalOpen(false);
          setSelectedFeature(null);
        }}
        feature={selectedFeature ? {
          name: selectedFeature.name,
          description: selectedFeature.description,
          priorityScore: typeof calculatePriorityScore(selectedFeature) === 'number'
            ? calculatePriorityScore(selectedFeature) as number
            : 0,
          action: getAction(calculatePriorityScore(selectedFeature)),
          source: selectedFeature.source
        } : null}
      />
    </div>
  );
}
