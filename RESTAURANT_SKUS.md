# Multi-Tenant Restaurant SKU & Identifier Mapping

This file serves as the official source of truth for restaurant identification across the POS & SaaS platform.

| Restaurant SKU | Restaurant Name | City | Database ID | Public Slug | Admin URL | Owner / Staff Login |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **QSR01** | **आपणो खाणो (Aapno Khaano)** | Fatehabad, Haryana | `rest_aapno_khano` | `aapno-khano` | `/admin` | `vinod@aapnokhano.com` |
| **QSR02** | **Mr. Bagri (Local Food from Haryana)** | Panchkula, Haryana | `rest_mr_bagri` | `mr-bagri` | `/admin` | `rudrawebx@gmail.com` |

---

### Command Rules for AI Agent:
1. When the user says **"QSR01"**, all actions, menu modifications, price changes, or configurations MUST apply exclusively to **Fatehabad (Aapno Khaano)**.
2. When the user says **"QSR02"**, all actions, menu modifications, price changes, or configurations MUST apply exclusively to **Panchkula (Mr. Bagri)**.
3. Keep database isolation strict: NEVER blend menus, products, categories, or tables between QSR01 and QSR02.
