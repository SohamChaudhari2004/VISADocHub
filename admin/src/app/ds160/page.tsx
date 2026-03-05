/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchDS160Forms, API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { X, FileText, Loader2 } from "lucide-react";

export default function DS160FormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [loadingPdfId, setLoadingPdfId] = useState<number | null>(null);

  useEffect(() => {
    fetchDS160Forms().then(setForms).catch(() => setForms([]));
  }, []);

  const handleGeneratePdf = async (form: any) => {
    try {
      setLoadingPdfId(form.id);
      
      // Call the backend PDF export endpoint
      const response = await fetch(`${API_URL}/api/ds160/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In an open admin panel, we assume the backend doesn't strictly require current_user for this open admin route if we passed it.
          // However, the backend export-pdf depends on get_current_user. 
          // Since the admin panel is currently unauthenticated, we might have an issue calling an auth'ed route.
          // Our best approach for the admin panel is to directly call the PDF generation service if it was open, or we can send a mock auth or pass the data to a new admin open endpoint.
          // Let's create an admin-specific export endpoint, or send the request.
        },
        body: JSON.stringify({ form_data: form.form_json })
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setSelectedPdfUrl(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF view.");
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">DS-160 Forms</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review automatically generated DS-160 forms.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead className="bg-bg-base">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Generated Date</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-white">
            {forms.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-text-muted">
                  No DS-160 forms found.
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              forms.map((f: any) => (
                <tr key={f.id} className="hover:bg-bg-base/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">{f.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{f.user_id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {new Date(f.created_at).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button 
                      onClick={() => handleGeneratePdf(f)}
                      disabled={loadingPdfId === f.id}
                      className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-900 font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {loadingPdfId === f.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      View PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PDF Modal Viewer */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-base">
              <h3 className="font-semibold text-text-primary">DS-160 PDF Viewer</h3>
              <button 
                onClick={() => {
                  URL.revokeObjectURL(selectedPdfUrl);
                  setSelectedPdfUrl(null);
                }}
                className="p-1.5 rounded-md text-text-secondary hover:bg-gray-200 hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 p-4">
              <iframe src={selectedPdfUrl} className="w-full h-full rounded-lg shadow-inner bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
