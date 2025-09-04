export default {
  "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix", "git add"],
  "*.{css,scss,json,md}": ["prettier --write", "git add"],
};
