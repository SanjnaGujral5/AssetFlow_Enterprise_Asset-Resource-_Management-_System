import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { useBulkCreateAssets } from "../../features/assets/useBulkCreateAssets";
import { useCategories } from "../../features/assets/useCategories";
import { CreateAssetInput } from "../../types";
import { Link, useNavigate } from "react-router-dom";

export function AssetRegistration() {
  const [csvContent, setCsvContent] = useState<string>("");
  const [parsedAssets, setParsedAssets] = useState<CreateAssetInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  const { data: categories } = useCategories();
  const bulkCreate = useBulkCreateAssets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    if (!categories) return;

    const lines = csv.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setErrors(["CSV must contain a header row and at least one data row."]);
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const expectedHeaders = ["name", "assettag", "categoryname"];
    const missing = expectedHeaders.filter(h => !headers.includes(h));
    
    if (missing.length > 0) {
      setErrors([`Missing required columns: ${missing.join(", ")}`]);
      return;
    }

    const nameIdx = headers.indexOf("name");
    const tagIdx = headers.indexOf("assettag");
    const catIdx = headers.indexOf("categoryname");
    const serialIdx = headers.indexOf("serialnumber");
    const costIdx = headers.indexOf("cost");

    const newErrors: string[] = [];
    const validAssets: CreateAssetInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      const catName = cols[catIdx];
      const category = categories.find(c => c.name.toLowerCase() === catName?.toLowerCase());

      if (!category) {
        newErrors.push(`Row ${i + 1}: Category '${catName}' not found.`);
        continue;
      }

      if (!cols[nameIdx] || !cols[tagIdx]) {
        newErrors.push(`Row ${i + 1}: Name and Asset Tag are required.`);
        continue;
      }

      validAssets.push({
        name: cols[nameIdx],
        assetTag: cols[tagIdx],
        categoryId: category.id,
        serialNumber: serialIdx >= 0 ? cols[serialIdx] : undefined,
        acquisitionCost: costIdx >= 0 && cols[costIdx] ? parseFloat(cols[costIdx]) : undefined,
      });
    }

    setErrors(newErrors);
    setParsedAssets(validAssets);
  };

  const handleSubmit = async () => {
    if (parsedAssets.length === 0) return;
    try {
      await bulkCreate.mutateAsync(parsedAssets);
      navigate("/assets");
    } catch (err) {
      setErrors(["Failed to submit bulk registration."]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Asset Registration</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bulk upload assets via CSV or register them individually.
          </p>
        </div>
        <Link
          to="/assets"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          &larr; Back to Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Zone */}
        <div className="col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-slate-400" />
              Bulk Import (CSV)
            </h2>
            
            <div 
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 transition-colors hover:border-brand-500 hover:bg-brand-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={32} className="mb-3 text-slate-400 group-hover:text-brand-500" />
              <p className="text-sm font-medium text-slate-700">Click to upload CSV</p>
              <p className="mt-1 text-xs text-slate-500">Columns: Name, AssetTag, CategoryName, SerialNumber, Cost</p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </div>

            {errors.length > 0 && (
              <div className="mt-4 rounded-lg bg-red-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-red-800">
                  <AlertCircle size={16} />
                  Validation Errors
                </h3>
                <ul className="mt-2 list-inside list-disc text-xs text-red-700">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Preview Zone */}
        <div className="col-span-1 lg:col-span-2">
          <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Preview ({parsedAssets.length} assets)</h2>
              <button
                onClick={handleSubmit}
                disabled={parsedAssets.length === 0 || bulkCreate.isPending}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {bulkCreate.isPending ? "Importing..." : "Import Assets"}
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
              {parsedAssets.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 size={40} className="mb-4 text-slate-200" />
                  <p className="text-sm font-medium">No assets loaded</p>
                  <p className="text-xs">Upload a CSV to preview imported records.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Asset Tag</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parsedAssets.map((asset, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-slate-900">{asset.assetTag}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-500">{asset.name}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-500">
                          {categories?.find(c => c.id === asset.categoryId)?.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
