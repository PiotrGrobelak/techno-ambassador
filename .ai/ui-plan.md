# Architektura UI dla Techno Ambassador

## 1. Przegląd struktury UI

Techno Ambassador to platforma kalendarzowa dla DJ-ów zbudowana w oparciu o Astro 5 z Vue 3 komponentami dla interaktywności. Architektura UI wykorzystuje PrimeVue jako główną bibliotekę komponentów, Tailwind 4 dla stylizacji oraz mobile-first approach z progressive enhancement. Struktura opiera się na dwóch głównych grupach użytkowników: DJ-ów zarządzających swoimi profilami i kalendarzami oraz fanów/organizatorów przeglądających i wyszukujących artystów.

## 2. Lista widoków

### 2.1 Strona główna (/)

- **Główny cel**: Punkt wejścia do platformy z centralną funkcją wyszukiwania DJ-ów
- **Kluczowe informacje**: Hero section z opisem platformy, wyszukiwarka DJ-ów, lista wyników wyświetlana domyślnie
- **Kluczowe komponenty**:
  - Hero section z opisem platformy
  - SearchFilters (nazwa DJ-a, styl muzyczny)
  - DJList z DJCard komponentami
  - LoadMoreButton dla paginacji
- **UX/Dostępność/Bezpieczeństwo**:
  - Debouncing (300ms) dla wyszukiwania
  - Skeleton loading dla wyników
  - ARIA labels dla wyszukiwarki
  - Publiczny dostęp bez autoryzacji

### 2.2 Lista DJ-ów (/djs)

- **Główny cel**: Pełna lista wszystkich DJ-ów z zaawansowanymi filtrami
- **Kluczowe informacje**: Kompletna lista DJ-ów, filtry po lokalizacji, stylu muzycznym, dostępności, nazwie
- **Kluczowe komponenty**:
  - AdvancedSearchFilters (wszystkie opcje filtrowania)
  - DJList w formacie listy (bez grid view)
  - FilterSidebar na desktop, FilterDrawer na mobile
  - Pagination z load more button
- **UX/Dostępność/Bezpieczeństwo**:
  - Responsive filtry z PrimeVue Sidebar na mobile
  - Keyboard navigation dla filtrów
  - Empty state "Nie znaleziono żadnych danych"
  - Real-time aktualizacja wyników

### 2.3 Profil DJ-a (/dj/{artist-name})

- **Główny cel**: Szczegółowe informacje o DJ-u i jego kalendarz eventów
- **Kluczowe informacje**: Biografia, style muzyczne, social media, lista eventów (nadchodzące i przeszłe)
- **Kluczowe komponenty**:
  - DJProfileHeader (zdjęcie, nazwa, biografia)
  - MusicStylesList
  - SocialMediaLinks (bezpośrednie linki)
  - EventsList (podział na nadchodzące/przeszłe)
  - ContactSection
- **UX/Dostępność/Bezpieczeństwo**:
  - SEO-friendly URL structure
  - Bezpośrednie linki do social media (bez modali)
  - Screen reader support dla wszystkich sekcji
  - Publiczny dostęp

### 2.4 Rejestracja DJ-a (/register)

- **Główny cel**: Tworzenie nowego konta DJ-a w systemie
- **Kluczowe informacje**: Formularz rejestracji z wymaganymi polami
- **Kluczowe komponenty**:
  - RegistrationForm (nazwa artysty, biografia, style muzyczne)
  - MusicStyleSelector
  - SocialMediaInputs
  - FormValidation
- **UX/Dostępność/Bezpieczeństwo**:
  - Inline validation z real-time feedback
  - Walidacja unikalności nazwy artysty
  - WCAG compliance dla formularzy
  - Supabase Auth integration

### 2.5 Logowanie (/login)

- **Główny cel**: Autoryzacja istniejących użytkowników
- **Kluczowe informacje**: Formularz logowania
- **Kluczowe komponenty**:
  - LoginForm
  - AuthErrorHandling
  - RedirectLogic
