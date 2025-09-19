# Design Document: Tutor Time Off Feature

## 1. Feature Summary

This feature allows a tutor (admin) to block out specific time ranges in their calendar as "Time Off," making those slots unavailable for student bookings.

---

## 2. Data Model (Firestore)

### `timeOff` Collection

A new root-level collection named `timeOff` will be created.

**Document Shape:** `/timeOff/{timeOffId}`

```typescript
{
  "tutorId": "string",      // UID of the tutor/admin creating the block.
  "startTime": Timestamp,   // Firestore Timestamp for the start of the time off.
  "endTime": Timestamp,     // Firestore Timestamp for the end of the time off.
  "reason": "string",       // Optional: e.g., "Personal Appointment", "Holiday".
  "createdAt": Timestamp,   // Firestore Timestamp when the document was created.
  "createdBy": "string"     // UID of the admin who created the record.
}
```

**Firestore Indexing Notes:**

A composite index will be required for the server-side validation query to function efficiently.

*   **Collection:** `timeOff`
*   **Fields:**
    1.  `tutorId` (Ascending)
    2.  `startTime` (Ascending)
    3.  `endTime` (Ascending)
*   **Query Scope:** Collection

---

## 3. API Surface / Server Actions

Server-side logic will be encapsulated in a new Server Action file.

**File:** `src/app/actions/timeOffActions.ts`

*   **`createTimeOff(formData: FormData)`**:
    *   **Payload:** `startTime`, `endTime`, `reason` (optional).
    *   **Validation (Server-Side):**
        *   User must be an admin.
        *   `startTime` must be before `endTime`.
        *   Checks for overlap with existing *confirmed* bookings for the same tutor. Fails if a conflict exists.
    *   **Action:** Creates a new document in the `timeOff` collection.

*   **`deleteTimeOff(timeOffId: string)`**:
    *   **Payload:** `timeOffId`.
    *   **Validation (Server-Side):** User must be an admin.
    *   **Action:** Deletes the specified document from the `timeOff` collection.

**Modified Server Actions:**

*   **`src/app/actions/slotActions.ts`**:
    *   The `getSlotData` function will be modified to also query and return `timeOff` ranges alongside `booked`, `blocked`, and `priority` ranges.

*   **`src/app/actions/bookingActions.ts`**:
    *   The `createSecureBooking` function must be updated to validate against the `timeOff` collection. It will query `timeOff` to ensure the requested booking slot does not overlap with any of the tutor's time off periods.

---

## 4. UI Changes

*   **New Component:** `src/components/admin/TimeOffManager.tsx`
    *   This component will be a self-contained form for creating and a list for viewing/deleting `timeOff` blocks.
    *   It will be rendered on a new admin page: `src/app/admin/availability/page.tsx`.

*   **Modified Component:** `src/app/bookings/page.tsx`
    *   The UI will render slots that overlap with `timeOff` ranges.
    *   These slots will be **disabled**.
    *   They will have a distinct style (e.g., a yellow or grey hatched pattern).
    *   A tooltip will appear on hover with the UX copy: **"Tutor is unavailable at this time."**

---

## 5. Pseudocode & Algorithms

### `createTimeOff(formData)` - Server Action

```pseudocode
function createTimeOff(formData):
  // 1. Authenticate & Authorize
  user = getCurrentUser()
  if user is not admin:
    return { success: false, error: "Permission denied." }

  // 2. Extract and parse data
  startTime = new Date(formData.get("startTime"))
  endTime = new Date(formData.get("endTime"))
  reason = formData.get("reason")

  // 3. Validate Inputs
  if startTime >= endTime:
    return { success: false, error: "Start time must be before end time." }

  // 4. Check for conflicts with existing CONFIRMED bookings
  conflictingBookings = queryFirestore(
    "bookings",
    where("status", "==", "confirmed"),
    where("startTime", "<", endTime),
    where("endTime", ">", startTime)
  )

  if conflictingBookings is not empty:
    return { success: false, error: "This time off conflicts with an existing booking." }

  // 5. Write to Firestore
  writeToFirestore("timeOff", {
    tutorId: user.uid,
    startTime: toTimestamp(startTime),
    endTime: toTimestamp(endTime),
    reason: reason,
    createdAt: serverTimestamp(),
    createdBy: user.uid
  })

  // 6. Return success
  revalidatePath("/bookings")
  return { success: true }
end function
```

