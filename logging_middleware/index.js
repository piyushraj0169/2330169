const LOG_ENDPOINT = "http://4.224.186.213/evaluation-service/logs";

const allowedStacks = ["backend", "frontend"];
const allowedLevels = ["debug", "info", "warn", "error", "fatal"];
const allowedPackages = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
];

async function Log(stack, level, packageName, message) {
  const normalizedStack = String(stack).toLowerCase();
  const normalizedLevel = String(level).toLowerCase();
  const normalizedPackage = String(packageName).toLowerCase();

  if (!allowedStacks.includes(normalizedStack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }
  if (!allowedLevels.includes(normalizedLevel)) {
    throw new Error(`Invalid level: ${level}`);
  }
  if (!allowedPackages.includes(normalizedPackage)) {
    throw new Error(`Invalid package: ${packageName}`);
  }
  if (!message || typeof message !== "string") {
    throw new Error("Message must be a non-empty string.");
  }

  const payload = {
    stack: normalizedStack,
    level: normalizedLevel,
    package: normalizedPackage,
    message,
  };

  return fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export default Log;
