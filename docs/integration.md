# Integrations

Information regarding integrations, workflows, architecture design.

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