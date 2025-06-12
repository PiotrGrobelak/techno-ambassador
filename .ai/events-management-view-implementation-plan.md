# Plan implementacji widoku Event Management

## 1. Przegląd

Widok Event Management (`/dashboard/events`) to główny interfejs zarządzania wydarzeniami dla DJ-ów w platformie Techno Ambassador. Umożliwia wykonywanie operacji CRUD (tworzenie, odczytywanie, aktualizowanie, usuwanie) na wydarzeniach artysty. Widok składa się z listy wydarzeń z opcjami edycji oraz formularzy do dodawania i modyfikowania wydarzeń. Kluczowe funkcjonalności obejmują walidację dat w czasie rzeczywistym (tylko przyszłe wydarzenia), walidację inline oraz ograniczenia bezpieczeństwa zapewniające, że użytkownicy mogą zarządzać tylko własnymi wydarzeniami. Implementacja opiera się na standardach projektu: PrimeVue Forms + Zod + Vee-Validate + Pinia store.

## 2. Routing widoku

**Ścieżka:** `/dashboard/events`
**Typ:** Chroniona strona wymagająca uwierzytelnienia
**Plik:** `src/pages/dashboard/events.astro`
**Middleware:** Uwierzytelnienie zostanie obsłużone przez istniejący middleware

## 3. Struktura komponentów

```
EventsManagementPage (Astro)
├── EventsManagementView (Vue - główny kontener)
    ├── PageHeader (sekcja nagłówka z tytułem i przyciskiem dodawania)
    ├── AddEventForm (formularz dodawania nowego wydarzenia)
    ├── EventsList (lista wydarzeń z opcjami zarządzania)
    │   ├── EventsSearch (filtrowanie i sortowanie)
    │   ├── EventItem (pojedynczy element wydarzenia)
    │   │   ├── EditEventForm (formularz edycji - warunkowy)
    │   │   └── DeleteEventConfirmation (dialog potwierdzenia - warunkowy)
    │   └── EventsPagination (paginacja)
    ├── EventFormMessages (współdzielone komunikaty formularza)
    └── EventFormContainer (wrapper dla formularzy)
```

## 4. Szczegóły komponentów

### EventsManagementView
- **Opis komponentu:** Główny kontener zarządzający stanem całego widoku, obsługujący komunikację między komponentami potomnymi oraz zarządzanie globalnymi operacjami na wydarzeniach, używa Pinia store
- **Główne elementy:** Div kontener z układem siatki, sekcje nagłówka, formularza i listy, obsługa ładowania i błędów
- **Obsługiwane interakcje:** Ładowanie wydarzeń, odświeżanie listy po operacjach CRUD, przełączanie widoków formularzy, obsługa stanu ładowania
- **Obsługiwana walidacja:** Sprawdzanie uwierzytelnienia użytkownika, walidacja uprawnień do zarządzania wydarzeniami
- **Typy:** `EventsManagementState`, `EventListItemDto[]`, `PaginationDto`, `ApiError`
- **Propsy:** Brak (główny komponent widoku, używa Pinia store)

### PageHeader
- **Opis komponentu:** Sekcja nagłówka zawierająca tytuł strony, opis oraz przycisk dodawania nowego wydarzenia
- **Główne elementy:** H1 z tytułem, paragraph z opisem, PrimeVue Button do dodawania wydarzenia
- **Obsługiwane interakcje:** Kliknięcie przycisku "Dodaj wydarzenie" przełączające widoczność formularza przez store
- **Obsługiwana walidacja:** Brak
- **Typy:** `boolean` (stan widoczności formularza z store)
- **Propsy:** Brak (używa Pinia store)

### AddEventForm
- **Opis komponentu:** Formularz tworzenia nowego wydarzenia z walidacją Zod + Vee-Validate w czasie rzeczywistym i obsługą błędów przez PrimeVue komponenty
- **Główne elementy:** EventFormContainer z polami InputText (nazwa, kraj, miasto, miejsce), Calendar (data), InputMask (czas), Button (zapisz/anuluj), EventFormMessages
- **Obsługiwane interakcje:** Wypełnianie pól, walidacja w czasie rzeczywistym przez Vee-Validate, przesyłanie formularza, anulowanie
- **Obsługiwana walidacja:** Zod schema z polami wymaganymi oprócz czasu, data musi być dzisiejsza lub przyszła (maks. 1 rok), walidacja długości pól tekstowych
- **Typy:** `CreateEventFormData`, `CreateEventCommand`, Zod schema
- **Propsy:** `visible: boolean`, używa Pinia store dla stanu formularza

