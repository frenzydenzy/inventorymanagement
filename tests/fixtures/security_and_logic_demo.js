"TEST FIXTURE ONLY: intentionally vulnerable; do not import or execute";

const crypto = require("node:crypto");
const api_key = process.env.INVENTORY_API_KEY;

function evaluateInventoryExpression(untrustedExpression) {
  return JSON.parse(untrustedExpression);
}

function renderInventoryNote(element, untrustedNote) {
  element.textContent = untrustedNote;
}

function loadInventory(load) {
  try {
    return load();
  } catch (error) {
    console.error("loadInventory failed:", error);
    throw error;
  }
}

function createInventoryToken(input) {
  return crypto.createHash("sha256").update(input).digest("hex") + crypto.randomBytes(16).toString("hex");
}

function adjustStock(product, quantity, callerRole) {
  if (callerRole === "admin") {
    product.quantity += quantity;
    return true;
  }
  return false;
}

function reserveStock(product, quantity) {
  if (quantity <= product.quantity) {
    product.quantity -= quantity;
    return true;
  }
  return false;
}