### `generateTimeSlots(...)` - Client-Side Logic

```pseudocode
function generateTimeSlots(date, lessonDuration, bookedRanges, blockedRanges, timeOffRanges, priorityRanges, userPriorityAccess):
  // Hierarchy of unavailability: Blocked > Time Off > Booked
  // Priority is a special case that modifies availability.

  for each potential slot in working hours:
    status = "available"
    isPriority = false

    // 1. Check against absolute unavailability (highest precedence)
    if slot overlaps with blockedRanges:
      status = "blocked"
    else if slot overlaps with timeOffRanges:
      status = "timeOff" // New status for UI
    else if slot overlaps with bookedRanges:
      status = "booked"
    
    // 2. If still available, check for priority status
    if status is "available":
      if slot overlaps with priorityRanges:
        isPriority = true
        if not userPriorityAccess:
          status = "notEligible"

    add { time, display, status, isPriority } to slotList
  
  return slotList
end function
```

### `createSecureBooking(...)` - Server Action (Updated)

```pseudocode
function createSecureBooking(userId, date, startTime, duration, isPriority):
  // ... (existing user checks and priority eligibility checks) ...

  // NEW: Add validation against timeOff collection
  requestedStartTime = toTimestamp(startTime)
  requestedEndTime = toTimestamp(startTime + duration)

  timeOffConflicts = queryFirestore(
    "timeOff",
    where("startTime", "<", requestedEndTime),
    where("endTime", ">", requestedStartTime)
  )

  if timeOffConflicts is not empty:
    return { success: false, error: "The tutor is unavailable at this time." }
  
  // ... (existing overlap checks for bookings and blockedSlots) ...

  // ... (if all checks pass, create booking document) ...

  return { success: true, bookingId: newBookingId }
end function
```

---

## 6. Test Scenarios

*   **Slot Generation:**
    *   **Input:** `timeOff` from 10:00 to 11:00. **Expected Output:** 10:00 and 10:30 slots have status `timeOff`.
    *   **Input:** `blockedSlot` from 11:00 to 12:00, `timeOff` from 11:30 to 12:30. **Expected Output:** 11:00 and 11:30 slots have status `blocked` (blocked takes precedence).
    *   **Input:** `prioritySlot` from 13:00 to 14:00, `timeOff` from 13:30 to 14:30. **Expected Output:** 13:00 is priority/notEligible, 13:30 is `timeOff`.
    *   **Boundary Test:** `timeOff` ends at 15:00. **Expected Output:** 15:00 slot is `available`. (Using a half-open interval convention: `[startTime, endTime)`).

*   **Server Validation:**
    *   **Scenario:** User A (non-priority) attempts to book a priority slot. **Expected:** Server rejects with a priority error.
    *   **Scenario:** Admin adds `timeOff` from 14:00-15:00 where a confirmed booking already exists. **Expected:** `createTimeOff` server action fails with a conflict error.
    *   **Scenario:** User attempts to book a slot from 16:00-17:00. A `timeOff` block exists from 15:30-16:30. **Expected:** `createSecureBooking` server action rejects with "tutor unavailable" error.
    *   **Race Condition:** Same as before, server must reject the second booking attempt.

---

## 7. Acceptance Criteria

*   An admin can create and delete "Time Off" blocks via a new UI in the admin panel.
*   The server **prevents** the creation of a "Time Off" block if it conflicts with an existing *confirmed* student booking.
*   On the student booking page, time slots covered by a "Time Off" block are visually distinct, disabled, and show a tooltip: "Tutor is unavailable at this time."
*   The `createSecureBooking` server action **rejects** any booking attempt that overlaps with a "Time Off" block.
*   All existing unit and integration tests for bookings, priority slots, and blocked slots continue to pass.
*   The feature is hidden behind a feature flag (`FEATURE_TIME_OFF`) and is disabled by default.
