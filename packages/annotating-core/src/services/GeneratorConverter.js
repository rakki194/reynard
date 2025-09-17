/**
 * Generator Converter Utility
 *
 * Converts backend generator information to frontend CaptionGenerator format.
 */
export class GeneratorConverter {
    /**
     * Convert backend generator info to CaptionGenerator format
     */
    static convertGeneratorInfo(generatorInfo) {
        return {
            name: generatorInfo.name,
            description: generatorInfo.description,
            version: generatorInfo.version,
            captionType: generatorInfo.caption_type,
            modelCategory: generatorInfo.model_category,
            isAvailable: generatorInfo.is_available,
            isLoaded: generatorInfo.is_loaded,
            status: generatorInfo.status,
            configSchema: generatorInfo.config_schema,
            features: generatorInfo.features,
            metadata: generatorInfo.metadata,
        };
    }
    /**
     * Convert multiple generator infos to CaptionGenerator array
     */
    static convertGeneratorInfos(generators) {
        return Object.values(generators).map(this.convertGeneratorInfo);
    }
}
