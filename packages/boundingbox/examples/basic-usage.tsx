/**
 * Basic usage example for reynard-boundingbox
 * 
 * This example demonstrates how to use the BoundingBoxEditor component
 * in a simple application.
 */

import { createSignal } from 'solid-js';
import { BoundingBoxEditor } from '../src/components/BoundingBoxEditor';
import type { BoundingBox, ImageInfo, AnnotationEventHandlers, Annotation } from '../src/types';
import './basic-usage.css';

export function BasicUsageExample() {
  // Image information
  const imageInfo: ImageInfo = {
    width: 1920,
    height: 1080,
    src: '/path/to/your/image.jpg',
    alt: 'Example image for bounding box annotation'
  };

  // Initial bounding boxes (optional)
  const [initialBoxes] = createSignal<BoundingBox[]>([
    {
      id: 'example-box-1',
      label: 'person',
      x: 100,
      y: 100,
      width: 200,
      height: 300,
      color: '#007acc'
    },
    {
      id: 'example-box-2',
      label: 'vehicle',
      x: 400,
      y: 200,
      width: 300,
      height: 150,
      color: '#10b981'
    }
  ]);

  // Event handlers
  const eventHandlers: AnnotationEventHandlers = {
    onAnnotationCreate: (annotation: Annotation) => {
      console.log('Created annotation:', annotation);
      // Type guard to check if it's a bounding box
      if ('x' in annotation && 'y' in annotation && 'width' in annotation && 'height' in annotation) {
        console.log('Created bounding box:', annotation as BoundingBox);
        // Here you would typically save to your backend
      }
    },

    onAnnotationUpdate: (id: string, annotation: Annotation) => {
      console.log('Updated annotation:', id, annotation);
      // Type guard to check if it's a bounding box
      if ('x' in annotation && 'y' in annotation && 'width' in annotation && 'height' in annotation) {
        console.log('Updated bounding box:', id, annotation as BoundingBox);
        // Here you would typically update in your backend
      }
    },

    onAnnotationDelete: (id: string) => {
      console.log('Deleted bounding box:', id);
      // Here you would typically delete from your backend
    },

    onAnnotationSelect: (id: string | null) => {
      console.log('Selected bounding box:', id);
      // Here you could update UI to show box details
    },

    onEditingStart: (id: string, operation: string) => {
      console.log('Started editing:', id, operation);
      // Here you could disable other UI elements
    },

    onEditingEnd: (id: string, operation: string) => {
      console.log('Finished editing:', id, operation);
      // Here you could re-enable other UI elements
    },

    onEditingCancel: (id: string) => {
      console.log('Cancelled editing:', id);
      // Here you could restore the original state
    }
  };

  return (
    <div class="example-container">
      <h1>Bounding Box Editor Example</h1>
      
      <div class="example-description">
        <p>
          This example demonstrates the basic usage of the BoundingBoxEditor component.
          You can create, edit, and delete bounding boxes by interacting with the canvas.
        </p>
      </div>

      <BoundingBoxEditor
        imageInfo={imageInfo}
        initialBoxes={initialBoxes()}
        config={{
          enableCreation: true,
          enableEditing: true,
          enableDeletion: true,
          enableSelection: true,
          enableSnapping: true,
          enableConstraints: true,
          showLabels: true,
          showHandles: true,
          handleSize: 8,
          handleColor: '#007acc',
          handleBorderColor: '#ffffff',
          labelClasses: ['person', 'vehicle', 'animal', 'object', 'building'],
          defaultLabelClass: 'object'
        }}
        eventHandlers={eventHandlers}
        containerWidth={800}
        containerHeight={600}
        className="example-editor"
      />

      <div class="example-instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Click and drag on the canvas to create a new bounding box</li>
          <li>Click on an existing box to select it</li>
          <li>Use the "Edit" button to enter resize mode</li>
          <li>Drag the corners or edges to resize the box</li>
          <li>Use the "Delete" button to remove a box</li>
          <li>Select different label classes from the dropdown</li>
        </ul>
      </div>
    </div>
  );
}

export default BasicUsageExample;
