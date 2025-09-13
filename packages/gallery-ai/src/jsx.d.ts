/**
 * JSX Type Declarations for SolidJS
 *
 * This file provides the necessary JSX type definitions for SolidJS components.
 * It ensures that JSX elements have proper typing and prevents the
 * "JSX element implicitly has type 'any'" error.
 */

import { JSX } from "solid-js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // HTML elements
      div: JSX.HTMLAttributes<HTMLDivElement>;
      span: JSX.HTMLAttributes<HTMLSpanElement>;
      button: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
      input: JSX.InputHTMLAttributes<HTMLInputElement>;
      textarea: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;
      select: JSX.SelectHTMLAttributes<HTMLSelectElement>;
      option: JSX.OptionHTMLAttributes<HTMLOptionElement>;
      label: JSX.LabelHTMLAttributes<HTMLLabelElement>;
      img: JSX.ImgHTMLAttributes<HTMLImageElement>;
      a: JSX.AnchorHTMLAttributes<HTMLAnchorElement>;
      p: JSX.HTMLAttributes<HTMLParagraphElement>;
      h1: JSX.HTMLAttributes<HTMLHeadingElement>;
      h2: JSX.HTMLAttributes<HTMLHeadingElement>;
      h3: JSX.HTMLAttributes<HTMLHeadingElement>;
      h4: JSX.HTMLAttributes<HTMLHeadingElement>;
      h5: JSX.HTMLAttributes<HTMLHeadingElement>;
      h6: JSX.HTMLAttributes<HTMLHeadingElement>;
      ul: JSX.HTMLAttributes<HTMLUListElement>;
      ol: JSX.HTMLAttributes<HTMLOListElement>;
      li: JSX.HTMLAttributes<HTMLLIElement>;
      form: JSX.FormHTMLAttributes<HTMLFormElement>;
      fieldset: JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>;
      legend: JSX.HTMLAttributes<HTMLLegendElement>;
      table: JSX.TableHTMLAttributes<HTMLTableElement>;
      thead: JSX.HTMLAttributes<HTMLTableSectionElement>;
      tbody: JSX.HTMLAttributes<HTMLTableSectionElement>;
      tr: JSX.HTMLAttributes<HTMLTableRowElement>;
      td: JSX.TdHTMLAttributes<HTMLTableDataCellElement>;
      th: JSX.ThHTMLAttributes<HTMLTableHeaderCellElement>;
      nav: JSX.HTMLAttributes<HTMLElement>;
      header: JSX.HTMLAttributes<HTMLElement>;
      footer: JSX.HTMLAttributes<HTMLElement>;
      main: JSX.HTMLAttributes<HTMLElement>;
      section: JSX.HTMLAttributes<HTMLElement>;
      article: JSX.HTMLAttributes<HTMLElement>;
      aside: JSX.HTMLAttributes<HTMLElement>;
      canvas: JSX.CanvasHTMLAttributes<HTMLCanvasElement>;
      video: JSX.VideoHTMLAttributes<HTMLVideoElement>;
      audio: JSX.AudioHTMLAttributes<HTMLAudioElement>;
      iframe: JSX.IframeHTMLAttributes<HTMLIFrameElement>;
      embed: JSX.EmbedHTMLAttributes<HTMLEmbedElement>;
      object: JSX.ObjectHTMLAttributes<HTMLObjectElement>;
      param: JSX.ParamHTMLAttributes<HTMLParamElement>;
      source: JSX.SourceHTMLAttributes<HTMLSourceElement>;
      track: JSX.TrackHTMLAttributes<HTMLTrackElement>;
      area: JSX.AreaHTMLAttributes<HTMLAreaElement>;
      map: JSX.MapHTMLAttributes<HTMLMapElement>;
      base: JSX.BaseHTMLAttributes<HTMLBaseElement>;
      link: JSX.LinkHTMLAttributes<HTMLLinkElement>;
      meta: JSX.MetaHTMLAttributes<HTMLMetaElement>;
      script: JSX.ScriptHTMLAttributes<HTMLScriptElement>;
      style: JSX.StyleHTMLAttributes<HTMLStyleElement>;
      title: JSX.HTMLAttributes<HTMLTitleElement>;
      head: JSX.HTMLAttributes<HTMLHeadElement>;
      body: JSX.HTMLAttributes<HTMLBodyElement>;
      html: JSX.HtmlHTMLAttributes<HTMLHtmlElement>;
      
      // SVG elements
      svg: JSX.SVGAttributes<SVGSVGElement>;
      circle: JSX.SVGAttributes<SVGCircleElement>;
      ellipse: JSX.SVGAttributes<SVGEllipseElement>;
      line: JSX.SVGAttributes<SVGLineElement>;
      path: JSX.SVGAttributes<SVGPathElement>;
      polygon: JSX.SVGAttributes<SVGPolygonElement>;
      polyline: JSX.SVGAttributes<SVGPolylineElement>;
      rect: JSX.SVGAttributes<SVGRectElement>;
      text: JSX.SVGAttributes<SVGTextElement>;
      tspan: JSX.SVGAttributes<SVGTSpanElement>;
      textPath: JSX.SVGAttributes<SVGTextPathElement>;
      g: JSX.SVGAttributes<SVGGElement>;
      defs: JSX.SVGAttributes<SVGDefsElement>;
      clipPath: JSX.SVGAttributes<SVGClipPathElement>;
      mask: JSX.SVGAttributes<SVGMaskElement>;
      pattern: JSX.SVGAttributes<SVGPatternElement>;
      image: JSX.SVGAttributes<SVGImageElement>;
      use: JSX.SVGAttributes<SVGUseElement>;
      symbol: JSX.SVGAttributes<SVGSymbolElement>;
      marker: JSX.SVGAttributes<SVGMarkerElement>;
      linearGradient: JSX.SVGAttributes<SVGLinearGradientElement>;
      radialGradient: JSX.SVGAttributes<SVGRadialGradientElement>;
      stop: JSX.SVGAttributes<SVGStopElement>;
      filter: JSX.SVGAttributes<SVGFilterElement>;
      feBlend: JSX.SVGAttributes<SVGFEBlendElement>;
      feColorMatrix: JSX.SVGAttributes<SVGFEColorMatrixElement>;
      feComponentTransfer: JSX.SVGAttributes<SVGFEComponentTransferElement>;
      feComposite: JSX.SVGAttributes<SVGFECompositeElement>;
      feConvolveMatrix: JSX.SVGAttributes<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: JSX.SVGAttributes<SVGFEDiffuseLightingElement>;
      feDisplacementMap: JSX.SVGAttributes<SVGFEDisplacementMapElement>;
      feDistantLight: JSX.SVGAttributes<SVGFEDistantLightElement>;
      feDropShadow: JSX.SVGAttributes<SVGFEDropShadowElement>;
      feFlood: JSX.SVGAttributes<SVGFEFloodElement>;
      feFuncA: JSX.SVGAttributes<SVGFEFuncAElement>;
      feFuncB: JSX.SVGAttributes<SVGFEFuncBElement>;
      feFuncG: JSX.SVGAttributes<SVGFEFuncGElement>;
      feFuncR: JSX.SVGAttributes<SVGFEFuncRElement>;
      feGaussianBlur: JSX.SVGAttributes<SVGFEGaussianBlurElement>;
      feImage: JSX.SVGAttributes<SVGFEImageElement>;
      feMerge: JSX.SVGAttributes<SVGFEMergeElement>;
      feMergeNode: JSX.SVGAttributes<SVGFEMergeNodeElement>;
      feMorphology: JSX.SVGAttributes<SVGFEMorphologyElement>;
      feOffset: JSX.SVGAttributes<SVGFEOffsetElement>;
      fePointLight: JSX.SVGAttributes<SVGFEPointLightElement>;
      feSpecularLighting: JSX.SVGAttributes<SVGFESpecularLightingElement>;
      feSpotLight: JSX.SVGAttributes<SVGFESpotLightElement>;
      feTile: JSX.SVGAttributes<SVGFETileElement>;
      feTurbulence: JSX.SVGAttributes<SVGFETurbulenceElement>;
      foreignObject: JSX.SVGAttributes<SVGForeignObjectElement>;
      view: JSX.SVGAttributes<SVGViewElement>;
    }
  }
}

export {};
