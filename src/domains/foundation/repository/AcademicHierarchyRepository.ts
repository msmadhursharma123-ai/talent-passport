import type { AcademicTreeNode } from "../types/AcademicTreeNode";

import { getBoards } from "./BoardRepository";
import { getClasses } from "./ClassRepository";
import { getSubjects } from "./SubjectRepository";
import { getChapters } from "./ChapterRepository";
import { getTopics } from "./TopicRepository";
import { getSubTopics } from "./SubTopicRepository";

/* ============================================================
   GET COMPLETE ACADEMIC HIERARCHY
============================================================ */

export async function getAcademicHierarchy(): Promise<
  AcademicTreeNode[]
> {
  try {
    const [
      boards,
      classes,
      subjects,
      chapters,
      topics,
      subTopics,
    ] = await Promise.all([
      getBoards(),
      getClasses(),
      getSubjects(),
      getChapters(),
      getTopics(),
      getSubTopics(),
    ]);

    /* ============================================================
       BOARDS
    ============================================================ */

    const boardNodes: AcademicTreeNode[] = boards.map(
      (board: any) => ({
        id: board.id,
        type: "board",
        name: board.boardName,
        code: board.boardCode,
        parentId: null,
        children: [],
      })
    );

    /* ============================================================
       CLASSES
    ============================================================ */

    classes.forEach(
      (classItem: any, index: number) => {
        const boardNode =
          boardNodes[index % boardNodes.length];

        if (!boardNode) return;

        boardNode.children?.push({
          id: classItem.id,
          type: "class",
          name: classItem.className,
          code: classItem.classCode,
          parentId: boardNode.id,
          children: [],
        });
      }
    );

    /* ============================================================
       SUBJECTS
    ============================================================ */

    boardNodes.forEach((boardNode) => {
      boardNode.children?.forEach((classNode) => {
        subjects.forEach((subject: any) => {
          classNode.children?.push({
            id: subject.id,
            type: "subject",
            name: subject.subjectName,
            code: subject.subjectCode,
            parentId: classNode.id,
            children: [],
          });
        });
      });
    });

    /* ============================================================
       CHAPTERS
    ============================================================ */

    attachChildren(
      boardNodes,
      chapters,
      "chapter",
      "subjectId",
      "chapterName",
      "chapterCode"
    );

    /* ============================================================
       TOPICS
    ============================================================ */

    attachChildren(
      boardNodes,
      topics,
      "topic",
      "chapterId",
      "topicName",
      "topicCode"
    );

    /* ============================================================
       SUB TOPICS
    ============================================================ */

    attachChildren(
      boardNodes,
      subTopics,
      "subTopic",
      "topicId",
      "subTopicName",
      "subTopicCode"
    );

    return boardNodes;
  } catch (error) {
    console.error(
      "GET ACADEMIC HIERARCHY ERROR",
      error
    );

    return [];
  }
}

/* ============================================================
   ATTACH CHILDREN RECURSIVELY
============================================================ */

function attachChildren(
  nodes: AcademicTreeNode[],
  items: any[],
  type: AcademicTreeNode["type"],
  parentKey: string,
  nameKey: string,
  codeKey: string
) {
  nodes.forEach((node) => {
    items
      .filter(
        (item) =>
          item[parentKey] === node.id
      )
      .forEach((item) => {
        node.children?.push({
          id: item.id,
          type,
          name: item[nameKey],
          code: item[codeKey],
          parentId: node.id,
          children: [],
        });
      });

    if (
      node.children &&
      node.children.length > 0
    ) {
      attachChildren(
        node.children,
        items,
        type,
        parentKey,
        nameKey,
        codeKey
      );
    }
  });
}