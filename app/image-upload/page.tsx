"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ImageUpload from "../components/ImageUpload";
import type { Id } from "../../convex/_generated/dataModel";

// Helper types for image metadata from Convex query
type ImageMeta = {
  _id: Id<"images">;
  fileId: Id<"_storage">;
  createdAt: number;
  // Add other fields from your schema if needed
};

// Child component to render a single image using its own query
function DisplayImage({ fileId }: { fileId: Id<"_storage"> }) {
  const imageUrl = useQuery(api.files.getImageUrl, { fileId });
  if (imageUrl === undefined) return <div style={{ width: 120, height: 120, background: "#eee", borderRadius: 4 }}>Loading...</div>;
  if (imageUrl === null) return <div style={{ width: 120, height: 120, background: "#fdd", borderRadius: 4, color: "red", fontSize: 10 }}>Error loading</div>;
  return (
    <img
      src={imageUrl}
      alt="Uploaded"
      style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4, marginBottom: 8 }}
    />
  );
}

export default function ImageUploadPage() {
  // Use Convex query for real-time updates
  const images = useQuery(api.files.listImages) as ImageMeta[] | undefined;
  const deleteImage = useMutation(api.files.deleteImage);

  const [loadingDelete, setLoadingDelete] = useState(false); // Loading state specifically for delete
  const [error, setError] = useState<string | null>(null);

  // Delete an image
  const handleDelete = async (id: Id<"images">) => {
    if (!confirm("Delete this image?")) return;
    setLoadingDelete(true);
    setError(null);
    try {
      await deleteImage({ id });
      // No need to refresh state, useQuery handles it
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Image Upload Demo</h1>
      <ImageUpload />
      <hr style={{ margin: "32px 0" }} />
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Uploaded Images</h2>
      {images === undefined && <div>Loading images...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {images?.map((img) => (
          <div key={img._id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, width: 140, textAlign: "center", background: "#fafafa" }}>
            <DisplayImage fileId={img.fileId} />
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              {new Date(img.createdAt).toLocaleString()}
            </div>
            <button onClick={() => handleDelete(img._id)} disabled={loadingDelete} style={{ fontSize: 12, color: "#b00", background: "none", border: "none", cursor: "pointer" }}>
              {loadingDelete ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}