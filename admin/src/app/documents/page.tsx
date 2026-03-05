/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchDocuments, API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments().then(setDocuments).catch(() => setDocuments([]));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Documents</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review uploaded documents and their processing status.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead className="bg-bg-base">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Filename</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Upload Date</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-white">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-text-muted">
                  No documents found.
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-bg-base/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">{doc.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{doc.user_id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {doc.doc_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary truncate max-w-xs">{doc.filename}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                      doc.status === 'extracted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    {doc.upload_path && (
                      <button 
                        onClick={() => setSelectedPdf(`${API_URL}/${doc.upload_path.replace(/\\/g, '/')}`)}
                        className="text-brand-600 hover:text-brand-900 font-medium text-sm transition-colors"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PDF Modal Viewer */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-base">
              <h3 className="font-semibold text-text-primary">Document Viewer</h3>
              <button 
                onClick={() => setSelectedPdf(null)}
                className="p-1.5 rounded-md text-text-secondary hover:bg-gray-200 hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 p-4">
              <iframe src={selectedPdf} className="w-full h-full rounded-lg shadow-inner bg-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
