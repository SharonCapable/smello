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
import { ChevronDown, ChevronUp, Plus, Trash2, Info, ArrowRight } from 'lucide-react';
import { FeatureIntegrationModal } from '@/components/feature-integration-modal';

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

export default function FeaturePrioritization() {
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: '', description: '', source: '', scores: {}, notes: '' },
  ]);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, []);

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

  // Sort by Priority Score (descending)
  const sortedFeatures = [...features].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    const numA = typeof scoreA === 'number' ? scoreA : -Infinity;
    const numB = typeof scoreB === 'number' ? scoreB : -Infinity;
    return numB - numA;
  });

  return (
    <div className="max-w-5xl mx-auto p-8 mt-6 space-y-8">
      <Card className="notched-card border shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            📋 Feature Prioritization
            <Badge variant="outline" className="ml-2">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Score and prioritize features using a data-driven approach based on value vs effort analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-semibold">ℹ️ Understanding the Prioritization Framework</span>
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
                <div>
                  <h4 className="font-semibold mb-2">🎯 Value Metrics (What you gain)</h4>
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
                  <h4 className="font-semibold mb-2">⚡ Effort Metrics (What it costs)</h4>
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
                <div>
                  <h4 className="font-semibold mb-2">🚀 Action Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-red-600">❌ Drop:</span> Low value, high effort</div>
                    <div><span className="text-orange-600">🔍 Investigate:</span> Needs more research</div>
                    <div><span className="text-yellow-600">🤷‍♂️ Backlog:</span> Consider later</div>
                    <div><span className="text-blue-600">🗓️ Plan Soon:</span> Good candidate</div>
                    <div><span className="text-green-600">🚀 Build Now:</span> High priority</div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="overflow-x-auto">
            <div className="max-w-full">
              <table className="min-w-full border text-xs relative z-10">
              <thead className="bg-muted font-semibold sticky top-0">
                <tr>
                  <th className="py-2 px-2 border text-center">Index</th>
                  <th className="py-2 px-2 border min-w-[120px]">Source of Feature</th>
                  <th className="py-2 px-2 border min-w-[180px]">Feature</th>
                  <th className="py-2 px-2 border text-center min-w-[100px]">Action</th>
                  <th className="py-2 px-2 border text-center min-w-[80px]">Priority Score</th>
                  <th className="py-2 px-2 border text-center min-w-[80px]">Total Value Score</th>
                  <th className="py-2 px-2 border text-center min-w-[80px]">Total Effort Score</th>
                  <th colSpan={VALUE_METRICS.length} className="py-2 px-2 border text-center bg-blue-50 dark:bg-blue-950/20">Value Metrics</th>
                  <th colSpan={EFFORT_METRICS.length} className="py-2 px-2 border text-center bg-orange-50 dark:bg-orange-950/20">Effort Metrics</th>
                  <th className="py-2 px-2 border"></th>
                </tr>
                <tr>
                  <th colSpan={7}></th>
                  {VALUE_METRICS.map(m => (
                    <th key={m.key} className="py-1 px-1 border text-center bg-blue-50 dark:bg-blue-950/20 text-[10px]">{m.label}</th>
                  ))}
                  {EFFORT_METRICS.map(m => (
                    <th key={m.key} className="py-1 px-1 border text-center bg-orange-50 dark:bg-orange-950/20 text-[10px]">{m.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedFeatures.map((feature, index) => {
                  const totalValue = calculateTotalValueScore(feature);
                  const totalEffort = calculateTotalEffortScore(feature);
                  const priorityScore = calculatePriorityScore(feature);
                  const action = getAction(priorityScore);
                  
                  return (
                    <tr key={feature.id} className="hover:bg-accent/5 transition">
                      <td className="border px-2 py-2 text-center font-mono text-xs">{index + 1}</td>
                      <td className="border px-2 py-2">
                        <Input
                          placeholder="Sheet, interview..."
                          value={feature.source}
                          onChange={e => updateFeature(feature.id, { source: e.target.value })}
                          className="w-full text-xs h-8"
                        />
                      </td>
                      <td className="border px-2 py-2">
                        <Input
                          placeholder="Feature title"
                          value={feature.name}
                          onChange={e => updateFeature(feature.id, { name: e.target.value })}
                          className="w-full text-xs mb-1"
                        />
                        <Input
                          placeholder="Description"
                          value={feature.description}
                          onChange={e => updateFeature(feature.id, { description: e.target.value })}
                          className="w-full text-[10px] bg-muted h-6"
                        />
                      </td>
                      <td className="border px-2 py-2 text-center font-semibold">
                        <span className="text-xs">{action}</span>
                      </td>
                      <td className="border px-2 py-2 text-center font-bold">
                        {typeof priorityScore === 'number' ? priorityScore.toFixed(2) : <span className="text-xs text-muted-foreground">{priorityScore}</span>}
                      </td>
                      <td className="border px-2 py-2 text-center font-semibold text-blue-600 dark:text-blue-400">
                        {totalValue > 0 ? totalValue.toFixed(2) : '-'}
                      </td>
                      <td className="border px-2 py-2 text-center font-semibold text-orange-600 dark:text-orange-400">
                        {totalEffort > 0 ? totalEffort.toFixed(2) : '-'}
                      </td>
                      {VALUE_METRICS.map(m => (
                        <td key={m.key} className="border px-1 py-1 bg-blue-50/50 dark:bg-blue-950/10">
                          <Input
                            type="number"
                            min={1} max={5}
                            step={1}
                            value={feature.scores[m.key] || ''}
                            onChange={e => updateFeature(feature.id, { scores: { ...feature.scores, [m.key]: e.target.value } })}
                            className="w-14 text-center text-xs h-7"
                            placeholder="1-5"
                          />
                        </td>
                      ))}
                      {EFFORT_METRICS.map(m => (
                        <td key={m.key} className="border px-1 py-1 bg-orange-50/50 dark:bg-orange-950/10">
                          <Input
                            type="number"
                            min={1} max={5}
                            step={1}
                            value={feature.scores[m.key] || ''}
                            onChange={e => updateFeature(feature.id, { scores: { ...feature.scores, [m.key]: e.target.value } })}
                            className="w-14 text-center text-xs h-7"
                            placeholder="1-5"
                          />
                        </td>
                      ))}
                      <td className="border px-2 py-2">
                        <div className="flex gap-1">
                          <Button 
                            onClick={() => removeFeature(feature.id)} 
                            variant="destructive" 
                            size="sm" 
                            type="button" 
                            className="h-7 text-xs"
                          >
                            Remove
                          </Button>
                          {feature.name && typeof priorityScore === 'number' && priorityScore >= 3 && (
                            <Button 
                              onClick={() => {
                                setSelectedFeature(feature);
                                setIntegrationModalOpen(true);
                              }}
                              variant="default" 
                              size="sm" 
                              type="button" 
                              className="h-7 text-xs bg-green-600 hover:bg-green-700"
                              title="Add to project as epic/user story"
                            >
                              <ArrowRight className="w-3 h-3" />
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
          <div className="flex mt-4 gap-2">
            <Button onClick={addFeature} variant="outline">+ Add Feature</Button>
          </div>
        </CardContent>
      </Card>
      
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