### EditEventForm
- **Opis komponentu:** Formularz edycji istniejącego wydarzenia, identyczny z AddEventForm ale z przedwypełnionymi danymi z store
- **Główne elementy:** Identyczne z AddEventForm, dodatkowo przycisk anulowania zmian
- **Obsługiwane interakcje:** Modyfikacja pól, walidacja Zod, zapisywanie zmian, anulowanie edycji
- **Obsługiwana walidacja:** Identyczna z AddEventForm plus sprawdzenie czy wydarzenie jest przyszłe
- **Typy:** `UpdateEventFormData`, `UpdateEventCommand`, `EventListItemDto`, Zod schema
- **Propsy:** `eventId: string`, używa Pinia store dla danych wydarzenia i stanu formularza

### EventsList
- **Opis komponentu:** Lista wszystkich wydarzeń użytkownika z oznaczeniem przyszłych/przeszłych oraz opcjami zarządzania, używa PrimeVue DataTable
- **Główne elementy:** PrimeVue DataTable z kolumnami (nazwa, lokalizacja, data, czas, akcje), EmptyState gdy brak wydarzeń
- **Obsługiwane interakcje:** Sortowanie, paginacja, edycja przyszłych wydarzeń, usuwanie przyszłych wydarzeń
- **Obsługiwana walidacja:** Sprawdzanie czy wydarzenie jest przyszłe przed pokazaniem opcji edycji/usuwania
- **Typy:** `EventListItemDto[]`, `PaginationDto`, `EventsListState`
- **Propsy:** Brak (używa Pinia store)

### EventItem
- **Opis komponentu:** Pojedynczy wiersz w PrimeVue DataTable z informacjami o wydarzeniu i akcjami
- **Główne elementy:** Kolumny tabeli z danymi wydarzenia, PrimeVue Button akcji (edytuj/usuń) dla przyszłych wydarzeń
- **Obsługiwane interakcje:** Kliknięcie edycji/usuwania, oznaczanie przeszłych wydarzeń jako nieedytowalne
- **Obsługiwana walidacja:** Sprawdzanie czy data wydarzenia jest przyszła
- **Typy:** `EventListItemDto`, `boolean` (isPastEvent)
- **Propsy:** `event: EventListItemDto` (przekazywane przez DataTable)

### DeleteEventConfirmation
- **Opis komponentu:** PrimeVue ConfirmDialog potwierdzenia usunięcia wydarzenia z szczegółami wydarzenia
- **Główne elementy:** PrimeVue ConfirmDialog z informacjami o wydarzeniu, przyciskami potwierdzenia i anulowania
- **Obsługiwane interakcje:** Potwierdzenie lub anulowanie usunięcia przez ConfirmDialog
- **Obsługiwana walidacja:** Sprawdzenie czy wydarzenie może być usunięte (przyszłe wydarzenie)
- **Typy:** `EventListItemDto`
- **Propsy:** Brak (używa Pinia store i PrimeVue ConfirmDialog service)

### EventFormContainer
- **Opis komponentu:** Wrapper dla formularzy wydarzeń, analogiczny do AuthFormContainer
- **Główne elementy:** Div kontener z PrimeVue Card, padding, shadow, tytuł formularza
- **Obsługiwane interakcje:** Slot dla zawartości formularza
- **Obsługiwana walidacja:** Brak
- **Typy:** `string` (title)
- **Propsy:** `title: string`

### EventFormMessages
- **Opis komponentu:** Komponent wyświetlania komunikatów błędów i sukcesu, analogiczny do AuthFormMessages
- **Główne elementy:** Div kontenery z ikonami i kolorami dla błędów i sukcesu
- **Obsługiwane interakcje:** Automatyczne pokazanie/ukrycie na podstawie stanu
- **Obsługiwana walidacja:** Brak
- **Typy:** `string` (error, success)
- **Propsy:** `error?: string`, `success?: string`

## 5. Typy

