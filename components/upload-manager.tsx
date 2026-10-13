"use client";

import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageUp, Trash2, GripVertical } from "lucide-react";
import { useProjectStore, hydrateProjectStore, type UploadedImage } from "@/src/store/project-store";

function SortableImage({ image, onRemove }: { image: UploadedImage; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const [preview] = useState(() => URL.createObjectURL(image.file));
  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="group relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[4/5] w-28 bg-muted sm:w-32">{preview && <img src={preview} alt={image.name} className="size-full object-cover" />}</div>
      <button type="button" {...attributes} {...listeners} aria-label={`Reorder ${image.name}`} className="absolute left-1 top-1 rounded-md bg-background/85 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><GripVertical className="size-4" /></button>
      <button type="button" onClick={onRemove} aria-label={`Delete ${image.name}`} className="absolute right-1 top-1 rounded-md bg-background/85 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"><Trash2 className="size-4" /></button>
      <p className="max-w-28 truncate px-2 py-2 text-[11px] text-muted-foreground sm:max-w-32">{image.name}</p>
    </li>
  );
}

export function UploadManager() {
  const images = useProjectStore((state) => state.images);
  const addImages = useProjectStore((state) => state.addImages);
  const removeImage = useProjectStore((state) => state.removeImage);
  const reorderImages = useProjectStore((state) => state.reorderImages);
  const [message, setMessage] = useState<string>();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  useEffect(() => hydrateProjectStore(), []);
  const onDrop = (accepted: File[], rejected: { file: File }[]) => {
    if (rejected.length) setMessage("Only PNG and JPG images are supported.");
    else if (accepted.length + images.length > 10) setMessage("You can add up to 10 screenshots.");
    else setMessage(undefined);
    addImages(accepted);
  };
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }, maxFiles: 10, noClick: true, disabled: images.length >= 10 });
  const ids = useMemo(() => images.map((image) => image.id), [images]);
  const onDragEnd = ({ active, over }: DragEndEvent) => { if (over && active.id !== over.id) reorderImages(String(active.id), String(over.id)); };
  return (
    <div className="w-full">
      <div {...getRootProps()} className={`rounded-md border border-dashed px-6 py-14 text-center transition-colors sm:px-12 sm:py-20 ${isDragActive ? "border-primary bg-accent/50" : "border-border bg-card"}`}>
        <input {...getInputProps()} />
        <ImageUp className="mx-auto mb-5 size-7 text-primary" strokeWidth={1.5} />
        <h2 className="text-lg font-medium tracking-[-0.015em] text-card-foreground">{isDragActive ? "Release to add screenshots" : "Drop your screenshots here"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">PNG or JPG · {images.length}/10 screenshots</p>
        <button type="button" onClick={open} disabled={images.length >= 10} className="mt-7 inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50">Browse files</button>
      </div>
      {message && <p role="alert" className="mt-3 text-center text-xs text-destructive">{message}</p>}
      {images.length > 0 && <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><SortableContext items={ids} strategy={horizontalListSortingStrategy}><ol className="mt-6 flex flex-wrap gap-3" aria-label="Uploaded screenshots">{images.map((image) => <SortableImage key={image.id} image={image} onRemove={() => removeImage(image.id)} />)}</ol></SortableContext></DndContext>}
      <p className="mt-4 text-center text-xs text-muted-foreground">Your images stay private and are processed locally in your browser.</p>
    </div>
  );
}
