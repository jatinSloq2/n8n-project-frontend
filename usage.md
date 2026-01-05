# Workflow Automation Platform - Complete Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Node Categories](#node-categories)
4. [Expression System](#expression-system)
5. [Node Reference](#node-reference)
6. [File Upload & Processing](#file-upload--processing)
7. [Workflow Examples](#workflow-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

This workflow automation platform allows you to create powerful automated workflows by connecting nodes together. Each node performs a specific action, and data flows from one node to the next.

### Key Concepts

- **Nodes**: Individual building blocks that perform specific actions
- **Connections**: Links between nodes that define data flow
- **Expressions**: Dynamic references to data from previous nodes using `{{...}}` syntax
- **Execution**: Running a workflow processes each node in sequence

---

## Getting Started

### Creating Your First Workflow

1. **Click "New Workflow"** from the dashboard
2. **Add nodes** from the sidebar by clicking on them
3. **Connect nodes** by dragging from the green output handle to the blue input handle
4. **Configure each node** by double-clicking it
5. **Save** your workflow (Ctrl/Cmd + S)
6. **Execute** the workflow (Ctrl/Cmd + E)

### Workflow Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save workflow |
| `Ctrl/Cmd + E` | Execute workflow |
| `Ctrl/Cmd + D` | Duplicate selected node |
| `Delete/Backspace` | Delete selected node |
| `Escape` | Deselect/Close dialogs |
| `?` | Show keyboard shortcuts |
| `Double Click` | Configure node |

---

## Node Categories

### 🎯 Trigger Nodes
Start points for workflows. Trigger nodes have no inputs, only outputs.

- **Manual Trigger**: Start workflow manually
- **Webhook**: Trigger via HTTP request
- **Schedule**: Run on a schedule (cron or interval)

### 🤖 AI Nodes
Leverage AI capabilities for intelligent processing.

- **AI Chat**: Interact with language models (OpenAI, Anthropic, Ollama, Groq)
- **AI Text Generation**: Generate content with specific tone/style
- **AI Image Analysis**: Analyze images using vision models
- **Sentiment Analysis**: Determine sentiment of text

### 🌐 Data Nodes
Fetch, parse, and manipulate data.

- **HTTP Request**: Make API calls
- **Database**: Query databases (MySQL, PostgreSQL, MongoDB)
- **JSON Parse**: Parse and extract JSON data
- **Data Mapper**: Transform data structures
- **Aggregate**: Summarize data (sum, average, count, etc.)

### 🔀 Logic Nodes
Control flow and routing.

- **IF**: Conditional branching (true/false outputs)
- **Switch**: Multi-way branching
- **Merge**: Combine data from multiple sources
- **Loop**: Iterate over arrays

### 🔧 Transform Nodes
Modify and process data.

- **Code**: Run custom JavaScript
- **Function**: Execute JavaScript functions
- **Set**: Add/modify fields
- **Filter**: Filter items by conditions
- **Sort**: Sort data
- **Limit**: Limit number of items

### 📧 Communication Nodes
Send notifications and messages.

- **Email**: Send emails via SMTP
- **Slack**: Post to Slack channels

### 📁 File Nodes
Work with files.

- **Read/Write File**: Read or write files
- **Upload File**: Upload and process files (CSV, Excel, JSON, images)

### ⏱️ Flow Control Nodes
Control execution timing.

- **Wait/Delay**: Pause execution for specified time

---

## Expression System

Expressions allow you to dynamically reference data from previous nodes using `{{...}}` syntax.

### Expression Types

#### 1. Node Data Reference
Access data from any previous node:

```javascript
{{$node.node_id.data.fieldName}}
```

**Examples:**
```javascript
// Access a user's email from HTTP node
{{$node.node-1234567890.data.email}}

// Access nested data
{{$node.http_1.data.results[0].name}}

// Access AI response
{{$node.aiChat_1.data.response}}
```

#### 2. Previous Node Shorthand
Access the immediately previous node:

```javascript
{{$prev.data.fieldName}}
```

**Examples:**
```javascript
// Get email from previous node
{{$prev.data.email}}

// Get AI response from previous node
{{$prev.response}}
```

#### 3. Current Item Reference (in loops)
When processing arrays, reference the current item:

```javascript
{{$item.fieldName}}
```

**Examples:**
```javascript
// In email body when sending to multiple users
Hello {{$item.name}}, your order #{{$item.orderId}} is ready!
```

#### 4. Workflow Input
Access data passed to the workflow:

```javascript
{{$input.fieldName}}
```

#### 5. Built-in Functions

| Function | Description | Example |
|----------|-------------|---------|
| `{{$now}}` | Current date/time (ISO) | `2024-01-03T10:30:00.000Z` |
| `{{$timestamp}}` | Unix timestamp | `1704279000000` |
| `{{$uuid}}` | Generate UUID | `a1b2c3d4-...` |
| `{{$random(min, max)}}` | Random number | `{{$random(1, 100)}}` |

### Expression Examples

```javascript
// Combine multiple expressions
Subject: Order {{$node.http_1.data.orderId}} - {{$now}}

// Use in API calls
https://api.example.com/users/{{$prev.data.userId}}

// Complex nested access
{{$node.database_1.data.results[0].customer.email}}

// In email body
Dear {{$item.firstName}} {{$item.lastName}},

Your account balance is ${{$item.balance}}.
Order status: {{$item.status}}

Thank you!
```

---

## Node Reference

### AI Chat Node 🤖

**Purpose**: Interact with AI language models

**Configuration:**
- **Provider**: `ollama`, `groq`, `openai`, `anthropic`
- **Model**: Model name (e.g., `llama3.2`, `gpt-4`, `claude-3-sonnet`)
- **API Key**: Required for cloud providers
- **System Prompt**: Instructions for AI behavior
- **User Prompt**: Your question/request (supports expressions)
- **Temperature**: Creativity level (0-2)
- **Max Tokens**: Response length limit

**Example Use Cases:**
1. Generate personalized email content
2. Analyze customer feedback
3. Translate text
4. Summarize documents

**Example Workflow:**
```
HTTP Request → AI Chat → Email
(Fetch users) → (Generate personalized message) → (Send emails)
```

**AI Chat Configuration Example:**
```javascript
System Prompt: You are a helpful customer support agent.

User Prompt: Write a professional email to {{$prev.data.name}} 
about their order #{{$prev.data.orderId}} which is now {{$prev.data.status}}.
```

**Output Data:**
```json
{
  "response": "Dear John, your order #12345 is now shipped...",
  "model": "gpt-4",
  "usage": { "total_tokens": 150 }
}
```

---

### HTTP Request Node 🌐

**Purpose**: Make API calls to external services

**Configuration:**
- **URL**: API endpoint (supports expressions)
- **Method**: GET, POST, PUT, DELETE, PATCH
- **Headers**: Request headers (JSON)
- **Query Parameters**: URL parameters
- **Body**: Request body (JSON)
- **Authentication**: none, basicAuth, bearerToken, apiKey
- **Timeout**: Request timeout in ms
- **Retry on Fail**: Enable automatic retries

**Example Use Cases:**
1. Fetch data from APIs
2. Send data to third-party services
3. Webhook notifications

**Example Workflow:**
```
Trigger → HTTP Request → Filter → AI Chat → Email
(Start) → (Fetch orders) → (New orders only) → (Generate summary) → (Notify)
```

**HTTP Configuration Example:**
```javascript
URL: https://api.example.com/orders
Method: GET
Headers: {
  "Authorization": "Bearer sk-xxx",
  "Content-Type": "application/json"
}
Query Parameters: {
  "status": "pending",
  "limit": "10"
}
```

**Output Data:**
```json
{
  "data": [
    { "id": 1, "status": "pending", "amount": 99.99 },
    { "id": 2, "status": "pending", "amount": 149.99 }
  ],
  "metadata": {
    "statusCode": 200,
    "headers": { ... }
  }
}
```

---

### Filter Node 🔍

**Purpose**: Filter items based on conditions

**Configuration:**
- **Conditions**: Array of filtering rules
  - Field: Field to check
  - Operator: equals, notEquals, contains, greaterThan, lessThan
  - Value: Comparison value

**Example Use Cases:**
1. Filter orders by status
2. Find high-value customers
3. Select items matching criteria

**Example Workflow:**
```
HTTP Request → Filter → Email
(Fetch orders) → (Status = "pending") → (Send to warehouse)
```

**Filter Configuration:**
```javascript
Conditions:
- Field: status
  Operator: equals
  Value: pending

- Field: amount
  Operator: greaterThan
  Value: 100
```

**Input Data:**
```json
[
  { "id": 1, "status": "pending", "amount": 150 },
  { "id": 2, "status": "completed", "amount": 200 },
  { "id": 3, "status": "pending", "amount": 50 }
]
```

**Output Data:**
```json
[
  { "id": 1, "status": "pending", "amount": 150 }
]
```

---

### IF Node 🔀

**Purpose**: Conditional branching with true/false outputs

**Configuration:**
- **Conditions**: Conditions to evaluate
- **Combine Operation**: AND or OR

**Example Use Cases:**
1. Route high-value orders differently
2. Check if data exists before processing
3. Validate input data

**Example Workflow:**
```
HTTP Request → IF → [True: Email Admin] [False: Log Only]
(Fetch order) → (Amount > $500?) → Send alert / Just log
```

**IF Configuration:**
```javascript
Conditions:
- Field: amount
  Operator: greaterThan
  Value: 500

Combine: AND
```

**Output:**
- **True Branch**: Receives data if condition is met
- **False Branch**: Receives data if condition fails

---

### Email Node 📧

**Purpose**: Send emails via SMTP

**Configuration:**
- **From Email**: Sender email address
- **To Email**: Recipient (supports expressions)
- **Subject**: Email subject (supports expressions)
- **Body**: Email content (supports expressions)
- **Send as HTML**: Enable HTML formatting
- **SMTP Settings**: Host, port, username, password

**Example Use Cases:**
1. Send order confirmations
2. Alert administrators
3. Send bulk personalized emails

**Example Workflow:**
```
HTTP Request → AI Chat → Email
(Fetch users) → (Generate message) → (Send to each user)
```

**Email Configuration:**
```javascript
From: noreply@example.com
To: {{$item.email}}
Subject: Your Order Update - {{$item.orderId}}
Body: 
Dear {{$item.name}},

{{$prev.response}}

Best regards,
Team
```

**When Processing Arrays:**
The email node automatically sends individual emails to each item in the array.

**Input (Array):**
```json
[
  { "email": "john@example.com", "name": "John", "orderId": "12345" },
  { "email": "jane@example.com", "name": "Jane", "orderId": "12346" }
]
```

**Output:**
```json
{
  "emails": [
    { "sent": true, "to": "john@example.com", "messageId": "..." },
    { "sent": true, "to": "jane@example.com", "messageId": "..." }
  ],
  "totalSent": 2,
  "totalFailed": 0
}
```

---

### Code Node 💻

**Purpose**: Execute custom JavaScript code

**Configuration:**
- **JavaScript Code**: Your custom code
- **Mode**: runOnceForAllItems or runOnceForEachItem

**Available Variables:**
- `items`: Array of input items
- `console.log()`: Logging (visible in execution logs)

**Example Use Cases:**
1. Complex data transformations
2. Custom calculations
3. Advanced logic not covered by other nodes

**Example Workflow:**
```
HTTP Request → Code → Email
(Fetch sales) → (Calculate totals) → (Send report)
```

**Code Example:**
```javascript
// Access input data via 'items'
const output = items.map(item => ({
  ...item,
  total: item.quantity * item.price,
  discount: item.price > 100 ? item.price * 0.1 : 0,
  processed: true,
  timestamp: new Date().toISOString()
}));

// Calculate summary
const summary = {
  totalItems: output.length,
  totalRevenue: output.reduce((sum, item) => sum + item.total, 0),
  avgOrderValue: output.reduce((sum, item) => sum + item.total, 0) / output.length
};

console.log('Processed:', summary);

return output;
```

**Input Data:**
```json
[
  { "id": 1, "quantity": 2, "price": 50 },
  { "id": 2, "quantity": 1, "price": 150 }
]
```

**Output Data:**
```json
[
  { "id": 1, "quantity": 2, "price": 50, "total": 100, "discount": 0 },
  { "id": 2, "quantity": 1, "price": 150, "total": 150, "discount": 15 }
]
```

---

### Data Mapper Node 🗺️

**Purpose**: Transform data structures by mapping fields

**Configuration:**
- **Field Mappings**: Source → Target field mappings
- **Keep Unmapped Fields**: Preserve unmapped fields

**Example Use Cases:**
1. Standardize data from different APIs
2. Rename fields for consistency
3. Restructure nested data

**Example Workflow:**
```
HTTP Request → Data Mapper → Database
(Fetch API data) → (Map to DB schema) → (Insert records)
```

**Mapper Configuration:**
```javascript
Mappings:
  firstName: data.user.first_name
  lastName: data.user.last_name
  email: data.contact.email_address
  
Keep Unmapped: false
```

**Input Data:**
```json
{
  "data": {
    "user": {
      "first_name": "John",
      "last_name": "Doe"
    },
    "contact": {
      "email_address": "john@example.com"
    }
  }
}
```

**Output Data:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

---

### Sort Node 🔃

**Purpose**: Sort array items

**Configuration:**
- **Sort By Field**: Field to sort by
- **Order**: ascending or descending

**Example Use Cases:**
1. Sort orders by date
2. Rank customers by value
3. Order items by priority

**Example:**
```javascript
Sort By: amount
Order: descending
```

**Input:**
```json
[
  { "id": 1, "amount": 50 },
  { "id": 2, "amount": 150 },
  { "id": 3, "amount": 100 }
]
```

**Output:**
```json
[
  { "id": 2, "amount": 150 },
  { "id": 3, "amount": 100 },
  { "id": 1, "amount": 50 }
]
```

---

## File Upload & Processing

### Upload File Node 📁

**Purpose**: Upload and process files (CSV, Excel, JSON, images, PDFs)

**Supported File Types:**
- **CSV**: Parsed into array of objects
- **Excel** (.xlsx, .xls): Parsed into array of objects
- **JSON**: Parsed JSON data
- **Text**: Raw text content
- **Images**: Base64-encoded data
- **PDF**: Base64-encoded data

**Configuration:**
1. Click "Upload File" field
2. Select file from computer
3. File is automatically uploaded and processed

**Maximum File Size:** 50MB

**Example Workflow: Process CSV and Send Emails**
```
Upload File → AI Chat → Email
(Upload users.csv) → (Generate personalized message) → (Send to each user)
```

### CSV/Excel Processing Example

**Uploaded CSV (users.csv):**
```csv
name,email,order_id,amount
John Doe,john@example.com,12345,150.00
Jane Smith,jane@example.com,12346,200.00
```

**File Node Output:**
```json
{
  "type": "csv",
  "data": [
    { "name": "John Doe", "email": "john@example.com", "order_id": "12345", "amount": "150.00" },
    { "name": "Jane Smith", "email": "jane@example.com", "order_id": "12346", "amount": "200.00" }
  ],
  "rowCount": 2,
  "columns": ["name", "email", "order_id", "amount"]
}
```

**Using File Data in Next Node (AI Chat):**
```javascript
User Prompt: Generate a personalized order confirmation email for {{$item.name}} 
with order #{{$item.order_id}} worth ${{$item.amount}}.
```

**Then in Email Node:**
```javascript
To: {{$item.email}}
Subject: Order Confirmation - {{$item.order_id}}
Body: {{$prev.response}}
```

### Image Processing Example

**Upload Image → AI Image Analysis → Code**

**AI Image Analysis Config:**
```javascript
Image URL: {{$prev.data}} // Uses uploaded image
Analysis Type: describe
Custom Prompt: Describe this product image for an e-commerce listing.
```

**Output:**
```json
{
  "analysis": "A modern laptop with a sleek silver design...",
  "imageUrl": "data:image/jpeg;base64,...",
  "analysisType": "describe"
}
```

---

## Workflow Examples

### Example 1: Automated Customer Onboarding

**Goal:** Send personalized welcome emails to new customers

**Workflow:**
```
Webhook → HTTP Request → AI Chat → Email
(New signup) → (Fetch user details) → (Generate welcome message) → (Send email)
```

**Configuration:**

1. **Webhook Node:**
   - Path: `/webhook/new-customer`
   - Method: POST

2. **HTTP Request Node:**
   - URL: `https://api.example.com/users/{{$input.userId}}`
   - Method: GET

3. **AI Chat Node:**
   - Provider: openai
   - Model: gpt-4
   - Prompt: `Write a warm, welcoming email for {{$prev.data.name}} who just signed up for our service. Include tips for getting started.`

4. **Email Node:**
   - To: `{{$prev.data.email}}`
   - Subject: `Welcome to Our Platform, {{$prev.data.name}}!`
   - Body: `{{$prev.response}}`

---

### Example 2: CSV to Personalized Emails

**Goal:** Upload a CSV of customers and send personalized promotional emails

**Workflow:**
```
Upload File → Filter → AI Chat → Email
(Upload CSV) → (Active customers) → (Generate promo message) → (Send emails)
```

**Configuration:**

1. **Upload File Node:**
   - Upload `customers.csv`

2. **Filter Node:**
   - Field: status
   - Operator: equals
   - Value: active

3. **AI Chat Node:**
   - Prompt: `Write a personalized promotional email for {{$item.name}} offering them a {{$item.discount}}% discount on their next purchase. Make it enthusiastic and friendly.`

4. **Email Node:**
   - To: `{{$item.email}}`
   - Subject: `Special Offer Just for You, {{$item.name}}!`
   - Body: `{{$prev.response}}`

---

### Example 3: Order Processing with Conditional Logic

**Goal:** Process orders differently based on amount

**Workflow:**
```
Schedule → HTTP Request → IF 
(Every 5 min) → (Fetch new orders) → (Amount > $500?)
                                      ├─ True → Email → Slack (Admin alert)
                                      └─ False → Email (Standard processing)
```

**Configuration:**

1. **Schedule Node:**
   - Interval: 5 minutes

2. **HTTP Request Node:**
   - URL: `https://api.example.com/orders?status=new`
   - Method: GET

3. **IF Node:**
   - Field: amount
   - Operator: greaterThan
   - Value: 500

4. **Email Node (True Branch):**
   - To: `admin@example.com`
   - Subject: `High-Value Order Alert: ${{$prev.data.amount}}`
   - Body: `Order #{{$prev.data.id}} requires priority processing.`

5. **Slack Node:**
   - Channel: `#high-value-orders`
   - Message: `🚨 New high-value order: ${{$prev.data.amount}}`

6. **Email Node (False Branch):**
   - Standard processing email

---

### Example 4: Data Aggregation and Reporting

**Goal:** Generate daily sales report

**Workflow:**
```
Schedule → HTTP Request → Aggregate → Code → Email
(Daily 9 AM) → (Fetch sales) → (Calculate totals) → (Format report) → (Send report)
```

**Configuration:**

1. **Schedule Node:**
   - Cron: `0 9 * * *` (9 AM daily)

2. **HTTP Request Node:**
   - URL: `https://api.example.com/sales?date={{$now}}`

3. **Aggregate Node:**
   - Operation: sum
   - Field: amount

4. **Code Node:**
```javascript
const total = items[0].sum;
const report = `
Daily Sales Report - ${new Date().toLocaleDateString()}
=================================================
Total Sales: $${total.toFixed(2)}
Number of Orders: ${items.length}
Average Order Value: $${(total / items.length).toFixed(2)}
`;

return { report, total, count: items.length };
```

5. **Email Node:**
   - To: `reports@example.com`
   - Subject: `Daily Sales Report - {{$now}}`
   - Body: `{{$prev.data.report}}`

---

## Best Practices

### 1. Node Organization
- Use descriptive node labels
- Group related nodes visually
- Keep workflows linear when possible
- Document complex logic with node descriptions

### 2. Expression Usage
- Use `$prev` for simple sequential flows
- Use `$node.id` for referencing specific nodes
- Test expressions with sample data first
- Add fallback values when data might be missing

### 3. Error Handling
- Use IF nodes to validate data before processing
- Enable retry on HTTP requests for reliability
- Set appropriate timeouts
- Log important data with Code nodes

### 4. Performance
- Use Filter nodes early to reduce data volume
- Limit array sizes with Limit node
- Set appropriate API timeouts
- Batch operations when possible

### 5. Security
- Store API keys securely (use authentication fields)
- Validate webhook inputs
- Don't log sensitive data
- Use HTTPS for all external calls

### 6. Testing
- Test with small datasets first
- Check execution logs for errors
- Verify expressions resolve correctly
- Test all conditional branches

---

## Troubleshooting

### Common Issues

#### 1. Expression Not Resolving

**Problem:** `{{$node.xxx.data.field}}` returns undefined

**Solutions:**
- Check node ID is correct (view in Properties panel)
- Verify the field exists in previous node output
- Check execution logs to see actual data structure
- Use `{{$prev.data}}` to see all available fields

#### 2. Node Execution Fails

**Problem:** Node shows error status

**Solutions:**
- Check required fields are configured
- Verify API credentials are correct
- Check timeout settings
- Review execution logs for specific error message

#### 3. Email Not Sending

**Problem:** Email node completes but no email received

**Solutions:**
- Verify SMTP credentials
- Check spam/junk folders
- Ensure recipient email is valid
- Test SMTP settings separately
- Check SMTP port (587 for TLS, 465 for SSL)

#### 4. File Upload Fails

**Problem:** File upload doesn't complete

**Solutions:**
- Check file size (max 50MB)
- Verify file type is supported
- Ensure stable internet connection
- Try smaller file first

#### 5. AI Node Returns Error

**Problem:** AI Chat node fails

**Solutions:**
- Verify API key is correct
- Check model name spelling
- Ensure sufficient API credits
- For Ollama: verify it's running locally
- Check prompt isn't too long

#### 6. Data Not Flowing Between Nodes

**Problem:** Next node receives no data

**Solutions:**
- Verify nodes are connected (green to blue handles)
- Check previous node completed successfully
- Ensure previous node returns data
- Review execution logs

### Debug Tips

1. **Use Code Nodes for Debugging:**
```javascript
console.log('Input data:', items);
console.log('Field value:', items[0].someField);
return items; // Pass through unchanged
```

2. **Check Execution Logs:**
   - View detailed execution in Executions page
   - Check each node's input/output
   - Look for error messages

3. **Test Incrementally:**
   - Build workflow step by step
   - Test after adding each node
   - Verify data structure at each step

4. **Use Sample Data:**
   - Start with manual trigger and known data
   - Verify logic before connecting to live APIs

---

## Advanced Topics

### Working with Arrays

**Processing Each Item:**
- AI Chat, Email, and other nodes automatically process arrays
- Each item is processed individually
- Use `{{$item.field}}` to reference current item

**Filtering Arrays:**
```
HTTP Request → Filter → Email
[Multiple items] → [Matching items only] → [Send to each]
```

**Transforming Arrays:**
```
HTTP Request → Code → Aggregate
[Raw data] → [Transform each] → [Summarize]
```

### Conditional Workflows

**Simple Branching:**
```
IF Node
├─ True → Action A
└─ False → Action B
```

**Multi-way Branching:**
```
Switch Node
├─ Output 0 → Action A
├─ Output 1 → Action B
├─ Output 2 → Action C
└─ Output 3 → Default Action
```

### Merging Data

**Combining Multiple Sources:**
```
HTTP Request 1 ─┐
HTTP Request 2 ─┤→ Merge → Process
HTTP Request 3 ─┘
```

### Loop Processing

**Iterating with Pauses:**
```
HTTP Request → Loop → Delay → Process → [Back to Loop]
```

---

## API Integration Examples

### Integration with Popular Services

#### GitHub
```javascript
URL: https://api.github.com/repos/{{$input.owner}}/{{$input.repo}}/issues
Headers: {
  "Authorization": "token ghp_xxxx",
  "Accept": "application/vnd.github.v3+json"
}
```

#### Stripe
```javascript
URL: https://api.stripe.com/v1/customers
Headers: {
  "Authorization": "Bearer sk_test_xxxx"
}
```

#### SendGrid
```javascript
URL: https://api.sendgrid.com/v3/mail/send
Method: POST
Headers: {
  "Authorization": "Bearer SG.xxxx",
  "Content-Type": "application/json"
}
```

---

## Conclusion

This platform provides a powerful no-code solution for automating complex workflows. By combining nodes and using expressions, you can create sophisticated automation without writing code.

**Key Takeaways:**
- Start simple and build incrementally
- Use expressions to connect data between nodes
- Test thoroughly with sample data
- Review execution logs when troubleshooting
- Leverage AI nodes for intelligent processing
- Process files with the upload node

**Need Help?**
- Check execution logs for detailed error messages
- Refer to this documentation for node details
- Test with smaller datasets first
- Use Code nodes to debug data flow

Happy automating! 🚀