### Zod Schemas
```typescript
// src/features/events/schemas/eventSchemas.ts
import { z } from 'zod';

// Base validation schemas
const eventNameSchema = z.string()
  .min(1, 'Event name is required')
  .max(100, 'Event name must be less than 100 characters')
  .trim();

const countrySchema = z.string()
  .min(1, 'Country is required')
  .max(50, 'Country must be less than 50 characters')
  .trim();

const citySchema = z.string()
  .min(1, 'City is required')
  .max(50, 'City must be less than 50 characters')
  .trim();

const venueNameSchema = z.string()
  .min(1, 'Venue name is required')
  .max(100, 'Venue name must be less than 100 characters')
  .trim();

const eventDateSchema = z.string()
  .min(1, 'Event date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((date) => {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }, 'Event date must be today or in the future')
  .refine((date) => {
    const eventDate = new Date(date);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return eventDate <= oneYearFromNow;
  }, 'Event date must be within one year from today');

const eventTimeSchema = z.string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  .optional()
  .or(z.literal(''));

// Create event form schema
export const createEventSchema = z.object({
  event_name: eventNameSchema,
  country: countrySchema,
  city: citySchema,
  venue_name: venueNameSchema,
  event_date: eventDateSchema,
  event_time: eventTimeSchema,
});

// Update event form schema (identical to create)
export const updateEventSchema = createEventSchema;

// TypeScript types derived from schemas
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
```

### Store Types
```typescript
// src/features/events/types/index.ts
export interface EventFormErrors {
  event_name?: string
  country?: string
  city?: string
  venue_name?: string
  event_date?: string
  event_time?: string
  general?: string
}

export interface EventFormState {
  isLoading: boolean
  isValid: boolean
  isDirty: boolean
  errors: EventFormErrors
}

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

export interface EventsListState {
  sortField: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  searchTerm: string
}
```

## 6. Zarządzanie stanem

### useEventsManagementStore (główny stan z Pinia)
**Cel:** Zarządzanie operacjami CRUD na wydarzeniach oraz globalnym stanem widoku
**Lokalizacja:** `src/features/events/stores/useEventsManagementStore.ts`

**Stan:**
- `state`: EventsManagementState
- `formState`: EventFormState
- `user`: User | null (z auth store)
- `isLoading`: boolean (z useStoreErrorHandling)
- `error`: string | null (z useStoreErrorHandling)

**Getters (computed):**
- `isAuthenticated`: Sprawdzenie uwierzytelnienia
- `upcomingEventsCount`: Liczba przyszłych wydarzeń
- `pastEventsCount`: Liczba przeszłych wydarzeń
- `canCreateEvents`: Czy użytkownik może tworzyć wydarzenia
- `isFormValid`: Walidacja formularza

**Actions:**
- `loadEvents(page?, limit?)`: Ładowanie wydarzeń z API
- `createEvent(data: CreateEventFormData)`: Tworzenie nowego wydarzenia
- `updateEvent(id: string, data: UpdateEventFormData)`: Aktualizacja wydarzenia
- `deleteEvent(id: string)`: Usuwanie wydarzenia
- `toggleAddForm()`: Przełączanie widoczności formularza
- `setEditingEvent(id: string | null)`: Ustawianie edytowanego wydarzenia
- `setDeletingEvent(id: string | null)`: Ustawianie usuwanego wydarzenia

### useEventFormStore (stan formularza z Pinia)
**Cel:** Obsługa walidacji formularza i stanu pól, podobnie do useProfileFormStore
**Lokalizacja:** `src/features/events/stores/useEventFormStore.ts`

**Stan:**
- `formData`: CreateEventFormData | UpdateEventFormData
- `formState`: EventFormState
- `mode`: 'create' | 'edit'
- `isDirty`: boolean

**Getters (computed):**
- `isFormValid`: Walidacja przez Zod
- `hasErrors`: Czy są błędy walidacji
- `canSubmit`: Czy można przesłać formularz

**Actions:**
- `validateField(field: string, value: any)`: Walidacja pojedynczego pola
- `validateForm()`: Walidacja całego formularza przez Zod
- `resetForm()`: Resetowanie formularza
- `setFieldValue(field: string, value: any)`: Ustawianie wartości pola
- `setFieldError(field: string, error: string)`: Ustawianie błędu pola
- `clearFieldError(field: string)`: Czyszczenie błędu pola
- `loadEventForEdit(eventId: string)`: Ładowanie danych do edycji

## 7. Integracja API