- **UX/Dostępność/Bezpieczeństwo**:
  - Focus management
  - Error handling z PrimeVue Toast
  - Secure authentication z Supabase
  - Redirect po udanym logowaniu

### 2.6 Dashboard DJ-a (/dashboard)

- **Główny cel**: Główny panel zarządzania dla DJ-ów
- **Kluczowe informacje**: Kalendarz eventów (główny element), podstawowe zarządzanie profilem
- **Kluczowe komponenty**:
  - DashboardSidebar (nawigacja)
  - EventsCalendarOverview (na górze)
  - ProfileManagementSection (na dole)
  - QuickActions
- **UX/Dostępność/Bezpieczeństwo**:
  - Sidebar navigation z collapsible menu na mobile
  - Kalendarz jako najważniejszy element
  - Brak statystyk w MVP
  - Autoryzacja wymagana (RLS)

### 2.7 Zarządzanie eventami (/dashboard/events)

- **Główny cel**: CRUD operacje na eventach DJ-a
- **Kluczowe informacje**: Lista eventów z opcjami edycji, formularz dodawania nowych eventów
- **Kluczowe komponenty**:
  - EventsList (z opcjami edycji/usuwania)
  - AddEventForm
  - EditEventForm
  - EventValidation
- **UX/Dostępność/Bezpieczeństwo**:
  - Real-time walidacja dat (tylko przyszłe)
  - Inline validation
  - PrimeVue Calendar component
  - Brak bulk actions w MVP
  - Tylko własne eventy (RLS)

### 2.8 Edycja profilu (/dashboard/profile)

- **Główny cel**: Aktualizacja informacji w profilu DJ-a
- **Kluczowe informacje**: Formularz edycji wszystkich danych profilu
- **Kluczowe komponenty**:
  - ProfileEditForm
  - MusicStyleSelector
  - SocialMediaInputs
  - ProfilePreview
- **UX/Dostępność/Bezpieczeństwo**:
  - Standardowe formularze bez preview
  - Inline validation
  - Walidacja wymaganych pól
  - Tylko własny profil (RLS)

## 3. Mapa podróży użytkownika

### 3.1 Ścieżka fana/organizatora eventów

1. **Strona główna** → Wpisanie nazwy DJ-a lub wybór stylu muzycznego
2. **Wyniki wyszukiwania** → Przeglądanie listy DJ-ów, filtrowanie
3. **Profil DJ-a** → Sprawdzenie biografii, kalendarza eventów
4. **Kontakt** → Kliknięcie w link do social media, przejście do zewnętrznej platformy

### 3.2 Ścieżka DJ-a - pierwsza wizyta

1. **Strona główna** → Kliknięcie "Jestem DJ-em"
2. **Rejestracja** → Wypełnienie formularza z danymi profilu
3. **Dashboard** → Przegląd głównego panelu
4. **Zarządzanie eventami** → Dodanie pierwszych eventów do kalendarza
5. **Edycja profilu** → Uzupełnienie dodatkowych informacji

### 3.3 Ścieżka DJ-a - powracający użytkownik

1. **Logowanie** → Autoryzacja w systemie
2. **Dashboard** → Przegląd kalendarza i aktualności
3. **Zarządzanie eventami** → Dodanie/edycja eventów
4. **Edycja profilu** → Aktualizacja informacji w razie potrzeby

### 3.4 Ścieżka przeglądania ogólnego

1. **Strona główna** → Przeglądanie domyślnej listy DJ-ów
2. **Lista DJ-ów** → Użycie zaawansowanych filtrów
3. **Profil DJ-a** → Szczegółowe informacje o wybranym artyście
4. **Powrót do listy** → Kontynuacja przeglądania

## 4. Układ i struktura nawigacji

### 4.1 Główna nawigacja (MenuBar z PrimeVue)

- **Desktop**: Poziomy pasek nawigacji z logo, menu główne, przyciski logowania
- **Mobile**: Hamburger menu z collapsible navigation
- **Elementy**:
  - Logo (link do strony głównej)
  - "Znajdź DJ-a" (link do listy DJ-ów)
  - "Jestem DJ-em" (link do rejestracji/dashboardu)
  - Logowanie/Profil użytkownika

