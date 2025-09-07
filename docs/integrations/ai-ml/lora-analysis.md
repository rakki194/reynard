# LoRA Analysis

Utilities for extracting metadata from LoRA model files and performing PCA analysis of weight matrices with optional visualizations.

## Metadata Extraction

`LoraMetadataExtractor.extract_metadata(lora_path)` returns cohesive metadata blocks: `file_info`, `model_info`, `training_info`, `architecture_info`, and `validation_info`. SafeTensors is read via `safetensors.safe_open(...).metadata()`. PyTorch checkpoints load via `torch.load`, scanning for LoRA keys to infer rank and target modules. A validator checks for basic consistency and reports warnings/errors. Export helpers write JSON, plain text, or Markdown.

- Files:
  - `app/lora_analysis/metadata.py`

The SafeTensors metadata supports common keys such as `ss_model_name`, `ss_base_model_name`, `ss_network_rank`, `ss_network_alpha`, and `ss_network_module` among many others. When reading PyTorch checkpoints, rank is inferred from the first occurrence of a `lora_A` or `lora_B` tensor, and target modules are derived from key prefixes. The extractor also provides helpers to format results for display and to export metadata to JSON, text, or Markdown. Validation currently checks for a positive rank and emits warnings when alpha or target modules are missing.

Example (programmatic):

```python
from pathlib import Path
from app.lora_analysis.metadata import LoraMetadataExtractor

extractor = LoraMetadataExtractor()
metadata = await extractor.extract_metadata(Path("/path/to/model.safetensors"))
print(await extractor.format_metadata_for_printing(metadata))
```

Returned shape (abbreviated):

```json
{
  "file_info": {"filename": "model.safetensors", "file_size_mb": 123.45, "file_extension": ".safetensors", "modified_time": "..."},
  "model_info": {"format": "safetensors", "model_name": "...", "base_model": "...", "network_rank": 16, "network_alpha": 32.0, "network_module": "q_proj,v_proj", "all_metadata": {"ss_model_name": "...", "ss_network_rank": "16", "...": "..."}},
  "training_info": {"training_method": "", "learning_rate": 0.0, "batch_size": 0, "epochs": 0, "steps": 0, ...},
  "architecture_info": {"target_modules": [], "rank": 0, "alpha": 0.0, ...},
  "validation_info": {"is_valid": true, "warnings": ["..."], "errors": []},
  "extraction_time": "..."
}
```

## PCA Analysis

`LoraPcaAnalyzer.analyze_lora_pca(lora_path, n_components)` extracts weight matrices for LoRA layers (keys containing `lora_A`/`lora_B`), standardizes them, and runs PCA. Results include explained variance, components, singular values, and transformed data. Visualization helpers generate multi-plot figures and heatmaps when Matplotlib/Seaborn are available.

- Files:
  - `app/lora_analysis/pca.py`

Analysis runs per layer that contains LoRA weights, flattens weights appropriately, uses `StandardScaler` and `sklearn.decomposition.PCA`, and returns a success flag plus per-layer results. A convenience method can generate figures showing explained variance curves, cumulative variance, singular values, and a heatmap of principal components when plotting backends are present.

Example (programmatic):

```python
from pathlib import Path
from app.lora_analysis.pca import LoraPcaAnalyzer

pca = LoraPcaAnalyzer()
result = await pca.analyze_lora_pca(Path("/path/to/model.safetensors"), n_components=8)
if result.get("success"):
    print("Layers analyzed:", result.get("total_layers"))
```

Returned shape (abbreviated):

```json
{
  "success": true,
  "pca_results": {
    "some.layer.lora_A": {
      "explained_variance_ratio": [0.21, 0.13, ...],
      "singular_values": [1.23, 1.01, ...],
      "components": [[...], [...], ...],
      "transformed_data": [[...], ...],
      "n_components": 8,
      "total_variance": 0.62,
      "cumulative_variance": [0.21, 0.34, ...]
    },
    "some.layer.lora_B": {"...": "..."}
  },
  "n_components": 8,
  "total_layers": 12
}
```

