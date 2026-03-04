"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";

interface VerificationData {
  risk_score: number;
  mismatches: Array<{
    field: string;
    values: Array<{ doc_id: number; doc_type: string; value: string }>;
    severity: string;
    message: string;
    similarity?: number;
  }>;
  verified_profile: Record<string, unknown> | null;
}

interface StepVerifyProps {
  onComplete: () => void;
}

export function StepVerify({ onComplete }: StepVerifyProps) {
  const [data, setData] = useState<VerificationData | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setRunning(true);
    setError("");
    try {
      const result = await api.runVerification();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setRunning(false);
    }
  };

  const riskScore = data?.risk_score ?? 0;
  const riskColor =
    riskScore <= 20 ? "text-green-400" : riskScore <= 50 ? "text-yellow-400" : "text-red-400";
  const riskBg =
    riskScore <= 20
      ? "bg-green-950/30 border-green-800/40"
      : riskScore <= 50
      ? "bg-yellow-950/30 border-yellow-800/40"
      : "bg-red-950/30 border-red-800/40";

  const severityVariant = (s: string) =>
    s === "high" ? "destructive" as const : s === "medium" ? "warning" as const : "outline" as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Verify Documents</h2>
          <p className="text-sm text-text-secondary mt-1">
            Cross-check all documents for consistency before generating DS-160
          </p>
        </div>
        {!data && (
          <Button onClick={handleVerify} loading={running}>
            <ShieldCheck size={16} />
            Verify Documents
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!data && !running && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="mx-auto mb-3 text-text-secondary" size={40} />
            <p className="text-text-secondary">Click "Verify Documents" to run consistency checks</p>
            <p className="text-sm text-text-secondary mt-1">
              We&apos;ll compare names, dates, passport numbers across all your documents
            </p>
          </CardContent>
        </Card>
      )}

      {running && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Running verification checks...</p>
            <p className="text-sm text-text-secondary mt-1">Comparing data across all documents</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Risk Score */}
          <Card className={riskBg}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Risk Score</p>
                  <p className={`text-5xl font-bold ${riskColor}`}>{riskScore}%</p>
                  <p className="text-sm text-text-secondary mt-2">
                    {riskScore <= 20
                      ? "Low risk — documents are consistent"
                      : riskScore <= 50
                      ? "Medium risk — some discrepancies found"
                      : "High risk — significant mismatches detected"}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    riskScore <= 20
                      ? "bg-green-900/50 border border-green-700/50"
                      : "bg-yellow-900/50 border border-yellow-700/50"
                  }`}
                >
                  {riskScore <= 20 ? (
                    <CheckCircle2 className="text-green-400" size={28} />
                  ) : (
                    <AlertTriangle className={riskColor} size={28} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mismatches */}
          {data.mismatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  Mismatches ({data.mismatches.length})
                </CardTitle>
                <CardDescription>Data inconsistencies found across documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.mismatches.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary capitalize">
                        {m.field.replace(/_/g, " ")}
                      </span>
                      <Badge variant={severityVariant(m.severity)}>{m.severity}</Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{m.message}</p>
                    <div className="space-y-1.5">
                      {m.values.map((v, vi) => (
                        <div key={vi} className="flex items-center gap-3 text-sm">
                          <Badge variant="secondary" className="min-w-[90px] justify-center text-xs">
                            {v.doc_type.replace("_", " ")}
                          </Badge>
                          <ArrowRight size={12} className="text-text-secondary" />
                          <span className="text-text-primary font-mono text-xs">{v.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Verified Profile */}
          {data.verified_profile && Object.keys(data.verified_profile).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User size={16} className="text-text-secondary" />
                  Verified Profile
                </CardTitle>
                <CardDescription>Consolidated data from all your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(data.verified_profile).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-text-secondary mb-0.5 capitalize">{key.replace(/_/g, " ")}</p>
                      <p className="text-sm text-text-primary font-medium">
                        {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue */}
          <div className="flex justify-end pt-2">
            <Button onClick={onComplete}>
              Continue to DS-160
              <ArrowRight size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
