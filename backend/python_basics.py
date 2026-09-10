products=[{
    "name": "Wireless Mouse",
    "price": 29.99,
    "quantity": 10,
    "sku": "WM123",
    "category": "Electronics",
    "supplier": "Tech Supplies Inc."
},
{
    "name": "Keyboard",
    "price": 30.00,
    "quantity": 5,
    "sku": "KB123",
    "category": "Electronics",
    "supplier": "Tech Supplies Inc.",
    "reorder_level": 20
},
{
    "name":"usb cable",
    "price": 9.99,
    "quantity": 20,
    "sku": "UC123",
    "category": "Electronics",
    "supplier": "Tech Supplies Inc.",
    "reorder_level": 50
}
]
inventory_value= products[0]["price"] * products[0]["quantity"]

print(inventory_value)

print(products[0]["name"])
for product in products:
    if product["quantity"] == 0:
        print(f"{product['name']} is out of stock")
    elif product["quantity"] <= product.get("reorder_level", 0):
        print(f"{product['name']} is low in stock")
    else:
        print(f"{product['name']} is sufficiently stocked")
for product in products:
    inventory_value = product["price"] * product["quantity"]
    total_inventory_value = total_inventory_value + inventory_value if 'total_inventory_value' in locals() else inventory_value
    print(f"Inventory value for {product['name']}: {inventory_value}")
print(f"Total inventory value: {total_inventory_value}")
    