/**
 * ComfyUI Text-to-Image Form Component
 *
 * A form component for generating images from text prompts using ComfyUI.
 */
import { createSignal, createEffect } from "solid-js";
import { useComfy } from "../composables/useComfy.js";
export const ComfyText2ImgForm = props => {
    const comfy = useComfy();
    // Form state
    const [formData, setFormData] = createSignal({
        caption: "",
        negative: "",
        width: 1024,
        height: 1024,
        steps: 24,
        cfg: 5.5,
        seed: undefined,
        checkpoint: undefined,
        sampler: undefined,
        scheduler: undefined,
        loras: undefined,
        loraWeights: undefined,
        pag: undefined,
        deepshrink: undefined,
        detailDaemon: undefined,
        splitSigmas: undefined,
        ...props.initialValues,
    });
    const [isGenerating, setIsGenerating] = createSignal(false);
    const [currentPromptId, setCurrentPromptId] = createSignal(null);
    // Initialize form with default values
    createEffect(() => {
        if (props.initialValues) {
            setFormData(prev => ({ ...prev, ...props.initialValues }));
        }
    });
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isGenerating() || props.disabled) {
            return;
        }
        try {
            setIsGenerating(true);
            const data = formData();
            if (!data.caption.trim()) {
                throw new Error("Caption is required");
            }
            const result = await comfy.textToImage(data);
            setCurrentPromptId(result.promptId);
            props.onGenerate?.(result.promptId);
            // Start monitoring the generation
            const cleanup = comfy.streamStatus(result.promptId, event => {
                if (event.type === "status" && event.data?.status === "completed") {
                    setIsGenerating(false);
                    setCurrentPromptId(null);
                    props.onComplete?.(event.data);
                    cleanup();
                }
                else if (event.type === "error") {
                    setIsGenerating(false);
                    setCurrentPromptId(null);
                    props.onError?.(event.message || "Generation failed");
                    cleanup();
                }
            });
        }
        catch (error) {
            setIsGenerating(false);
            setCurrentPromptId(null);
            const errorMessage = error instanceof Error ? error.message : "Generation failed";
            props.onError?.(errorMessage);
        }
    };
    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    return (<form onSubmit={handleSubmit} class={`comfy-text2img-form ${props.class || ""}`}>
      <div class="form-group">
        <label for="caption">Caption *</label>
        <textarea id="caption" value={formData().caption} onInput={e => handleInputChange("caption", e.currentTarget.value)} placeholder="Enter your prompt..." rows={3} disabled={props.disabled || isGenerating()} required/>
      </div>

      <div class="form-group">
        <label for="negative">Negative Prompt</label>
        <textarea id="negative" value={formData().negative || ""} onInput={e => handleInputChange("negative", e.currentTarget.value)} placeholder="Enter negative prompt..." rows={2} disabled={props.disabled || isGenerating()}/>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="width">Width</label>
          <input id="width" type="number" value={formData().width || 1024} onInput={e => handleInputChange("width", parseInt(e.currentTarget.value))} min="64" max="4096" step="64" disabled={props.disabled || isGenerating()}/>
        </div>

        <div class="form-group">
          <label for="height">Height</label>
          <input id="height" type="number" value={formData().height || 1024} onInput={e => handleInputChange("height", parseInt(e.currentTarget.value))} min="64" max="4096" step="64" disabled={props.disabled || isGenerating()}/>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="steps">Steps</label>
          <input id="steps" type="number" value={formData().steps || 24} onInput={e => handleInputChange("steps", parseInt(e.currentTarget.value))} min="1" max="150" disabled={props.disabled || isGenerating()}/>
        </div>

        <div class="form-group">
          <label for="cfg">CFG Scale</label>
          <input id="cfg" type="number" value={formData().cfg || 5.5} onInput={e => handleInputChange("cfg", parseFloat(e.currentTarget.value))} min="0.1" max="20.0" step="0.1" disabled={props.disabled || isGenerating()}/>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="seed">Seed</label>
          <input id="seed" type="number" value={formData().seed || ""} onInput={e => handleInputChange("seed", e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined)} min="0" disabled={props.disabled || isGenerating()}/>
        </div>

        <div class="form-group">
          <label for="checkpoint">Checkpoint</label>
          <input id="checkpoint" type="text" value={formData().checkpoint || ""} onInput={e => handleInputChange("checkpoint", e.currentTarget.value || undefined)} placeholder="Model checkpoint" disabled={props.disabled || isGenerating()}/>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="sampler">Sampler</label>
          <input id="sampler" type="text" value={formData().sampler || ""} onInput={e => handleInputChange("sampler", e.currentTarget.value || undefined)} placeholder="Sampling method" disabled={props.disabled || isGenerating()}/>
        </div>

        <div class="form-group">
          <label for="scheduler">Scheduler</label>
          <input id="scheduler" type="text" value={formData().scheduler || ""} onInput={e => handleInputChange("scheduler", e.currentTarget.value || undefined)} placeholder="Scheduler type" disabled={props.disabled || isGenerating()}/>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" disabled={props.disabled || isGenerating() || !formData().caption.trim()} class="btn btn-primary">
          {isGenerating() ? "Generating..." : "Generate Image"}
        </button>

        {isGenerating() && currentPromptId() && (<div class="generation-info">
            <small>Prompt ID: {currentPromptId()}</small>
          </div>)}
      </div>

      {comfy.error() && <div class="error-message">{comfy.error()}</div>}
    </form>);
};
