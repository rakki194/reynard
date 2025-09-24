"""Reynard Caption Generation Plugins

This package contains all the caption generation plugins for the Reynard system.
Each plugin implements a specific caption generation model with its own
configuration and optimization strategies.

Available plugins:
- jtp2: Joint Tagger Project PILOT2 - Specialized tagger for furry artwork
- florence2: Microsoft Florence2 - General purpose image captioning
- wdv3: WDv3 - Danbooru-style tagger
- joycaption: JoyCaption - Large language model for image captioning

Each plugin follows the same interface defined in the base module, ensuring
consistency and ease of use across different models.
"""
