export interface StudentMasterclassRecord {
  id: string;
  rollNumber: string;
  month: string;
  masterclassDate: string;
  partnerName: string;
  creditsWon: number | null;
  rank: 1 | 2 | 3 | 4 | 5 | null;
}

export interface StudentMasterclassHistoryResult {
  rows: StudentMasterclassRecord[];
}
