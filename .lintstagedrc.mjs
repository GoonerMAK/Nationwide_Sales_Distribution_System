function scoped(pkg, bin, args) {
  return (files) => {
    const binPath = `${pkg}/node_modules/.bin/${bin}`;
    const quoted = files.map((f) => JSON.stringify(f.replaceAll("\\", "/"))).join(" ");
    return `${binPath} ${args} ${quoted}`;
  };
}

export default {
  "client/**/*.{ts,tsx,css,json}": [scoped("client", "prettier", "--write")],
  "client/**/*.{ts,tsx}": [
    scoped("client", "eslint", "--config client/eslint.config.mjs --fix"),
  ],
  "server/**/*.ts": [
    scoped("server", "prettier", "--write"),
    scoped("server", "eslint", "--config server/eslint.config.mjs --fix"),
  ],
};
