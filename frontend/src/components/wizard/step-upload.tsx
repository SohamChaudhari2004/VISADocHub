"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, CheckCircle2, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StepUploadProps {
  onComplete: (docs: any[]) => void;
  visaType: string;
}

export function StepUpload({ onComplete, visaType }: StepUploadProps) {
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [activeType, setActiveType] = useState<string>("");
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadRequirements() {
      try {
        const reqs = await api.getVisaRequirements();
        if (reqs[visaType]) {
          const docs = reqs[visaType].documents.map((d: any) => ({
            id: d.type,
            label: d.label,
            required: d.required
          }));
          setDocTypes(docs);
          if (docs.length > 0) setActiveType(docs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDocs(false);
      }
    }
    loadRequirements();
  }, [visaType]);

  const currentType = docTypes.find((t) => t.id === activeType);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => ({
        ...prev,
        [activeType]: [...(prev[activeType] || []), ...newFiles],
      }));
    }
  };

  const removeFile = (type: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const allUploaded = [];
      const typesToUpload = Object.keys(files);
      const total = typesToUpload.length;

      for (let i = 0; i < total; i++) {
        const type = typesToUpload[i];
        const fileList = files[type];
        if (fileList.length === 0) continue;

        const uploaded = await api.uploadDocuments(fileList, type);
        allUploaded.push(...uploaded);
        setProgress(((i + 1) / total) * 100);
      }

      onComplete(allUploaded);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const hasRequiredDocs = docTypes.filter((t) => t.required).every(
    (t) => files[t.id] && files[t.id].length > 0
  );

  if (loadingDocs) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-secondary">
        <Loader2 className="animate-spin h-8 w-8 mb-4" />
        <p>Loading document requirements...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar - Doc Types */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary mb-2 px-2">Document Checklist</p>
        {docTypes.map((type) => {
          const count = files[type.id]?.length || 0;
          return (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                activeType === type.id
                  ? "bg-muted text-white font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-muted"
              )}
            >
              <span>{type.label}</span>
              {count > 0 && (
                <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  {count}
                </span>
              )}
              {count === 0 && type.required && (
                <span className="text-[10px] text-text-secondary bg-muted px-1.5 py-0.5 rounded border border-border">
                  Required
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Upload Area */}
      <div className="md:col-span-2 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            Upload {currentType?.label}
            {currentType?.required && <span className="text-red-500 text-sm">*</span>}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Supported formats: PDF, JPG, PNG. Max size: 10MB per file.
          </p>
        </div>

        {/* Dropzone */}
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-border hover:bg-muted/20 transition-all cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-muted transition-colors">
            <Upload className="text-text-secondary group-hover:text-white" size={20} />
          </div>
          <p className="text-text-secondary font-medium">Click to upload or drag and drop</p>
          <p className="text-sm text-text-secondary mt-1">
            Recommeded: Scanned PDF or high-quality image
          </p>
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        {/* File List */}
        {files[activeType] && files[activeType].length > 0 && (
          <div className="space-y-2">
            {files[activeType].map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm text-text-primary truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(activeType, idx)}
                  className="text-text-secondary hover:text-red-400 p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-950/20 p-3 rounded-lg border border-red-900/30 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-border pt-6 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!hasRequiredDocs || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? "Uploading..." : "Upload & Continue"}
          </Button>
        </div>
        
        {uploading && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-text-secondary text-center">Uploading documents...</p>
          </div>
        )}
      </div>
    </div>
  );
}
