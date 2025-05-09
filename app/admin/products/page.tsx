"use client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";

interface ProductPhoto {
  _id?: Id<"products">;
  type: string;
  title: string;
  color: string;
  price: string;
  imageId: Id<"images">;
  filename: string;
  image?: Doc<"images"> | null;
  status: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

function DisplayImage({ fileId, alt }: { fileId: Id<"_storage">, alt: string }) {
  const url = useQuery(api.files.getImageUrl, { fileId });
  if (url === undefined) return <div className="w-full aspect-square bg-gray-100 flex items-center justify-center mb-4 text-gray-400">Loading...</div>;
  if (url === null) return <div className="w-full aspect-square bg-gray-100 flex items-center justify-center mb-4 text-gray-400">No image</div>;
  return (
    <img
      src={url}
      alt={alt}
      className="w-full aspect-square object-cover mb-4"
    />
  );
}

function isProductChanged(original: ProductPhoto, edited: ProductPhoto) {
  return (
    original.type !== edited.type ||
    original.title !== edited.title ||
    original.color !== edited.color ||
    original.price !== edited.price ||
    original.imageId !== edited.imageId ||
    original.filename !== edited.filename
  );
}

function useStripeProduct(stripeProductId?: string) {
  const [stripeData, setStripeData] = useState<any | null>(null);
  useEffect(() => {
    let ignore = false;
    async function fetchStripe() {
      if (!stripeProductId) return;
      const res = await fetch("/api/convex/stripeProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeProductId }),
      });
      const data = await res.json();
      if (!ignore) setStripeData(data);
    }
    fetchStripe();
    return () => { ignore = true; };
  }, [stripeProductId]);
  return stripeData;
}

function isConvexDifferentFromStripe(convex: ProductPhoto, stripe: any) {
  if (!stripe || stripe.error) return true;
  // Compare title/name, description, price, image
  const convexDesc = `${convex.type} - ${convex.color}`;
  const convexPrice = Math.round(Number(convex.price) * 100);
  return (
    convex.title !== stripe.name ||
    convexDesc !== stripe.description ||
    (stripe.price !== undefined && convexPrice !== stripe.price) ||
    (stripe.image && convex.image && convex.image.fileId && stripe.image && stripe.image !== convex.image.fileId)
  );
}

