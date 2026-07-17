import type { AcademicTree } from "../types/AcademicTree";
import type { AcademicTreeNode } from "../types/AcademicTreeNode";

interface AcademicTreeProps {
  academicTree: AcademicTree | null;
  selectedNode: AcademicTreeNode | null;
  onSelectNode: (node: AcademicTreeNode) => void;
}

export default function AcademicTree({
  academicTree,
  selectedNode,
  onSelectNode,
}: AcademicTreeProps) {
  if (!academicTree) {
    return (
      <div className="rounded-xl border p-6">
        No Academic Data Found.
      </div>
    );
  }

function renderNode(
  node: AcademicTreeNode,
  level = 0
) {
    const isSelected =
      selectedNode?.id === node.id;

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => onSelectNode(node)}
          className={`w-full rounded-lg p-3 text-left transition-all ${
            isSelected
              ? "bg-blue-100 font-semibold"
              : "hover:bg-gray-100"
          }`}
          style={{
            paddingLeft: `${level * 20 + 16}px`,
          }}
        >
          {node.name}
        </button>

        {node.children?.map((child) =>
          renderNode(child, level + 1)
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-4 text-xl font-bold">
        Academic Explorer
      </h2>

      {academicTree.boards.map((board) =>
        renderNode(board)
      )}
    </div>
  );
}