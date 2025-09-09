/**
 * File and Document Icons
 * Icons for files, documents, and file operations
 */

// Import Fluent UI file icons
import FolderIcon from "@fluentui/svg-icons/icons/folder_24_regular.svg?raw";
import FolderAddIcon from "@fluentui/svg-icons/icons/folder_add_24_regular.svg?raw";
import FolderArrowUpIcon from "@fluentui/svg-icons/icons/folder_arrow_up_24_regular.svg?raw";
import DocumentTextRegular from "@fluentui/svg-icons/icons/document_text_24_regular.svg?raw";
import DocumentPyRegular from "@fluentui/svg-icons/icons/document_py_16_regular.svg?raw";
import DocumentArrowDownRegular from "@fluentui/svg-icons/icons/document_arrow_down_24_regular.svg?raw";
import TypeIcon from "@fluentui/svg-icons/icons/document_24_regular.svg?raw";
import FileTextIcon from "@fluentui/svg-icons/icons/document_text_24_regular.svg?raw";
import NotepadIcon from "@fluentui/svg-icons/icons/notepad_24_regular.svg?raw";
import BookRegular from "@fluentui/svg-icons/icons/book_24_regular.svg?raw";
import BookQuestionMarkRegular from "@fluentui/svg-icons/icons/book_question_mark_24_regular.svg?raw";
import TagIcon from "@fluentui/svg-icons/icons/tag_24_regular.svg?raw";
import SubtitlesIcon from "@fluentui/svg-icons/icons/subtitles_24_regular.svg?raw";
import TextRegular from "@fluentui/svg-icons/icons/text_paragraph_24_regular.svg?raw";
import TextLowerCaseRegular from "@fluentui/svg-icons/icons/text_case_lowercase_24_regular.svg?raw";
import TextUpperCaseRegular from "@fluentui/svg-icons/icons/text_case_uppercase_24_regular.svg?raw";
import TextAlignIcon from "@fluentui/svg-icons/icons/text_align_distributed_vertical_24_regular.svg?raw";
import TextAlignDistributedIcon from "@fluentui/svg-icons/icons/text_align_distributed_evenly_24_regular.svg?raw";
import TextAlignRightIcon from "@fluentui/svg-icons/icons/text_align_right_24_regular.svg?raw";
import TextAlignLeftIcon from "@fluentui/svg-icons/icons/text_align_left_24_regular.svg?raw";
import TextSortAscendingRegular from "@fluentui/svg-icons/icons/text_sort_ascending_24_regular.svg?raw";
import TextSortDescendingRegular from "@fluentui/svg-icons/icons/text_sort_descending_24_regular.svg?raw";

