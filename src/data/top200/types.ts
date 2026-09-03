import { Flashcard } from "@/types/language";

export interface TopWordCard extends Flashcard {
  rank: number; // 1 a 200
  category: string;
}

export interface Top200Progress {
  currentIndex: number;
  masteredIds: string[];
  reviewQueue: string[]; // IDs agendados para repetição/fixação
  lastReviewedRank?: number;
}
