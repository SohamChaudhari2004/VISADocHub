"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  Play,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCw,
} from "lucide-react";

interface UploadedDoc {
  id: number;
  doc_type: string;
  filename: string;
}

interface ExtractedFields {
  [key: string]: unknown;
}

interface DocState {
  id: number;
  doc_type: string;
  filename: string;
  status: "uploaded" | "processing" | "extracted" | "failed";
  fields: ExtractedFields | null;
  error?: string;
  expanded: boolean;
}

interface StepProcessProps {
  uploadedDocs: UploadedDoc[];
  onComplete: () => void;
}

export function StepProcess({ uploadedDocs, onComplete }: StepProcessProps) {
  const [docs, setDocs] = useState<DocState[]>([]);
  const [processingAll, setProcessingAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // On mount: always fetch real statuses from the API
  const refreshStatuses = useCallback(async () => {
    try {
      const allDocs = await api.listDocuments();
      // Build doc list from API data, keeping only docs in our uploadedDocs list
      const uploadIds = new Set(uploadedDocs.map((d) => d.id));
      const freshDocs: DocState[] = allDocs
        .filter((d: { id: number }) => uploadIds.has(d.id))
        .map((d: { id: number; doc_type: string; filename: string; status: string }) => ({
          id: d.id,
          doc_type: d.doc_type,
          filename: d.filename,
          status: d.status as DocState["status"],
          fields: null,
          expanded: false,
        }));

      // If API returned no docs for our IDs, fall back to uploadedDocs
      if (freshDocs.length === 0) {
        setDocs(
          uploadedDocs.map((d) => ({
            ...d,
            status: "uploaded" as const,
            fields: null,
            expanded: false,
          }))
        );
      } else {
        setDocs(freshDocs);
      }
    } catch {
      // Fallback: use uploadedDocs with default status
      setDocs(
        uploadedDocs.map((d) => ({
          ...d,
          status: "uploaded" as const,
          fields: null,
          expanded: false,
        }))
      );
    } finally {
      setLoaded(true);
    }
  }, [uploadedDocs]);

  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  const allExtracted = docs.length > 0 && docs.every((d) => d.status === "extracted");
  const hasFailures = docs.some((d) => d.status === "failed");
  const hasPending = docs.some((d) => d.status === "uploaded" || d.status === "failed");

  const handleProcessAll = async () => {
    setProcessingAll(true);

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      if (doc.status === "extracted") continue;

      setDocs((prev) =>
        prev.map((d, idx) =>
          idx === i ? { ...d, status: "processing" as const, error: undefined } : d
        )
      );

      try {
        const result = await api.processDocument(doc.id);
        setDocs((prev) =>
          prev.map((d, idx) =>
            idx === i
              ? { ...d, status: "extracted" as const, fields: result.fields, expanded: true }
              : d
          )
        );
      } catch (err: unknown) {
        setDocs((prev) =>
          prev.map((d, idx) =>
            idx === i
              ? {
                  ...d,
                  status: "failed" as const,
                  error: err instanceof Error ? err.message : "Processing failed",
                }
              : d
          )
        );
      }
    }

    setProcessingAll(false);
  };

  const handleRetryOne = async (idx: number) => {
    const doc = docs[idx];
    setDocs((prev) =>
      prev.map((d, i) =>
        i === idx ? { ...d, status: "processing" as const, error: undefined } : d
      )
    );

    try {
      const result = await api.processDocument(doc.id);
      setDocs((prev) =>
        prev.map((d, i) =>
          i === idx
            ? { ...d, status: "extracted" as const, fields: result.fields, expanded: true }
            : d
        )
      );
    } catch (err: unknown) {
      setDocs((prev) =>
        prev.map((d, i) =>
          i === idx
            ? {
                ...d,
                status: "failed" as const,
                error: err instanceof Error ? err.message : "Processing failed",
              }
            : d
        )
      );
    }
  };

  const toggleExpand = async (idx: number) => {
    const doc = docs[idx];

    // If expanding and no fields loaded, fetch them
    if (!doc.expanded && !doc.fields && doc.status === "extracted") {
      try {
        const data = await api.getExtractedFields(doc.id);
        setDocs((prev) =>
          prev.map((d, i) =>
            i === idx ? { ...d, fields: data.fields, expanded: true } : d
          )
        );
        return;
      } catch {
        // ignore
      }
    }

    setDocs((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, expanded: !d.expanded } : d))
    );
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Loader2 size={16} className="text-yellow-400 animate-spin" />;
      case "extracted":
        return <CheckCircle2 size={16} className="text-green-400" />;
      case "failed":
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <FileText size={16} className="text-text-secondary" />;
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-text-secondary" size={24} />
        <span className="ml-3 text-text-secondary">Loading document statuses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Process Documents</h2>
          <p className="text-sm text-text-secondary mt-1">
            Run OCR and extract structured data from your uploaded documents
          </p>
        </div>
        <div className="flex gap-2">
          {hasPending && (
            <Button onClick={handleProcessAll} loading={processingAll}>
              <Play size={16} />
              {hasFailures ? "Retry Failed" : "Process All"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {docs.map((doc, idx) => (
          <Card
            key={doc.id}
            className={`overflow-hidden transition-all duration-200 ${
              doc.status === "extracted" ? "border-green-900/30" : ""
            }`}
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => doc.status === "extracted" && toggleExpand(idx)}
            >
              <div className="flex items-center gap-4">
                {statusIcon(doc.status)}
                <div>
                  <p className="text-sm font-medium text-text-primary">{doc.filename}</p>
                  <p className="text-xs text-text-secondary">{doc.doc_type.replace("_", " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    doc.status === "extracted"
                      ? "success"
                      : doc.status === "processing"
                      ? "warning"
                      : doc.status === "failed"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {doc.status}
                </Badge>
                {doc.status === "failed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetryOne(idx);
                    }}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <RotateCw size={14} />
                    Retry
                  </Button>
                )}
                {doc.status === "extracted" &&
                  (doc.expanded ? (
                    <ChevronUp size={14} className="text-text-secondary" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary" />
                  ))}
              </div>
            </div>

            {/* Expanded extracted fields */}
            {doc.expanded && doc.fields && (
              <div className="border-t border-border bg-muted/20 p-4 animate-fade-in">
                <p className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wider">
                  Extracted Fields
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(doc.fields).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <p className="text-xs text-text-secondary mb-0.5">{key.replace(/_/g, " ")}</p>
                      <p className="text-sm text-text-primary font-mono">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value ?? "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.error && (
              <div className="border-t border-red-900/30 bg-red-950/10 px-4 py-3">
                <p className="text-xs text-red-400">{doc.error}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Always show the continue button when all docs are extracted */}
      {allExtracted && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <CheckCircle2 size={16} />
            All documents processed successfully
          </div>
          <Button onClick={onComplete}>
            Continue to Verification
            <ArrowRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
