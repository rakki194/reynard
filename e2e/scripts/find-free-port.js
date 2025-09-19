#!/usr/bin/env node

/**
 * 🦊 Find Free Port Utility
 *
 * Simple utility to find a free port for testing
 */

import net from "net";

function findFreePort(startPort = 12525, maxAttempts = 100) {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    function tryPort(port) {
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find free port after ${maxAttempts} attempts`));
        return;
      }

      const server = net.createServer();

      server.listen(port, () => {
        server.once("close", () => {
          resolve(port);
        });
        server.close();
      });

      server.on("error", err => {
        if (err.code === "EADDRINUSE") {
          attempts++;
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
    }

    tryPort(currentPort);
  });
}

// If run directly, find and print a free port
if (import.meta.url === `file://${process.argv[1]}`) {
  findFreePort(12525)
    .then(port => {
      console.log(port);
      process.exit(0);
    })
    .catch(err => {
      console.error("Error finding free port:", err.message);
      process.exit(1);
    });
}

export { findFreePort };
