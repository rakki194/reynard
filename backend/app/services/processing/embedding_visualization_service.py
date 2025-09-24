"""Embedding Visualization Service for Reynard Backend.

This module provides embedding visualization functionality for high-dimensional data.
"""

import json
import logging
import math
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

# Visualization imports
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    from matplotlib import patches
    from matplotlib.colors import to_hex

    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots

    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False

# Dimensionality reduction imports
try:
    from sklearn.cluster import DBSCAN, AgglomerativeClustering, KMeans
    from sklearn.decomposition import PCA, FastICA, TruncatedSVD
    from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
    from sklearn.manifold import MDS, TSNE, Isomap
    from sklearn.metrics import calinski_harabasz_score, silhouette_score

    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import umap

    UMAP_AVAILABLE = True
except ImportError:
    UMAP_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class EmbeddingPoint:
    """Individual embedding point data structure."""

    point_id: str
    coordinates: list[float]
    label: str | None = None
    metadata: dict[str, Any] = None
    cluster_id: int | None = None
    color: str | None = None
    size: float = 1.0
    opacity: float = 1.0

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class EmbeddingDataset:
    """Embedding dataset data structure."""

    dataset_id: str
    name: str
    description: str
    points: list[EmbeddingPoint]
    original_dimensions: int
    reduced_dimensions: int
    reduction_method: str
    created_at: datetime = None
    updated_at: datetime = None
    metadata: dict[str, Any] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
        if self.metadata is None:
            self.metadata = {}


@dataclass
class VisualizationConfig:
    """Visualization configuration."""

    width: int = 800
    height: int = 600
    background_color: str = "white"
    point_size: float = 5.0
    point_opacity: float = 0.7
    color_scheme: str = "viridis"  # viridis, plasma, inferno, magma, coolwarm
    show_legend: bool = True
    show_grid: bool = True
    show_axes: bool = True
    title: str | None = None
    x_label: str | None = None
    y_label: str | None = None
    z_label: str | None = None
    interactive: bool = True
    save_format: str = "png"  # png, svg, pdf, html
    dpi: int = 300


@dataclass
class ClusteringResult:
    """Clustering analysis result."""

    method: str
    n_clusters: int
    cluster_labels: list[int]
    silhouette_score: float
    calinski_harabasz_score: float
    inertia: float | None = None
    cluster_centers: list[list[float]] | None = None


