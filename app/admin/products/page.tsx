"use client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";

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
  originalPrice?: string;
  dealPrice?: string;
  dealExpiresAt?: number;
  ownerId?: Id<"users">;
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
    <Card key={id as string} className="w-full max-w-md mb-6">
      <CardContent className="flex flex-col items-center">
        {/* Draft/Published badge */}
        {edit.status === "draft" && (
          <Alert variant="default" className="mb-2 bg-yellow-100 text-yellow-800">Draft</Alert>
        )}
        {edit.status === "published" && (
          <Alert variant="default" className="mb-2 bg-green-100 text-green-800">Published</Alert>
        )}
        {edit.image && edit.image.fileId ? (
          <DisplayImage fileId={edit.image.fileId} alt={edit.filename} />
        ) : (
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center mb-4 text-gray-400">No image</div>
        )}
        <div className="w-full flex flex-col gap-2">
          <Label>Type
            <Input value={edit.type} onChange={e => handleEdit(id as string, "type", e.target.value)} />
          </Label>
          <Label>Title
            <Input value={edit.title} onChange={e => handleEdit(id as string, "title", e.target.value)} />
          </Label>
          <Label>Color
            <Input value={edit.color} onChange={e => handleEdit(id as string, "color", e.target.value)} />
          </Label>
          <Label>Price
            <Input value={edit.price} onChange={e => handleEdit(id as string, "price", e.target.value)} />
          </Label>
          <Label>Image
            <Select value={edit.imageId as string} onValueChange={val => handleImageEdit(id as string, val as Id<"images">)}>
              <SelectTrigger>
                <SelectValue placeholder="Select image" />
              </SelectTrigger>
              <SelectContent>
                {images.map((img: Doc<"images">) => (
                  <SelectItem key={img._id as string} value={img._id as string}>
                    {img.fileId ? `${String(img.fileId).slice(0, 8)}...` : "No fileId"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
          <Label>Deal Price (cents)
            <Input type="number" value={edit.dealPrice ?? ""} onChange={e => handleEdit(id as string, "dealPrice", e.target.value)} placeholder="e.g. 399" />
          </Label>
          <Label>Original Price (cents)
            <Input type="number" value={edit.originalPrice ?? ""} onChange={e => handleEdit(id as string, "originalPrice", e.target.value)} placeholder="e.g. 499" />
          </Label>
          <Label>Deal Expires At (timestamp, optional)
            <Input type="number" value={edit.dealExpiresAt ?? ""} onChange={e => handleEdit(id as string, "dealExpiresAt", e.target.value)} placeholder="e.g. 1712345678" />
          </Label>
          {(edit.dealPrice || edit.originalPrice) && (
            <Button variant="secondary" className="mt-2 text-xs" onClick={() => {
              handleEdit(id as string, "dealPrice", "");
              handleEdit(id as string, "originalPrice", "");
              handleEdit(id as string, "dealExpiresAt", "");
            }}>
              Remove Deal
            </Button>
          )}
        </div>
        {showPublishButton && (
          <Button className="mt-4 bg-purple-600 text-white hover:bg-purple-700" onClick={async () => {
            setStatus("Publishing to Stripe...");
            const result = await publishToStripe({ id });
            if (result && "stripeProductId" in result) {
              setStatus("Published to Stripe!");
            } else {
              setStatus(result && "error" in result ? result.error : "Failed to publish");
            }
          }}>
            Publish to Stripe
          </Button>
        )}
        <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={() => handleSave(id as string)} disabled={!isProductChanged(product, edit)}>
          Save
        </Button>
        <Button variant="destructive" className="mt-2" onClick={() => handleDelete(id)}>
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminProductPhotos() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const users = useQuery(api.users.listUsers, {}) ?? [];
  const ownerId = selectedUser ? (selectedUser as Id<"users">) : undefined;
  const products = useQuery(api.products.listProducts, ownerId ? { ownerId } : {}) as (ProductPhoto[] | undefined);
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
        originalPrice: edited.originalPrice,
        dealPrice: edited.dealPrice,
        dealExpiresAt: edited.dealExpiresAt ? Number(edited.dealExpiresAt) : undefined,
        ownerId: (edited.ownerId as Id<"users">) || ownerId!,
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
    if (!ownerId) {
      setStatus("Please select a user to create a product for.");
      return;
    }
    try {
      await upsertProduct({
        type: "",
        title: "",
        color: "",
        price: "",
        imageId: images[0]?._id,
        filename: "new-product.png",
        status: "draft",
        ownerId,
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
    <main className="min-h-screen bg-muted flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Admin: Product Photos</h1>
          <p className="text-muted-foreground text-lg mb-4">Manage your product catalog, images, and deals</p>
          <div className="w-full border-b border-border/40 mb-6" />
        </header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2 sm:w-1/2">
            <label htmlFor="user-filter" className="text-sm font-medium">Filter by User</label>
            <select
              id="user-filter"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
          <Input type="file" accept="image/*" onChange={handleFileChange} className="sm:w-1/2" />
          <Button className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto" onClick={handleCreate}>
            New Product
          </Button>
        </div>
        {status && <Alert className="mb-8 text-blue-600 text-base font-medium rounded-lg shadow-sm">{status}</Alert>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </main>
  );
}