# DONT WRITE CODE WITHOUT MY PERMISSION

Hey, I mostly asks doubts regarding this project. And sometimes if i struggle.

- I dont want you to write full code without my permission.
- You can give small structure how it looks or it needs to be rather than the full code for the fix.

## ABOUT APPLICATION

This is a task management application the tasks are saved locally and synced to users time and date.

On future I will implement cloud functionality.

THE MVP is Task Management, edit, delete, save.

## CURRENT PLANNING

1. Migrate JS code to TS.
2. use Temporal API everywhere rather than default Date() function, Prefer user's local time. The app works fully offline right now. So our users are from different parts of the planet with different locales, so the app is designed to boost their productivity by preferring their locales,
3. Migrate to SQLite from Async Storage.
4. Build Standalone DateTimePicker rather than relying on Android's default Date Time Picker. 
5. Build reusable components. 

#### Note:

This project is built on EXPO framework. WE use Tailwind CSS by using nativwind library.
