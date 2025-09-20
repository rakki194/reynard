/**
 * Segmentation Panel Component
 *
 * Comprehensive panel for managing segmentations with list view, search,
 * sorting, and controls. Integrates with TagBubble components for enhanced
 * user experience and follows Reynard design patterns.
 */
import { createSignal, createMemo, For, Show } from "solid-js";
import { getIcon } from "reynard-fluent-icons";
import { PolygonOps } from "reynard-algorithms";
import { SegmentationSource } from "../types/index.js";
import "./SegmentationPanel.css";
/**
 * Segmentation Panel Component with comprehensive management capabilities
 */
export const SegmentationPanel = props => {
    const [searchTerm, setSearchTerm] = createSignal("");
    const [sortBy, setSortBy] = createSignal("date");
    const [sortOrder, setSortOrder] = createSignal("desc");
    const [showFilters, setShowFilters] = createSignal(false);
    const [filterSource, setFilterSource] = createSignal("all");
    // Filtered and sorted segmentations
    const filteredSegmentations = createMemo(() => {
        let filtered = props.segmentations;
        // Filter by search term
        if (searchTerm()) {
            const term = searchTerm().toLowerCase();
            filtered = filtered.filter(seg => seg.id.toLowerCase().includes(term) ||
                seg.caption?.content.toLowerCase().includes(term) ||
                seg.metadata?.category?.toLowerCase().includes(term));
        }
        // Filter by source
        if (filterSource() !== "all") {
            filtered = filtered.filter(seg => seg.metadata?.source === filterSource());
        }
        // Sort segmentations
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy()) {
                case "name":
                    comparison = a.id.localeCompare(b.id);
                    break;
                case "date":
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case "area":
                    const areaA = calculateArea(a);
                    const areaB = calculateArea(b);
                    comparison = areaA - areaB;
                    break;
            }
            return sortOrder() === "asc" ? comparison : -comparison;
        });
        return filtered;
    });
    // Calculate polygon area using PolygonOps
    const calculateArea = (segmentation) => {
        return PolygonOps.area(segmentation.polygon);
    };
    // Get source icon
    const getSourceIcon = (source) => {
        switch (source) {
            case SegmentationSource.MANUAL:
                return getIcon("Edit");
            case SegmentationSource.AI_GENERATED:
                return getIcon("Sparkle");
            case SegmentationSource.IMPORTED:
                return getIcon("Import");
            case SegmentationSource.REFINED:
                return getIcon("ArrowSync");
            default:
                return getIcon("Circle");
        }
    };
    // Get source color
    const getSourceColor = (source) => {
        switch (source) {
            case SegmentationSource.MANUAL:
                return "#3b82f6";
            case SegmentationSource.AI_GENERATED:
                return "#10b981";
            case SegmentationSource.IMPORTED:
                return "#f59e0b";
            case SegmentationSource.REFINED:
                return "#8b5cf6";
            default:
                return "#6b7280";
        }
    };
    // Format date
    const formatDate = (date) => {
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };
    // Format area
    const formatArea = (area) => {
        if (area < 1000) {
            return `${Math.round(area)} px²`;
        }
        else if (area < 1000000) {
            return `${Math.round(area / 1000)}k px²`;
        }
        else {
            return `${Math.round(area / 1000000)}M px²`;
        }
    };
    return (<div class={`segmentation-panel ${props.class || ""}`}>
      {/* Header */}
      <div class="segmentation-panel-header">
        <h3 class="segmentation-panel-title">Segmentations</h3>
        <div class="segmentation-panel-count">{props.segmentations.length} items</div>
      </div>

      {/* Controls */}
      <div class="segmentation-panel-controls">
        {/* Search */}
        <div class="segmentation-panel-search">
          <input type="text" placeholder="Search segmentations..." value={searchTerm()} onInput={e => setSearchTerm(e.currentTarget.value)} class="segmentation-panel-search-input"/>
        </div>

        {/* Sort controls */}
        <div class="segmentation-panel-sort">
          <select value={sortBy()} onChange={e => setSortBy(e.currentTarget.value)} class="segmentation-panel-sort-select" title="Sort segmentations by" aria-label="Sort segmentations by">
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="area">Area</option>
          </select>

          <button onClick={() => setSortOrder(sortOrder() === "asc" ? "desc" : "asc")} class="segmentation-panel-sort-button" title={`Sort ${sortOrder() === "asc" ? "Descending" : "Ascending"}`}>
            {getIcon(sortOrder() === "asc" ? "ArrowUp" : "ArrowDown")}
          </button>
        </div>

        {/* Filter toggle */}
        <button onClick={() => setShowFilters(!showFilters())} class={`segmentation-panel-filter-button ${showFilters() ? "active" : ""}`} title="Toggle Filters">
          {getIcon("Filter")}
        </button>

        {/* Create button */}
        <button onClick={props.onSegmentationCreate} class="segmentation-panel-create-button" title="Create New Segmentation">
          {getIcon("Add")}
          Create
        </button>
      </div>

      {/* Advanced filters */}
      <Show when={showFilters()}>
        <div class="segmentation-panel-filters">
          <div class="segmentation-panel-filter-group">
            <label class="segmentation-panel-filter-label">Source:</label>
            <select value={filterSource()} onChange={e => setFilterSource(e.currentTarget.value)} class="segmentation-panel-filter-select">
              <option value="all">All Sources</option>
              <option value={SegmentationSource.MANUAL}>Manual</option>
              <option value={SegmentationSource.AI_GENERATED}>AI Generated</option>
              <option value={SegmentationSource.IMPORTED}>Imported</option>
              <option value={SegmentationSource.REFINED}>Refined</option>
            </select>
          </div>
        </div>
      </Show>

      {/* Segmentation list */}
      <div class="segmentation-panel-list">
        <Show when={filteredSegmentations().length > 0} fallback={<div class="segmentation-panel-empty">
              <div class="segmentation-panel-empty-icon">{getIcon("Shape")}</div>
              <div class="segmentation-panel-empty-text">No segmentations found</div>
              <Show when={searchTerm()}>
                <div class="segmentation-panel-empty-hint">Try adjusting your search terms</div>
              </Show>
            </div>}>
          <For each={filteredSegmentations()}>
            {segmentation => (<div class={`segmentation-panel-item ${segmentation.id === props.selectedSegmentation ? "selected" : ""}`} onClick={() => props.onSegmentationSelect?.(segmentation.id)}>
                {/* Source indicator */}
                <div class="segmentation-panel-item-source" style={{
                color: getSourceColor(segmentation.metadata?.source || SegmentationSource.MANUAL),
            }} title={segmentation.metadata?.source || SegmentationSource.MANUAL}>
                  {getSourceIcon(segmentation.metadata?.source || SegmentationSource.MANUAL)}
                </div>

                {/* Content */}
                <div class="segmentation-panel-item-content">
                  <div class="segmentation-panel-item-header">
                    <div class="segmentation-panel-item-id">{segmentation.id}</div>
                    <div class="segmentation-panel-item-date">{formatDate(segmentation.createdAt)}</div>
                  </div>

                  <Show when={segmentation.caption?.content}>
                    <div class="segmentation-panel-item-caption">{segmentation.caption?.content}</div>
                  </Show>

                  <Show when={segmentation.metadata?.category}>
                    <div class="segmentation-panel-item-category">
                      <span class="segmentation-panel-item-category-tag">{segmentation.metadata?.category}</span>
                    </div>
                  </Show>

                  <div class="segmentation-panel-item-meta">
                    <span class="segmentation-panel-item-area">{formatArea(calculateArea(segmentation))}</span>
                    <span class="segmentation-panel-item-points">{segmentation.polygon.points.length} points</span>
                    <Show when={segmentation.metadata?.confidence}>
                      <span class="segmentation-panel-item-confidence">
                        {Math.round((segmentation.metadata?.confidence || 0) * 100)}%
                      </span>
                    </Show>
                  </div>
                </div>

                {/* Actions */}
                <div class="segmentation-panel-item-actions">
                  <button onClick={e => {
                e.stopPropagation();
                props.onSegmentationDelete?.(segmentation.id);
            }} class="segmentation-panel-item-delete" title="Delete Segmentation">
                    {getIcon("Delete")}
                  </button>
                </div>
              </div>)}
          </For>
        </Show>
      </div>
    </div>);
};
