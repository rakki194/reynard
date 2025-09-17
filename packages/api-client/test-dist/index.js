"use strict";
/**
 * Reynard API Client
 *
 * Auto-generated TypeScript client for Reynard backend API
 * Provides type-safe access to all backend endpoints
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReynardApiClient = void 0;
// Re-export generated types and client
__exportStar(require("./generated/index.js"), exports);
// Re-export composables and utilities
__exportStar(require("./composables/index.js"), exports);
__exportStar(require("./utils/index.js"), exports);
// Re-export main client factory
var client_js_1 = require("./client.js");
Object.defineProperty(exports, "createReynardApiClient", {
  enumerable: true,
  get: function () {
    return client_js_1.createReynardApiClient;
  },
});
