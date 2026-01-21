export default interface RemindersTable {
    id: string;
    createdAt: string; // ISO date string
    updatedAt?: string; // ISO date string, nullable
    userId: string;
    type: string; // USER-DEFINED enum
    message?: string; // text, nullable
    date: string; // date, NOT NULL (YYYY-MM-DD format)
    isRecurring?: boolean; // nullable
    recurringType: string; // USER-DEFINED enum, NOT NULL (but might have default)
    send?: string; // time with time zone, nullable (HH:MM:SS format)
}