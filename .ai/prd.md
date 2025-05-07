# Dokument wymagań produktu (PRD) - Techno Ambassador

## 1. Przegląd produktu

Techno Ambassador to platforma skupiająca wszystkie cykle imprez oraz eventy związane z muzyką techno. Głównym celem produktu jest umożliwienie użytkownikom sprawdzenia ocen eventów oraz oddawania ocen i komentarzy na zakończone eventy. System integruje dane o lokalizacji eventów pobrane z Facebooka przy użyciu technologii AI, a administratorzy mają możliwość zatwierdzania lub uzupełniania tych danych. Platforma umożliwia również monitorowanie działań użytkowników przez integrację z narzędziami analitycznymi (np. Google Analytics).

## 2. Problem użytkownika

Użytkownicy muzycznych eventów techno nie mają centralnego miejsca, gdzie mogliby oceniać i komentować wydarzenia, a także zapoznawać się ze szczegółami takich imprez. Problem ten powoduje, że:

- Brakuje wiarygodnej oceny eventów, co utrudnia wybór wartościowych imprez.
- Brakuje możliwości dzielenia się opiniami i doświadczeniami po zakończeniu eventu.
- Użytkownicy nie mają wglądu w oceny innych uczestników, co utrudnia ocenę potencjalnych wydarzeń.
- Organizatorzy imprez nie wiedzą w któym kierunku rowijać wydarzenia

## 3. Wymagania funkcjonalne

1. Użytkownik musi być zalogowany, aby móc oddać głos i dodać komentarz.
2. System umożliwia oddanie jednego głosu na zakończony event przez jednego użytkownika, jednak użytkownik może edytować swój głos bez ograniczeń czasowych.
3. Administrator (root) ma prawo dodawać eventy poprzez wprowadzenie wymaganych danych: daty, opisu oraz lokalizacji.
4. Integracja z AI do pobierania danych o lokalizacji eventów z Facebooka, z możliwością zatwierdzenia lub ręcznego uzupełnienia brakujących informacji przez administratora.
5. Integracja z narzędziami analitycznymi (np. Google Analytics) w celu monitorowania istotnych wskaźników sukcesu.
6. System umożliwia rejestrację nowych użytkowników poprzez formularz rejestracyjny, który nie wymaga dodatkowych kroków weryfikacyjnych, jednak dane wprowadzone podczas rejestracji są walidowane w celu zapewnienia bezpieczeństwa dostępu.

## 4. Granice produktu

1. System nie obejmuje zaawansowanych mechanizmów rejestracji i zarządzania kontami; ogranicza się do podstawowego uwierzytelniania.
2. Funkcjonalność dodawania eventów jest dostępna wyłącznie dla administratora (root), a użytkownicy nie mogą zgłaszać własnych eventów.
3. Integracja danych z AI dotyczy wyłącznie pobierania lokalizacji z Facebooka, a inne dane eventów wprowadzane są ręcznie.
4. System nie przewiduje dodatkowych ról użytkowników poza rolą zwykłego użytkownika i administratorem.

## 5. Historyjki użytkowników

US-001
Tytuł: Użytkownik loguje się do systemu
Opis: Jako użytkownik, chcę móc się zalogować do systemu, aby uzyskać dostęp do możliwości oceniania eventów.
Kryteria akceptacji:

- Użytkownik musi wprowadzić poprawne dane logowania.
- System umożliwia odzyskanie hasła.
- Uwierzytelnianie odbywa się w sposób bezpieczny.

US-002
Tytuł: Użytkownik przegląda listę eventów
Opis: Jako zalogowany użytkownik, chcę mieć możliwość przeglądania listy zakończonych eventów, aby móc zdecydować, na który event oddać głos i dodać komentarz.
Kryteria akceptacji:

- Lista eventów jest aktualna i zawiera wszystkie zakończone wydarzenia.
- Użytkownik widzi podstawowe informacje, takie jak data, opis i lokalizacja wydarzenia.
- Interfejs jest responsywny i intuicyjny.

