import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface StepExportProps {
  formData: Record<string, any>;
  onComplete?: () => void;
}

export function StepExport({ formData, onComplete }: StepExportProps) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generateEditedPdf = async () => {
    setLoading(true);
    try {
      const url = await api.exportDS160PDF(formData);
      setPdfUrl(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate the PDF right away
    if (Object.keys(formData).length > 0) {
        generateEditedPdf();
    }
  }, [formData]);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-12 space-y-6">
      <Card className="w-full bg-muted border-border">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
            <FileText size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-white">Application Ready</h2>
          <p className="text-text-secondary">
            We have merged your data into the final DS-160 PDF. You can now download and review the completed application form.
          </p>
          
          <div className="pt-6">
            {loading ? (
              <Button disabled className="w-full gap-2">
                <Loader2 className="animate-spin" size={16} />
                Generating PDF...
              </Button>
            ) : pdfUrl ? (
              <a href={pdfUrl} download="Completed_DS160.pdf" className="w-full inline-block">
                <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Download size={16} />
                  Download Complete PDF
                </Button>
              </a>
            ) : (
              <Button onClick={generateEditedPdf} className="w-full gap-2 bg-muted hover:bg-zinc-700">
                Retry Generation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {pdfUrl && (
        <div className="w-full animate-fade-in flex flex-col items-center">
             <div className="flex items-center gap-2 text-green-400 bg-green-950/20 px-4 py-2 rounded-lg border border-green-900/30">
               <CheckCircle2 size={16} />
               <span>PDF generated successfully with {Object.keys(formData).length} data sections.</span>
             </div>
        </div>
      )}
    </div>
  );
}
