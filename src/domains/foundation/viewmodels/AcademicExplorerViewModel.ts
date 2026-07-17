import { useCallback, useEffect, useState } from "react";

import type { AcademicTree } from "../types/AcademicTree";
import type { AcademicTreeNode } from "../types/AcademicTreeNode";
import type { AcademicTreeSearchResult } from "../types/AcademicTreeSearchResult";

import {
  getAcademicTree,
  getAcademicStatistics,
  refreshAcademicTree,
  searchAcademicTree,
} from "../repository/FoundationHubRepository";

import {
    getAcademicHierarchy,
} from "../repository/AcademicHierarchyRepository";

export default function useAcademicExplorerViewModel() {
  const [academicTree, setAcademicTree] =
    useState<AcademicTree | null>(null);

  const [selectedNode, setSelectedNode] =
    useState<AcademicTreeNode | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<AcademicTreeSearchResult[]>([]);

  const [statistics, setStatistics] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  /* ============================================================
      LOAD ACADEMIC TREE
  ============================================================ */

  const loadAcademicTree =
    useCallback(async () => {
      setLoading(true);

      try {
       const hierarchy =
  await getAcademicHierarchy();

const stats =
  await getAcademicStatistics();

        setAcademicTree({
  boards: hierarchy,

  totalBoards: hierarchy.length,

  totalAcademicYears: 0,

  totalOrganizations: 0,

  totalCurriculums: 0,

  totalClasses: 0,

  totalSections: 0,

  totalSubjects: 0,

  totalChapters: 0,

  totalTopics: 0,

  totalSubTopics: 0,

  generatedAt: new Date().toISOString(),
});

        setStatistics(stats);
      } finally {
        setLoading(false);
      }
    }, []);

  /* ============================================================
      INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadAcademicTree();
  }, [loadAcademicTree]);

  /* ============================================================
      SELECT NODE
  ============================================================ */

  function selectNode(
    node: AcademicTreeNode
  ) {
    setSelectedNode(node);
  }

  /* ============================================================
      SEARCH
  ============================================================ */

  async function search() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results =
      await searchAcademicTree(
        searchQuery
      );

    setSearchResults(results);
  }

  /* ============================================================
      CLEAR SEARCH
  ============================================================ */

  function clearSearch() {
    setSearchQuery("");
    setSearchResults([]);
  }

  /* ============================================================
      REFRESH
  ============================================================ */

  async function refresh() {
    setLoading(true);

    try {
      const tree =
        await refreshAcademicTree();

      const stats =
        await getAcademicStatistics();

      setAcademicTree(tree);
      setStatistics(stats);

      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
      RELOAD
  ============================================================ */

  async function reload() {
    await loadAcademicTree();
  }

  /* ============================================================
      RETURN
  ============================================================ */

  return {
    academicTree,

    selectedNode,

    statistics,

    loading,

    searchQuery,
    setSearchQuery,

    searchResults,

    loadAcademicTree,

    selectNode,

    search,

    clearSearch,

    refresh,

    reload,
  };
}