class EmbeddingVisualizationService:
    """Service for embedding visualization and analysis."""

    def __init__(
        self,
        data_dir: str = "data/embeddings",
        output_dir: str = "data/visualizations",
    ):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Storage directories
        self.datasets_dir = self.data_dir / "datasets"
        self.datasets_dir.mkdir(exist_ok=True)
        self.visualizations_dir = self.output_dir / "images"
        self.visualizations_dir.mkdir(exist_ok=True)

        # Load existing datasets
        self._load_datasets()

        # Set default style
        if MATPLOTLIB_AVAILABLE:
            plt.style.use("default")
            sns.set_palette("husl")

    def _load_datasets(self) -> None:
        """Load existing embedding datasets."""
        try:
            datasets_file = self.data_dir / "datasets.json"
            if datasets_file.exists():
                with open(datasets_file, encoding="utf-8") as f:
                    datasets_data = json.load(f)
                    self.datasets = {
                        dataset_id: EmbeddingDataset(**dataset_data)
                        for dataset_id, dataset_data in datasets_data.items()
                    }
            else:
                self.datasets = {}
        except Exception as e:
            logger.error(f"Failed to load embedding datasets: {e}")
            self.datasets = {}

    def _save_datasets(self) -> None:
        """Save embedding datasets to storage."""
        try:
            datasets_file = self.data_dir / "datasets.json"
            datasets_data = {
                dataset_id: asdict(dataset)
                for dataset_id, dataset in self.datasets.items()
            }

            # Convert datetime objects to ISO strings
            for dataset_data in datasets_data.values():
                for key, value in dataset_data.items():
                    if isinstance(value, datetime):
                        dataset_data[key] = value.isoformat()

            with open(datasets_file, "w", encoding="utf-8") as f:
                json.dump(datasets_data, f, indent=2, default=str)

        except Exception as e:
            logger.error(f"Failed to save embedding datasets: {e}")

    async def create_embedding_dataset(
        self,
        name: str,
        description: str,
        embeddings: list[list[float]],
        labels: list[str] | None = None,
        metadata: list[dict[str, Any]] | None = None,
    ) -> EmbeddingDataset:
        """Create a new embedding dataset.

        Args:
            name: Dataset name
            description: Dataset description
            embeddings: List of embedding vectors
            labels: Optional list of labels
            metadata: Optional list of metadata dictionaries

        Returns:
            EmbeddingDataset object

        """
        try:
            if not embeddings:
                raise ValueError("Embeddings list cannot be empty")

            # Validate embeddings
            original_dimensions = len(embeddings[0])
            for i, embedding in enumerate(embeddings):
                if len(embedding) != original_dimensions:
                    raise ValueError(
                        f"Embedding {i} has {len(embedding)} dimensions, expected {original_dimensions}",
                    )

            # Create embedding points
            points = []
            for i, embedding in enumerate(embeddings):
                point = EmbeddingPoint(
                    point_id=str(uuid.uuid4()),
                    coordinates=embedding,
                    label=labels[i] if labels and i < len(labels) else None,
                    metadata=metadata[i] if metadata and i < len(metadata) else {},
                )
                points.append(point)

            # Create dataset
            dataset = EmbeddingDataset(
                dataset_id=str(uuid.uuid4()),
                name=name,
                description=description,
                points=points,
                original_dimensions=original_dimensions,
                reduced_dimensions=original_dimensions,  # Will be updated after reduction
                reduction_method="none",
            )

            # Store dataset
            self.datasets[dataset.dataset_id] = dataset
            self._save_datasets()

            logger.info(f"Created embedding dataset: {dataset.dataset_id}")
            return dataset

        except Exception as e:
            logger.error(f"Failed to create embedding dataset: {e}")
            raise

    async def reduce_dimensions(
        self,
        dataset_id: str,
        target_dimensions: int = 2,
        method: str = "tsne",
        **kwargs,
    ) -> EmbeddingDataset:
        """Reduce dimensions of an embedding dataset.

        Args:
            dataset_id: Dataset ID
            target_dimensions: Target number of dimensions (2 or 3)
            method: Reduction method ('pca', 'tsne', 'umap', 'mds', 'isomap', 'ica', 'svd', 'lda')
            **kwargs: Additional parameters for the reduction method

        Returns:
            Updated EmbeddingDataset object

        """
        try:
            if dataset_id not in self.datasets:
                raise ValueError(f"Dataset {dataset_id} not found")

            dataset = self.datasets[dataset_id]

            if not SKLEARN_AVAILABLE:
                raise RuntimeError(
                    "scikit-learn not available for dimensionality reduction",
                )

            # Extract coordinates
            coordinates = [point.coordinates for point in dataset.points]
            labels = [point.label for point in dataset.points]

            # Apply dimensionality reduction
            if method == "pca":
                reducer = PCA(n_components=target_dimensions, **kwargs)
            elif method == "tsne":
                reducer = TSNE(n_components=target_dimensions, **kwargs)
            elif method == "umap":
                if not UMAP_AVAILABLE:
                    raise RuntimeError("UMAP not available")
                reducer = umap.UMAP(n_components=target_dimensions, **kwargs)
            elif method == "mds":
                reducer = MDS(n_components=target_dimensions, **kwargs)
            elif method == "isomap":
                reducer = Isomap(n_components=target_dimensions, **kwargs)
            elif method == "ica":
                reducer = FastICA(n_components=target_dimensions, **kwargs)
            elif method == "svd":
                reducer = TruncatedSVD(n_components=target_dimensions, **kwargs)
            elif method == "lda":
                if not labels or len(set(labels)) < 2:
                    raise ValueError("LDA requires at least 2 distinct labels")
                reducer = LinearDiscriminantAnalysis(n_components=target_dimensions)
            else:
                raise ValueError(f"Unknown reduction method: {method}")

            # Fit and transform
            if method == "lda":
                reduced_coordinates = reducer.fit_transform(coordinates, labels)
            else:
                reduced_coordinates = reducer.fit_transform(coordinates)

            # Update dataset points
            for i, point in enumerate(dataset.points):
                point.coordinates = reduced_coordinates[i].tolist()

            # Update dataset metadata
            dataset.reduced_dimensions = target_dimensions
            dataset.reduction_method = method
            dataset.updated_at = datetime.now()

            # Store updated dataset
            self._save_datasets()

            logger.info(f"Reduced dimensions for dataset {dataset_id} using {method}")
            return dataset

        except Exception as e:
            logger.error(f"Failed to reduce dimensions: {e}")
            raise

    async def perform_clustering(
        self,
        dataset_id: str,
        method: str = "kmeans",
        n_clusters: int | None = None,
        **kwargs,
    ) -> ClusteringResult:
        """Perform clustering analysis on an embedding dataset.

        Args:
            dataset_id: Dataset ID
            method: Clustering method ('kmeans', 'dbscan', 'agglomerative')
            n_clusters: Number of clusters (ignored for DBSCAN)
            **kwargs: Additional parameters for the clustering method

        Returns:
            ClusteringResult object

        """
        try:
            if dataset_id not in self.datasets:
                raise ValueError(f"Dataset {dataset_id} not found")

            if not SKLEARN_AVAILABLE:
                raise RuntimeError("scikit-learn not available for clustering")

            dataset = self.datasets[dataset_id]

            # Extract coordinates
            coordinates = [point.coordinates for point in dataset.points]

            # Determine number of clusters if not specified
            if n_clusters is None:
                n_clusters = min(8, len(coordinates) // 10)  # Heuristic

            # Apply clustering
            if method == "kmeans":
                clusterer = KMeans(n_clusters=n_clusters, **kwargs)
            elif method == "dbscan":
                clusterer = DBSCAN(**kwargs)
            elif method == "agglomerative":
                clusterer = AgglomerativeClustering(n_clusters=n_clusters, **kwargs)
            else:
                raise ValueError(f"Unknown clustering method: {method}")

            # Fit clustering
            cluster_labels = clusterer.fit_predict(coordinates)

            # Calculate metrics
            if len(set(cluster_labels)) > 1:  # Need at least 2 clusters
                silhouette = silhouette_score(coordinates, cluster_labels)
                calinski_harabasz = calinski_harabasz_score(coordinates, cluster_labels)
            else:
                silhouette = 0.0
                calinski_harabasz = 0.0

            # Get cluster centers for KMeans
            cluster_centers = None
            if hasattr(clusterer, "cluster_centers_"):
                cluster_centers = clusterer.cluster_centers_.tolist()

            # Get inertia for KMeans
            inertia = None
            if hasattr(clusterer, "inertia_"):
                inertia = clusterer.inertia_

            # Update dataset points with cluster labels
            for i, point in enumerate(dataset.points):
                point.cluster_id = int(cluster_labels[i])

            # Update dataset
            dataset.updated_at = datetime.now()
            self._save_datasets()

            # Create clustering result
            result = ClusteringResult(
                method=method,
                n_clusters=len(set(cluster_labels)),
                cluster_labels=cluster_labels.tolist(),
                silhouette_score=silhouette,
                calinski_harabasz_score=calinski_harabasz,
                inertia=inertia,
                cluster_centers=cluster_centers,
            )

            logger.info(f"Performed {method} clustering on dataset {dataset_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to perform clustering: {e}")
            raise

    async def create_visualization(
        self,
        dataset_id: str,
        config: VisualizationConfig | None = None,
        backend: str = "matplotlib",
    ) -> str:
        """Create a visualization of an embedding dataset.

        Args:
            dataset_id: Dataset ID
            config: Visualization configuration
            backend: Visualization backend ('matplotlib' or 'plotly')

        Returns:
            Path to saved visualization file

        """
        try:
            if dataset_id not in self.datasets:
                raise ValueError(f"Dataset {dataset_id} not found")

            dataset = self.datasets[dataset_id]
            config = config or VisualizationConfig()

            # Extract data
            coordinates = [point.coordinates for point in dataset.points]
            labels = [point.label for point in dataset.points]
            cluster_ids = [point.cluster_id for point in dataset.points]

            if backend == "matplotlib":
                if not MATPLOTLIB_AVAILABLE:
                    raise RuntimeError("matplotlib not available")
                return await self._create_matplotlib_visualization(
                    dataset, coordinates, labels, cluster_ids, config,
                )
            if backend == "plotly":
                if not PLOTLY_AVAILABLE:
                    raise RuntimeError("plotly not available")
                return await self._create_plotly_visualization(
                    dataset, coordinates, labels, cluster_ids, config,
                )
            raise ValueError(f"Unknown visualization backend: {backend}")

        except Exception as e:
            logger.error(f"Failed to create visualization: {e}")
            raise

    async def _create_matplotlib_visualization(
        self,
        dataset: EmbeddingDataset,
        coordinates: list[list[float]],
        labels: list[str | None],
        cluster_ids: list[int | None],
        config: VisualizationConfig,
    ) -> str:
        """Create matplotlib visualization."""
        try:
            # Create figure
            fig, ax = plt.subplots(figsize=(config.width / 100, config.height / 100))
            ax.set_facecolor(config.background_color)

            # Determine colors
            if any(cluster_ids):
                # Use cluster colors
                unique_clusters = list(
                    set(cid for cid in cluster_ids if cid is not None),
                )
                colors = plt.cm.get_cmap(config.color_scheme)(
                    range(len(unique_clusters)),
                )
                point_colors = [
                    colors[unique_clusters.index(cid)] if cid is not None else "gray"
                    for cid in cluster_ids
                ]
            elif any(labels):
                # Use label colors
                unique_labels = list(
                    set(label for label in labels if label is not None),
                )
                colors = plt.cm.get_cmap(config.color_scheme)(range(len(unique_labels)))
                point_colors = [
                    colors[unique_labels.index(label)] if label is not None else "gray"
                    for label in labels
                ]
            else:
                # Use single color
                point_colors = [config.color_scheme] * len(coordinates)

            # Plot points
            if dataset.reduced_dimensions == 2:
                x_coords = [coord[0] for coord in coordinates]
                y_coords = [coord[1] for coord in coordinates]

                scatter = ax.scatter(
                    x_coords,
                    y_coords,
                    c=point_colors,
                    s=config.point_size * 20,
                    alpha=config.point_opacity,
                    edgecolors="black",
                    linewidth=0.5,
                )

                # Set labels
                if config.x_label:
                    ax.set_xlabel(config.x_label)
                if config.y_label:
                    ax.set_ylabel(config.y_label)

            elif dataset.reduced_dimensions == 3:
                # 3D plot
                ax = fig.add_subplot(111, projection="3d")
                x_coords = [coord[0] for coord in coordinates]
                y_coords = [coord[1] for coord in coordinates]
                z_coords = [coord[2] for coord in coordinates]

                scatter = ax.scatter(
                    x_coords,
                    y_coords,
                    z_coords,
                    c=point_colors,
                    s=config.point_size * 20,
                    alpha=config.point_opacity,
                    edgecolors="black",
                    linewidth=0.5,
                )

                # Set labels
                if config.x_label:
                    ax.set_xlabel(config.x_label)
                if config.y_label:
                    ax.set_ylabel(config.y_label)
                if config.z_label:
                    ax.set_zlabel(config.z_label)

            else:
                raise ValueError("Only 2D and 3D visualizations are supported")

            # Configure plot
            if config.title:
                ax.set_title(config.title, fontsize=14, fontweight="bold")

            if config.show_grid:
                ax.grid(True, alpha=0.3)

            if not config.show_axes:
                ax.set_xticks([])
                ax.set_yticks([])
                if dataset.reduced_dimensions == 3:
                    ax.set_zticks([])

            # Add legend if needed
            if config.show_legend and (any(labels) or any(cluster_ids)):
                if any(cluster_ids):
                    unique_clusters = list(
                        set(cid for cid in cluster_ids if cid is not None),
                    )
                    legend_elements = [
                        plt.Line2D(
                            [0],
                            [0],
                            marker="o",
                            color="w",
                            markerfacecolor=colors[i],
                            markersize=8,
                            label=f"Cluster {cid}",
                        )
                        for i, cid in enumerate(unique_clusters)
                    ]
                else:
                    unique_labels = list(
                        set(label for label in labels if label is not None),
                    )
                    legend_elements = [
                        plt.Line2D(
                            [0],
                            [0],
                            marker="o",
                            color="w",
                            markerfacecolor=colors[i],
                            markersize=8,
                            label=label,
                        )
                        for i, label in enumerate(unique_labels)
                    ]

                ax.legend(handles=legend_elements, loc="best")

            # Save visualization
            filename = (
                f"{dataset.dataset_id}_{dataset.reduction_method}_{config.save_format}"
            )
            filepath = self.visualizations_dir / filename

            plt.tight_layout()
            plt.savefig(filepath, dpi=config.dpi, bbox_inches="tight")
            plt.close()

            logger.info(f"Created matplotlib visualization: {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to create matplotlib visualization: {e}")
            raise

    async def _create_plotly_visualization(
        self,
        dataset: EmbeddingDataset,
        coordinates: list[list[float]],
        labels: list[str | None],
        cluster_ids: list[int | None],
        config: VisualizationConfig,
    ) -> str:
        """Create plotly visualization."""
        try:
            # Determine colors
            if any(cluster_ids):
                # Use cluster colors
                unique_clusters = list(
                    set(cid for cid in cluster_ids if cid is not None),
                )
                colors = px.colors.qualitative.Set1[: len(unique_clusters)]
                point_colors = [
                    colors[unique_clusters.index(cid)] if cid is not None else "gray"
                    for cid in cluster_ids
                ]
                color_labels = [
                    f"Cluster {cid}" if cid is not None else "No Cluster"
                    for cid in cluster_ids
                ]
            elif any(labels):
                # Use label colors
                unique_labels = list(
                    set(label for label in labels if label is not None),
                )
                colors = px.colors.qualitative.Set1[: len(unique_labels)]
                point_colors = [
                    colors[unique_labels.index(label)] if label is not None else "gray"
                    for label in labels
                ]
                color_labels = [
                    label if label is not None else "No Label" for label in labels
                ]
            else:
                # Use single color
                point_colors = [config.color_scheme] * len(coordinates)
                color_labels = ["Points"] * len(coordinates)

            # Create plot
            if dataset.reduced_dimensions == 2:
                fig = go.Figure()

                # Add scatter plot
                fig.add_trace(
                    go.Scatter(
                        x=[coord[0] for coord in coordinates],
                        y=[coord[1] for coord in coordinates],
                        mode="markers",
                        marker=dict(
                            size=config.point_size,
                            color=point_colors,
                            opacity=config.point_opacity,
                            line=dict(width=1, color="black"),
                        ),
                        text=color_labels,
                        hovertemplate="<b>%{text}</b><br>X: %{x}<br>Y: %{y}<extra></extra>",
                        name="Embeddings",
                    ),
                )

                # Update layout
                fig.update_layout(
                    title=config.title
                    or f"{dataset.name} - {dataset.reduction_method.upper()}",
                    xaxis_title=config.x_label or "Dimension 1",
                    yaxis_title=config.y_label or "Dimension 2",
                    width=config.width,
                    height=config.height,
                    plot_bgcolor=config.background_color,
                    showlegend=config.show_legend,
                )

            elif dataset.reduced_dimensions == 3:
                fig = go.Figure()

                # Add 3D scatter plot
                fig.add_trace(
                    go.Scatter3d(
                        x=[coord[0] for coord in coordinates],
                        y=[coord[1] for coord in coordinates],
                        z=[coord[2] for coord in coordinates],
                        mode="markers",
                        marker=dict(
                            size=config.point_size,
                            color=point_colors,
                            opacity=config.point_opacity,
                            line=dict(width=1, color="black"),
                        ),
                        text=color_labels,
                        hovertemplate="<b>%{text}</b><br>X: %{x}<br>Y: %{y}<br>Z: %{z}<extra></extra>",
                        name="Embeddings",
                    ),
                )

                # Update layout
                fig.update_layout(
                    title=config.title
                    or f"{dataset.name} - {dataset.reduction_method.upper()}",
                    scene=dict(
                        xaxis_title=config.x_label or "Dimension 1",
                        yaxis_title=config.y_label or "Dimension 2",
                        zaxis_title=config.z_label or "Dimension 3",
                        bgcolor=config.background_color,
                    ),
                    width=config.width,
                    height=config.height,
                    showlegend=config.show_legend,
                )

            else:
                raise ValueError("Only 2D and 3D visualizations are supported")

            # Save visualization
            filename = f"{dataset.dataset_id}_{dataset.reduction_method}.html"
            filepath = self.visualizations_dir / filename

            fig.write_html(str(filepath))

            logger.info(f"Created plotly visualization: {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to create plotly visualization: {e}")
            raise

    async def get_dataset_statistics(self, dataset_id: str) -> dict[str, Any]:
        """Get statistics for an embedding dataset.

        Args:
            dataset_id: Dataset ID

        Returns:
            Dictionary containing dataset statistics

        """
        try:
            if dataset_id not in self.datasets:
                raise ValueError(f"Dataset {dataset_id} not found")

            dataset = self.datasets[dataset_id]

            # Basic statistics
            n_points = len(dataset.points)
            n_labels = len(set(point.label for point in dataset.points if point.label))
            n_clusters = len(
                set(point.cluster_id for point in dataset.points if point.cluster_id),
            )

            # Coordinate statistics
            coordinates = [point.coordinates for point in dataset.points]
            if coordinates:
                # Calculate mean and std for each dimension
                import numpy as np

                coords_array = np.array(coordinates)
                mean_coords = np.mean(coords_array, axis=0).tolist()
                std_coords = np.std(coords_array, axis=0).tolist()

                # Calculate pairwise distances
                distances = []
                for i in range(len(coordinates)):
                    for j in range(i + 1, len(coordinates)):
                        dist = math.sqrt(
                            sum(
                                (a - b) ** 2
                                for a, b in zip(coordinates[i], coordinates[j], strict=False)
                            ),
                        )
                        distances.append(dist)

                avg_distance = np.mean(distances) if distances else 0
                max_distance = np.max(distances) if distances else 0
                min_distance = np.min(distances) if distances else 0
            else:
                mean_coords = []
                std_coords = []
                avg_distance = 0
                max_distance = 0
                min_distance = 0

            statistics = {
                "dataset_id": dataset_id,
                "name": dataset.name,
                "description": dataset.description,
                "n_points": n_points,
                "original_dimensions": dataset.original_dimensions,
                "reduced_dimensions": dataset.reduced_dimensions,
                "reduction_method": dataset.reduction_method,
                "n_labels": n_labels,
                "n_clusters": n_clusters,
                "mean_coordinates": mean_coords,
                "std_coordinates": std_coords,
                "avg_pairwise_distance": avg_distance,
                "max_pairwise_distance": max_distance,
                "min_pairwise_distance": min_distance,
                "created_at": dataset.created_at.isoformat(),
                "updated_at": dataset.updated_at.isoformat(),
            }

            return statistics

        except Exception as e:
            logger.error(f"Failed to get dataset statistics: {e}")
            raise

    async def export_dataset(self, dataset_id: str, format: str = "json") -> str:
        """Export a dataset to a file.

        Args:
            dataset_id: Dataset ID
            format: Export format ('json', 'csv', 'tsv')

        Returns:
            Path to exported file

        """
        try:
            if dataset_id not in self.datasets:
                raise ValueError(f"Dataset {dataset_id} not found")

            dataset = self.datasets[dataset_id]

            # Create export filename
            filename = f"{dataset.name}_{dataset.reduction_method}.{format}"
            filepath = self.visualizations_dir / filename

            if format == "json":
                # Export as JSON
                export_data = asdict(dataset)
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(export_data, f, indent=2, default=str)

            elif format in ["csv", "tsv"]:
                # Export as CSV/TSV
                delimiter = "," if format == "csv" else "\t"

                with open(filepath, "w", encoding="utf-8") as f:
                    # Write header
                    header = ["point_id", "label", "cluster_id"]
                    for i in range(dataset.reduced_dimensions):
                        header.append(f"dim_{i+1}")
                    header.append("metadata")
                    f.write(delimiter.join(header) + "\n")

                    # Write data
                    for point in dataset.points:
                        row = [
                            point.point_id,
                            point.label or "",
                            (
                                str(point.cluster_id)
                                if point.cluster_id is not None
                                else ""
                            ),
                        ]
                        row.extend(point.coordinates)
                        row.append(json.dumps(point.metadata))
                        f.write(delimiter.join(str(cell) for cell in row) + "\n")

            else:
                raise ValueError(f"Unsupported export format: {format}")

            logger.info(f"Exported dataset {dataset_id} to {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Failed to export dataset: {e}")
            raise

    async def delete_dataset(self, dataset_id: str) -> bool:
        """Delete an embedding dataset.

        Args:
            dataset_id: Dataset ID

        Returns:
            True if successful

        """
        try:
            if dataset_id not in self.datasets:
                return False

            # Remove dataset
            del self.datasets[dataset_id]
            self._save_datasets()

            # Remove associated files
            dataset_files = list(self.visualizations_dir.glob(f"{dataset_id}*"))
            for file_path in dataset_files:
                try:
                    file_path.unlink()
                except:
                    pass

            logger.info(f"Deleted dataset: {dataset_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete dataset: {e}")
            return False


# Global embedding visualization service instance
embedding_visualization_service = EmbeddingVisualizationService()
