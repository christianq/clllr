import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MagnifyingGlass } from "@phosphor-icons/react";

export interface Filters {
  searchTerm?: string;
  colors?: string[];
  sizes?: string[];
  categories?: string[];
  sortBy?: 'priceLowHigh' | 'priceHighLow' | 'newest' | 'oldest' | 'relevance';
}

const COLOR_OPTIONS = ["Red", "Blue", "Green", "Black", "White"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];
const CATEGORY_OPTIONS = ["Tote", "Backpack", "Duffel", "Messenger", "Accessory"];
const SORT_OPTIONS = [
  { value: "priceLowHigh", label: "Price: Low to High" },
  { value: "priceHighLow", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

interface FilterProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  hideSearchOnMobile?: boolean;
  onlySearchMobile?: boolean;
  resultsCount?: number;
}

export default function Filter({ filters, onChange, hideSearchOnMobile = false, onlySearchMobile = false, resultsCount }: FilterProps) {
  const [local, setLocal] = useState<Filters>(filters);

  const handleChange = (field: keyof Filters, value: any) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onChange(updated);
  };

  // Only render the search input for mobile search mode
  if (onlySearchMobile) {
    const [searchValue, setSearchValue] = useState(local.searchTerm || "");
    const [showAllButton, setShowAllButton] = useState(false);
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleChange("searchTerm", searchValue);
      setShowAllButton(true);
    };
    const handleShowAll = () => {
      setSearchValue("");
      handleChange("searchTerm", "");
      setShowAllButton(false);
    };
    if (showAllButton) {
      return (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-screen z-50 px-4 py-2 bg-white shadow-md pointer-events-auto block lg:hidden"
          style={{ top: 'var(--products-heading-col-height, 0px)' }}
        >
          <button
            className="w-full bg-blue-600 text-white rounded px-3 py-2 font-semibold"
            onClick={handleShowAll}
          >
            Show all products
          </button>
        </div>
      );
    }
    return (
      <div
        className="absolute left-1/2 -translate-x-1/2 w-screen z-50 px-4 py-2 bg-white shadow-md pointer-events-auto block lg:hidden"
        style={{ top: 'var(--products-heading-col-height, 0px)' }}
      >
        <form className="flex w-full gap-2" onSubmit={handleSubmit}>
          <input
            id="search"
            placeholder="Search products..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2 flex items-center justify-center">
            <MagnifyingGlass size={20} />
          </button>
        </form>
        {typeof resultsCount === 'number' && (
          <div className="text-xs text-gray-500 mt-1 text-center">Found: {resultsCount}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow border border-gray-200 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-md scrollbar-track-rounded-md">
      {/* Search input: hide on lg and below if hideSearchOnMobile is true */}
      {hideSearchOnMobile ? (
        <form className="hidden lg:flex w-full gap-2" onSubmit={e => { e.preventDefault(); handleChange('searchTerm', local.searchTerm || ''); }}>
          <input
            id="search"
            placeholder="Search products..."
            value={local.searchTerm || ""}
            onChange={e => handleChange("searchTerm", e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2 flex items-center justify-center">
            <MagnifyingGlass size={20} />
          </button>
        </form>
      ) : (
        <form className="block w-full gap-2 flex" onSubmit={e => { e.preventDefault(); handleChange('searchTerm', local.searchTerm || ''); }}>
          <input
            id="search"
            placeholder="Search products..."
            value={local.searchTerm || ""}
            onChange={e => handleChange("searchTerm", e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2 flex items-center justify-center">
            <MagnifyingGlass size={20} />
          </button>
        </form>
      )}
      {typeof resultsCount === 'number' && (
        <div className="text-xs text-gray-500 mt-1 text-center">Found: {resultsCount}</div>
      )}
      {/* <hr className="my-2 border-gray-200" />
      <div>
        <Label htmlFor="sortBy">Sort By</Label>
        <Select
          value={local.sortBy || "priceLowHigh"}
          onValueChange={val => handleChange("sortBy", val)}
        >
          <SelectTrigger id="sortBy">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <Select
          value={local.colors && local.colors[0] ? local.colors[0] : ""}
          onValueChange={val => handleChange("colors", val ? [val] : [])}
        >
          <SelectTrigger id="color">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map(color => (
              <SelectItem key={color} value={color}>{color}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="size">Size</Label>
        <Select
          value={local.sizes && local.sizes[0] ? local.sizes[0] : ""}
          onValueChange={val => handleChange("sizes", val ? [val] : [])}
        >
          <SelectTrigger id="size">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map(size => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={local.categories && local.categories[0] ? local.categories[0] : ""}
          onValueChange={val => handleChange("categories", val ? [val] : [])}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={() => {
        setLocal({});
        onChange({});
      }}>Clear Filters</Button> */}
    </div>
  );
}