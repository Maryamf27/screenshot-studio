"use client";

import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageUp, Trash2 } from "lucide-react";
import { useProjectStore, hydrateProjectStore, type UploadedImage } from "@/src/store/project-store";

function SortableImage({ image, onRemove, onRename }: { image: UploadedImage; onRemove: () => void; onRename: (name: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: image.id });
  const [preview] = useState(() => URL.createObjectURL(image.file));
  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);

  const cardState = isDragging
    ? "z-10 scale-[0.98] border-orange-300 opacity-60 shadow-xl ring-2 ring-orange-200"
    : isOver
      ? "border-orange-300 shadow-md ring-2 ring-orange-100"
      : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative min-w-0 overflow-hidden rounded-2xl border bg-white p-2.5 shadow-sm transition-[border-color,box-shadow,opacity,transform] duration-200 ${cardState}`}
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-slate-100">
        <img src={preview} alt={image.file.name} className="size-full object-contain" />
        <div className="absolute inset-x-2 top-2 flex items-center justify-between">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${image.name}`}
            className={`inline-flex size-9 touch-none items-center justify-center rounded-lg border border-white/80 bg-white/95 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Delete ${image.name}`}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-white/80 bg-white/95 text-slate-500 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.98]"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-w-0 space-y-1.5 p-2 pt-3">
        <p className="truncate text-xs font-medium leading-5 text-slate-500" title={image.file.name}>{image.file.name}</p>
        <label className="sr-only" htmlFor={`slide-name-${image.id}`}>Slide title</label>
        <input
          id={`slide-name-${image.id}`}
          type="text"
          value={image.name}
          onChange={(event) => onRename(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          className="block h-9 w-full min-w-0 cursor-text truncate rounded-lg border border-transparent bg-slate-50 px-2.5 text-sm font-semibold leading-5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-200 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </li>
  );
}

export function UploadManager({ onContinue }: { onContinue: () => void }) {
  const images = useProjectStore((state) => state.images);
  const addImages = useProjectStore((state) => state.addImages);
  const removeImage = useProjectStore((state) => state.removeImage);
  const renameImage = useProjectStore((state) => state.renameImage);
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxFiles: 10,
    noClick: true,
    disabled: images.length >= 10,
  });
  const ids = useMemo(() => images.map((image) => image.id), [images]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((image) => image.id === active.id);
    const newIndex = images.findIndex((image) => image.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    reorderImages(arrayMove(images, oldIndex, newIndex));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`rounded-2xl border border-dashed px-6 py-12 text-center transition-all duration-200 sm:px-12 sm:py-16 ${isDragActive ? "border-orange-400 bg-orange-50 shadow-inner ring-4 ring-orange-100" : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70"}`}
      >
        <input {...getInputProps()} />
        <div className={`mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl transition-colors ${isDragActive ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"}`}>
          <ImageUp className="size-6" strokeWidth={1.7} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {isDragActive ? "Release to add screenshots" : "Drop your screenshots here"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">PNG or JPG <span aria-hidden="true">·</span> {images.length} of 10 screenshots</p>
        <button
          type="button"
          onClick={open}
          disabled={images.length >= 10}
          className="mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          Browse files
        </button>
      </div>

      {message && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{message}</p>}

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
            <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-label="Uploaded screenshots">
              {images.map((image) => (
                <SortableImage key={image.id} image={image} onRemove={() => removeImage(image.id)} onRename={(name) => renameImage(image.id, name)} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-7 flex justify-end border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onContinue}
          disabled={images.length === 0}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          Next
        </button>
      </div>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Your images stay private and are processed locally in your browser.</p>
    </div>
  );
}
