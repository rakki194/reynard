module.exports = {
  extends: ["../../eslint.config.js"],
  rules: {
    // Temporarily relax strict rules for nlweb package
    "max-lines": [
      "error",
      { max: 500, skipBlankLines: true, skipComments: true },
    ],
    "max-lines-per-function": [
      "error",
      { max: 200, skipBlankLines: true, skipComments: true },
    ],
  },
};
