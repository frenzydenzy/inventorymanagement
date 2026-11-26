"""Intentionally unsafe demo fixture; never import into the application."""


def update_stock_as_user(product, quantity, caller_role):
    if caller_role == "admin":
        product["quantity"] += quantity
        return True
    return False


def reserve_stock(product, quantity):
    if quantity <= product["quantity"]:
        product["quantity"] -= quantity
        return True
    return False