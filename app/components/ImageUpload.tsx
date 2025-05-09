import React, { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const saveImage = useMutation(api.files.saveImageMetadata);

  const handleUpload = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      if (!fileInputRef.current?.files?.[0]) {
        setError("No file selected");
        setLoading(false);
        return;
      }
      const file = fileInputRef.current.files[0];

      // 1. Get upload URL from Convex
      const res = await fetch("/api/convex/generateUploadUrl");
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { url } = await res.json();

      // 2. Upload file to Convex
      const uploadRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file");
      const { storageId } = await uploadRes.json();

      // 3. Save fileId to the database
      await saveImage({ fileId: storageId as Id<"_storage"> }); // Assert type for storageId
      setSuccessMessage("Image uploaded successfully!");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px dashed #ccc", padding: 16, borderRadius: 8, background: "#f9f9f9" }}>
      <input type="file" ref={fileInputRef} accept="image/*" />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <div style={{ color: "red", fontSize: 12, marginTop: 8 }}>{error}</div>}
      {successMessage && <div style={{ color: "green", fontSize: 12, marginTop: 8 }}>{successMessage}</div>}
    </div>
  );
}