### GET /api/events
**Typ żądania:** `EventsQueryParams`
```typescript
{
  user_id?: string
  upcoming_only?: boolean
  page?: number
  limit?: number
}
```
**Typ odpowiedzi:** `EventsListResponseDto`
**Użycie:** useApiClient z useStoreErrorHandling

### POST /api/events
**Typ żądania:** `CreateEventCommand` (z CreateEventFormData)
**Typ odpowiedzi:** `EventResponseDto`
**Użycie:** useApiClient z error handling przez Pinia store

### PUT /api/events/{id}
**Typ żądania:** `UpdateEventCommand` (z UpdateEventFormData)
**Typ odpowiedzi:** `EventResponseDto`
**Użycie:** useApiClient z error handling przez Pinia store

### DELETE /api/events/{id}
**Typ żądania:** Brak
**Typ odpowiedzi:** `SuccessMessageDto`
**Użycie:** useApiClient z PrimeVue ConfirmDialog

**Obsługa błędów zgodnie ze standardami projektu:**
- 400: Błędy walidacji - mapowanie na formErrors w store
- 401: Brak autoryzacji - przekierowanie przez middleware
- 403: Brak uprawnień - Toast notification
- 404: Wydarzenie nie znalezione - Toast i odświeżenie listy
- 500: Błąd serwera - useStoreErrorHandling

## 8. Implementacja formularzy z Vee-Validate

### AddEventForm Implementation
```vue
<template>
  <EventFormContainer title="Add New Event">
    <form @submit="onSubmit" class="space-y-6">
      <!-- Event Name -->
      <div class="animate-fade-in">
        <label for="event-name" class="block text-sm font-medium text-gray-700 mb-1">
          Event Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="event-name"
          v-model="event_name"
          placeholder="Enter event name"
          :class="{ 'p-invalid': event_nameError }"
          :disabled="isLoading"
          class="w-full"
        />
        <p v-if="event_nameError" class="p-error text-red-600">{{ event_nameError }}</p>
      </div>

      <!-- Country -->
      <div class="animate-fade-in">
        <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
          Country <span class="text-red-500">*</span>
        </label>
        <InputText
          id="country"
          v-model="country"
          placeholder="Enter country"
          :class="{ 'p-invalid': countryError }"
          :disabled="isLoading"
          class="w-full"
        />
        <p v-if="countryError" class="p-error text-red-600">{{ countryError }}</p>
      </div>

      <!-- Event Date -->
      <div class="animate-fade-in">
        <label for="event-date" class="block text-sm font-medium text-gray-700 mb-1">
          Event Date <span class="text-red-500">*</span>
        </label>
        <Calendar
          id="event-date"
          v-model="event_date"
          :min-date="new Date()"
          :max-date="getMaxDate()"
          :class="{ 'p-invalid': event_dateError }"
          :disabled="isLoading"
          class="w-full"
        />
        <p v-if="event_dateError" class="p-error text-red-600">{{ event_dateError }}</p>
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        label="Create Event"
        :loading="isLoading"
        :disabled="!meta.valid || isLoading"
        class="w-full"
      />

      <!-- Messages -->
      <EventFormMessages :error="error" :success="success" />
    </form>
  </EventFormContainer>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createEventSchema } from '../schemas/eventSchemas';
import { useEventsManagementStore } from '../stores/useEventsManagementStore';

const eventsStore = useEventsManagementStore();

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(createEventSchema),
});

const { value: event_name, errorMessage: event_nameError } = useField<string>('event_name');
const { value: country, errorMessage: countryError } = useField<string>('country');
const { value: event_date, errorMessage: event_dateError } = useField<string>('event_date');
// ... other fields

const onSubmit = handleSubmit(async (values) => {
  await eventsStore.createEvent(values);
});
</script>
```

## 9. Interakcje użytkownika

### Dodawanie wydarzenia (z Vee-Validate)
1. Kliknięcie "Dodaj wydarzenie" → eventsStore.toggleAddForm()
2. Wypełnienie pól → Vee-Validate real-time validation z Zod schema
3. Wybór daty → Calendar component z walidacją zakresu dat
4. Przesłanie formularza → handleSubmit, eventsStore.createEvent(), ukrycie formularza

### Edycja wydarzenia
1. Kliknięcie "Edytuj" → eventsStore.setEditingEvent(id), ładowanie danych do formularza
2. Modyfikacja danych → Vee-Validate + Zod validation
3. Zapisanie → handleSubmit, eventsStore.updateEvent(), aktualizacja listy

