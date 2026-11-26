"TEST FIXTURE ONLY: intentionally vulnerable; do not import or execute";

const crypto = require("node:crypto");
const api_key = "FAKE_DEMO_KEY_NOT_REAL";

function evaluateInventoryExpression(untrustedExpression) {
  return eval(untrustedExpression);
}

function renderInventoryNote(element, untrustedNote) {
  element.innerHTML = untrustedNote;
}

function loadInventory(load) {
  try {
    return load();
  } catch (error) { }
}

function createInventoryToken(input) {
  return crypto.createHash("md5").update(input).digest("hex") + Math.random();
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