export const fileIcons = {
  folder: {
    svg: FolderIcon,
    metadata: {
      name: "folder",
      tags: ["file", "directory", "folder"],
      description: "Folder icon",
      caption:
        "A folder icon representing a directory or container for organizing files",
      keywords: ["folder", "directory", "file", "container"],
    },
  },
  "folder-add": {
    svg: FolderAddIcon,
    metadata: {
      name: "folder-add",
      tags: ["file", "directory", "add"],
      description: "Add folder icon",
      caption:
        "A folder with plus sign icon for creating new directories or folders",
      keywords: ["folder", "add", "new", "directory"],
    },
  },
  "folder-arrow-up": {
    svg: FolderArrowUpIcon,
    metadata: {
      name: "folder-arrow-up",
      tags: ["file", "directory", "upload"],
      description: "Folder arrow up icon",
      caption:
        "A folder with upward arrow icon for uploading files to a directory",
      keywords: ["folder", "upload", "arrow up", "directory"],
    },
  },
  "document-text": {
    svg: DocumentTextRegular,
    metadata: {
      name: "document-text",
      tags: ["file", "document", "text"],
      description: "Text document icon",
      caption:
        "A document icon with text lines representing a text file or document",
      keywords: ["document", "text", "file", "page"],
    },
  },
  "document-py": {
    svg: DocumentPyRegular,
    metadata: {
      name: "document-py",
      tags: ["file", "document", "python"],
      description: "Python document icon",
      caption:
        "A document icon with Python logo representing a Python code file",
      keywords: ["document", "python", "file", "code"],
    },
  },
  "document-arrow-down": {
    svg: DocumentArrowDownRegular,
    metadata: {
      name: "document-arrow-down",
      tags: ["file", "document", "download"],
      description: "Document arrow down icon",
      caption: "A document with downward arrow icon for downloading files",
      keywords: ["document", "download", "arrow down", "file"],
    },
  },
  document: {
    svg: TypeIcon,
    metadata: {
      name: "document",
      tags: ["file", "document", "type"],
      description: "Document icon",
      caption: "A generic document icon representing a file or page",
      keywords: ["document", "file", "type", "page"],
    },
  },
  "file-text": {
    svg: FileTextIcon,
    metadata: {
      name: "file-text",
      tags: ["file", "document", "text"],
      description: "Text file icon",
      caption: "A file icon with text content representing a text document",
      keywords: ["file", "text", "document", "page"],
    },
  },
  notepad: {
    svg: NotepadIcon,
    metadata: {
      name: "notepad",
      tags: ["file", "document", "notes"],
      description: "Notepad icon",
      caption: "A notepad icon for taking notes or writing text content",
      keywords: ["notepad", "notes", "document", "text"],
    },
  },
  book: {
    svg: BookRegular,
    metadata: {
      name: "book",
      tags: ["file", "document", "book"],
      description: "Book icon",
      caption:
        "An open book icon representing reading material or documentation",
      keywords: ["book", "document", "read", "pages"],
    },
  },
  "book-question-mark": {
    svg: BookQuestionMarkRegular,
    metadata: {
      name: "book-question-mark",
      tags: ["file", "document", "help"],
      description: "Book question mark icon",
      caption:
        "A book with question mark icon representing help documentation or FAQ",
      keywords: ["book", "question", "help", "document"],
    },
  },
  tag: {
    svg: TagIcon,
    metadata: {
      name: "tag",
      tags: ["file", "metadata", "label"],
      description: "Tag icon",
      caption: "A tag icon for labeling, categorizing, or organizing content",
      keywords: ["tag", "label", "metadata", "category"],
    },
  },
  subtitles: {
    svg: SubtitlesIcon,
    metadata: {
      name: "subtitles",
      tags: ["file", "media", "text"],
      description: "Subtitles icon",
      caption: "A subtitles icon representing text captions for media content",
      keywords: ["subtitles", "captions", "text", "media"],
    },
  },
  text: {
    svg: TextRegular,
    metadata: {
      name: "text",
      tags: ["file", "text", "paragraph"],
      description: "Text paragraph icon",
      caption:
        "A text paragraph icon representing written content or text blocks",
      keywords: ["text", "paragraph", "content", "words"],
    },
  },
  "text-lowercase": {
    svg: TextLowerCaseRegular,
    metadata: {
      name: "text-lowercase",
      tags: ["file", "text", "case"],
      description: "Text lowercase icon",
      caption: "A text formatting icon for converting text to lowercase",
      keywords: ["text", "lowercase", "case", "format"],
    },
  },
  "text-uppercase": {
    svg: TextUpperCaseRegular,
    metadata: {
      name: "text-uppercase",
      tags: ["file", "text", "case"],
      description: "Text uppercase icon",
      caption: "A text formatting icon for converting text to uppercase",
      keywords: ["text", "uppercase", "case", "format"],
    },
  },
  "text-align": {
    svg: TextAlignIcon,
    metadata: {
      name: "text-align",
      tags: ["file", "text", "alignment"],
      description: "Text align distributed vertical icon",
      caption: "A text alignment icon for distributing text vertically",
      keywords: ["text", "align", "distributed", "vertical"],
    },
  },
  "text-align-distributed": {
    svg: TextAlignDistributedIcon,
    metadata: {
      name: "text-align-distributed",
      tags: ["file", "text", "alignment"],
      description: "Text align distributed evenly icon",
      caption:
        "A text alignment icon for distributing text evenly across lines",
      keywords: ["text", "align", "distributed", "evenly"],
    },
  },
  "text-align-right": {
    svg: TextAlignRightIcon,
    metadata: {
      name: "text-align-right",
      tags: ["file", "text", "alignment"],
      description: "Text align right icon",
      caption: "A text alignment icon for right-aligning text content",
      keywords: ["text", "align", "right", "justify"],
    },
  },
  "text-align-left": {
    svg: TextAlignLeftIcon,
    metadata: {
      name: "text-align-left",
      tags: ["file", "text", "alignment"],
      description: "Text align left icon",
      caption: "A text alignment icon for left-aligning text content",
      keywords: ["text", "align", "left", "justify"],
    },
  },
  "text-sort-ascending": {
    svg: TextSortAscendingRegular,
    metadata: {
      name: "text-sort-ascending",
      tags: ["file", "text", "sort"],
      description: "Text sort ascending icon",
      caption:
        "A text sorting icon for arranging text content in ascending order",
      keywords: ["text", "sort", "ascending", "order"],
    },
  },
  "text-sort-descending": {
    svg: TextSortDescendingRegular,
    metadata: {
      name: "text-sort-descending",
      tags: ["file", "text", "sort"],
      description: "Text sort descending icon",
      caption:
        "A text sorting icon for arranging text content in descending order",
      keywords: ["text", "sort", "descending", "order"],
    },
  },
} as const;
