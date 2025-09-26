/**
 * Notebook Page - Shows notes within a specific notebook
 */

import { Component } from "solid-js";
import { Card } from "reynard-primitives";

const NotebookPage: Component = () => {
  return (
    <div class="notebook-page">
      <Card padding="lg">
        <h1>Notebook Page</h1>
        <p>This page will show the notes within a specific notebook.</p>
      </Card>
    </div>
  );
};

export default NotebookPage;
