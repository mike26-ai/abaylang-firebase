# Risk Mitigation Plan: Tutor Time Off Feature

This document outlines the top 5 risks associated with implementing the Tutor Time Off feature and the specific actions to mitigate them.

---

### 1. Risk: Server-Side Validation Failure

*   **Description:** A bug in the `createSecureBooking` or `createTimeOff` server actions could allow a conflicting booking or time-off block to be created, leading to a double-booked tutor.
*   **Risk Level:** **High**
*   **Mitigation Actions:**
    1.  **Authoritative Server Logic:** All write operations (`createSecureBooking`, `createTimeOff`) **must** perform their own independent, server-side checks against Firestore at the moment of execution. The client's state is never trusted.
    2.  **Unit & Integration Testing:** Write specific tests for the server actions that simulate conflict scenarios (booking vs. time-off, time-off vs. booking) and assert that the actions correctly return an error.
    3.  **Firestore Emulator:** All tests will be run against a local Firebase Emulator to ensure a clean, predictable environment without affecting live data.

### 2. Risk: Client-Side State Desynchronization

*   **Description:** The booking page UI could show a slot as available, but it becomes unavailable (e.g., an admin adds time-off) just before the user clicks to book.
*   **Risk Level:** **Medium**
*   **Mitigation Actions:**
    1.  **Primary Mitigation:** This is primarily a UX risk because the server-side validation (Risk #1) will prevent the invalid booking.
    2.  **Graceful Error Handling:** The `handleBooking` function on the client will be updated to properly catch the error returned from the server action and display a user-friendly toast notification (e.g., "Sorry, this slot is no longer available. Please select another time.").
    3.  **Data Re-fetching:** The page will automatically re-fetch slot availability after a failed booking attempt to ensure the UI reflects the most current state.

### 3. Risk: Incorrect Timezone Handling

*   **Description:** If client and server times are not handled consistently (e.g., one uses local time while the other uses UTC), overlap checks will fail, allowing double-bookings or incorrectly blocking slots.
*   **Risk Level:** **High**
*   **Mitigation Actions:**
    1.  **Standardize on UTC:** All `Date` objects will be converted to UTC on the server before being stored as Firestore Timestamps.
    2.  **Server-Side Comparison:** All critical overlap validation logic will occur exclusively on the server, using the standardized Firestore Timestamps to prevent any client-side timezone discrepancies from affecting the outcome.
    3.  **Client-Side Display:** The client will receive UTC-based data and be responsible for displaying it in the user's local timezone using libraries like `date-fns`.

### 4. Risk: Performance Degradation

*   **Description:** Adding another Firestore query for `timeOff` blocks on the booking page for every date selection could slow down the user experience.
*   **Risk Level:** **Low**
*   **Mitigation Actions:**
    1.  **Parallel Queries:** The `getSlotData` action already performs queries in parallel. The new query for `timeOff` blocks will be added to this `Promise.all` execution, minimizing the impact.
    2.  **Efficient Indexing:** A composite index will be created in Firestore for the `timeOff` collection, as specified in the design document, to ensure queries are fast and efficient.

### 5. Risk: Accidental Deletion of Booked Slot

*   **Description:** An admin could accidentally create a `timeOff` block that overlaps with a student's existing confirmed booking.
*   **Risk Level:** **Medium**
*   **Mitigation Actions:**
    1.  **Server-Side Conflict Check:** The `createTimeOff` server action will explicitly query the `bookings` collection for any confirmed appointments that fall within the requested time-off period.
    2.  **Blocking UI:** If a conflict is found, the server action will return a specific error message, and the admin UI will display this to the admin, preventing the action. The UI will clearly state, "Cannot create time-off as it conflicts with a scheduled lesson."

---

### Required Environment Variables for Local Testing

To test this feature locally, the following environment variables must be set in a `.env` file:

```env
# Enables the feature for local development
FEATURE_TIME_OFF=true

# Connects the local Firebase emulator
FIREBASE_EMULATOR_HOST="localhost:8080"
```
