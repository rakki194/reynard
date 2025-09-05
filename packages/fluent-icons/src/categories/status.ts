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
      keywords: ["success", "checkmark", "done", "complete"],
    },
  },
  question: {
    svg: QuestionIcon,
    metadata: {
      name: "question",
      tags: ["status", "help", "unknown"],
      description: "Question icon",
      keywords: ["question", "help", "unknown", "circle"],
    },
  },
  info: {
    svg: InfoIcon,
    metadata: {
      name: "info",
      tags: ["status", "information", "neutral"],
      description: "Info icon",
      keywords: ["info", "information", "i", "circle"],
    },
  },
  warning: {
    svg: WarningIcon,
    metadata: {
      name: "warning",
      tags: ["status", "warning", "caution"],
      description: "Warning icon",
      keywords: ["warning", "caution", "alert", "triangle"],
    },
  },
  error: {
    svg: ErrorIcon,
    metadata: {
      name: "error",
      tags: ["status", "error", "negative"],
      description: "Error icon",
      keywords: ["error", "x", "circle", "fail"],
    },
  },
  "checkmark-circle": {
    svg: CheckmarkCircleIcon,
    metadata: {
      name: "checkmark-circle",
      tags: ["status", "success", "confirm"],
      description: "Checkmark circle icon",
      keywords: ["checkmark", "circle", "success", "confirm"],
    },
  },
  "error-circle": {
    svg: ErrorCircleIcon,
    metadata: {
      name: "error-circle",
      tags: ["status", "error", "negative"],
      description: "Error circle icon",
      keywords: ["error", "circle", "x", "fail"],
    },
  },
  spinner: {
    svg: SpinnerIcon,
    metadata: {
      name: "spinner",
      tags: ["status", "loading", "progress"],
      description: "Spinner icon",
      keywords: ["spinner", "loading", "progress", "wait"],
    },
  },
  loading: {
    svg: SpinnerIcon,
    metadata: {
      name: "loading",
      tags: ["status", "loading", "progress"],
      description: "Loading spinner icon",
      keywords: ["loading", "spinner", "progress", "wait"],
    },
  },
  clock: {
    svg: ClockRegular,
    metadata: {
      name: "clock",
      tags: ["status", "time", "temporal"],
      description: "Clock icon",
      keywords: ["clock", "time", "temporal", "schedule"],
    },
  },
  history: {
    svg: HistoryIcon,
    metadata: {
      name: "history",
      tags: ["status", "time", "past"],
      description: "History icon",
      keywords: ["history", "time", "past", "chronological"],
    },
  },
  "calendar-date": {
    svg: CalendarDateRegular,
    metadata: {
      name: "calendar-date",
      tags: ["status", "time", "date"],
      description: "Calendar date icon",
      keywords: ["calendar", "date", "time", "schedule"],
    },
  },
  size: {
    svg: SizeIcon,
    metadata: {
      name: "size",
      tags: ["status", "data", "usage"],
      description: "Data usage icon",
      keywords: ["size", "data", "usage", "storage"],
    },
  },
  time: {
    svg: TimeIcon,
    metadata: {
      name: "time",
      tags: ["status", "time", "calendar"],
      description: "Time icon",
      keywords: ["time", "calendar", "schedule", "date"],
    },
  },
  gauge: {
    svg: GaugeIcon,
    metadata: {
      name: "gauge",
      tags: ["status", "data", "usage"],
      description: "Gauge icon",
      keywords: ["gauge", "data", "usage", "meter"],
    },
  },
} as const;
