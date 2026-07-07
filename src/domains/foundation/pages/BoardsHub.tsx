import React, { useMemo, useState } from "react";

import FoundationManagementHeader from "../components/management/FoundationManagementHeader";

import FoundationStatisticsRow, {
  type FoundationStatistic,
} from "../components/management/FoundationStatisticsRow";

import FoundationToolbar, {
  type FoundationFilter,
} from "../components/management/FoundationToolbar";

import FoundationDataTable, {
  type FoundationTableColumn,
  type FoundationTableRow,
  type FoundationTableAction,
} from "../components/management/FoundationDataTable";

import BoardDialog
from "../components/dialogs/BoardDialog";

import type { Board } from "../../../types/board";

import { useBoardViewModel }
from "../viewmodels/BoardViewModel";

interface BoardsHubProps {
  onBack?: () => void;
}

const filters: FoundationFilter[] = [
  {
    label: "Status",
    options: [
      "All",
      "Active",
      "Archived",
    ],
  },
  {
    label: "Education Level",
    options: [
      "All",
      "School",
      "Higher Education",
      "Professional",
    ],
  },
];

const columns: FoundationTableColumn[] = [
  {
    key: "boardName",
    label: "Board",
  },
  {
    key: "shortName",
    label: "Short Name",
  },
  {
    key: "country",
    label: "Country",
  },
  {
    key: "educationLevel",
    label: "Education Level",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function BoardsHub({
  onBack,
}: BoardsHubProps) {
  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingBoard, setEditingBoard] =
    useState<Board | undefined>();

  const [search, setSearch] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [selectedLevel, setSelectedLevel] =
    useState("All");

  const {
    boards,
    loading,
    addBoard,
    editBoard,
    archive,
    restore,
    remove,
  } = useBoardViewModel();

  const statistics: FoundationStatistic[] =
    useMemo(() => {
      const active =
        boards.filter(
          (board) =>
            board.isActive
        ).length;

      const archived =
        boards.filter(
          (board) =>
            !board.isActive
        ).length;

      return [
        {
          title: "Boards",
          value: boards.length,
          subtitle: "Registered",
        },
        {
          title: "Active",
          value: active,
          subtitle: "Boards",
        },
        {
          title: "Archived",
          value: archived,
          subtitle: "Inactive",
        },
        {
          title: "Loading",
          value: loading ? "Yes" : "No",
          subtitle: "Repository Status",
        },
      ];
    }, [boards, loading]);

  const filteredBoards =
    useMemo(() => {
      return boards.filter(
        (board) => {
          const searchMatch =
            search === "" ||

            board.boardName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            board.boardCode
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            board.shortName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const statusMatch =
            selectedStatus === "All" ||

            (
              selectedStatus === "Active"
                ? board.isActive
                : !board.isActive
            );

          const levelMatch =
            selectedLevel === "All" ||

            board.educationLevel ===
              selectedLevel;

          return (
            searchMatch &&
            statusMatch &&
            levelMatch
          );
        }
      );
    }, [
      boards,
      search,
      selectedStatus,
      selectedLevel,
    ]);

  const rows: FoundationTableRow[] =
    useMemo(
      () =>
        filteredBoards.map(
          (board) => ({
            id: board.id,

            values: {
              boardName:
                board.boardName,

              shortName:
                board.shortName,

              country:
                board.country ??
                "-",

              educationLevel:
                board.educationLevel ??
                "-",

              status:
                board.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [filteredBoards]
    );

  const actions: FoundationTableAction[] = [
    {
      label: "Edit",
      variant: "primary",

      onClick: (row) => {
        const board =
          boards.find(
            (item) =>
              item.id === row.id
          );

        if (!board) {
          return;
        }

        setEditingBoard(board);

        setDialogOpen(true);
      },
    },

    {
      label: "Archive / Restore",

      variant: "secondary",

      onClick: async (row) => {
        const board =
          boards.find(
            (item) =>
              item.id === row.id
          );

        if (!board) {
          return;
        }

        if (board.isActive) {
          await archive(row.id);
        } else {
          await restore(row.id);
        }
      },
    },

    {
      label: "Delete",

      variant: "danger",

      onClick: async (row) => {
        const confirmed =
          window.confirm(
            "Are you sure you want to permanently delete this board?"
          );

        if (!confirmed) {
          return;
        }

        await remove(row.id);
      },
    },
  ];

  return (
    <>
      <div style={pageStyle}>
        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="📚 Boards"
          subtitle="Manage educational boards available across the Foundation Hub. Organizations, curriculum, subjects and classes will reference these master records."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

        <FoundationToolbar
          searchPlaceholder="Search boards..."

          searchValue={search}

          onSearchChange={setSearch}

          filters={filters}

          filterValues={[
            selectedStatus,
            selectedLevel,
          ]}

          onFilterChange={(
            index,
            value
          ) => {
            if (index === 0) {
              setSelectedStatus(value);
            }

            if (index === 1) {
              setSelectedLevel(value);
            }
          }}

          primaryActionLabel="+ Add Board"

          onPrimaryAction={() => {
            setEditingBoard(undefined);
            setDialogOpen(true);
          }}
        />

        <FoundationDataTable
          columns={columns}
          rows={rows}
          actions={actions}
        />
      </div>

      <BoardDialog
        mode={
          editingBoard
            ? "edit"
            : "create"
        }

        board={editingBoard}

        open={dialogOpen}

        onClose={() => {
          setDialogOpen(false);
          setEditingBoard(undefined);
        }}

        onSave={async (
          board
        ) => {
          if (
            editingBoard
          ) {
            await editBoard(
              editingBoard.id,
              board
            );
          } else {
            await addBoard(
              board
            );
          }

          setEditingBoard(
            undefined
          );

          setDialogOpen(false);
        }}
      />
    </>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};