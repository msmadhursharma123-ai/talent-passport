import { useCallback, useEffect, useState } from "react";

import type { Board } from "../../../types/board";

import {
  getBoards,
  createBoard,
  updateBoard,
  archiveBoard,
  restoreBoard,
  deleteBoard,
} from "../repository/BoardRepository";

export function useBoardViewModel() {
  const [boards, setBoards] =
    useState<Board[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadBoards =
    useCallback(async () => {
      setLoading(true);

      const data =
        await getBoards();

      setBoards(data);

      setLoading(false);
    }, []);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  async function addBoard(
    board: Partial<Board>
  ) {
    const created =
      await createBoard(board);

    if (created) {
      await loadBoards();
    }

    return created;
  }

  async function editBoard(
    boardId: string,
    updates: Partial<Board>
  ) {
    const updated =
      await updateBoard(
        boardId,
        updates
      );

    if (updated) {
      await loadBoards();
    }

    return updated;
  }

  async function archive(
    boardId: string
  ) {
    const success =
      await archiveBoard(
        boardId
      );

    if (success) {
      await loadBoards();
    }
  }

  async function restore(
    boardId: string
  ) {
    const success =
      await restoreBoard(
        boardId
      );

    if (success) {
      await loadBoards();
    }
  }

  async function remove(
    boardId: string
  ) {
    const success =
      await deleteBoard(
        boardId
      );

    if (success) {
      await loadBoards();
    }
  }

  return {
    boards,

    loading,

    refresh: loadBoards,

    addBoard,

    editBoard,

    archive,

    restore,

    remove,
  };
}