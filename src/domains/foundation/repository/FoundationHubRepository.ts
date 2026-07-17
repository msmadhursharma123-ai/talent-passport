import type { AcademicTree } from "../types/AcademicTree";
import type { AcademicTreeNode } from "../types/AcademicTreeNode";
import type { AcademicTreeSearchResult } from "../types/AcademicTreeSearchResult";

import { getBoards } from "./BoardRepository";
import { getAcademicYears } from "./AcademicYearRepository";
import { getOrganizations } from "./OrganizationRepository";
import { getCurriculums } from "./CurriculumRepository";
import { getClasses } from "./ClassRepository";
import { getSections } from "./SectionRepository";
import { getSubjects } from "./SubjectRepository";
import { getChapters } from "./ChapterRepository";
import { getTopics } from "./TopicRepository";
import { getSubTopics } from "./SubTopicRepository";

export async function getAcademicTree(): Promise<AcademicTree> {
  const [
    boards,
    academicYears,
    organizations,
    curriculums,
    classes,
    sections,
    subjects,
    chapters,
    topics,
    subTopics,
  ] = await Promise.all([
    getBoards(),
    getAcademicYears(),
    getOrganizations(),
    getCurriculums(),
    getClasses(),
    getSections(),
    getSubjects(),
    getChapters(),
    getTopics(),
    getSubTopics(),
  ]);

  const boardNodes: AcademicTreeNode[] = boards.map((board) => ({
    id: board.id,
    type: "board",
    code: board.boardCode,
    name: board.boardName,
    displayOrder: board.displayOrder,
    isActive: board.isActive,
    parentId: null,
    children: [],
  }));

  return {
    boards: boardNodes,

    totalBoards: boards.length,
    totalAcademicYears: academicYears.length,
    totalOrganizations: organizations.length,
    totalCurriculums: curriculums.length,
    totalClasses: classes.length,
    totalSections: sections.length,
    totalSubjects: subjects.length,
    totalChapters: chapters.length,
    totalTopics: topics.length,
    totalSubTopics: subTopics.length,

    generatedAt: new Date().toISOString(),
  };
}

export async function refreshAcademicTree() {
  return getAcademicTree();
}

export async function searchAcademicTree(
  query: string
): Promise<AcademicTreeSearchResult[]> {
  const tree = await getAcademicTree();

  const results: AcademicTreeSearchResult[] = [];

  function searchNodes(
    nodes: AcademicTreeNode[],
    path = ""
  ) {
    for (const node of nodes) {
      const currentPath =
        path.length > 0
          ? `${path} > ${node.name}`
          : node.name;

      if (
        node.name
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        results.push({
          node,
          path: currentPath,
          level: node.type,
        });
      }

      if (node.children?.length) {
        searchNodes(
          node.children,
          currentPath
        );
      }
    }
  }

  searchNodes(tree.boards);

  return results;
}

export async function getAcademicStatistics() {
  const tree = await getAcademicTree();

  return {
    totalBoards: tree.totalBoards,
    totalAcademicYears:
      tree.totalAcademicYears,
    totalOrganizations:
      tree.totalOrganizations,
    totalCurriculums:
      tree.totalCurriculums,
    totalClasses: tree.totalClasses,
    totalSections:
      tree.totalSections,
    totalSubjects:
      tree.totalSubjects,
    totalChapters:
      tree.totalChapters,
    totalTopics:
      tree.totalTopics,
    totalSubTopics:
      tree.totalSubTopics,
  };
}