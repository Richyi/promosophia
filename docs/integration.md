# Integrations

Information regarding integrations, workflows, architecture design.

## Table of Contents

- [Accounting System (G/L)](#accounting-system-gl)
  - [Integration Workflow](#integration-workflow)
  - [Technical Design Considerations](#technical-design-considerations)
  - [G/L Data to TPM](#gl-data-to-tpm)
- [Data Model](#data-model)
  - [Database Architecture & Schema Strategy](#database-architecture--schema-strategy)
  - [Detailed Data Model (Core Tables)](#detailed-data-model-core-tables)
    - [A. Master Data (ERP Synced)](#a-master-data-erp-synced)
    - [B. Planning (TPM Core)](#b-planning-tpm-core)
    - [C. Finance (Reconciliation Engine)](#c-finance-reconciliation-engine)
    - [D. Intelligence (POS & Shipments Integration)](#d-intelligence-pos--shipments-integration)
  - [Data Model Excel Generator (Python Script)](#data-model-excel-generator-python-script)
  - [Technical Specifications for PostgreSQL & Python Stack](#technical-specifications-for-postgresql--python-stack)
    - [A. Data Integration (Where do GL and POS live?)](#a-data-integration-where-do-gl-and-pos-live)
    - [B. Postgres Optimization](#b-postgres-optimization)
    - [C. Backend (Python/FastAPI or Django)](#c-backend-pythonfastapi-or-django)
    - [D. Frontend (Next.js/React)](#d-frontend-nextjsreact)
- [Detailed Resolution Scenarios & Logic](#detailed-resolution-scenarios--logic)
  - [Scenario A: The "Deduction Variance" (Retailer over-claims)](#scenario-a-the-deduction-variance-retailer-over-claims)
  - [Scenario B: The "Timing Gap" (Accrual Release)](#scenario-b-the-timing-gap-accrual-release)
  - [Scenario C: The "Fixed Fee" (Slotting Reconciliation)](#scenario-c-the-fixed-fee-slotting-reconciliation)
  - [Scenario D: The "Forward Buy" (Revenue Variance)](#scenario-d-the-forward-buy-revenue-variance)
  - [Implementing this in Python/Postgres](#implementing-this-in-pythonpostgres)

## Accounting System (G/L)

![TPM Accounting Integration Workflow](https://www.netatwork.com/wp-content/uploads/2020/05/trade-promotion-management-sage-x3.jpg)

### Integration Workflow
[AI Chat Converation (Bob Barker)](https://gemini.google.com/u/2/app/f7efdfb404c7dc65?pageId=none)

[Integration] (ERP -> TPM) Sends master data to TPM. One way updates.
- Triggers: Real-time (Webhook) or Daily Batch (Scheduled) when a new product or customer is created in the ERP.
    - Customer Master: Hierarchy of retailers (e.g., Walmart Corporate → Regional DCs → Stores), Bill-to/Ship-to addresses, and Payment Terms.
    - Product Master: SKU details, Product Hierarchy (Brand → Category → Sub-category), and List Prices.
    - Chart of Accounts (CoA): General Ledger (GL) codes for trade spend, rebates, and slotting fees         
- CRUD and plans promotions with budgets

[Integration] (TPM -> ERP) Approved Promotions plans converted into `accrual liability` (Journal entry or Rebate Agreement) in G/L with respective trade-spend account to debit
- Trigger: Promotion status changes to "Approved" or "Live" in the TPM.
    - Accrual Amount: Estimated spend based on forecasted volume.
    - GL Mappings: Which trade-spend account to debit.
    - Reference ID: TPM Promotion ID (critical for reconciliation).
- Accounting Action: The ERP creates a Journal Entry (JE) or a Rebate Agreement to reflect the liability on the balance sheet.

[Integration] (ERP -> TPM) Retailers "deduct" promotion cost from next invoice payments.
- Trigger: Payment application or Lockbox processing in the ERP.
    - Deduction Amount: The short-payment amount.
    - Reason Code: Retailer-provided code (e.g., "05 - Shortage" or "12 - Promo").
    - Metadata: Invoice number, Check/EFT date, and Retailer ID.
- TPM Action: The TPM creates a "Pending Claim" that an analyst must now match to a promotion.

[Integration] (TPM -> ERP) Claim information with updated status & amount (if changed)
- Trigger: Claim status changes to "Settled" or "Approved for Payment" in TPM.
    - Settlement Amount: The validated amount (may be less than the deduction).
    - Write-off/Adjustment Codes: If the deduction was invalid (e.g., the retailer overcharged).
- Accounting Action: The ERP clears the Accounts Receivable (AR) deduction.
    - It reverses the original Accrual and records the Actual Expense.

### Technical Design Considerations
- The "Unique ID" Strategy: Every promotion must have a global unique identifier (GUID) that travels into the ERP and back. Without this, you cannot perform "Post-Event Analysis" to see if you actually made a profit.

- Handling "Over-Deductions": Design a workflow for when a retailer deducts $10,000 but the promotion only earned $8,000. The integration must trigger an "Unauthorized Deduction" task in the TPM and potentially a "Chargeback" in the ERP.

- Volume Integration: Don't just pass dollars. Pass Shipment Volumes (from ERP to TPM) so the TPM can calculate "Spend per Unit" and "Landed Cost" in real-time.

- Error Handling: If an accrual fails to post in the ERP (e.g., a closed fiscal period), the TPM must receive a "Failed" status so the Sales team doesn't think the budget is active.

### G/L Data to TPM

| Data Object | Why the TPM needs it | Frequency
|-------------|------------------------|---------
| Invoices | To calculate actual volume and "burn rate" of a budget. | Daily
| Deductions | To trigger the reconciliation/matching process. | Real-time / Daily
| Unit Costs (COGS) | "To calculate ""Real-Time Margin"" and profitability." | Monthly / Quarterly
| GL Balances | "To ensure ""Fund Envelopes"" (budgets) aren't overspent." | Real-time

Why the G/L is the "Feeder"?

    The G/L acts as the "Feeder" system because it holds the actual cash transactions. The TPM takes this "raw" financial data and enriches it by attaching it to a specific Promotion ID, a specific Retailer, and a specific "Uplift" percentage. This enrichment is what allows the TPM to show "Total Company Margin" while the G/L can only show "Total Company Expense."

1. Master Data (The "Truth" Foundation)

Without this, the TPM cannot categorize where spend is happening.

    Customer Master: Bill-to/Ship-to hierarchies, trade group mappings, and payment terms.

    Product Master: SKUs, list prices (MSRP), and cost of goods sold (COGS) per unit.

    Chart of Accounts (CoA): The specific GL codes used for trade spend (e.g., 5500-Rebates, 5510-Slotting).

2. Transactional Actuals (The "Performance" Data)

This data allows the TPM to compare the Plan (what you thought would happen) against the Actual (what the G/L recorded).

    Gross Shipments/Sales: Every invoice generated in the ERP is pushed to the TPM. This is used to calculate "Baseline vs. Incremental" sales.

    Accounts Receivable (AR) Deductions: When a retailer short-pays an invoice, that "Deduction Record" is pushed to the TPM's matching engine.

    Accounts Payable (AP) Payments: If a promotion is paid via check or ACH (rather than a deduction), the payment record is pushed to mark the promotion as "Paid."

3. Financial Reconciliation Data

This ensures the "Margin" in the TPM aligns with the "Margin" in the G/L. POS data only used for Unit Sales. The G/L provides the actual COGS and revenue.

    Revenue: The "Gross Sales" of each SKU. This is vital for the TPM to calculate Net Margin.
    
    Standard COGS: The "Landed Cost" of each SKU. This is vital for the TPM to calculate Net Margin.

    Actual Spend Reversals: If a month-end close in the G/L reveals an accrual was too high, the G/L pushes a "Reversal" or "Adjustment" to the TPM to sync the budget.

    Off-Invoice Credits: Direct credits given on the face of an invoice (already deducted from Gross Sales in the ERP) must be pushed so the TPM doesn't "double count" the spend.

## Data Model

You are asking for the blueprint of an Enterprise SaaS TPM application. Given your tech stack (Python/Postgres + React/Next.js), your data model must leverage PostgreSQL's strengths (JSONB for flexibility, Partitioning for large POS/Shipment data, and Row Level Security for multi-tenancy).

Below is the **Database Design Specification**, followed by the Python code to generate the Data Dictionary Excel file.

### 1. Database Architecture & Schema Strategy

For an Enterprise solution, do not put everything in the `public` schema. Use logical separation:

* **`tenancy`**: Account management, users, roles, audit logs (Pure SaaS).
* **`master`**: "Truth" data synced from the ERP (Products, Customers, Price Lists).
* **`planning`**: The heart of the TPM (Promotions, Funds, Tactics).
* **`finance`**: The reconciliation engine (Accruals, Claims, Settlements, GL Postings).
* **`intelligence`**: High-volume external data (POS, Syndicated Data, Competitor Pricing).
* **`staging`**: "Dirty" tables where raw data lands via API/ETL before processing.

---

### 2. Detailed Data Model (Core Tables)

Here are the critical tables. *Note: Every table has `tenant_id` (UUID) as the first column for RLS.*

#### A. Master Data (ERP Synced)

**1. `master.products**` (Product Hierarchy)

* **id (UUID):** Primary Key.
* **erp_id (VARCHAR):** Unique ID in the ERP system (e.g., SAP Material Number).
* **sku (VARCHAR):** Code visible to the user.
* **brand (VARCHAR):** Hierarchy Level 1.
* **category (VARCHAR):** Hierarchy Level 2.
* **list_price (NUMERIC 19,4):** Current base list price.
* **cogs_standard (NUMERIC 19,4):** Standard cost for TPM margin calculation.
* **attributes (JSONB):** For custom fields (e.g., "Organic", "Gluten Free").

**2. `master.customers**` (Customer Hierarchy)

* **id (UUID):** PK.
* **erp_id (VARCHAR):** ERP Customer ID.
* **parent_id (UUID):** Recursive FK for hierarchy (e.g., Walmart HQ -> Walmart East).
* **type (ENUM):** 'Bill-to', 'Ship-to', 'Sold-to', 'Banner'.
* **payment_terms (VARCHAR):** E.g., "Net 60".

#### B. Planning (TPM Core)

**3. `planning.funds**` (The Budget)

* **id (UUID):** PK.
* **name (VARCHAR):** E.g., "Q1 2026 Innovation Fund".
* **total_budget (NUMERIC 19,4):** Allocated amount.
* **remaining_balance (NUMERIC 19,4):** Calculated live.
* **owner_id (UUID):** User ID of the Sales Manager.

**4. `planning.promotions**` (The Central Object)

* **id (UUID):** PK.
* **name (VARCHAR):** E.g., "SuperBowl BOGO".
* **status (ENUM):** 'Draft', 'Pending Approval', 'Live', 'Closed', 'Settled'.
* **tactic_type (VARCHAR):** 'TPR', 'Display', 'Feature', 'Scan-Back'.
* **date_start_sellin (DATE):** Shipment start date.
* **date_end_sellin (DATE):** Shipment end date.
* **date_start_scan (DATE):** In-store start date (for POS).
* **date_end_scan (DATE):** In-store end date.
* **forecast_uplift_pct (NUMERIC 5,2):** Estimated % increase.
* **total_planned_spend (NUMERIC 19,4):** Estimated total cost.

**5. `planning.promotion_products**` (Promo Scope)

* **promotion_id (UUID):** FK.
* **product_id (UUID):** FK.
* **discount_per_unit (NUMERIC 19,4):** Specific discount for this SKU.
* **forecasted_base_units (INT):** Baseline.
* **forecasted_uplift_units (INT):** Lift.

#### C. Finance (Reconciliation Engine)

**6. `finance.gl_transactions**` (GL Transactions from ERP)

* **id (UUID):** PK.
* **source_type (ENUM):** 'INVOICE', 'DEDUCTION', 'JOURNAL_ENTRY'.
* **erp_ref_id (VARCHAR):** The Invoice #, Check #, or JE # from ERP.
* **gl_account_code (VARCHAR):** The specific account (e.g., 5500-Rebates, 5510-Slotting).
* **amount (NUMERIC 19,4):** Total currency value of line item.
* **posting_date (DATE):** When the transaction hit the G/L.
* **open_balance (NUMERIC 19,4):** Amount not yet reconciled.
* **reason_code_erp (VARCHAR):** Original code (e.g., "005").
* **reason_code_normalized (VARCHAR):** Mapped code (e.g., "PROMO", "SHORTAGE", "TAX", "SPOILS").
* **dispute_status (ENUM):** 'OPEN', 'DISPUTED', 'RECOVERED', 'WRITEOFF'.
* **backup_doc_url (TEXT):** Link to scanned PDF (S3/Blob Storage).

**7. `finance.settlements**` (The Promo-Deduction Link)

* **id (UUID):** PK.
* **claim_id (UUID):** FK to `finance.claims`.
* **promotion_id (UUID):** FK to `planning.promotions`.
* **amount_settled (NUMERIC 19,4):** How much of this claim applies to this promo.
* **status (ENUM):** 'Draft', 'Posted to ERP'.
* **gl_posting_json (JSONB):** Exact payload sent to ERP to close the item.

#### D. Intelligence (POS & Shipments Integration)

**8. `intelligence.pos_facts**` (Sell-Out Data)

* *Strategy:* This table will become huge (billions of rows). Use **Postgres Partitioning** by date (month/year).
* **date (DATE):** Day of sale.
* **product_id (UUID):** FK.
* **customer_store_id (UUID):** FK to specific store (if available).
* **units_sold (INT):** Quantity.
* **sales_value (NUMERIC 19,4):** Revenue collected.
* **is_promotion (BOOLEAN):** Flag if retailer indicated active promo.

**9. `intelligence.shipment_facts**` (Sell-In Data from ERP)

* **invoice_date (DATE):** Invoice date.
* **invoice_id (VARCHAR):** ERP Reference.
* **product_id (UUID):** FK.
* **customer_id (UUID):** FK.
* **units_shipped (INT):** Actual volume.
* **net_revenue (NUMERIC 19,4):** Actual net revenue.

---

### 3. Data Model Excel Generator (Python Script)

This Python script uses `pandas` to create a perfectly formatted Excel file you can hand to your development team. It includes Schema, Table, Field, Type, and Description.

```python
import pandas as pd

# Data Model Definition
data = []

def add_row(schema, table, field, dtype, nullable, description, usage):
    data.append({
        "Schema": schema,
        "Table": table,
        "Field Name": field,
        "Data Type": dtype,
        "Nullable": nullable,
        "Description": description,
        "Usage / Integration Logic": usage
    })

# --- TENANCY SCHEMA ---
add_row("tenancy", "tenants", "id", "UUID", "No", "Primary Key", "Row Level Security Root")
add_row("tenancy", "tenants", "name", "VARCHAR(255)", "No", "Company Name", "UI Display")
add_row("tenancy", "tenants", "settings", "JSONB", "Yes", "Config", "Stores fiscal year start, currency, ERP type")

# --- MASTER SCHEMA (ERP Data) ---
add_row("master", "products", "erp_id", "VARCHAR(50)", "No", "ERP Material Code", "Join Key for Integration")
add_row("master", "products", "cogs_standard", "NUMERIC(19,4)", "No", "Standard Cost", "Used for Profitability Calc")
add_row("master", "customers", "hierarchy_path", "LTREE", "Yes", "Path Enumeration", "Postgres LTREE for fast hierarchy queries")

# --- PLANNING SCHEMA (TPM) ---
add_row("planning", "promotions", "id", "UUID", "No", "PK", "Internal TPM ID")
add_row("planning", "promotions", "forecast_mode", "VARCHAR(20)", "No", "Calc Method", "'Manual', 'AI_Linear', 'AI_Seasonality'")
add_row("planning", "promotions", "lifecycle_status", "ENUM", "No", "State Machine", "'Draft' -> 'Approved' -> 'Committed' -> 'Settled'")

# --- FINANCE SCHEMA (Reconciliation) ---
add_row("finance", "claims", "match_confidence_score", "FLOAT", "Yes", "AI Score", "0.0 to 1.0 likelihood match to promo")
add_row("finance", "claims", "auto_cleared", "BOOLEAN", "No", "Flag", "True if settled by rules engine without human")
add_row("finance", "gl_ledger", "debit_account", "VARCHAR(20)", "No", "GL Code", "From Chart of Accounts")
add_row("finance", "gl_ledger", "credit_account", "VARCHAR(20)", "No", "GL Code", "Usually AR Clearing Account")

# --- INTELLIGENCE SCHEMA (Big Data) ---
add_row("intelligence", "pos_facts", "promo_price_detected", "NUMERIC(19,4)", "Yes", "Observed Price", "Did retailer execute the discount?")
add_row("intelligence", "pos_facts", "baseline_units", "INT", "Yes", "Calculated Baseline", "What would have sold without promo (filled by ML job)")

# Create DataFrame
df = pd.DataFrame(data)

# Create Excel File
file_name = "TPM_Enterprise_Data_Model_Spec.xlsx"
writer = pd.ExcelWriter(file_name, engine='xlsxwriter')
df.to_excel(writer, sheet_name='Data Dictionary', index=False)

# Formatting Excel
workbook = writer.book
worksheet = writer.sheets['Data Dictionary']
header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1})

for col_num, value in enumerate(df.columns.values):
    worksheet.write(0, col_num, value, header_format)
    worksheet.set_column(col_num, col_num, 25) # Set column width

writer.close()

print(f"Data Model generated successfully: {file_name}")

```

### 4. Technical Specifications for PostgreSQL & Python Stack

Since you are using Python/Next.js, here are the critical architectural patterns:

#### A. Data Integration (Where do GL and POS live?)

Do not mix raw data with the transactional model.

1. **Staging Layer (`staging` schema):**
* Use tables without foreign key constraints.
* Example: `staging.raw_invoices_sap`.
* Use Python (Pandas/Polars) or dbt to validate and move data from `staging` to `master` and `intelligence`.


2. **Intelligence Layer (`intelligence` schema):**
* Here reside historical POS and Shipments.
* **Relationship:** `pos_facts` tables have FKs to `master.products` and `master.customers`, but **DO NOT** force FKs to `planning.promotions` directly on raw data.
* **Mapping:** Use a bridge table `analytics.promotion_actuals` that aggregates daily POS data and attributes it to a `promotion_id` based on date and customer. This calculation must be done by an asynchronous job (Celery/Arq), not real-time.



#### B. Postgres Optimization

1. **JSONB Indexing:** For `attributes` fields on Products and Customers, use GIN indexes (`CREATE INDEX idx_prod_attr ON master.products USING GIN (attributes);`) to allow fast queries on custom fields.
2. **PostGIS vs LTREE:** For customer hierarchies (Walmart -> Region -> Store), use the **LTREE** extension of Postgres. It is much more performant than recursive Common Table Expressions (CTEs) for calculating "roll-up" aggregations (e.g., "Give me total sales for Walmart US").
3. **Money Handling:** In Python, use `Decimal` to map DB `NUMERIC` fields. Never use `float` for money.

#### C. Backend (Python/FastAPI or Django)

* Use **SQLAlchemy 2.0** (async) for the ORM.
* For "Baseline vs Incremental" calculations (Data Science), do not do it in the ORM. Extract data into **Pandas/Polars**, calculate, and write results to `planning.promotion_results`.

#### D. Frontend (Next.js/React)

* Since financial data is heavy, use **React Query** or **SWR** for caching.
* For the "Deduction Grid" (which looks like Excel), use high-performance libraries like **Ag-Grid** or **TanStack Table**, as users will load thousands of claim rows.

## Detailed Resolution Scenarios & Logic

Here is how your Python backend should handle the "Truth Mismatch" between the G/L and the TPM.
Scenario A: The "Deduction Variance" (Retailer over-claims)

    The Situation: You planned a $10,000 "Scan-Down" promo. The retailer (Walmart) deducts $12,000 from their invoice. The G/L reflects a $12,000 hit to revenue.

    The Resolution Logic:

        Ingest: Pull the $12,000 deduction from the ERP AR Feed.

        Match: Locate the Promotion ID associated with that date/customer.

        Detect Variance: The TPM sees that the $2,000 excess exceeds the "Tolerance Threshold" (e.g., 2%).

        Action: The TPM marks $10,000 as "Settled" (reverses the accrual) and moves $2,000 into a DISPUTE status.

        G/L Signal: Send a signal to the ERP to create a "Debit Memo" for $2,000, putting that amount back into Accounts Receivable (the retailer now owes you this money).

Scenario B: The "Timing Gap" (Accrual Release)

    The Situation: A promotion ends. You accrued $50,000. Total deductions received only equal $45,000. The G/L still shows a $5,000 liability sitting on the balance sheet.

    The Resolution Logic:

        Close Out: User marks the promotion as "Closed" in the TPM.

        Calculate Residual: TPM identifies the $5,000 unused accrual.

        Action: Trigger an "Accrual Release" (or "Sweep").

        G/L Signal: TPM sends a Journal Entry to the G/L: Debit Accrual Liability $5,000 / Credit Trade Expense $5,000. This immediately improves the company's "Net Margin" for the period.

Scenario C: The "Fixed Fee" (Slotting Reconciliation)

    The Situation: You pay Kroger $20,000 for a "New Store Opening" fee. This is paid via a check (Accounts Payable) in the G/L, not a deduction.

    The Resolution Logic:

        Ingest: TPM monitors the G/L for specific Account Codes + Customer IDs.

        Action: It finds the $20,000 AP Voucher.

        Link: It matches the payment to the "Fixed Fee" tactic inside the TPM Account Plan.

        Verification: TPM confirms that the "Proof of Performance" (e.g., a photo of the new shelf set) has been uploaded. If not, it flags the payment for audit.

Scenario D: The "Forward Buy" (Revenue Variance)

    The Situation: G/L shows a massive spike in revenue in March. POS data in the TPM shows consumer sales are flat.

    The Resolution Logic:

        Compare: TPM compares intelligence.shipment_facts (ERP) vs. intelligence.pos_facts (Retailer).

        Detect: Shipments > POS.

        Insight: The TPM alerts the Sales Manager: "Retailer is 'Loading the Pantry'. Your next 2 months of revenue will likely drop. Do not plan new promos until POS catches up."

        Financial Impact: TPM calculates "Days of Supply" on hand at the retailer to adjust future trade spend accruals.

3. Implementing this in Python/Postgres

To make this performant:

    Use views for real-time margin: Create a Postgres View that joins master.products (COGS) with intelligence.shipment_facts (Revenue) and finance.accrual_ledger (Costs). This gives your React frontend a "Real-Time Margin" without heavy API processing.

    Audit Trail: For every change in finance.settlements, store a JSON snapshot of the G/L state at that moment. This is vital for the year-end "Trade Audit" that every CPG company undergoes.