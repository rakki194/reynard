"""Dimensionality Reduction Utilities

Provides implementations of PCA, t-SNE, and UMAP for embedding visualization.
"""

import asyncio
import logging
from dataclasses import dataclass
from typing import Any, Protocol

# Conditional numpy import
from app.core.service_conditional_loading import is_numpy_enabled, can_load_service, load_service

if is_numpy_enabled() and can_load_service("numpy"):
    try:
        import numpy as np
        load_service("numpy")
    except ImportError:
        np = None
else:
    np = None

logger = logging.getLogger(__name__)


class DimensionalityReducer(Protocol):
    """Protocol for dimensionality reduction algorithms."""

    async def reduce(self, data: np.ndarray, parameters: Any) -> np.ndarray:
        """Reduce dimensionality of the input data."""
        ...


@dataclass
class PCAParameters:
    """Parameters for PCA dimensionality reduction."""

    n_components: int = 3
    variance_threshold: float = 0.95
    whiten: bool = False
    svd_solver: str = "auto"


@dataclass
class TSNEParameters:
    """Parameters for t-SNE dimensionality reduction."""

    n_components: int = 3
    perplexity: float = 30.0
    learning_rate: float = 200.0
    early_exaggeration: float = 12.0
    max_iter: int = 1000
    metric: str = "euclidean"
    method: str = "barnes_hut"


@dataclass
class UMAPParameters:
    """Parameters for UMAP dimensionality reduction."""

    n_components: int = 3
    n_neighbors: int = 15
    min_dist: float = 0.1
    learning_rate: float = 1.0
    spread: float = 1.0
    metric: str = "euclidean"
    local_connectivity: int = 1


class PCAReducer:
    """Principal Component Analysis reducer."""

    def __init__(self):
        self.name = "PCA"
        logger.info("PCA reducer initialized")

    async def reduce(self, data: np.ndarray, parameters: PCAParameters) -> np.ndarray:
        """Perform PCA dimensionality reduction.

        Args:
            data: Input data array (n_samples, n_features)
            parameters: PCA parameters

        Returns:
            Reduced data array (n_samples, n_components)

        """
        try:
            # Run in thread pool to avoid blocking
            return await asyncio.get_event_loop().run_in_executor(
                None, self._reduce_sync, data, parameters,
            )
        except Exception as e:
            logger.error(f"PCA reduction failed: {e}")
            raise

    def _reduce_sync(self, data: np.ndarray, parameters: PCAParameters) -> np.ndarray:
        """Synchronous PCA reduction."""
        try:
            from sklearn.decomposition import PCA

            # Determine number of components
            n_components = parameters.n_components

            # If variance threshold is specified, find optimal components
            if parameters.variance_threshold < 1.0:
                pca_temp = PCA()
                pca_temp.fit(data)
                cumsum_variance = np.cumsum(pca_temp.explained_variance_ratio_)
                n_components = (
                    np.argmax(cumsum_variance >= parameters.variance_threshold) + 1
                )
                n_components = min(n_components, data.shape[1])

            # Perform PCA
            pca = PCA(
                n_components=n_components,
                whiten=parameters.whiten,
                svd_solver=parameters.svd_solver,
            )

            reduced_data = pca.fit_transform(data)

            logger.info(f"PCA reduction: {data.shape} -> {reduced_data.shape}")
            logger.info(f"Explained variance ratio: {pca.explained_variance_ratio_}")
            logger.info(
                f"Cumulative explained variance: {np.cumsum(pca.explained_variance_ratio_)}",
            )

            return reduced_data

        except ImportError:
            logger.error("scikit-learn not available for PCA")
            # Fallback to simple SVD-based PCA
            return self._simple_pca(data, n_components)
        except Exception as e:
            logger.error(f"PCA reduction error: {e}")
            raise

    def _simple_pca(self, data: np.ndarray, n_components: int) -> np.ndarray:
        """Simple SVD-based PCA fallback."""
        # Center the data
        centered_data = data - np.mean(data, axis=0)

        # Perform SVD
        U, S, Vt = np.linalg.svd(centered_data, full_matrices=False)

        # Select top components
        reduced_data = U[:, :n_components] @ np.diag(S[:n_components])

        logger.info(f"Simple PCA reduction: {data.shape} -> {reduced_data.shape}")
        return reduced_data


