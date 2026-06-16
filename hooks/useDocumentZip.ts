import { useState, useCallback } from "react";

export type ZipRole = "agent" | "vendor";

interface ZipEntry {
  filename: string;
  file: File;
}

interface UseDocumentZipResult {
  zipping:   boolean;
  zipError:  string | null;
  createAndUploadZip: (
    entries:    ZipEntry[],
    registrationId: string,
    role:       ZipRole
  ) => Promise<boolean>;
}

/**
 * Loads JSZip dynamically, bundles provided files into a ZIP,
 * and uploads it to /src/upload/{role}/{registrationId}.zip
 *
 * In development/demo mode (no real API), it triggers a browser download instead.
 */
export function useDocumentZip(): UseDocumentZipResult {
  const [zipping,  setZipping]  = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const loadJSZip = useCallback((): Promise<typeof import("jszip")["default"]> => {
    return new Promise((resolve, reject) => {
      if ((window as Record<string, unknown>).JSZip) {
        resolve((window as Record<string, unknown>).JSZip as typeof import("jszip")["default"]);
        return;
      }
      const script   = document.createElement("script");
      script.src     = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.onload  = () => resolve((window as Record<string, unknown>).JSZip as typeof import("jszip")["default"]);
      script.onerror = () => reject(new Error("Failed to load JSZip"));
      document.head.appendChild(script);
    });
  }, []);

  const createAndUploadZip = useCallback(async (
    entries: ZipEntry[],
    registrationId: string,
    role: ZipRole
  ): Promise<boolean> => {
    setZipping(true);
    setZipError(null);

    try {
      const JSZip = await loadJSZip();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const zip = new (JSZip as any)();

      for (const entry of entries) {
        const arrayBuffer = await entry.file.arrayBuffer();
        zip.file(entry.filename, arrayBuffer);
      }

      const zipBlob: Blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const zipFilename   = `${registrationId}.zip`;
      const uploadPath    = `/src/upload/${role}/${zipFilename}`;

      // ── Try to upload to server ──
      try {
        const formData = new FormData();
        formData.append("file", zipBlob, zipFilename);
        formData.append("path", uploadPath);

        const res = await fetch(`/api/upload-documents`, {
          method: "POST",
          body:   formData,
        });

        if (res.ok) {
          console.log(`✅ ZIP uploaded to ${uploadPath}`);
          setZipping(false);
          return true;
        }
      } catch {
        // Server not available — fall through to browser download
      }

      // ── Fallback: browser download ──
      // (Remove this in production once /api/upload-documents endpoint is ready)
      const url = URL.createObjectURL(zipBlob);
      const a   = document.createElement("a");
      a.href    = url;
      a.download = zipFilename;
      a.click();
      URL.revokeObjectURL(url);
      console.log(`📦 ZIP saved as ${zipFilename} (upload path would be: ${uploadPath})`);

      setZipping(false);
      return true;
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "ZIP creation failed");
      setZipping(false);
      return false;
    }
  }, [loadJSZip]);

  return { zipping, zipError, createAndUploadZip };
}