US-003
Tytuł: Użytkownik oddaje głos i dodaje komentarz do eventu
Opis: Jako zalogowany użytkownik, chcę móc oddać jeden głos (w skali 1-5) na zakończony event oraz dodać do niego komentarz, aby wyrazić swoją opinię.
Kryteria akceptacji:

- Użytkownik może oddać tylko jeden głos na dany event.
- Głos jest w skali 1-5.
- Komentarz można dodać jednocześnie z oddaniem głosu.
- Po oddaniu głosu użytkownik może edytować swój głos i komentarz bez ograniczeń czasowych.

US-004
Tytuł: Użytkownik edytuje oddany głos i komentarz
Opis: Jako zalogowany użytkownik, chcę móc edytować mój głos i komentarz, który już oddałem, aby zaktualizować swoją opinię po refleksji lub zmianach.
Kryteria akceptacji:

- Edycja głosu nie jest ograniczona czasowo.
- Użytkownik widzi możliwość edycji przy każdym zakończonym evencie, na który już oddał głos.
- Zmiany są natychmiast zapisywane i widoczne.
- Może oddać tylko raz głos

US-005
Tytuł: Administrator dodaje nowy event
Opis: Jako administrator, chcę mieć możliwość dodania nowego eventu, wprowadzając wymagane dane takie jak data, opis i lokalizacja, aby móc publicznie udostępnić wydarzenie.
Kryteria akceptacji:

- Formularz dodawania eventu zawiera pola: data, opis, lokalizacja.
- Wprowadzone dane są walidowane przed zapisaniem.
- Administrator otrzymuje potwierdzenie dodania eventu.

US-006
Tytuł: Administrator zatwierdza lub uzupełnia dane z integracji AI
Opis: Jako administrator, chcę móc zatwierdzić dane dotyczące lokalizacji pobrane z integracji z AI (Facebook) lub uzupełnić brakujące informacje, aby zapewnić kompletność danych eventu.
Kryteria akceptacji:

- System pobiera dane o lokalizacji eventu z Facebooka.
- Jeśli dane są niekompletne, administrator ma możliwość ich uzupełnienia.
- Po zatwierdzeniu, dane są widoczne w szczegółach eventu.

US-007
Tytuł: Bezpieczne uwierzytelnianie użytkownika
Opis: Jako użytkownik, chcę mieć pewność, że moje dane są chronione podczas logowania do systemu, co zapewnia bezpieczny dostęp do aplikacji.
Kryteria akceptacji:

- System stosuje zabezpieczenia przy przesyłaniu danych logowania.
- Uwierzytelnianie odbywa się przy użyciu bezpiecznych protokołów (np. HTTPS).
- W przypadku nieudanej próby logowania, użytkownik otrzymuje jasny komunikat błędu.

US-008
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik, chcę móc zarejestrować swoje konto, aby uzyskać dostęp do pełnej funkcjonalności platformy, w tym oddawania głosów i komentowania eventów.
Kryteria akceptacji:

- Formularz rejestracji powinien zawierać pola: adres email, nazwa użytkownika, hasło, potwierdzenie hasła.
- Dane wprowadzone w formularzu muszą być walidowane, w tym poprawność formatu email oraz zgodność haseł.
- Po udanej rejestracji użytkownik zostaje automatycznie zalogowany lub przekierowany do strony logowania.
- W przypadku błędów użytkownik otrzymuje jasne komunikaty o błędach.

## 6. Metryki sukcesu

1. Co najmniej 65% zalogowanych użytkowników oddaje jeden głos na zakończone eventy w każdym tygodniu.
2. Co najmniej 33% użytkowników, którzy oddali głos, dodaje również komentarz.
3. Wskaźniki te są monitorowane poprzez integrację z narzędziami analitycznymi (np. Google Analytics).
4. System skutecznie wykrywa i loguje duplikaty głosów oraz komentarzy.
5. Wskaźniki logowania akcji użytkowników potwierdzają, że uwierzytelnianie odbywa się w sposób bezpieczny.
