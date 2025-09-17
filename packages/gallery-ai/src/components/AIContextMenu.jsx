/**
 * AI Context Menu Component
 *
 * Enhanced context menu with AI-powered actions for gallery items.
 * Integrates with the annotation system to provide caption generation,
 * batch processing, and smart features.
 */
import { Show, For, createSignal } from "solid-js";
import { useAIGalleryContext } from "../composables/useGalleryAI";
import { AIContextMenuActionType } from "../types";
export const AIContextMenu = (props) => {
    const ai = useAIGalleryContext();
    const [expandedSubmenus, setExpandedSubmenus] = createSignal(new Set());
    const [isProcessing, setIsProcessing] = createSignal(false);
    // Handle action execution
    const handleActionClick = async (action) => {
        if (action.disabled || isProcessing())
            return;
        setIsProcessing(true);
        try {
            // Handle different action types
            switch (action.aiActionType) {
                case AIContextMenuActionType.GENERATE_CAPTION:
                    await handleGenerateCaption(action);
                    break;
                case AIContextMenuActionType.BATCH_ANNOTATE:
                    await handleBatchAnnotate(action);
                    break;
                case AIContextMenuActionType.EDIT_CAPTION:
                    await handleEditCaption(action);
                    break;
                case AIContextMenuActionType.DELETE_CAPTION:
                    await handleDeleteCaption(action);
                    break;
                case AIContextMenuActionType.REGENERATE_CAPTION:
                    await handleRegenerateCaption(action);
                    break;
                case AIContextMenuActionType.SMART_ORGANIZE:
                    await handleSmartOrganize(action);
                    break;
                case AIContextMenuActionType.AI_SEARCH:
                    await handleAISearch(action);
                    break;
                default:
                    // Fallback to custom onClick
                    action.onClick?.();
            }
            props.onActionClick(action);
        }
        catch (error) {
            console.error("AI action failed:", error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    // Generate caption for single item
    const handleGenerateCaption = async (action) => {
        if (props.item.type === "folder")
            return;
        const generator = action.aiConfig?.generator || ai.aiState().selectedGenerator;
        const result = await ai.generateCaption(props.item, generator);
        if (result.success) {
            console.log("Caption generated:", result.caption);
        }
    };
    // Batch annotate multiple items
    const handleBatchAnnotate = async (action) => {
        const items = props.selectedItems.filter((item) => item.type !== "folder");
        if (items.length === 0)
            return;
        const generator = action.aiConfig?.generator || ai.aiState().selectedGenerator;
        const results = await ai.batchAnnotate(items, generator);
        console.log("Batch annotation completed:", results.length, "items processed");
    };
    // Edit existing caption
    const handleEditCaption = async (_action) => {
        // This would open a caption editor dialog
        console.log("Edit caption for:", props.item.name);
    };
    // Delete caption
    const handleDeleteCaption = async (_action) => {
        // This would delete the caption file
        console.log("Delete caption for:", props.item.name);
    };
    // Regenerate caption
    const handleRegenerateCaption = async (action) => {
        if (props.item.type === "folder")
            return;
        const generator = action.aiConfig?.generator || ai.aiState().selectedGenerator;
        const result = await ai.generateCaption(props.item, generator);
        console.log("Caption regenerated:", result.caption);
    };
    // Smart organize
    const handleSmartOrganize = async (_action) => {
        console.log("Smart organize for:", props.item.name);
        // This would implement smart organization logic
    };
    // AI search
    const handleAISearch = async (_action) => {
        console.log("AI search for:", props.item.name);
        // This would implement AI-powered search
    };
    // Toggle submenu expansion
    const toggleSubmenu = (actionId) => {
        setExpandedSubmenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(actionId)) {
                newSet.delete(actionId);
            }
            else {
                newSet.add(actionId);
            }
            return newSet;
        });
    };
    // Check if action is available
    const isActionAvailable = (action) => {
        // Check if AI is enabled
        if (!ai.aiState().aiEnabled)
            return false;
        // Check if generator is available
        if (action.requiredGenerator &&
            !ai.isGeneratorAvailable(action.requiredGenerator)) {
            return false;
        }
        // Check if multiple selection is required
        if (action.requiresMultipleSelection && props.selectedItems.length < 2) {
            return false;
        }
        // Check if item type is supported
        if (action.aiActionType === AIContextMenuActionType.GENERATE_CAPTION &&
            props.item.type === "folder") {
            return false;
        }
        return true;
    };
    // Render action item
    const renderAction = (action, depth = 0) => {
        const available = isActionAvailable(action);
        const hasChildren = action.children && action.children.length > 0;
        const isExpanded = expandedSubmenus().has(action.id);
        return (<div class={`ai-context-menu__item ai-context-menu__item--depth-${depth}`}>
        <button class={`ai-context-menu__action ${!available ? "ai-context-menu__action--disabled" : ""} ${isProcessing() ? "ai-context-menu__action--processing" : ""}`} disabled={!available || isProcessing()} onClick={() => {
                if (hasChildren) {
                    toggleSubmenu(action.id);
                }
                else {
                    handleActionClick(action);
                }
            }}>
          <Show when={action.icon}>
            <span class="ai-context-menu__icon">{action.icon}</span>
          </Show>
          <span class="ai-context-menu__label">{action.label}</span>
          <Show when={hasChildren}>
            <span class={`ai-context-menu__arrow ${isExpanded ? "ai-context-menu__arrow--expanded" : ""}`}>
              ▶
            </span>
          </Show>
        </button>

        <Show when={hasChildren && isExpanded}>
          <div class="ai-context-menu__submenu">
            <For each={action.children}>
              {(childAction) => renderAction(childAction, depth + 1)}
            </For>
          </div>
        </Show>
      </div>);
    };
    return (<Show when={props.visible}>
      <div class={`ai-context-menu ai-context-menu__positioned ${props.class || ""}`} 
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    style={`--menu-x: ${props.position.x}px; --menu-y: ${props.position.y}px;`} onClick={(e) => e.stopPropagation()}>
        <div class="ai-context-menu__content">
          <div class="ai-context-menu__header">
            <span class="ai-context-menu__title">AI Actions</span>
            <Show when={isProcessing()}>
              <span class="ai-context-menu__processing">Processing...</span>
            </Show>
          </div>

          <div class="ai-context-menu__actions">
            <For each={props.actions}>{(action) => renderAction(action)}</For>
          </div>

          <Show when={ai.aiState().batchProgress}>
            <div class="ai-context-menu__progress">
              <div class="ai-context-menu__progress-bar">
                <div class="ai-context-menu__progress-fill" 
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    style={`--progress-width: ${ai.aiState().batchProgress?.percentage || 0}%`}/>
              </div>
              <span class="ai-context-menu__progress-text">
                {ai.aiState().batchProgress?.completed || 0} /{" "}
                {ai.aiState().batchProgress?.total || 0}
              </span>
            </div>
          </Show>
        </div>
      </div>
    </Show>);
};
