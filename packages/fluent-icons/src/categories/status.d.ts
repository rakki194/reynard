/**
 * Status and Feedback Icons
 * Icons for status indicators, alerts, and feedback
 */
export declare const statusIcons: {
    readonly success: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "success";
            readonly tags: readonly ["status", "success", "positive"];
            readonly description: "Success icon";
            readonly caption: "A checkmark icon indicating successful completion or positive status";
            readonly keywords: readonly ["success", "checkmark", "done", "complete"];
        };
    };
    readonly question: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "question";
            readonly tags: readonly ["status", "help", "unknown"];
            readonly description: "Question icon";
            readonly caption: "A question mark in a circle icon for help, unknown status, or seeking information";
            readonly keywords: readonly ["question", "help", "unknown", "circle"];
        };
    };
    readonly info: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "info";
            readonly tags: readonly ["status", "information", "neutral"];
            readonly description: "Info icon";
            readonly caption: "An information icon with letter 'i' in a circle for displaying helpful information";
            readonly keywords: readonly ["info", "information", "i", "circle"];
        };
    };
    readonly warning: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "warning";
            readonly tags: readonly ["status", "warning", "caution"];
            readonly description: "Warning icon";
            readonly caption: "A warning triangle icon with exclamation mark for caution or alerts";
            readonly keywords: readonly ["warning", "caution", "alert", "triangle"];
        };
    };
    readonly error: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "error";
            readonly tags: readonly ["status", "error", "negative"];
            readonly description: "Error icon";
            readonly caption: "An error icon with X mark in a circle indicating failure or error state";
            readonly keywords: readonly ["error", "x", "circle", "fail"];
        };
    };
    readonly "checkmark-circle": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "checkmark-circle";
            readonly tags: readonly ["status", "success", "confirm"];
            readonly description: "Checkmark circle icon";
            readonly caption: "A checkmark inside a circle icon for confirming success or completion";
            readonly keywords: readonly ["checkmark", "circle", "success", "confirm"];
        };
    };
    readonly "error-circle": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "error-circle";
            readonly tags: readonly ["status", "error", "negative"];
            readonly description: "Error circle icon";
            readonly caption: "An X mark inside a circle icon indicating an error or failure state";
            readonly keywords: readonly ["error", "circle", "x", "fail"];
        };
    };
    readonly spinner: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "spinner";
            readonly tags: readonly ["status", "loading", "progress"];
            readonly description: "Spinner icon";
            readonly caption: "A spinning loading icon indicating ongoing process or waiting state";
            readonly keywords: readonly ["spinner", "loading", "progress", "wait"];
        };
    };
    readonly loading: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "loading";
            readonly tags: readonly ["status", "loading", "progress"];
            readonly description: "Loading spinner icon";
            readonly caption: "A loading spinner icon showing that content is being processed or loaded";
            readonly keywords: readonly ["loading", "spinner", "progress", "wait"];
        };
    };
    readonly clock: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "clock";
            readonly tags: readonly ["status", "time", "temporal"];
            readonly description: "Clock icon";
            readonly caption: "A clock icon representing time, scheduling, or temporal information";
            readonly keywords: readonly ["clock", "time", "temporal", "schedule"];
        };
    };
    readonly history: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "history";
            readonly tags: readonly ["status", "time", "past"];
            readonly description: "History icon";
            readonly caption: "A history icon with clock and arrow representing past events or chronological data";
            readonly keywords: readonly ["history", "time", "past", "chronological"];
        };
    };
    readonly "calendar-date": {
        readonly svg: string;
        readonly metadata: {
            readonly name: "calendar-date";
            readonly tags: readonly ["status", "time", "date"];
            readonly description: "Calendar date icon";
            readonly caption: "A calendar icon with date highlighting for scheduling or date selection";
            readonly keywords: readonly ["calendar", "date", "time", "schedule"];
        };
    };
    readonly size: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "size";
            readonly tags: readonly ["status", "data", "usage"];
            readonly description: "Data usage icon";
            readonly caption: "A data usage icon showing storage or bandwidth consumption";
            readonly keywords: readonly ["size", "data", "usage", "storage"];
        };
    };
    readonly time: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "time";
            readonly tags: readonly ["status", "time", "calendar"];
            readonly description: "Time icon";
            readonly caption: "A calendar icon representing time, scheduling, or date-related information";
            readonly keywords: readonly ["time", "calendar", "schedule", "date"];
        };
    };
    readonly gauge: {
        readonly svg: string;
        readonly metadata: {
            readonly name: "gauge";
            readonly tags: readonly ["status", "data", "usage"];
            readonly description: "Gauge icon";
            readonly caption: "A gauge or meter icon for displaying data usage, performance metrics, or progress";
            readonly keywords: readonly ["gauge", "data", "usage", "meter"];
        };
    };
};
