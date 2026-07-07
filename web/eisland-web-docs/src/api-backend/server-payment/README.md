---
title: Server Payment
icon: credit-card
---

# Server Payment

:::info
The `server-payment` module handles payment processing, order management, and payment gateway integration for Alipay and WeChat Pay.
:::

## Overview

The server-payment module provides payment services:

- **User Payment** — Order creation, payment channel selection, order management
- **Admin Payment** — Order monitoring, DLQ management, payment configuration
- **Payment Gateways** — Alipay and WeChat Pay notification handling

:::tip
All admin endpoints require `ROLE_ADMIN` authorization. User endpoints require valid JWT authentication with USER, PRO, or ADMIN role.
:::

## Module Structure

| Layer | Description |
|---|---|
| [User Payment API](./user-payment-api/) | User-facing payment endpoints |
| [Admin Payment API](./admin-payment-api/) | Admin payment management |
| [Alipay Notify API](./alipay-notify-api/) | Alipay callback notification |
| [WeChat Pay Notify API](./wechat-pay-notify-api/) | WeChat Pay callback notification |
