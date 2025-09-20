/**
 * ContentQualityDisplay Component
 *
 * Visualizes content quality assessment with detailed factor breakdown.
 */
import { For, createSignal } from "solid-js";
import { useContentQuality } from "../composables/useContentQuality";
export function ContentQualityDisplay(props) {
    const { content, metadata, quality, onQualityUpdate, className = "" } = props;
    const [isAssessing, setIsAssessing] = createSignal(false);
    const [currentQuality, setCurrentQuality] = createSignal(quality || null);
    const { assessQuality, getQualityLevel } = useContentQuality({
        onQualityUpdate: quality => {
            setCurrentQuality(quality);
            onQualityUpdate?.(quality);
        },
    });
    const handleAssessQuality = async () => {
        if (!content)
            return;
        try {
            setIsAssessing(true);
            const result = await assessQuality(content, metadata);
            setCurrentQuality(result);
            onQualityUpdate?.(result);
        }
        catch (error) {
            console.error("Failed to assess quality:", error);
        }
        finally {
            setIsAssessing(false);
        }
    };
    const getQualityColor = (level) => {
        switch (level) {
            case "excellent":
                return "text-green-600 bg-green-100";
            case "good":
                return "text-blue-600 bg-blue-100";
            case "fair":
                return "text-yellow-600 bg-yellow-100";
            case "poor":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 75)
            return "text-blue-600";
        if (score >= 60)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getScoreBarColor = (score) => {
        if (score >= 90)
            return "bg-green-500";
        if (score >= 75)
            return "bg-blue-500";
        if (score >= 60)
            return "bg-yellow-500";
        return "bg-red-500";
    };
    const formatScore = (score) => {
        return Math.round(score);
    };
    return (<div class={`content-quality-display ${className}`}>
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Content Quality Assessment</h3>
          <p class="text-sm text-gray-600">Analyze content quality across multiple factors</p>
        </div>
        {content && (<button onClick={handleAssessQuality} disabled={isAssessing()} class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isAssessing() ? "Assessing..." : "Assess Quality"}
          </button>)}
      </div>

      {/* Overall Quality Score */}
      {currentQuality() && (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Overall Quality</h4>
            <span class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(currentQuality().overall)}`}>
              {currentQuality().overall.charAt(0).toUpperCase() + currentQuality().overall.slice(1)}
            </span>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Quality Score</span>
                <span class={`text-2xl font-bold ${getScoreColor(currentQuality().score)}`}>
                  {formatScore(currentQuality().score)}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class={`h-3 rounded-full transition-all duration-500 ${getScoreBarColor(currentQuality().score)}`} style={{ width: `${currentQuality().score}%` }}/>
              </div>
            </div>
          </div>
        </div>)}

      {/* Quality Factors */}
      {currentQuality() && (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Quality Factors</h4>
          <div class="space-y-4">
            <For each={currentQuality().factors}>
              {factor => (<div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">{factor.name}</span>
                      <span class={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                        {formatScore(factor.score)}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(factor.score)}`} style={{ width: `${factor.score}%` }}/>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{factor.description}</p>
                  </div>
                  <div class="ml-4 text-right">
                    <div class="text-xs text-gray-500">Weight</div>
                    <div class="text-sm font-medium text-gray-900">{Math.round(factor.weight * 100)}%</div>
                  </div>
                </div>)}
            </For>
          </div>
        </div>)}

      {/* No Quality Data */}
      {!currentQuality() && !content && (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No quality assessment</h3>
            <p class="mt-1 text-sm text-gray-500">Provide content to assess its quality across multiple factors.</p>
          </div>
        </div>)}

      {/* Quality Guidelines */}
      <div class="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Quality Guidelines</h4>
        <div class="text-sm text-blue-800 space-y-1">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"/>
            <span>
              <strong>Excellent (90-100):</strong> High-quality content with excellent structure and completeness
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"/>
            <span>
              <strong>Good (75-89):</strong> Well-structured content with good readability and relevance
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-yellow-500 rounded-full"/>
            <span>
              <strong>Fair (60-74):</strong> Adequate content with room for improvement
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-red-500 rounded-full"/>
            <span>
              <strong>Poor (0-59):</strong> Low-quality content requiring significant improvement
            </span>
          </div>
        </div>
      </div>
    </div>);
}
