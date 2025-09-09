/**
 * Status and Feedback Icons
 * Icons for status indicators, alerts, and feedback
 */

// Import Fluent UI status icons
import SuccessIcon from "@fluentui/svg-icons/icons/checkmark_24_regular.svg?raw";
import QuestionIcon from "@fluentui/svg-icons/icons/question_circle_24_regular.svg?raw";
import InfoIcon from "@fluentui/svg-icons/icons/info_24_regular.svg?raw";
import WarningIcon from "@fluentui/svg-icons/icons/warning_24_regular.svg?raw";
import ErrorIcon from "@fluentui/svg-icons/icons/error_circle_24_regular.svg?raw";
import CheckmarkCircleIcon from "@fluentui/svg-icons/icons/checkmark_circle_24_regular.svg?raw";
import ErrorCircleIcon from "@fluentui/svg-icons/icons/error_circle_24_regular.svg?raw";
import SpinnerIcon from "@fluentui/svg-icons/icons/spinner_ios_20_regular.svg?raw";
import ClockRegular from "@fluentui/svg-icons/icons/clock_24_regular.svg?raw";
import HistoryIcon from "@fluentui/svg-icons/icons/history_24_regular.svg?raw";
import CalendarDateRegular from "@fluentui/svg-icons/icons/calendar_date_24_regular.svg?raw";
import SizeIcon from "@fluentui/svg-icons/icons/data_usage_24_regular.svg?raw";
import TimeIcon from "@fluentui/svg-icons/icons/calendar_24_regular.svg?raw";
import GaugeIcon from "@fluentui/svg-icons/icons/data_usage_24_regular.svg?raw";

export const statusIcons = {
  success: {
    svg: SuccessIcon,
    metadata: {
      name: "success",
      tags: ["status", "success", "positive"],
      description: "Success icon",
      caption:
        "A checkmark icon indicating successful completion or positive status",
      keywords: ["success", "checkmark", "done", "complete"],
    },
  },
  question: {
    svg: QuestionIcon,
    metadata: {
      name: "question",
      tags: ["status", "help", "unknown"],
      description: "Question icon",
      caption:
        "A question mark in a circle icon for help, unknown status, or seeking information",
      keywords: ["question", "help", "unknown", "circle"],
    },
  },
  info: {
    svg: InfoIcon,
    metadata: {
      name: "info",
      tags: ["status", "information", "neutral"],
      description: "Info icon",
      caption:
        "An information icon with letter 'i' in a circle for displaying helpful information",
      keywords: ["info", "information", "i", "circle"],
    },
  },
  warning: {
    svg: WarningIcon,
    metadata: {
      name: "warning",
      tags: ["status", "warning", "caution"],
      description: "Warning icon",
      caption:
        "A warning triangle icon with exclamation mark for caution or alerts",
      keywords: ["warning", "caution", "alert", "triangle"],
    },
  },
  error: {
    svg: ErrorIcon,
    metadata: {
      name: "error",
      tags: ["status", "error", "negative"],
      description: "Error icon",
      caption:
        "An error icon with X mark in a circle indicating failure or error state",
      keywords: ["error", "x", "circle", "fail"],
    },
  },
  "checkmark-circle": {
    svg: CheckmarkCircleIcon,
    metadata: {
      name: "checkmark-circle",
      tags: ["status", "success", "confirm"],
      description: "Checkmark circle icon",
      caption:
        "A checkmark inside a circle icon for confirming success or completion",
      keywords: ["checkmark", "circle", "success", "confirm"],
    },
  },
  "error-circle": {
    svg: ErrorCircleIcon,
    metadata: {
      name: "error-circle",
      tags: ["status", "error", "negative"],
      description: "Error circle icon",
      caption:
        "An X mark inside a circle icon indicating an error or failure state",
      keywords: ["error", "circle", "x", "fail"],
    },
  },
  spinner: {
    svg: SpinnerIcon,
    metadata: {
      name: "spinner",
      tags: ["status", "loading", "progress"],
      description: "Spinner icon",
      caption:
        "A spinning loading icon indicating ongoing process or waiting state",
      keywords: ["spinner", "loading", "progress", "wait"],
    },
  },
  loading: {
    svg: SpinnerIcon,
    metadata: {
      name: "loading",
      tags: ["status", "loading", "progress"],
      description: "Loading spinner icon",
      caption:
        "A loading spinner icon showing that content is being processed or loaded",
      keywords: ["loading", "spinner", "progress", "wait"],
    },
  },
  clock: {
    svg: ClockRegular,
    metadata: {
      name: "clock",
      tags: ["status", "time", "temporal"],
      description: "Clock icon",
      caption:
        "A clock icon representing time, scheduling, or temporal information",
      keywords: ["clock", "time", "temporal", "schedule"],
    },
  },
  history: {
    svg: HistoryIcon,
    metadata: {
      name: "history",
      tags: ["status", "time", "past"],
      description: "History icon",
      caption:
        "A history icon with clock and arrow representing past events or chronological data",
      keywords: ["history", "time", "past", "chronological"],
    },
  },
  "calendar-date": {
    svg: CalendarDateRegular,
    metadata: {
      name: "calendar-date",
      tags: ["status", "time", "date"],
      description: "Calendar date icon",
      caption:
        "A calendar icon with date highlighting for scheduling or date selection",
      keywords: ["calendar", "date", "time", "schedule"],
    },
  },
  size: {
    svg: SizeIcon,
    metadata: {
      name: "size",
      tags: ["status", "data", "usage"],
      description: "Data usage icon",
      caption: "A data usage icon showing storage or bandwidth consumption",
      keywords: ["size", "data", "usage", "storage"],
    },
  },
  time: {
    svg: TimeIcon,
    metadata: {
      name: "time",
      tags: ["status", "time", "calendar"],
      description: "Time icon",
      caption:
        "A calendar icon representing time, scheduling, or date-related information",
      keywords: ["time", "calendar", "schedule", "date"],
    },
  },
  gauge: {
    svg: GaugeIcon,
    metadata: {
      name: "gauge",
      tags: ["status", "data", "usage"],
      description: "Gauge icon",
      caption:
        "A gauge or meter icon for displaying data usage, performance metrics, or progress",
      keywords: ["gauge", "data", "usage", "meter"],
    },
  },
} as const;
