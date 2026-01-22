# Dependency Map: Tutor Time Off Feature

This document lists all files, components, and modules that will be affected by or interact with the new Tutor Time Off feature.

---

## 1. Existing Files to be Modified

The following files will require code changes to integrate the new feature.

*   `src/app/actions/bookingActions.ts`: Will be updated to include server-side validation against `timeOff` blocks before creating a booking.
*   `src/app/actions/slotActions.ts`: The `getSlotData` function will be modified to fetch and return `timeOff` ranges.
*   `src/app/bookings/page.tsx`: The main student booking UI. Its slot generation logic (`displayTimeSlots`) and rendering will be updated to handle the new `timeOff` status.
*   `src/lib/types.ts`: A new `TimeOff` interface will be added.
*   `src/config/site.ts`: A new navigation item for "Availability" will be added to the `adminNav` array.

---

## 2. High-Risk Files ("Do Not Modify" Without Approval)

These files are critical to the application's core functionality and have been sources of bugs in the past. Changes should be minimized and heavily scrutinized.

*   **🚩 `src/app/bookings/page.tsx`**: High complexity in state management and data fetching. Any change must be carefully tested to avoid regressions in booking, priority, or blocking logic.
*   **🚩 `src/app/actions/bookingActions.ts`**: The authoritative server-side validation logic lives here. Incorrect modifications could compromise booking integrity.
*   **🚩 `src/lib/firebase-admin.ts`**: Core server-side Firebase initialization. Do not modify.

---

## 3. New Files to be Created

The implementation will introduce the following new files to encapsulate the feature's logic and UI.

*   **`src/app/actions/timeOffActions.ts`**: New Server Action file to handle creating and deleting `timeOff` blocks.
*   **`src/app/admin/availability/page.tsx`**: New admin page to host the time off management UI.
*   **`src/components/admin/TimeOffManager.tsx`**: The new React component containing the form and list for managing time off.
