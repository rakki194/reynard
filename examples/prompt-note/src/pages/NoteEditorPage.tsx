/**
 * Note Editor Page - Rich text editor for notes
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";
import { CodeEditor } from "reynard-monaco";

const NoteEditorPage: Component = () => {
  return (
    <div class="note-editor-page">
      <Card padding="lg">
        <h1>Note Editor</h1>
        <p>This page will contain the rich text editor for notes.</p>
        <div style={{ height: "400px", margin: "20px 0" }}>
          <CodeEditor
            value="# Welcome to Prompt Note\n\nThis is a markdown editor powered by Monaco.\n\n## Features\n- Rich text editing\n- Markdown support\n- Real-time collaboration\n- AI-powered assistance"
            language="markdown"
            height="400px"
            onChange={value => console.log("Content changed:", value)}
          />
        </div>
      </Card>
    </div>
  );
};

export default NoteEditorPage;