function ProductCard({
  product,
  edit,
  images,
  handleEdit,
  handleImageEdit,
  handleSave,
  handleDelete,
  publishToStripe,
  setStatus,
}: {
  product: ProductPhoto;
  edit: ProductPhoto;
  images: Doc<"images">[];
  handleEdit: (id: string, field: keyof ProductPhoto, value: string) => void;
  handleImageEdit: (id: string, imageId: Id<"images">) => void;
  handleSave: (id: string) => void;
  handleDelete: (id: Id<"products">) => void;
  publishToStripe: any;
  setStatus: (msg: string) => void;
}) {
  const id = product._id as Id<"products">;
  const stripeData = edit.status === "published" && edit.stripeProductId
    ? useStripeProduct(edit.stripeProductId)
    : null;
  const showPublishButton =
    edit.status === "draft" ||
    (edit.status === "published" && edit.stripeProductId && isConvexDifferentFromStripe(edit, stripeData));
  return (
    <div key={id as string} className="bg-white rounded shadow p-4 flex flex-col items-center">
      {/* Draft badge */}
      {edit.status === "draft" && (
        <span className="mb-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">Draft</span>
      )}
      {edit.status === "published" && (
        <span className="mb-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Published</span>
      )}
      {edit.image && edit.image.fileId ? (
        <DisplayImage fileId={edit.image.fileId} alt={edit.filename} />
      ) : (
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center mb-4 text-gray-400">No image</div>
      )}
      <div className="w-full flex flex-col gap-2">
        <label className="text-xs font-semibold">Type
          <input
            className="border rounded px-2 py-1 w-full"
            value={edit.type}
            onChange={(e) => handleEdit(id as string, "type", e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold">Title
          <input
            className="border rounded px-2 py-1 w-full"
            value={edit.title}
            onChange={(e) => handleEdit(id as string, "title", e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold">Color
          <input
            className="border rounded px-2 py-1 w-full"
            value={edit.color}
            onChange={(e) => handleEdit(id as string, "color", e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold">Price
          <input
            className="border rounded px-2 py-1 w-full"
            value={edit.price}
            onChange={(e) => handleEdit(id as string, "price", e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold">Image
          <select
            className="border rounded px-2 py-1 w-full"
            value={edit.imageId}
            onChange={(e) => handleImageEdit(id as string, e.target.value as Id<"images">)}
          >
            {images.map((img: Doc<"images">) => (
              <option key={img._id as string} value={img._id as string}>
                {img.fileId ? `${String(img.fileId).slice(0, 8)}...` : "No fileId"}
              </option>
            ))}
          </select>
        </label>
      </div>
      {showPublishButton && (
        <button
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={async () => {
            setStatus("Publishing to Stripe...");
            const result = await publishToStripe({ id });
            if (result && "stripeProductId" in result) {
              setStatus("Published to Stripe!");
            } else {
              setStatus(result && "error" in result ? result.error : "Failed to publish");
            }
          }}
        >
          Publish to Stripe
        </button>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={() => handleSave(id as string)}
        disabled={!isProductChanged(product, edit)}
      >
        Save
      </button>
      <button
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => handleDelete(id)}
      >
        Delete
      </button>
    </div>
  );
}

export default function AdminProductPhotos() {
  const products = useQuery(api.products.listProducts, {}) as (ProductPhoto[] | undefined);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveImageMetadata = useMutation(api.files.saveImageMetadata);
  const [refreshImages, setRefreshImages] = useState(0);
  const images = useQuery(api.images.listImages, {}) as (Doc<"images">[] | undefined);
  const upsertProduct = useMutation(api.products.upsertProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const publishToStripe = useAction(api.products.publishToStripe);
  const [editing, setEditing] = useState<Record<string, ProductPhoto>>({});
  const [status, setStatus] = useState<string>("");

  if (!products || !images) {
    return <div className="p-8">Loading...</div>;
  }

  const handleEdit = (id: string, field: keyof ProductPhoto, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...products.find((p: ProductPhoto) => (p._id as string) === id)!, ...prev[id], [field]: value },
    }));
  };

  const handleImageEdit = (id: string, imageId: Id<"images">) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...products.find((p: ProductPhoto) => (p._id as string) === id)!, ...prev[id], imageId },
    }));
  };

  const handleSave = async (id: string) => {
    const edited = editing[id];
    if (!edited) return;
    try {
      await upsertProduct({
        id: edited._id,
        type: edited.type,
        title: edited.title,
        color: edited.color,
        price: edited.price,
        imageId: edited.imageId,
        filename: edited.filename,
        status: edited.status,
        stripeProductId: edited.stripeProductId,
        stripePriceId: edited.stripePriceId,
      });
      setStatus("Saved successfully!");
      setEditing((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err: any) {
      setStatus(`Error: ${err.message || "Unknown error"}`);
    }
  };

  const handleCreate = async () => {
    try {
      await upsertProduct({
        type: "",
        title: "",
        color: "",
        price: "",
        imageId: images[0]?._id,
        filename: "new-product.png",
        status: "draft",
      });
      setStatus("Created new product!");
    } catch (err: any) {
      setStatus(`Error: ${err.message || "Unknown error"}`);
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    try {
      await deleteProduct({ id });
      setStatus("Deleted successfully!");
    } catch (err: any) {
      setStatus(`Error: ${err.message || "Unknown error"}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("Uploading...");
    try {
      // 1. Get upload URL from Convex
      const result = await generateUploadUrl({}) as any;
      let url: string;
      if (typeof result === "string") {
        url = result;
      } else if (result && typeof result === "object" && "url" in result) {
        url = result.url;
      } else {
        throw new Error("Invalid upload URL response");
      }
      // 2. Upload file to Convex storage
      const uploadRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file");
      const { storageId } = await uploadRes.json();
      // 3. Save metadata in Convex
      await saveImageMetadata({ fileId: storageId as Id<'_storage'> });
      setStatus("Image uploaded!");
      setRefreshImages((r) => r + 1); // trigger images refresh
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin: Product Photos</h1>
      <div className="mb-8">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button
        className="mb-8 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleCreate}
      >
        New Product
      </button>
      {status && <div className="mb-4 text-blue-600">{status}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product: ProductPhoto) => {
          const id = product._id as Id<"products">;
          const edit = editing[id as string] || product;
          return (
            <ProductCard
              key={id as string}
              product={product}
              edit={edit}
              images={images}
              handleEdit={handleEdit}
              handleImageEdit={handleImageEdit}
              handleSave={handleSave}
              handleDelete={handleDelete}
              publishToStripe={publishToStripe}
              setStatus={setStatus}
            />
          );
        })}
      </div>
    </div>
  );
}