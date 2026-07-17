import type { AcademicTreeNode } from "../types/AcademicTreeNode";

interface AcademicDetailsPanelProps {
  selectedNode: AcademicTreeNode | null;
}

export default function AcademicDetailsPanel({
  selectedNode,
}: AcademicDetailsPanelProps) {
  if (!selectedNode) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-bold">
          Academic Details
        </h2>

        <p className="mt-4 text-gray-500">
          Select any academic item from the
          Academic Explorer to view its details.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-xl font-bold">
        Academic Details
      </h2>

      <div className="space-y-4">
        <DetailRow
          label="Name"
          value={selectedNode.name}
        />

        <DetailRow
          label="Type"
          value={selectedNode.type}
        />

        <DetailRow
          label="Code"
          value={selectedNode.code ?? "-"}
        />

        <DetailRow
          label="Status"
          value={
            selectedNode.isActive
              ? "Active"
              : "Inactive"
          }
        />

        <DetailRow
          label="Display Order"
          value={
            selectedNode.displayOrder?.toString() ??
            "-"
          }
        />

        <DetailRow
          label="Parent ID"
          value={
            selectedNode.parentId ?? "-"
          }
        />
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      <span className="font-medium text-gray-600">
        {label}
      </span>

      <span className="text-right font-semibold">
        {value}
      </span>
    </div>
  );
}