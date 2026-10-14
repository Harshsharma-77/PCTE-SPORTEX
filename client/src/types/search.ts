export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
}

export interface OmnisearchResults {
  students: SearchResultItem[];
  teams: SearchResultItem[];
  sports: SearchResultItem[];
  tournaments: SearchResultItem[];
  matches: SearchResultItem[];
  announcements: SearchResultItem[];
}