class TSNEReducer:
    """t-SNE dimensionality reducer."""

    def __init__(self):
        self.name = "t-SNE"
        logger.info("t-SNE reducer initialized")

    async def reduce(self, data: np.ndarray, parameters: TSNEParameters) -> np.ndarray:
        """Perform t-SNE dimensionality reduction.

        Args:
            data: Input data array (n_samples, n_features)
            parameters: t-SNE parameters

        Returns:
            Reduced data array (n_samples, n_components)

        """
        try:
            # Run in thread pool to avoid blocking
            return await asyncio.get_event_loop().run_in_executor(
                None, self._reduce_sync, data, parameters,
            )
        except Exception as e:
            logger.error(f"t-SNE reduction failed: {e}")
            raise

    def _reduce_sync(self, data: np.ndarray, parameters: TSNEParameters) -> np.ndarray:
        """Synchronous t-SNE reduction."""
        try:
            from sklearn.manifold import TSNE

            # Validate parameters
            if parameters.n_components not in [2, 3]:
                raise ValueError("t-SNE only supports 2 or 3 components")

            # Adjust perplexity based on data size
            n_samples = data.shape[0]
            perplexity = min(parameters.perplexity, (n_samples - 1) / 3)

            # Perform t-SNE
            tsne = TSNE(
                n_components=parameters.n_components,
                perplexity=perplexity,
                learning_rate=parameters.learning_rate,
                early_exaggeration=parameters.early_exaggeration,
                max_iter=parameters.max_iter,
                metric=parameters.metric,
                method=parameters.method,
                random_state=42,
                verbose=1,
            )

            reduced_data = tsne.fit_transform(data)

            logger.info(f"t-SNE reduction: {data.shape} -> {reduced_data.shape}")
            logger.info(f"Final KL divergence: {tsne.kl_divergence_}")

            return reduced_data

        except ImportError:
            logger.error("scikit-learn not available for t-SNE")
            # Fallback to random projection
            return self._random_projection(data, parameters.n_components)
        except Exception as e:
            logger.error(f"t-SNE reduction error: {e}")
            raise

    def _random_projection(self, data: np.ndarray, n_components: int) -> np.ndarray:
        """Random projection fallback."""
        np.random.seed(42)
        projection_matrix = np.random.randn(data.shape[1], n_components)
        projection_matrix /= np.linalg.norm(projection_matrix, axis=0)

        reduced_data = data @ projection_matrix

        logger.info(f"Random projection fallback: {data.shape} -> {reduced_data.shape}")
        return reduced_data


class UMAPReducer:
    """UMAP dimensionality reducer."""

    def __init__(self):
        self.name = "UMAP"
        logger.info("UMAP reducer initialized")

    async def reduce(self, data: np.ndarray, parameters: UMAPParameters) -> np.ndarray:
        """Perform UMAP dimensionality reduction.

        Args:
            data: Input data array (n_samples, n_features)
            parameters: UMAP parameters

        Returns:
            Reduced data array (n_samples, n_components)

        """
        try:
            # Run in thread pool to avoid blocking
            return await asyncio.get_event_loop().run_in_executor(
                None, self._reduce_sync, data, parameters,
            )
        except Exception as e:
            logger.error(f"UMAP reduction failed: {e}")
            raise

    def _reduce_sync(self, data: np.ndarray, parameters: UMAPParameters) -> np.ndarray:
        """Synchronous UMAP reduction."""
        try:
            import umap

            # Perform UMAP
            reducer = umap.UMAP(
                n_components=parameters.n_components,
                n_neighbors=parameters.n_neighbors,
                min_dist=parameters.min_dist,
                learning_rate=parameters.learning_rate,
                spread=parameters.spread,
                metric=parameters.metric,
                local_connectivity=parameters.local_connectivity,
                random_state=42,
                verbose=True,
            )

            reduced_data = reducer.fit_transform(data)

            logger.info(f"UMAP reduction: {data.shape} -> {reduced_data.shape}")

            return reduced_data

        except ImportError:
            logger.error("UMAP not available")
            # Fallback to PCA
            logger.info("Falling back to PCA")
            pca_reducer = PCAReducer()
            pca_params = PCAParameters(n_components=parameters.n_components)
            return pca_reducer._reduce_sync(data, pca_params)
        except Exception as e:
            logger.error(f"UMAP reduction error: {e}")
            raise


