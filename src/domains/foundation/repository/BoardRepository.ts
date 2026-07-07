import { getSupabaseClient } from "../../../supabaseClient";

import type { Board } from "../../../types/board";

import {
  mapBoardFromDatabase,
  mapBoardToDatabase,
} from "../../../services/boardMapper";

/* ============================================================
   GET ALL BOARDS
============================================================ */

export async function getBoards(): Promise<Board[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("boards_master")
    .select("*")
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET BOARDS ERROR",
      error
    );

    return [];
  }

  return (data ?? []).map(
    mapBoardFromDatabase
  );
}

/* ============================================================
   GET BOARD
============================================================ */

export async function getBoardById(
  boardId: string
): Promise<Board | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from("boards_master")
    .select("*")
    .eq("id", boardId)
    .single();

  if (error) {
    console.error(
      "GET BOARD ERROR",
      error
    );

    return null;
  }

  return mapBoardFromDatabase(
    data
  );
}

/* ============================================================
   CHECK BOARD CODE
============================================================ */

export async function boardCodeExists(
  boardCode: string,
  excludeBoardId?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  let query = (supabase as any)
    .from("boards_master")
    .select("id")
    .eq(
      "board_code",
      boardCode
    );

  if (excludeBoardId) {
    query = query.neq(
      "id",
      excludeBoardId
    );
  }

  const { data, error } =
    await query.limit(1);

  if (error) {
    console.error(
      "CHECK BOARD CODE ERROR",
      error
    );

    return false;
  }

  return (data?.length ?? 0) > 0;
}

/* ============================================================
   CREATE BOARD
============================================================ */

export async function createBoard(
  board: Partial<Board>
): Promise<Board | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapBoardToDatabase(board);

  if (
    payload.board_code &&
    await boardCodeExists(
      payload.board_code
    )
  ) {
    console.error(
      "BOARD CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } = await (supabase as any)
    .from("boards_master")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error(
      "CREATE BOARD ERROR"
    );

    console.error(error);

    console.error("PAYLOAD");

    console.log(payload);

    return null;
  }

  return mapBoardFromDatabase(
    data
  );
}

/* ============================================================
   UPDATE BOARD
============================================================ */

export async function updateBoard(
  boardId: string,
  updates: Partial<Board>
): Promise<Board | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const payload =
    mapBoardToDatabase(
      updates
    );

  if (
    payload.board_code &&
    await boardCodeExists(
      payload.board_code,
      boardId
    )
  ) {
    console.error(
      "BOARD CODE ALREADY EXISTS"
    );

    return null;
  }

  const { data, error } = await (supabase as any)
    .from("boards_master")
    .update(payload)
    .eq("id", boardId)
    .select()
    .single();

  if (error) {
    console.error(
      "UPDATE BOARD ERROR",
      error
    );

    return null;
  }

  return mapBoardFromDatabase(
    data
  );
}

/* ============================================================
   ARCHIVE BOARD
============================================================ */

export async function archiveBoard(
  boardId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("boards_master")
    .update({
      is_active: false,
    })
    .eq("id", boardId);

  if (error) {
    console.error(
      "ARCHIVE BOARD ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   RESTORE BOARD
============================================================ */

export async function restoreBoard(
  boardId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("boards_master")
    .update({
      is_active: true,
    })
    .eq("id", boardId);

  if (error) {
    console.error(
      "RESTORE BOARD ERROR",
      error
    );

    return false;
  }

  return true;
}

/* ============================================================
   DELETE BOARD
============================================================ */

export async function deleteBoard(
  boardId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await (supabase as any)
    .from("boards_master")
    .delete()
    .eq("id", boardId);

  if (error) {
    console.error(
      "DELETE BOARD ERROR",
      error
    );

    return false;
  }

  return true;
}