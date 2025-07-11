import type { MusicStyleDto } from '@/types';

/**
 * Search state management for DJ search functionality
 */
export interface SearchState {
  /** Current search text */
  searchTerm: string;
  /** List of selected music style IDs */
  selectedMusicStyles: string[];
  /** Results loading state */
  isLoading: boolean;
  /** Whether an error occurred */
  hasError: boolean;
  /** Error message */
  errorMessage: string;
}

/**
 * Filter options for DJ search
 */
export interface FilterOptions {
  /** Available music styles */
  musicStyles: MusicStyleDto[];
  /** Music styles loading state */
  isLoadingMusicStyles: boolean;
}

/**
 * Pagination state for DJ list
 */
export interface PaginationState {
  /** Current page */
  currentPage: number;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Next page loading state */
  isLoadingMore: boolean;
}
