/**
 * Generator Converter Utility
 *
 * Converts backend generator information to frontend CaptionGenerator format.
 */
import { CaptionGenerator } from "../types/index.js";
export declare class GeneratorConverter {
    /**
     * Convert backend generator info to CaptionGenerator format
     */
    static convertGeneratorInfo(generatorInfo: any): CaptionGenerator;
    /**
     * Convert multiple generator infos to CaptionGenerator array
     */
    static convertGeneratorInfos(generators: Record<string, any>): CaptionGenerator[];
}