When the required dependencies are not available, the analyzer returns a structured error (for example when `scikit-learn` is not installed). All heavy imports, including NumPy, PyTorch, Matplotlib, and SafeTensors, are loaded lazily to minimize baseline overhead.

Optional visualization and export:

```python
ok = await pca.generate_pca_visualization(result, Path("/tmp/pca.png"))
ok = await pca.export_pca_results(result, Path("/tmp/pca.json"))
```

Interpreting PCA for LoRA: principal components can surface dominant adaptation directions per module. Cumulative explained variance indicates how compactly the adaptation is represented; for small ranks, a few components often explain most of the variance.

## Notes

- All heavy imports are lazily loaded to avoid runtime penalties.
- Errors are logged; callers receive structured results and can display summaries.

## Resizing and Merging

The resizer supports changing the effective rank by padding or truncating `lora_A` and `lora_B` matrices and can merge multiple LoRA adapters with weighted averaging. The resize validator checks file presence, size, rank validity, and extracts the current rank from the first `lora_A`/`lora_B` occurrence. Resizing pads with zeros when increasing rank and truncates when decreasing rank. Merging normalizes provided weights and combines per-layer tensors across models.

Example (programmatic):

```python
from pathlib import Path
from app.lora_analysis.resizer import LoraResizer

resizer = LoraResizer()
valid = await resizer.validate_resize_operation(Path("/path/to/model.safetensors"), new_rank=32)
if valid.get("is_valid"):
    await resizer.resize_lora_rank(Path("/path/to/model.safetensors"), 32, Path("/tmp/out.safetensors"))
```

The saver writes SafeTensors or PyTorch checkpoints, attaching minimal metadata such as `ss_network_rank` and an operation tag (e.g., `resize` or `weighted_sum`). Consider that zero-padding or truncation is a simplistic approach; fine-tuning at the new rank typically yields better quality.

- Files:
  - `app/lora_analysis/resizer.py`

## Visualization

Visualization helpers render per-layer heatmaps, distribution histograms, rank analysis summaries (including singular-value spectra and cumulative explained variance), and model-to-model comparisons. They reuse the same lazy-loaded plotting backends and write figures to disk.

Example (programmatic):

```python
from pathlib import Path
from app.lora_analysis.visualizer import LoraVisualizer

viz = LoraVisualizer()
await viz.generate_weight_distribution_plot(Path("/path/to/model.safetensors"), Path("/tmp/dist.png"))
await viz.generate_rank_analysis_plot(Path("/path/to/model.safetensors"), Path("/tmp/rank.png"))
```

- Files:
  - `app/lora_analysis/visualizer.py`

## Frontend Integration

The UI includes a PCA panel and a LoRA resizer that call corresponding backend endpoints. The PCA panel runs server-side analysis and presents explained-variance summaries and component plots; the resizer validates a model, then issues resize or merge operations, and reports outputs. Both use authenticated fetches and display notifications on success or failure.

- Files:
  - `src/components/LoraAnalysis/PcaAnalysis.tsx`
  - `src/components/LoraAnalysis/LoraResizer.tsx`

## Background and Best Practices

LoRA (Low-Rank Adaptation) injects low-rank matrices into existing weights so that an adapted weight is effectively \( W' = W + \alpha BA \) with rank \( r \ll \min(d, k) \). Practical implications for analysis include focusing on the `lora_A` and `lora_B` matrices per target module, inspecting singular values to understand effective dimensionality, and monitoring how much variance is captured by the first few components. SafeTensors is preferred for robustness and faster metadata access. When changing ranks mechanically, treat the result as a structural transformation and consider further fine-tuning. For merging adapters, weight normalization avoids scale drift across models.

Key references include the original LoRA paper for conceptual grounding and community conventions around SafeTensors metadata keys. See the LoRA paper “LoRA: Low-Rank Adaptation of Large Language Models” and common SafeTensors metadata practices in diffusion model tooling for additional context.
