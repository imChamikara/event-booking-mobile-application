# Fix Event Publication and Form Improvements

The goal is to fix the "unexpected error" when publishing events, which is caused by a date format mismatch between the frontend and backend. We also need to add date/time pickers and a category dropdown to the event form.

## Proposed Changes

### [Backend] Event Validation
Relax the date validation in the backend to be more flexible, or ensure the frontend sends the correct ISO 8601 format.

#### [events.ts](file:///C:/Users/User/Desktop/University/2nd year 2nd Semester/Mobile Application/Event Booking Application/server/src/routes/events.ts)
- Update `createEventSchema` to use a more flexible date validation.

### [Frontend] Event Form Improvements
Update the event form to use proper date/time pickers and a category dropdown.

#### [event-form.tsx](file:///C:/Users/User/Desktop/University/2nd year 2nd Semester/Mobile Application/Event Booking Application/app/organizer/event-form.tsx)
- Integrate `@react-native-community/datetimepicker` for start and end dates.
- Integrate `@react-native-picker/picker` for the category field.
- Fix date formatting in the schema and submission logic to ensure compatibility with the backend.

### [Frontend] Persistence
Ensure that the event data is correctly saved and the local state is updated.

#### [useEvents.ts](file:///C:/Users/User/Desktop/University/2nd year 2nd Semester/Mobile Application/Event Booking Application/hooks/useEvents.ts)
- Already has `invalidateQueries`, which ensures the UI refreshes after creation/update.

## Verification Plan

### Manual Verification
- **Create Event**: Test creating a new event with the new date/time pickers and category dropdown.
- **Publish Event**: Verify that clicking "Publish Event" works without errors.
- **Edit Event**: Verify that existing events can be edited and the pickers reflect the current values.
- **Verify Persistence**: Check that the new event appears in the home screen and organizer dashboard.
