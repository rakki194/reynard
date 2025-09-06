import { createSignal, For } from "solid-js";
import { Button, Card, TextField, Select, Modal } from "reynard-components";
import { useTheme } from "reynard-core";
import { getIcon } from "reynard-fluent-icons";

export function ComponentsDemo() {
  const { theme } = useTheme();
  const [showModal, setShowModal] = createSignal(false);
  const [textValue, setTextValue] = createSignal("");
  const [selectValue, setSelectValue] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3", disabled: true },
    { value: "option4", label: "Option 4" },
  ];

  const buttonVariants = [
    "primary", "secondary", "tertiary", "ghost", "danger", "success", "warning"
  ] as const;

  const buttonSizes = ["sm", "md", "lg"] as const;

  const cardVariants = [
    "default", "elevated", "outlined", "filled"
  ] as const;

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div class="components-demo">
      <Card class="demo-section">
        <h3>Button Component</h3>
        <p>Demonstrates all button variants, sizes, and states.</p>
        
        <div class="demo-subsection">
          <h4>Variants</h4>
          <div class="button-grid">
            <For each={buttonVariants}>
              {(variant) => (
                <Button variant={variant}>
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Button>
              )}
            </For>
          </div>
        </div>

        <div class="demo-subsection">
          <h4>Sizes</h4>
          <div class="button-grid">
            <For each={buttonSizes}>
              {(size) => (
                <Button size={size}>
                  {size.toUpperCase()} Button
                </Button>
              )}
            </For>
          </div>
        </div>

        <div class="demo-subsection">
          <h4>States</h4>
          <div class="button-grid">
            <Button loading>Loading Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button fullWidth>Full Width Button</Button>
            <Button iconOnly>
              <span innerHTML={getIcon("settings") || ""}></span>
            </Button>
          </div>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Card Component</h3>
        <p>Demonstrates different card variants and configurations.</p>
        
        <div class="card-grid">
          <For each={cardVariants}>
            {(variant) => (
              <Card variant={variant} padding="md">
                <h4>{variant.charAt(0).toUpperCase() + variant.slice(1)} Card</h4>
                <p>This is a {variant} card variant with medium padding.</p>
              </Card>
            )}
          </For>
        </div>

        <div class="demo-subsection">
          <h4>Interactive Cards</h4>
          <div class="card-grid">
            <Card interactive padding="md">
              <h4>Interactive Card</h4>
              <p>This card has hover effects and is clickable.</p>
            </Card>
            <Card selected padding="md">
              <h4>Selected Card</h4>
              <p>This card is in a selected state.</p>
            </Card>
          </div>
        </div>

        <div class="demo-subsection">
          <h4>Card with Header and Footer</h4>
          <Card 
            variant="elevated" 
            padding="lg"
            header={<h4>Card Header</h4>}
            footer={<Button size="sm">Action</Button>}
          >
            <p>This card has a header, content, and footer section.</p>
          </Card>
        </div>
      </Card>

      <Card class="demo-section">
        <h3>TextField Component</h3>
        <p>Demonstrates text input with various configurations.</p>
        
        <div class="form-grid">
          <TextField
            label="Basic Text Field"
            placeholder="Enter some text..."
            value={textValue()}
            onInput={(e) => setTextValue(e.currentTarget.value)}
          />
          
          <TextField
            label="Required Field"
            placeholder="This field is required"
            required
            helperText="This field is required to continue"
          />
          
          <TextField
            label="Error State"
            placeholder="This field has an error"
            error
            errorMessage="This field contains an error"
          />
          
          <TextField
            label="Loading State"
            placeholder="Loading..."
            loading
          />
          
          <TextField
            label="With Icons"
            placeholder="Search..."
            leftIcon={<span innerHTML={getIcon("search") || ""}></span>}
            rightIcon={<span innerHTML={getIcon("edit") || ""}></span>}
          />
          
          <TextField
            label="Full Width"
            placeholder="This field takes full width"
            fullWidth
          />
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Select Component</h3>
        <p>Demonstrates dropdown select with various configurations.</p>
        
        <div class="form-grid">
          <Select
            label="Basic Select"
            placeholder="Choose an option..."
            options={selectOptions}
            value={selectValue()}
            onChange={(e) => setSelectValue(e.currentTarget.value)}
          />
          
          <Select
            label="Required Select"
            placeholder="This select is required"
            options={selectOptions}
            required
            helperText="Please select an option"
          />
          
          <Select
            label="Error State"
            placeholder="This select has an error"
            options={selectOptions}
            error
            errorMessage="Please select a valid option"
          />
          
          <Select
            label="Loading State"
            placeholder="Loading options..."
            options={selectOptions}
            loading
          />
          
          <Select
            label="With Icon"
            placeholder="Search options..."
            options={selectOptions}
            leftIcon={<span innerHTML={getIcon("search") || ""}></span>}
          />
        </div>
      </Card>

      <Card class="demo-section">
        <h3>Modal Component</h3>
        <p>Demonstrates modal dialogs with different configurations.</p>
        
        <div class="button-grid">
          <Button onClick={() => setShowModal(true)}>
            Open Modal
          </Button>
          <Button onClick={simulateLoading} loading={loading()}>
            Simulate Loading
          </Button>
        </div>

        <Modal
          open={showModal()}
          onClose={() => setShowModal(false)}
          title="Demo Modal"
          size="lg"
        >
          <div class="modal-content">
            <p>This is a demonstration of the Modal component.</p>
            <p>Current theme: <strong>{theme()}</strong></p>
            <p>You can close this modal by:</p>
            <ul>
              <li>Clicking the X button in the header</li>
              <li>Clicking outside the modal (backdrop)</li>
              <li>Pressing the Escape key</li>
            </ul>
            <div class="modal-actions">
              <Button onClick={() => setShowModal(false)}>
                Close Modal
              </Button>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
}
