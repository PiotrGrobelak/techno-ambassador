import type { 
  EventListItemDto, 
  PaginationDto
} from '../../../types';

// Event form data types imported from schemas
export type { CreateEventFormData, UpdateEventFormData } from '../schemas/eventSchemas';

// Event form errors interface
export interface EventFormErrors {
  event_name?: string
  country?: string
  city?: string
  venue_name?: string
  event_date?: string
  event_time?: string
  general?: string
}

// Event form state interface
export interface EventFormState {
  isLoading: boolean
  isValid: boolean
  isDirty: boolean
  errors: EventFormErrors
}

// Events management state interface
export interface EventsManagementState {
  events: EventListItemDto[]
  upcomingEvents: EventListItemDto[]
  pastEvents: EventListItemDto[]
  pagination: PaginationDto
  loading: boolean
  error: string | null
  showAddForm: boolean
  editingEventId: string | null
  deletingEventId: string | null
}

// Events list state interface
export interface EventsListState {
  sortField: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  searchTerm: string
} 