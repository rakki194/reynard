#!/usr/bin/env python3
"""Test Enhanced Service Profiler
===============================

Comprehensive tests for the enhanced service profiler with detailed statistics
and specific recommendations.
"""

import asyncio
import os
import pytest
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

try:
    from fenrir.tools.service_profiler import ServiceProfiler, ServiceMetrics, PackageMetrics, FeatureMetrics
    TOOLS_AVAILABLE = True
except ImportError:
    TOOLS_AVAILABLE = False


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Service profiler not available")
class TestEnhancedServiceProfiler:
    """Test the enhanced service profiler functionality."""

    def test_service_profiler_initialization(self):
        """Test ServiceProfiler initializes correctly with enhanced features."""
        profiler = ServiceProfiler()

        assert profiler is not None
        assert hasattr(profiler, 'service_metrics')
        assert hasattr(profiler, 'package_metrics')
        assert hasattr(profiler, 'feature_metrics')
        assert hasattr(profiler, 'enabled_services')
        assert hasattr(profiler, 'enabled_packages')
        assert hasattr(profiler, 'enabled_features')

    def test_get_enabled_services_comprehensive(self):
        """Test that all service types are detected correctly."""
        profiler = ServiceProfiler()
        
        # Test with mock environment variables
        with patch.dict(os.environ, {
            'RAG_ENABLED': 'true',
            'OLLAMA_ENABLED': 'true',
            'PYTORCH_ENABLED': 'true',
            'TRANSFORMERS_ENABLED': 'true',
            'EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED': 'true',
            'PDF_PROCESSING_ENABLED': 'true',
            'DIFFUSION_PIPE_ENABLED': 'true',
            'CONTINUOUS_INDEXING_ENABLED': 'true',
        }):
            enabled = profiler._get_enabled_services()
            
            # Should include various service types
            assert 'rag' in enabled
            assert 'ollama' in enabled
            assert 'pytorch' in enabled
            assert 'transformers' in enabled
            assert 'sentence_transformers' in enabled
            assert 'pdf_processing' in enabled
            assert 'diffusion_pipe' in enabled
            assert 'continuous_indexing' in enabled

    def test_service_configuration_comprehensive(self):
        """Test that service configurations are comprehensive."""
        profiler = ServiceProfiler()
        
        # Test RAG configuration
        rag_config = profiler._get_service_configuration('rag')
        assert 'RAG_ENABLED' in rag_config
        assert 'RAG_CONTINUOUS_INDEXING_ENABLED' in rag_config
        assert 'INDEXING_MEMORY_PROFILER_ENABLED' in rag_config
        assert 'EMBEDDING_BACKENDS_ENABLED' in rag_config

        # Test PyTorch configuration
        pytorch_config = profiler._get_service_configuration('pytorch')
        assert 'PYTORCH_ENABLED' in pytorch_config
        assert 'PYTORCH_CUDA_ALLOC_CONF' in pytorch_config
        assert 'CUDA_LAUNCH_BLOCKING' in pytorch_config

        # Test Gatekeeper configuration
        gatekeeper_config = profiler._get_service_configuration('gatekeeper')
        assert 'GATEKEEPER_ENABLED' in gatekeeper_config
        assert 'GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES' in gatekeeper_config
        assert 'GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS' in gatekeeper_config

    def test_service_dependencies_comprehensive(self):
        """Test that service dependencies are comprehensive."""
        profiler = ServiceProfiler()
        
        # Test RAG dependencies
        rag_deps = profiler._get_service_dependencies('rag')
        assert 'database' in rag_deps
        assert 'redis' in rag_deps
        assert 'embedding_backends' in rag_deps
        assert 'file_indexing' in rag_deps

        # Test PyTorch dependencies
        pytorch_deps = profiler._get_service_dependencies('pytorch')
        assert 'numpy' in pytorch_deps
        assert 'cuda' in pytorch_deps

        # Test Transformers dependencies
        transformers_deps = profiler._get_service_dependencies('transformers')
        assert 'torch' in transformers_deps
        assert 'tokenizers' in transformers_deps

    def test_service_specific_recommendations(self):
        """Test that service-specific recommendations are provided."""
        profiler = ServiceProfiler()
        
        # Test PyTorch memory recommendation
        pytorch_memory_rec = profiler._get_service_specific_recommendation('pytorch', 'memory')
        assert 'torch.jit.script' in pytorch_memory_rec
        assert 'CUDA memory pooling' in pytorch_memory_rec

        # Test RAG startup recommendation
        rag_startup_rec = profiler._get_service_specific_recommendation('rag', 'startup')
        assert 'asynchronously' in rag_startup_rec
        assert 'cache vector indices' in rag_startup_rec

        # Test Ollama memory recommendation
        ollama_memory_rec = profiler._get_service_specific_recommendation('ollama', 'memory')
        assert 'model streaming' in ollama_memory_rec
        assert 'connection pooling' in ollama_memory_rec

    def test_generate_specific_recommendations(self):
        """Test that specific recommendations are generated based on actual data."""
        profiler = ServiceProfiler()
        
        # Mock some service metrics
        profiler.service_metrics = {
            'high_memory_service': ServiceMetrics(
                name='high_memory_service',
                enabled=True,
                memory_mb=75.0,  # High memory
                memory_percent=0.1,
                cpu_percent=0.0,
                startup_time_ms=500.0,
                import_time_ms=100.0,
                dependencies=['dep1', 'dep2'],
                configuration={},
                status='active',
                error_count=0,
                last_activity=None,
                performance_score=30.0  # Low performance
            ),
            'slow_service': ServiceMetrics(
                name='slow_service',
                enabled=True,
                memory_mb=20.0,
                memory_percent=0.1,
                cpu_percent=0.0,
                startup_time_ms=1500.0,  # Slow startup
                import_time_ms=200.0,
                dependencies=['dep1', 'dep2', 'dep3', 'dep4', 'dep5'],  # Many dependencies
                configuration={},
                status='active',
                error_count=0,
                last_activity=None,
                performance_score=80.0
            )
        }
        
        recommendations = profiler._generate_specific_recommendations()
        
        # Should have memory optimization recommendation
        memory_rec = next((r for r in recommendations if r['category'] == 'memory_optimization'), None)
        assert memory_rec is not None
        assert memory_rec['priority'] == 'high'
        assert 'high_memory_service' in memory_rec['services_affected']
        assert 'lazy loading' in memory_rec['recommendation']

        # Should have startup optimization recommendation
        startup_rec = next((r for r in recommendations if r['category'] == 'startup_optimization'), None)
        assert startup_rec is not None
        assert startup_rec['priority'] == 'medium'
        assert 'slow_service' in startup_rec['services_affected']
        assert 'initialization' in startup_rec['recommendation']

        # Should have performance optimization recommendation
        perf_rec = next((r for r in recommendations if r['category'] == 'performance_optimization'), None)
        assert perf_rec is not None
        assert perf_rec['priority'] == 'high'
        assert 'high_memory_service' in perf_rec['services_affected']
        assert 'performance bottlenecks' in perf_rec['recommendation']

        # Should have dependency optimization recommendation
        dep_rec = next((r for r in recommendations if r['category'] == 'dependency_optimization'), None)
        assert dep_rec is not None
        assert dep_rec['priority'] == 'medium'
        assert 'slow_service' in dep_rec['services_affected']
        assert 'dependencies' in dep_rec['recommendation']

    @pytest.mark.asyncio
    async def test_profile_all_services_comprehensive(self):
        """Test comprehensive service profiling."""
        profiler = ServiceProfiler()
        
        # Mock environment to have some services enabled
        with patch.dict(os.environ, {
            'RAG_ENABLED': 'true',
            'OLLAMA_ENABLED': 'true',
            'PYTORCH_ENABLED': 'true',
        }):
            # Mock the import and initialization methods to avoid actual imports
            with patch.object(profiler, '_import_service_module') as mock_import, \
                 patch.object(profiler, '_initialize_service') as mock_init:
                
                mock_import.return_value = MagicMock()
                mock_init.return_value = MagicMock()
                
                results = await profiler.profile_all_services()
                
                # Check that results have the expected structure
                assert 'profiling_session' in results
                assert 'services' in results
                assert 'packages' in results
                assert 'features' in results
                assert 'summary' in results
                
                # Check that summary has enhanced features
                summary = results['summary']
                assert 'specific_recommendations' in summary
                assert 'top_memory_consumers' in summary
                assert 'slowest_services' in summary
                
                # Check that recommendations are included in top consumers
                if summary['top_memory_consumers']:
                    for consumer in summary['top_memory_consumers']:
                        assert 'recommendation' in consumer
                        assert isinstance(consumer['recommendation'], str)
                        assert len(consumer['recommendation']) > 0

    def test_calculate_service_performance_score(self):
        """Test service performance score calculation."""
        profiler = ServiceProfiler()
        
        # Test with good performance metrics
        good_score = profiler._calculate_service_performance_score(
            memory_mb=10.0,  # Low memory
            startup_time_ms=100.0,  # Fast startup
            import_time_ms=50.0  # Fast import
        )
        assert good_score > 80  # Should be high score
        
        # Test with poor performance metrics
        poor_score = profiler._calculate_service_performance_score(
            memory_mb=100.0,  # High memory
            startup_time_ms=2000.0,  # Slow startup
            import_time_ms=1000.0  # Slow import
        )
        assert poor_score < 50  # Should be low score

    def test_calculate_feature_performance_score(self):
        """Test feature performance score calculation."""
        profiler = ServiceProfiler()
        
        # Test with good performance metrics
        good_score = profiler._calculate_feature_performance_score(
            memory_mb=5.0,  # Low memory
            services_count=2,  # Few services
            endpoints_count=3  # Few endpoints
        )
        assert good_score > 80  # Should be high score
        
        # Test with poor performance metrics
        poor_score = profiler._calculate_feature_performance_score(
            memory_mb=150.0,  # High memory
            services_count=10,  # Many services
            endpoints_count=20  # Many endpoints
        )
        assert poor_score < 50  # Should be low score

    def test_system_health_calculation(self):
        """Test system health calculation."""
        profiler = ServiceProfiler()
        
        # Mock service metrics for health calculation
        profiler.service_metrics = {
            'service1': ServiceMetrics(
                name='service1',
                enabled=True,
                memory_mb=30.0,  # Moderate memory
                memory_percent=0.1,
                cpu_percent=0.0,
                startup_time_ms=500.0,  # Moderate startup
                import_time_ms=100.0,
                dependencies=[],
                configuration={},
                status='active',
                error_count=0,
                last_activity=None,
                performance_score=80.0
            ),
            'service2': ServiceMetrics(
                name='service2',
                enabled=True,
                memory_mb=20.0,  # Low memory
                memory_percent=0.1,
                cpu_percent=0.0,
                startup_time_ms=200.0,  # Fast startup
                import_time_ms=50.0,
                dependencies=[],
                configuration={},
                status='active',
                error_count=0,
                last_activity=None,
                performance_score=90.0
            )
        }
        
        health = profiler._calculate_system_health()
        
        assert 'overall_health_score' in health
        assert 'active_services' in health
        assert 'total_services' in health
        assert 'service_uptime_percentage' in health
        assert 'average_memory_usage_mb' in health
        assert 'average_startup_time_ms' in health
        assert 'health_status' in health
        
        # With good metrics, health should be excellent
        assert health['overall_health_score'] >= 90
        assert health['health_status'] == 'excellent'
        assert health['active_services'] == 2
        assert health['total_services'] == 2
        assert health['service_uptime_percentage'] == 100.0


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Service profiler not available")
class TestServiceProfilerIntegration:
    """Test service profiler integration with Fenrir profiler."""

    @pytest.mark.asyncio
    async def test_fenrir_profiler_integration(self):
        """Test that service profiler integrates correctly with Fenrir profiler."""
        from fenrir.core.profiler import FenrirProfiler
        
        profiler = FenrirProfiler()
        
        # Mock environment to have some services enabled
        with patch.dict(os.environ, {
            'RAG_ENABLED': 'true',
            'OLLAMA_ENABLED': 'true',
        }):
            results = await profiler.run_detailed_service_profiling('test-integration')
            
            # Check that results have the expected structure
            assert 'profiling_session' in results
            assert 'services' in results
            assert 'summary' in results
            assert 'session_id' in results
            assert 'timestamp' in results
            
            # Check that summary has enhanced features
            summary = results['summary']
            assert 'specific_recommendations' in summary
            assert isinstance(summary['specific_recommendations'], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
