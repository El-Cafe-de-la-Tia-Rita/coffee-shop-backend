# El Café de la Tía Rita - Backend

This is the backend for the "El Café de la Tía Rita" application, a comprehensive system for managing a coffee business, from green coffee bean acquisition to final sales.

## Environment Variables

To run this application, you will need to add the following environment variables to your `.env` file:

`DB_HOST`
`DB_PORT`
`DB_USERNAME`
`DB_PASSWORD`
`DB_DATABASE`
`JWT_SECRET`
`JWT_EXPIRATION_TIME`

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tu_usuario/ElCafeDeLaTiaRita.git
   ```
2. Install PNPM packages
   ```sh
   pnpm install
   ```

### Running the application

```sh
pnpm run start:dev
```

### Migrations

To run database migrations, use the following command:

```sh
pnpm run migration:run
```

## Entities

### `Batch`

| Attribute          | Type         | Description                               |
| ------------------ | ------------ | ----------------------------------------- |
| `id`               | `string`     | Unique identifier for the batch.          |
| `code`             | `string`     | Unique code for the batch.                |
| `purchase_date`    | `string`     | Date the batch was purchased.             |
| `green_kg`         | `number`     | Initial quantity of green coffee in kg.   |
| `green_kg_available`| `number`    | Available quantity of green coffee in kg. |
| `producer`         | `string`     | Name of the coffee producer.              |
| `origin`           | `string`     | Origin of the coffee.                     |
| `variety`          | `string`     | Coffee variety.                           |
| `process`          | `string`     | Processing method.                        |
| `altitude_masl`    | `number`     | Altitude in meters above sea level.       |
| `total_cost`       | `number`     | Total cost of the batch.                  |
| `cost_per_kg`      | `number`     | Cost per kg of green coffee.              |
| `status`           | `BatchStatus`| Status of the batch.                      |
| `observations`     | `string`     | Additional observations.                  |
| `created_at`       | `Date`       | Timestamp of creation.                    |
| `updated_at`       | `Date`       | Timestamp of last update.                 |
| `deleted_at`       | `Date`       | Timestamp of deletion.                    |
| `microbatches`     | `MicroBatch[]`| Relation to micro-batches.              |
| `expenses`         | `Expense[]`  | Relation to expenses.                     |
| `inventory_movements`| `InventoryMovement[]`| Relation to inventory movements. |

### `Client`

| Attribute         | Type      | Description                             |
| ----------------- | --------- | --------------------------------------- |
| `id`              | `string`  | Unique identifier for the client.       |
| `name`            | `string`  | Name of the client.                     |
| `email`           | `string`  | Email of the client.                    |
| `phone`           | `string`  | Phone number of the client.             |
| `address`         | `string`  | Address of the client.                  |
| `district`        | `string`  | District of the client.                 |
| `notes`           | `string`  | Additional notes.                       |
| `first_purchase`  | `Date`    | Date of the first purchase.             |
| `last_purchase`   | `Date`    | Date of the last purchase.              |
| `marketing_opt_in`| `boolean` | Client opted-in for marketing.          |
| `active`          | `boolean` | Client is active.                       |
| `created_at`      | `Date`    | Timestamp of creation.                  |
| `updated_at`      | `Date`    | Timestamp of last update.               |
| `deleted_at`      | `Date`    | Timestamp of deletion.                  |
| `orders`          | `Order[]` | Relation to orders.                     |

### `Expense`

| Attribute        | Type               | Description                              |
| ---------------- | ------------------ | ---------------------------------------- |
| `id`             | `string`           | Unique identifier for the expense.       |
| `batch`          | `Batch`            | Relation to a batch (optional).          |
| `date`           | `string`           | Date of the expense.                     |
| `category`       | `ExpenseCategory`  | Category of the expense.                 |
| `concept`        | `string`           | Concept of the expense.                  |
| `description`    | `string`           | Description of the expense.              |
| `amount`         | `number`           | Amount of the expense.                   |
| `provider`       | `string`           | Provider of the service/product.         |
| `receipt_url`    | `string`           | URL of the receipt.                      |
| `payment_method` | `PaymentMethod`    | Payment method used.                     |
| `responsible`    | `string`           | Person responsible for the expense.      |
| `observations`   | `string`           | Additional observations.                 |
| `created_at`     | `Date`             | Timestamp of creation.                   |
| `updated_at`     | `Date`             | Timestamp of last update.                |
| `deleted_at`     | `Date`             | Timestamp of deletion.                   |

### `InventoryMovement`

| Attribute        | Type                      | Description                                |
| ---------------- | ------------------------- | ------------------------------------------ |
| `id`             | `string`                  | Unique identifier for the movement.        |
| `product_stock`  | `Product`                 | Relation to a product stock (optional).    |
| `batch`          | `Batch`                   | Relation to a batch (optional).            |
| `movement_type`  | `MovementType`            | Type of movement (e.g., entry, exit).      |
| `quantity`       | `number`                  | Quantity of the product moved.             |
| `unit`           | `string`                  | Unit of the product moved.                 |
| `reason`         | `InventoryMovementReason` | Reason for the movement.                   |
| `reference`      | `string`                  | Reference for the movement.                |
| `user`           | `User`                    | User who performed the movement.           |
| `movement_date`  | `Date`                    | Date of the movement.                      |
| `created_at`     | `Date`                    | Timestamp of creation.                     |
| `updated_at`     | `Date`                    | Timestamp of last update.                  |
| `deleted_at`     | `Date`                    | Timestamp of deletion.                     |

### `MicroBatch`

| Attribute           | Type          | Description                                |
| ------------------- | ------------- | ------------------------------------------ |
| `id`                | `string`      | Unique identifier for the micro-batch.     |
| `batch`             | `Batch`       | Relation to a batch.                       |
| `code`              | `string`      | Unique code for the micro-batch.           |
| `roast_number`      | `number`      | Roast number of the micro-batch.           |
| `roast_date`        | `string`      | Date of the roast.                         |
| `green_kg_used`     | `number`      | Quantity of green coffee used in kg.       |
| `roasted_kg_obtained`| `number`     | Quantity of roasted coffee obtained in kg. |
| `loss_kg`           | `number`      | Loss of coffee in kg.                      |
| `loss_percentage`   | `number`      | Percentage of loss.                        |
| `roast_type`        | `RoastType`   | Type of roast.                             |
| `roast_responsible` | `string`      | Person responsible for the roast.          |
| `observations`      | `string`      | Additional observations.                   |
| `created_at`        | `Date`        | Timestamp of creation.                     |
| `updated_at`        | `Date`        | Timestamp of last update.                  |
| `deleted_at`        | `Date`        | Timestamp of deletion.                     |
| `product_stock`     | `Product[]`   | Relation to product stock.                 |

### `OrderItem`

| Attribute     | Type      | Description                              |
| ------------- | --------- | ---------------------------------------- |
| `id`          | `string`  | Unique identifier for the order item.    |
| `order`       | `Order`   | Relation to an order.                    |
| `product_stock`| `Product`| Relation to a product stock.             |
| `quantity`    | `number`  | Quantity of the product.                 |
| `unit_price`  | `number`  | Unit price of the product.               |
| `subtotal`    | `number`  | Subtotal of the order item.              |
| `sold_kg`     | `number`  | Quantity of coffee sold in kg.           |
| `created_at`  | `Date`    | Timestamp of creation.                   |
| `updated_at`  | `Date`    | Timestamp of last update.                |
| `deleted_at`  | `Date`    | Timestamp of deletion.                   |

### `Order`

| Attribute               | Type            | Description                              |
| ----------------------- | --------------- | ---------------------------------------- |
| `id`                    | `string`        | Unique identifier for the order.         |
| `order_number`          | `string`        | Unique number for the order.             |
| `client`                | `Client`        | Relation to a client.                    |
| `order_date`            | `Date`          | Date of the order.                       |
| `delivery_date_estimated`| `string`       | Estimated delivery date.                 |
| `delivery_date_real`    | `string`        | Real delivery date.                      |
| `status`                | `OrderStatus`   | Status of the order.                     |
| `subtotal`              | `number`        | Subtotal of the order.                   |
| `discount`              | `number`        | Discount applied to the order.           |
| `shipping`              | `number`        | Shipping cost.                           |
| `total`                 | `number`        | Total of the order.                      |
| `payment_method`        | `PaymentMethod` | Payment method used.                     |
| `payment_confirmed`     | `boolean`       | Payment is confirmed.                    |
| `payment_receipt_url`   | `string`        | URL of the payment receipt.              |
| `notes`                 | `string`        | Additional notes.                        |
| `delivery_address`      | `string`        | Delivery address.                        |
| `origin`                | `OrderOrigin`   | Origin of the order.                     |
| `created_by`            | `User`          | User who created the order.              |
| `created_at`            | `Date`          | Timestamp of creation.                   |
| `updated_at`            | `Date`          | Timestamp of last update.                |
| `deleted_at`            | `Date`          | Timestamp of deletion.                   |
| `items`                 | `OrderItem[]`   | Relation to order items.                 |

### `ProductCatalog`

| Attribute       | Type        | Description                               |
| --------------- | ----------- | ----------------------------------------- |
| `id`            | `string`    | Unique identifier for the product catalog.|
| `code`          | `string`    | Unique code for the product catalog.      |
| `name`          | `string`    | Name of the product catalog.              |
| `description`   | `string`    | Description of the product catalog.       |
| `weight_grams`  | `number`    | Weight in grams of the product.           |
| `package_type`  | `string`    | Type of package.                          |
| `base_price`    | `number`    | Base price of the product.                |
| `active`        | `boolean`   | Product catalog is active.                |
| `created_at`    | `Date`      | Timestamp of creation.                    |
| `updated_at`    | `Date`      | Timestamp of last update.                 |
| `deleted_at`    | `Date`      | Timestamp of deletion.                    |
| `product_stock` | `Product[]` | Relation to product stock.                |

### `Product`

| Attribute          | Type                  | Description                              |
| ------------------ | --------------------- | ---------------------------------------- |
| `id`               | `string`              | Unique identifier for the product.       |
| `product_catalog`  | `ProductCatalog`      | Relation to a product catalog.           |
| `microbatch`       | `MicroBatch`          | Relation to a micro-batch.               |
| `sku`              | `string`              | Unique SKU for the product.              |
| `grind_type`       | `GrindType`           | Type of grind.                           |
| `stock_current`    | `number`              | Current stock of the product.            |
| `stock_reserved`   | `number`              | Reserved stock of the product.           |
| `stock_minimum`    | `number`              | Minimum stock of the product.            |
| `sale_price`       | `number`              | Sale price of the product.               |
| `unit_cost`        | `number`              | Unit cost of the product.                |
| `active`           | `boolean`             | Product is active.                       |
| `created_at`       | `Date`                | Timestamp of creation.                   |
| `updated_at`       | `Date`                | Timestamp of last update.                |
| `deleted_at`       | `Date`                | Timestamp of deletion.                   |
| `order_items`      | `OrderItem[]`         | Relation to order items.                 |
| `inventory_movements`| `InventoryMovement[]`| Relation to inventory movements.         |

### `User`

| Attribute        | Type                  | Description                              |
| ---------------- | --------------------- | ---------------------------------------- |
| `id`             | `string`              | Unique identifier for the user.          |
| `email`          | `string`              | Email of the user.                       |
| `password`       | `string`              | Password of the user (excluded from response). |
| `name`           | `string`              | Name of the user.                        |
| `role`           | `UserRole`            | Role of the user.                        |
| `active`         | `boolean`             | User is active.                          |
| `created_at`     | `Date`                | Timestamp of creation.                   |
| `updated_at`     | `Date`                | Timestamp of last update.                |
| `deleted_at`     | `Date`                | Timestamp of deletion.                   |
| `orders`         | `Order[]`             | Relation to orders.                      |
| `inventory_movements`| `InventoryMovement[]`| Relation to inventory movements.         |