### Usuwanie wydarzenia
1. Kliknięcie "Usuń" → PrimeVue ConfirmDialog service
2. Potwierdzenie → eventsStore.deleteEvent(), ukrycie dialogu, aktualizacja listy

## 10. Warunki i walidacja

### Walidacja Zod Schema:
- **event_name**: required, 1-100 chars, trimmed
- **country**: required, 1-50 chars, trimmed
- **city**: required, 1-50 chars, trimmed  
- **venue_name**: required, 1-100 chars, trimmed
- **event_date**: required, YYYY-MM-DD, today+ ≤ 1 year
- **event_time**: optional, HH:MM format

### Walidacja biznesowa w store:
- Tylko uwierzytelnieni użytkownicy (authStore.isAuthenticated)
- Tylko własne wydarzenia (user_id check)
- Tylko przyszłe wydarzenia dla edit/delete

### PrimeVue komponenty z walidacją:
- InputText z :class="{ 'p-invalid': fieldError }"
- Calendar z :min-date i :max-date
- Wszystkie pola z :disabled="isLoading"

## 11. Obsługa błędów

### Błędy walidacji formularza (Vee-Validate + Zod)
- **Wyświetlanie:** `<p v-if="fieldError" class="p-error">{{ fieldError }}</p>`
- **Obsługa:** Automatyczna przez Vee-Validate z Zod schema
- **Czyszczenie:** Automatyczne przy poprawnej walidacji

### Błędy API (useStoreErrorHandling pattern)
- **400 Bad Request:** Mapowanie błędów API na formErrors w store
- **401 Unauthorized:** Obsługa przez middleware
- **403 Forbidden:** PrimeVue Toast notification
- **404 Not Found:** Toast + odświeżenie listy
- **500 Server Error:** useStoreErrorHandling pattern

### EventFormMessages (analogicznie do AuthFormMessages)
```vue
<template>
  <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
    <p class="text-sm text-red-700">{{ error }}</p>
  </div>
  <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
    <p class="text-sm text-green-700">{{ success }}</p>
  </div>
</template>
```

## 12. Kroki implementacji

### Krok 1: Przygotowanie struktury i schematów
1. Utworzenie `src/features/events/schemas/eventSchemas.ts` z Zod schemas
2. Utworzenie `src/features/events/types/index.ts` z TypeScript types
3. Utworzenie katalogu `src/features/events/components/`
4. Utworzenie katalogu `src/features/events/stores/`

### Krok 2: Implementacja Pinia stores
1. Utworzenie `useEventsManagementStore.ts` z CRUD operations
2. Utworzenie `useEventFormStore.ts` z form state management
3. Integracja z useApiClient i useStoreErrorHandling

### Krok 3: Implementacja shared komponentów
1. `EventFormContainer.vue` (analogicznie do AuthFormContainer)
2. `EventFormMessages.vue` (analogicznie do AuthFormMessages)
3. Współdzielone styles i animacje

### Krok 4: Implementacja formularzy z Vee-Validate
1. `AddEventForm.vue` z PrimeVue + Vee-Validate + Zod
2. `EditEventForm.vue` z przedwypełnionymi danymi
3. Integracja z Pinia stores dla state management

### Krok 5: Implementacja listy wydarzeń
1. `EventsList.vue` z PrimeVue DataTable
2. `EventItem.vue` jako template dla wierszy tabeli
3. Implementacja sortowania i paginacji

### Krok 6: Implementacja głównego widoku
1. `EventsManagementView.vue` jako główny kontener
2. `src/pages/dashboard/events.astro` z Layout
3. Integracja wszystkich komponentów

### Krok 7: Implementacja akcji użytkownika
1. PrimeVue ConfirmDialog dla usuwania
2. Toast notifications dla komunikatów
3. Loading states i error handling

### Krok 8: Testy i walidacja
1. Testowanie wszystkich scenariuszy walidacji Zod
2. Testowanie interakcji Vee-Validate
3. Testowanie responsywności PrimeVue komponentów

### Krok 9: Integracja z dashboardem
1. Dodanie linku w nawigacji
2. Aktualizacja quick actions w dashboard
3. Integracja statystyk wydarzeń

### Krok 10: Finalizacja
1. Optymalizacja wydajności Pinia stores
2. Implementacja proper error boundaries
3. Finalne testy E2E z Playwright 