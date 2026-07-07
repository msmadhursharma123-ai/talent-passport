import type { Board } from "../types/board";

/* ============================================================
   DATABASE → DOMAIN
============================================================ */

export function mapBoardFromDatabase(
  row: any
): Board {
  return {
    id: row.id,

    boardCode:
      row.board_code,

    boardName:
      row.board_name,

    shortName:
      row.short_name,

    description:
      row.description,

    country:
      row.country,

    educationLevel:
      row.education_level,

    displayOrder:
      row.display_order,

    isActive:
      row.is_active,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* ============================================================
   DOMAIN → DATABASE
============================================================ */

export function mapBoardToDatabase(
  board: Partial<Board>
) {
  const payload: any = {
    board_code:
      board.boardCode,

    board_name:
      board.boardName,

    short_name:
      board.shortName,

    description:
      board.description,

    country:
      board.country,

    education_level:
      board.educationLevel,

    display_order:
      board.displayOrder,

    is_active:
      board.isActive,
  };

  if (board.id) {
    payload.id = board.id;
  }

  return payload;
}