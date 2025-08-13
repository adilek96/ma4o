import { useRef, useState } from "react";
import { Button } from "./ui/button";

export default function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState<string>("Your Name");
  const [bio, setBio] = useState<string>(
    "Love traveling, photography, and meeting new people."
  );

  const [interests, setInterests] = useState<string[]>([
    "Travel",
    "Photography",
    "Music",
    "Coffee",
  ]);
  const [newInterest, setNewInterest] = useState<string>("");

  const addInterest = () => {
    const value = newInterest.trim();
    if (value && !interests.includes(value)) {
      setInterests((prev) => [...prev, value]);
    }
    setNewInterest("");
  };
  const removeInterest = (idx: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== idx));
  };

  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...urls].slice(0, 9));
    e.target.value = "";
  };
  const removePhoto = (idx: number) => {
    const url = photos[idx];
    try {
      URL.revokeObjectURL(url);
    } catch {}
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 space-y-4 animate-fadeInUp">
      {/* Basic info */}
      <div className="p-4 component-bg glass-effect border border-border rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Edit profile
        </h2>
        <div className="space-y-3">
          <label className="block text-sm text-foreground/70">Name</label>
          <input
            className="w-full rounded-xl px-3 py-2 bg-transparent border border-border text-foreground outline-none focus:ring-2 focus:ring-ring/50"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
          <label className="block text-sm text-foreground/70 mt-2">Bio</label>
          <textarea
            className="w-full rounded-xl px-3 py-2 bg-transparent border border-border text-foreground outline-none focus:ring-2 focus:ring-ring/50 min-h-24"
            value={bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBio(e.target.value)
            }
          />
        </div>
      </div>

      {/* Interests */}
      <div className="p-4 component-bg glass-effect border border-border rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Interests
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded-xl px-3 py-2 bg-transparent border border-border text-foreground outline-none focus:ring-2 focus:ring-ring/50"
            placeholder="Add interest"
            value={newInterest}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewInterest(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInterest();
              }
            }}
          />
          <Button
            variant="outline"
            className="rounded-xl border-border text-foreground"
            onClick={addInterest}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/20 text-foreground border border-white/30"
            >
              {tag}
              <button
                aria-label="Remove"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => removeInterest(idx)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="p-4 component-bg glass-effect border border-border rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold text-foreground mb-3">Photos</h3>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddPhotos}
        />
        <div className="mb-3">
          <Button
            variant="outline"
            className="rounded-xl border-border text-foreground"
            onClick={() => fileRef.current?.click()}
          >
            Add photos
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((src, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-border"
            >
              <img
                src={src}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                aria-label="Remove photo"
                className="absolute top-1 right-1 text-xs px-2 py-1 rounded-lg component-bg glass-effect border border-border"
                onClick={() => removePhoto(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          className="flex-1 rounded-xl shadow-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          onClick={onBack}
        >
          Save
        </Button>
        <Button
          className="flex-1 rounded-xl border-border text-foreground component-bg glass-effect"
          variant="outline"
          onClick={onBack}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
