"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { Download, Save, Loader2, CheckCircle2, AlertTriangle, FileText, Zap } from "lucide-react";
import { FormSection } from "@/components/ui/form-section";

// Section structure mirroring the official DS-160 PDF
const SECTIONS = [
  { id: "personal_details", title: "Personal Information", icon: "user" },
  { id: "passport_details", title: "Passport Information", icon: "passport" },
  { id: "travel_information", title: "Travel Information", icon: "plane" },
  { id: "previous_us_travel", title: "Previous U.S. Travel", icon: "history" },
  { id: "us_contact", title: "U.S. Point of Contact", icon: "map-pin" },
  { id: "family_details", title: "Family Information", icon: "home" },
  { id: "work_education", title: "Work / Education / Training", icon: "briefcase" },
  { id: "security_questions", title: "Security and Background", icon: "shield" },
  { id: "additional", title: "Additional Information", icon: "file-text" },
];

interface StepDS160Props {
  onComplete?: (formData: Record<string, any>) => void;
}

export function StepDS160({ onComplete }: StepDS160Props) {
  const [formId, setFormId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Fetch or generate DS-160 data on mount
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Try preview first (gets existing or generates new)
        const res = await api.previewDS160();
        if (res.form) {
          setFormData(res.form);
          setFormId(res.id);
          setGenerated(res.generated);
        } else {
          // If no form returned, try explicit generate
          const genRes = await api.generateDS160();
          setFormData(genRes.form);
          setFormId(genRes.id);
          setGenerated(true);
        }
      } catch (err) {
        console.error("Failed to load DS-160:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleFieldChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!formId) return;
    setSaving(true);
    try {
      await api.saveDS160(formId, formData);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutofill = async () => {
    try {
      const resp = await fetch("/autofill_answers.json");
      if (resp.ok) {
        const data = await resp.json();
        setFormData(data);
      } else {
        console.error("Failed to fetch autofill answers");
      }
    } catch (err) {
      console.error("Error loading autofill answers:", err);
    }
  };

  const calculateCompleteness = () => {
    // Simple heuristic: define "completeness" based on filled fields vs total fields
    let total = 0;
    let filled = 0;
    Object.values(formData).forEach((section: any) => {
      if (typeof section === "object") {
        Object.values(section).forEach((val) => {
          total++;
          if (val && val !== "" && val !== null) filled++;
        });
      }
    });
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-text-secondary mb-4" size={32} />
        <p className="text-text-secondary">Genering your DS-160 application...</p>
        <p className="text-xs text-text-secondary mt-2">Mapping extracted data to official form fields</p>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="sticky top-24">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Completion Status</p>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-bold text-white">{completeness}%</span>
                {completeness >= 90 ? (
                  <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                  <AlertTriangle className="text-yellow-500" size={20} />
                )}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleSave}
                disabled={saving || !formId}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Progress
              </Button>
              <Button 
                className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleAutofill}
              >
                <Zap size={16} />
                Autofill Test Data
              </Button>
              <Button 
                className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => api.exportDS160()}
                disabled={!formId}
              >
                <Download size={16} />
                Export JSON
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <Button 
                className="w-full justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={() => onComplete?.(formData)}
                disabled={!formId && Object.keys(formData).length === 0}
              >
                Generate Final PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Links (Could be implemented for scrolling) */}
        <div className="hidden lg:block space-y-1">
          {SECTIONS.map((sec) => (
            <div 
              key={sec.id}
              className="text-sm px-3 py-2 text-text-secondary hover:text-white cursor-pointer rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
              onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              {sec.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="lg:col-span-3 space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Review & Edit Application</h2>
          <span className="text-xs text-text-secondary bg-muted px-2 py-1 rounded">Form Version: 2024.01</span>
        </div>

        {SECTIONS.map((section) => {
          const sectionData = formData[section.id] || {};
          const fieldCount = Object.keys(sectionData).length;

          const isBooleanOrYesNo = (k: string, v: any) => {
            if (typeof v === "boolean") return true;
            if (typeof v === "string") {
              const strVal = v.toLowerCase();
              if (["yes", "no", "true", "false"].includes(strVal)) return true;
            }
            const keyLower = k.toLowerCase();
            return ["has_", "is_", "are_", "do_", "did_", "have_"].some(prefix => keyLower.startsWith(prefix));
          };

          return (
            <FormSection
              key={section.id}
              id={section.id}
              title={section.title}
              description={`Please review all fields in the ${section.title} section.`}
              badge={`${fieldCount} Fields`}
              defaultOpen={section.id === "personal_details"}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(sectionData).map(([key, value]) => {
                  const isYesNo = isBooleanOrYesNo(key, value);
                  let defaultVal = value as string;
                  if (isYesNo) {
                    if (typeof value === "boolean") defaultVal = value ? "Yes" : "No";
                    else if (typeof value === "string") {
                      const lower = value.toLowerCase();
                      if (lower === "true" || lower === "yes") defaultVal = "Yes";
                      else if (lower === "false" || lower === "no") defaultVal = "No";
                      else defaultVal = "No";
                    }
                  }

                  return (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs text-text-secondary uppercase tracking-wide">
                        {key.replace(/_/g, " ")}
                      </Label>
                      {isYesNo ? (
                        <Select 
                          defaultValue={defaultVal}
                          onValueChange={(v) => handleFieldChange(section.id, key, v)}
                        >
                          <SelectTrigger className="bg-background/50 border-border">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          defaultValue={value as string}
                          onChange={(e) => handleFieldChange(section.id, key, e.target.value)}
                          className="bg-background/50 border-border focus:border-indigo-500 transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
                {fieldCount === 0 && (
                  <div className="col-span-2 py-8 text-center text-text-secondary italic bg-background/30 rounded-lg border border-border border-dashed">
                    No data available for this section.
                  </div>
                )}
              </div>
            </FormSection>
          );
        })}
      </div>
    </div>
  );
}
