import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Asset } from "../../types";
import { useCategories } from "../../features/assets/useCategories";
import { useCreateAsset, useUpdateAsset } from "../../features/assets/useAssets";

const assetFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  assetTag: z.string().min(1, "Asset tag is required"),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.coerce.number().min(0).optional().or(z.literal("")),
  condition: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().optional(),
  isBookable: z.boolean().optional(),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

interface AssetFormModalProps {
  open: boolean;
  onClose: () => void;
  editAsset?: Asset | null;
}

const CONDITIONS = ["New", "Good", "Fair", "Poor"];

export function AssetFormModal({ open, onClose, editAsset }: AssetFormModalProps) {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();

  const isEdit = !!editAsset;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      assetTag: "",
      categoryId: "",
      serialNumber: "",
      acquisitionDate: "",
      acquisitionCost: "" as unknown as number,
      condition: "",
      location: "",
      photoUrl: "",
      isBookable: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editAsset) {
      reset({
        name: editAsset.name,
        assetTag: editAsset.assetTag,
        categoryId: editAsset.categoryId,
        serialNumber: editAsset.serialNumber || "",
        acquisitionDate: editAsset.acquisitionDate
          ? editAsset.acquisitionDate.slice(0, 10)
          : "",
        acquisitionCost: editAsset.acquisitionCost ?? ("" as unknown as number),
        condition: editAsset.condition || "",
        location: editAsset.location || "",
        photoUrl: editAsset.photoUrl || "",
        isBookable: editAsset.isBookable,
      });
    } else {
      reset({
        name: "",
        assetTag: "",
        categoryId: "",
        serialNumber: "",
        acquisitionDate: "",
        acquisitionCost: "" as unknown as number,
        condition: "",
        location: "",
        photoUrl: "",
        isBookable: false,
      });
    }
  }, [editAsset, reset]);

  function onSubmit(data: AssetFormData) {
    const payload: Record<string, unknown> = {
      name: data.name,
      assetTag: data.assetTag,
      categoryId: data.categoryId,
      serialNumber: data.serialNumber || undefined,
      acquisitionDate: data.acquisitionDate || undefined,
      acquisitionCost:
        data.acquisitionCost !== "" && data.acquisitionCost !== undefined
          ? Number(data.acquisitionCost)
          : undefined,
      condition: data.condition || undefined,
      location: data.location || undefined,
      photoUrl: data.photoUrl || undefined,
      isBookable: data.isBookable ?? false,
    };

    if (isEdit && editAsset) {
      updateMutation.mutate(
        { id: editAsset.id, ...payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Asset" : "Register New Asset"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="e.g. Dell Latitude 5540"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Asset Tag */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Asset Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("assetTag")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="e.g. AST-00142"
            />
            {errors.assetTag && (
              <p className="mt-1 text-xs text-red-600">
                {errors.assetTag.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("categoryId")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Two-column row: Serial Number & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Serial Number
              </label>
              <input
                type="text"
                {...register("serialNumber")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="S/N..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Condition
              </label>
              <select
                {...register("condition")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select...</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Two-column row: Acquisition Date & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Acquisition Date
              </label>
              <input
                type="date"
                {...register("acquisitionDate")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Acquisition Cost
              </label>
              <input
                type="number"
                step="0.01"
                {...register("acquisitionCost")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              {...register("location")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="e.g. Building A, Floor 2"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Photo URL
            </label>
            <input
              type="text"
              {...register("photoUrl")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="https://..."
            />
          </div>

          {/* Is Bookable toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isBookable"
              {...register("isBookable")}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label
              htmlFor="isBookable"
              className="text-sm font-medium text-slate-700"
            >
              Shared / Bookable Resource
            </label>
          </div>

          {/* Error from mutation */}
          {mutationError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {(mutationError as any)?.response?.data?.message ||
                "Something went wrong"}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {isPending
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Register Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
