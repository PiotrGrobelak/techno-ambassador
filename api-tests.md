# API Testing for /api/users endpoint

This file contains curl commands to test the user creation endpoint and associated service functionality.

## Setup

Replace `http://localhost:4321` with your actual server URL and port.
Replace the music style UUIDs with actual UUIDs from your database.

---

## 1. Valid User Creation (Happy Path)

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "DJ TestBeat",
    "biography": "An upcoming techno artist with a passion for dark, industrial sounds. Started mixing in underground clubs and now performs at major festivals.",
    "instagram_url": "https://instagram.com/djtestbeat",
    "facebook_url": "https://facebook.com/djtestbeat",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

---

## 2. Minimal Valid User (Required Fields Only)

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "MinimalTechno",
    "biography": "Minimalist approach to techno music with deep bass lines.",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

---

## 3. Missing Required Fields (Should Return 400)

### Missing artist_name

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "biography": "Artist without a name",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

### Missing biography

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "NoBioArtist",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

### Missing music_style_ids

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "NoStyleArtist",
    "biography": "Artist without music styles"
  }'
```

---

## 4. Invalid Data Formats

### Empty music_style_ids array

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "EmptyStylesArtist",
    "biography": "Artist with no music styles",
    "music_style_ids": []
  }'
```

### Invalid UUID format in music_style_ids

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "InvalidUUIDartist",
    "biography": "Artist with invalid UUID",
    "music_style_ids": [
      "not-a-valid-uuid",
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

### Invalid social media URLs

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "BadURLArtist",
    "biography": "Artist with invalid URLs",
    "instagram_url": "not-a-valid-url",
    "facebook_url": "also-not-valid",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

---

## 5. Duplicate Artist Name (Should Return 409 or 400)

```bash
# First, create a user
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "DuplicateTest",
    "biography": "First user with this name",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'

# Then try to create another user with the same artist_name
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "DuplicateTest",
    "biography": "Second user with same name - should fail",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

---

## 6. Non-existent Music Style IDs

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "NonExistentStyleArtist",
    "biography": "Artist with non-existent music style",
    "music_style_ids": [
      "00000000-0000-0000-0000-000000000000",
      "11111111-1111-1111-1111-111111111111"
    ]
  }'
```

---

## 7. Invalid JSON Format

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "InvalidJSON",
    "biography": "This JSON is malformed"
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001"
    ]
  }'
```

---

## 8. Very Long Field Values (Edge Case Testing)

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "VeryLongArtistNameThatExceedsNormalLimitsAndShouldBeTestedForValidation",
    "biography": "This is an extremely long biography that tests the limits of the biography field validation. It contains multiple sentences and goes on for quite a while to test how the system handles very long text inputs. This should help identify any character limits or performance issues with long text processing in the user creation endpoint and service layer.",
    "instagram_url": "https://instagram.com/verylongusernamethatmightcauseissues",
    "facebook_url": "https://facebook.com/anotherlongusernamethatcouldbetroublesome",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ]
  }'
```

---

## 9. Mixed Valid and Invalid Data

```bash
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "artist_name": "MixedValidityArtist",
    "biography": "Valid biography",
    "instagram_url": "valid-url-format",
    "facebook_url": "https://facebook.com/validuser",
    "music_style_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "invalid-uuid",
      "550e8400-e29b-41d4-a716-446655440003"
    ]
  }'
```

---

## 10. Different Content-Type Headers (Should Fail)

```bash
# Missing Content-Type header
curl -X POST http://localhost:4321/api/users \
  -d '{
    "artist_name": "NoContentType",
    "biography": "Testing without content type",
    "music_style_ids": ["550e8400-e29b-41d4-a716-446655440001"]
  }'

# Wrong Content-Type header
curl -X POST http://localhost:4321/api/users \
  -H "Content-Type: text/plain" \
  -d '{
    "artist_name": "WrongContentType",
    "biography": "Testing with wrong content type",
    "music_style_ids": ["550e8400-e29b-41d4-a716-446655440001"]
  }'
```

---

## Expected Responses

### Success (201 Created)

```json
{
  "data": {
    "id": "uuid-here",
    "artist_name": "DJ TestBeat",
    "biography": "An upcoming techno artist...",
    "instagram_url": "https://instagram.com/djtestbeat",
    "facebook_url": "https://facebook.com/djtestbeat",
    "music_styles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "style_name": "Techno"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "style_name": "Industrial"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Validation Error (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "artist_name",
      "message": "Required"
    }
  ]
}
```

### Business Logic Error (400/409)

```json
{
  "error": "Artist name already exists"
}
```

---

## Notes for Testing

1. **Music Style IDs**: Before testing, you'll need actual music style UUIDs from your database. You can get these by querying the `music_styles` table.

2. **Database State**: Some tests (like duplicate artist name) depend on the current state of your database.

3. **Server URL**: Update the localhost URL to match your development server.

4. **Rate Limiting**: If you have rate limiting implemented, space out your requests appropriately.

5. **Environment**: These tests assume a development environment. Be cautious when running against production data.

6. **Cleanup**: After testing, you may want to clean up test data from your database.