### 4.2 Nawigacja w dashboardzie (Sidebar)

- **Desktop**: Stały sidebar po lewej stronie
- **Mobile**: Collapsible sidebar z overlay
- **Elementy**:
  - Dashboard (przegląd)
  - Zarządzanie eventami
  - Edycja profilu
  - Ustawienia konta
  - Wylogowanie

### 4.3 Breadcrumbs

- Implementowane na głębszych poziomach nawigacji
- Szczególnie w dashboardzie i formularzach edycji
- Format: Strona główna > Dashboard > Zarządzanie eventami

### 4.4 Bottom navigation (Mobile)

- Do określenia w trakcie implementacji
- Potencjalne elementy: Strona główna, Wyszukaj, Dashboard (dla DJ-ów)

## 5. Kluczowe komponenty

### 5.1 DJCard

- **Cel**: Prezentacja podstawowych informacji o DJ-u w listach
- **Zawartość**: Nazwa artysty, style muzyczne, najbliższy event, link do profilu
- **Wykorzystanie**: Strona główna, lista DJ-ów
- **Funkcjonalności**: Hover effects, responsive design, accessibility support

### 5.2 EventCard

- **Cel**: Wyświetlanie informacji o pojedynczym evencie
- **Zawartość**: Nazwa eventu, lokalizacja, data, czas
- **Wykorzystanie**: Profile DJ-ów, dashboard, zarządzanie eventami
- **Funkcjonalności**: Status (przyszły/przeszły), opcje edycji dla właściciela

### 5.3 SearchFilters

- **Cel**: Filtrowanie listy DJ-ów
- **Zawartość**: Pole tekstowe (nazwa), selector (style muzyczne), filtry lokalizacji i dostępności
- **Wykorzystanie**: Strona główna, lista DJ-ów
- **Funkcjonalności**: Debouncing, real-time results, clear filters

### 5.4 EventForm

- **Cel**: Dodawanie i edycja eventów
- **Zawartość**: Nazwa eventu, lokalizacja (kraj, miasto, venue), data, czas
- **Wykorzystanie**: Zarządzanie eventami
- **Funkcjonalności**: Real-time validation, date picker z ograniczeniami, inline errors

### 5.5 ProfileForm

- **Cel**: Tworzenie i edycja profili DJ-ów
- **Zawartość**: Nazwa artysty, biografia, style muzyczne, social media
- **Wykorzystanie**: Rejestracja, edycja profilu
- **Funkcjonalności**: Multi-select dla stylów, URL validation, character counters

### 5.6 Navigation

- **Cel**: Główna nawigacja aplikacji
- **Zawartość**: Logo, menu główne, user actions
- **Wykorzystanie**: Wszystkie strony
- **Funkcjonalności**: Responsive design, active states, accessibility

### 5.7 DashboardSidebar

- **Cel**: Nawigacja w panelu DJ-a
- **Zawartość**: Menu opcji dashboardu, user info, logout
- **Wykorzystanie**: Wszystkie strony dashboardu
- **Funkcjonalności**: Collapsible na mobile, active states, role-based visibility

### 5.8 LoadingStates

- **Cel**: Skeleton loading dla różnych typów treści
- **Zawartość**: Skeleton dla list, kart, formularzy
- **Wykorzystanie**: Wszystkie strony z dynamiczną treścią
- **Funkcjonalności**: PrimeVue Skeleton component, responsive placeholders

### 5.9 ErrorHandling

- **Cel**: Obsługa błędów i komunikatów
- **Zawartość**: Toast messages, error boundaries, empty states
- **Wykorzystanie**: Cała aplikacja
- **Funkcjonalności**: PrimeVue Toast, Message components, graceful degradation

### 5.10 AuthGuard

- **Cel**: Ochrona tras wymagających autoryzacji
- **Zawartość**: Sprawdzanie stanu autoryzacji, przekierowania
- **Wykorzystanie**: Dashboard i wszystkie chronione trasy
- **Funkcjonalności**: Supabase Auth integration, automatic redirects, session management