# Global reducer instances
_reducers: dict[str, DimensionalityReducer] = {}


def get_dimensionality_reducer(method: str) -> DimensionalityReducer:
    """Get a dimensionality reducer instance.

    Args:
        method: Reduction method ('pca', 'tsne', 'umap')

    Returns:
        DimensionalityReducer instance

    Raises:
        ValueError: If method is not supported

    """
    if method not in _reducers:
        if method == "pca":
            _reducers[method] = PCAReducer()
        elif method == "tsne":
            _reducers[method] = TSNEReducer()
        elif method == "umap":
            _reducers[method] = UMAPReducer()
        else:
            raise ValueError(f"Unsupported reduction method: {method}")

    return _reducers[method]


def get_available_methods() -> dict[str, dict[str, Any]]:
    """Get information about available dimensionality reduction methods.

    Returns:
        Dictionary mapping method names to their information

    """
    methods = {
        "pca": {
            "name": "Principal Component Analysis",
            "description": "Linear dimensionality reduction using SVD",
            "supports_2d": True,
            "supports_3d": True,
            "fast": True,
            "preserves_global_structure": True,
            "preserves_local_structure": False,
        },
        "tsne": {
            "name": "t-Distributed Stochastic Neighbor Embedding",
            "description": "Non-linear dimensionality reduction for visualization",
            "supports_2d": True,
            "supports_3d": True,
            "fast": False,
            "preserves_global_structure": False,
            "preserves_local_structure": True,
        },
        "umap": {
            "name": "Uniform Manifold Approximation and Projection",
            "description": "Non-linear dimensionality reduction with better global structure",
            "supports_2d": True,
            "supports_3d": True,
            "fast": True,
            "preserves_global_structure": True,
            "preserves_local_structure": True,
        },
    }

    return methods


def validate_parameters(method: str, parameters: dict[str, Any]) -> dict[str, Any]:
    """Validate and normalize parameters for a given method.

    Args:
        method: Reduction method
        parameters: Raw parameters

    Returns:
        Validated and normalized parameters

    Raises:
        ValueError: If parameters are invalid

    """
    if method == "pca":
        return {
            "n_components": min(max(int(parameters.get("n_components", 3)), 2), 50),
            "variance_threshold": min(
                max(float(parameters.get("variance_threshold", 0.95)), 0.0), 1.0,
            ),
            "whiten": bool(parameters.get("whiten", False)),
            "svd_solver": str(parameters.get("svd_solver", "auto")),
        }

    if method == "tsne":
        return {
            "n_components": min(max(int(parameters.get("n_components", 3)), 2), 3),
            "perplexity": min(
                max(float(parameters.get("perplexity", 30.0)), 5.0), 100.0,
            ),
            "learning_rate": min(
                max(float(parameters.get("learning_rate", 200.0)), 10.0), 1000.0,
            ),
            "early_exaggeration": min(
                max(float(parameters.get("early_exaggeration", 12.0)), 1.0), 50.0,
            ),
            "max_iter": min(max(int(parameters.get("max_iter", 1000)), 100), 10000),
            "metric": str(parameters.get("metric", "euclidean")),
            "method": str(parameters.get("method", "barnes_hut")),
        }

    if method == "umap":
        return {
            "n_components": min(max(int(parameters.get("n_components", 3)), 2), 10),
            "n_neighbors": min(max(int(parameters.get("n_neighbors", 15)), 2), 100),
            "min_dist": min(max(float(parameters.get("min_dist", 0.1)), 0.0), 1.0),
            "learning_rate": min(
                max(float(parameters.get("learning_rate", 1.0)), 0.1), 10.0,
            ),
            "spread": min(max(float(parameters.get("spread", 1.0)), 0.1), 10.0),
            "metric": str(parameters.get("metric", "euclidean")),
            "local_connectivity": min(
                max(int(parameters.get("local_connectivity", 1)), 1), 10,
            ),
        }

    raise ValueError(f"Unsupported method: {method}")
