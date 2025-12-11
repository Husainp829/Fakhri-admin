# WhatsApp Broadcast Feature - Development Plan

## Direct Meta API Integration for Template Management

### Implementation Status: 🟢 In Progress

**Completed:**

- ✅ Template listing functionality (working)
- ✅ Backend API proxy for Meta templates
- ✅ Frontend list view with filters and sync
- ✅ Template detail/show view (working)
  - Displays template components (header, body, footer, buttons)
  - Status and quality score indicators
  - Refresh from Meta functionality

**Next Steps:**

- ✅ Template create/edit forms (COMPLETED)
- Broadcast module implementation (backend + frontend)

### Overview

Implement WhatsApp template management and broadcast functionality with **all Meta API calls proxied through the NestJS backend**. The frontend (React Admin) will only communicate with the backend APIs, and the backend will handle all Meta WhatsApp Business API interactions.

**Architecture:**

```
Frontend (React Admin) → Backend (NestJS) → Meta WhatsApp Business API
```

**Key Principle:** No direct Meta API calls from the frontend. All communication goes through the backend proxy layer.

### Architecture & API Flow

**Frontend → Backend → Meta API**

1. **Frontend (React Admin):**

   - Makes HTTP requests to NestJS backend APIs
   - Uses React Admin's dataProvider (already configured)
   - No Meta API credentials or direct API calls
   - Example: `GET /whatsapp-templates` → Backend endpoint

2. **Backend (NestJS):**

   - Receives requests from frontend
   - Validates requests and permissions
   - Proxies requests to Meta WhatsApp Business API
   - Handles authentication with Meta API (using `META_ACCESS_TOKEN`)
   - Caches template data locally (optional)
   - Returns formatted responses to frontend
   - Example: `GET /whatsapp-templates` → Calls Meta API → Returns to frontend

3. **Meta WhatsApp Business API:**
   - Receives requests from backend only
   - Validates using backend's access token
   - Returns template/broadcast data

**Benefits:**

- ✅ Security: Meta API credentials never exposed to frontend
- ✅ Rate limiting: Centralized in backend
- ✅ Error handling: Consistent error responses
- ✅ Caching: Backend can cache templates for performance
- ✅ Logging: All Meta API calls logged in backend
- ✅ Authentication: Backend handles Meta API auth

### Example API Flow

**Scenario: Frontend wants to list all WhatsApp templates**

1. **Frontend (React Admin):**

   ```javascript
   // React Admin automatically calls:
   dataProvider.getList('whatsappTemplates', { ... })
   // Which translates to:
   GET /whatsapp-templates
   ```

2. **Backend (NestJS Controller):**

   ```typescript
   @Get('whatsapp-templates')
   async findAll(@Query() query: WhatsappTemplateQueryDto) {
     // Controller receives request from frontend
     return this.whatsappTemplateService.listTemplates(query);
   }
   ```

3. **Backend (NestJS Service):**

   ```typescript
   async listTemplates(query) {
     // Service calls Meta API (server-side only)
     const templates = await this.metaWhatsAppClient.listTemplates(
       process.env.META_BUSINESS_ACCOUNT_ID,
       query
     );
     // Optionally cache in database
     // Return to frontend
     return templates;
   }
   ```

4. **Meta API:**

   ```
   GET https://graph.facebook.com/v22.0/{business_account_id}/message_templates
   Authorization: Bearer {META_ACCESS_TOKEN}
   ```

5. **Response flows back:**
   Meta API → Backend Service → Backend Controller → Frontend

**Key Point:** Frontend never sees or calls Meta API directly. All Meta API interactions happen server-side in the NestJS backend.

---

## Phase 1: Environment Configuration

### 1.1 Add Required Environment Variables

**Backend (.env):**

- `META_PHONE_NUMBER_ID` (already exists)
- `META_ACCESS_TOKEN` (already exists)
- `META_BUSINESS_ACCOUNT_ID` (NEW) - WhatsApp Business Account ID (WABA ID)
- `META_API_VERSION` (optional, default: "v22.0")

---

## Phase 2: Database Schema (NestJS/Prisma)

### 2.1 WhatsApp Template Cache Model (Optional)

**Purpose:** Cache template data locally for faster access, offline viewing, and better UX. Templates are still managed via Meta API.

**Add `WhatsAppTemplate` model to Prisma schema:**

```prisma
model WhatsAppTemplate {
  id              String    @id @default(uuid()) @db.Char(36)
  name            String    @unique @db.VarChar(255)  // Meta template name
  metaId          String?   @db.VarChar(255)           // Meta template ID (if available)
  category        String    @db.VarChar(50)            // UTILITY, MARKETING, AUTHENTICATION
  language        String    @default("en_US") @db.VarChar(10)
  status          String    @db.VarChar(50)            // APPROVED, PENDING, REJECTED, PAUSED
  qualityScore    String?   @db.VarChar(50)            // GREEN, YELLOW, RED, UNKNOWN
  bodyText        String?   @db.Text                   // Cached body text
  headerType      String?   @db.VarChar(50)            // TEXT, IMAGE, VIDEO, DOCUMENT, null
  headerContent   String?   @db.Text
  footerText      String?   @db.VarChar(1024)
  buttonData      Json?                                // Cached button configuration
  components      Json                                 // Full template components from Meta
  lastSyncedAt    DateTime? @db.DateTime(0)           // Last sync with Meta API
  createdAt       DateTime  @default(now()) @db.DateTime(0)
  updatedAt       DateTime  @updatedAt @db.DateTime(0)

  broadcasts      WhatsAppBroadcast[]

  @@index([status])
  @@index([category])
  @@map("whatsapp_templates")
}
```

### 2.2 WhatsApp Broadcast Model

**Add `WhatsAppBroadcast` model:**

```prisma
model WhatsAppBroadcast {
  id                String    @id @default(uuid()) @db.Char(36)
  templateName      String    @db.VarChar(255)        // Meta template name
  templateId        String?   @db.Char(36)             // Reference to cached template (optional)
  name              String    @db.VarChar(255)         // Broadcast name/description
  status            String    @default("PENDING") @db.VarChar(50)  // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
  totalRecipients   Int       @default(0)
  successCount      Int       @default(0)
  failureCount      Int       @default(0)
  parameters        Json                              // Template parameters for this broadcast
  filterCriteria    Json?                             // Filter criteria used (mohalla, sector, etc.)
  recipientIds      Json?                             // Array of itsdata IDs or phone numbers
  errorMessage      String?   @db.Text
  createdBy         String    @db.VarChar(255)         // Admin ID
  createdAt         DateTime  @default(now()) @db.DateTime(0)
  updatedAt         DateTime  @updatedAt @db.DateTime(0)
  startedAt         DateTime? @db.DateTime(0)
  completedAt       DateTime? @db.DateTime(0)

  template          WhatsAppTemplate? @relation(fields: [templateId], references: [id])
  recipients        WhatsAppBroadcastRecipient[]

  @@index([status])
  @@index([templateName])
  @@index([createdAt])
  @@map("whatsapp_broadcasts")
}
```

### 2.3 Broadcast Recipient Log Model

**Add `WhatsAppBroadcastRecipient` model:**

```prisma
model WhatsAppBroadcastRecipient {
  id              String    @id @default(uuid()) @db.Char(36)
  broadcastId     String    @db.Char(36)
  recipientPhone  String    @db.VarChar(20)
  recipientName   String?   @db.VarChar(255)
  itsdataId       String?   @db.VarChar(36)
  status          String    @default("PENDING") @db.VarChar(50)  // PENDING, SENT, DELIVERED, READ, FAILED
  messageId       String?   @db.VarChar(255)      // Meta API message ID
  errorCode       String?   @db.VarChar(50)
  errorMessage    String?   @db.Text
  sentAt          DateTime? @db.DateTime(0)
  deliveredAt     DateTime? @db.DateTime(0)
  readAt          DateTime? @db.DateTime(0)
  createdAt       DateTime  @default(now()) @db.DateTime(0)

  broadcast       WhatsAppBroadcast @relation(fields: [broadcastId], references: [id], onDelete: Cascade)

  @@index([broadcastId])
  @@index([status])
  @@index([recipientPhone])
  @@map("whatsapp_broadcast_recipients")
}
```

---

## Phase 3: Backend API Development (NestJS)

### 3.1 Enhanced WhatsApp Client

**Update `/core/clients/whatsapp-client.js` or create `/core/clients/meta-whatsapp-client.js`:**

Add methods for template management:

- `listTemplates(businessAccountId, filters?)` - GET templates from Meta
- `getTemplate(businessAccountId, templateName)` - Get specific template
- `createTemplate(businessAccountId, templateData)` - POST new template
- `updateTemplate(businessAccountId, templateName, templateData)` - POST update
- `deleteTemplate(businessAccountId, templateName)` - DELETE template
- `getTemplateStatus(businessAccountId, templateName)` - Check approval status

**Base URL:** `https://graph.facebook.com/v22.0/{business_account_id}/message_templates`

### 3.2 WhatsApp Template Module (Meta API Proxy)

**Create `/nest/modules/whatsapp-template/`:**

**Important:** This module acts as a proxy layer. All Meta API calls are made server-side only. Frontend never directly calls Meta APIs.

#### `whatsapp-template.service.ts`

- `syncTemplatesFromMeta()` - Fetch all templates from Meta and cache locally
- `listTemplates(query)` - List templates (from cache or Meta API)
- `getTemplate(name)` - Get template details (from cache or Meta API)
- `createTemplate(dto)` - Create template via Meta API, then cache
- `updateTemplate(name, dto)` - Update template via Meta API, then update cache
- `deleteTemplate(name)` - Delete template via Meta API, then remove from cache
- `refreshTemplate(name)` - Sync single template from Meta API
- `getTemplateStatus(name)` - Get approval status from Meta API

#### `whatsapp-template.controller.ts`

**All endpoints proxy to Meta API (server-side only):**

- `GET /whatsapp-templates` - List templates (proxies to Meta API, returns cached or fresh data)
- `GET /whatsapp-templates/:name` - Get template by name (proxies to Meta API)
- `POST /whatsapp-templates` - Create template (proxies to Meta API, then caches)
- `PUT /whatsapp-templates/:name` - Update template (proxies to Meta API, then updates cache)
- `DELETE /whatsapp-templates/:name` - Delete template (proxies to Meta API, then removes from cache)
- `POST /whatsapp-templates/sync` - Sync all templates from Meta (proxies to Meta API, updates cache)
- `POST /whatsapp-templates/:name/refresh` - Refresh single template from Meta (proxies to Meta API)
- `GET /whatsapp-templates/:name/status` - Get template approval status (proxies to Meta API)

**Note:** All Meta API calls are made server-side. Frontend only calls these NestJS endpoints.

#### DTOs:

- `create-whatsapp-template.dto.ts` - Template creation payload
- `update-whatsapp-template.dto.ts` - Template update payload
- `whatsapp-template-query.dto.ts` - Query filters
- `template-component.dto.ts` - Template component structure

### 3.3 WhatsApp Broadcast Module

**Create `/nest/modules/whatsapp-broadcast/`:**

#### `whatsapp-broadcast.service.ts`

- `createBroadcast(dto)` - Create broadcast and queue for processing
- `processBroadcast(broadcastId)` - Process broadcast (send messages)
- `getBroadcastStatus(broadcastId)` - Get current status
- `retryFailedMessages(broadcastId)` - Retry failed recipients
- `cancelBroadcast(broadcastId)` - Cancel pending/processing broadcast
- `getRecipients(broadcastId, filters?)` - Get recipient logs

#### `whatsapp-broadcast.controller.ts`

- `GET /whatsapp-broadcasts` - List broadcasts
- `GET /whatsapp-broadcasts/:id` - Get broadcast details
- `POST /whatsapp-broadcasts` - Create and start broadcast
- `GET /whatsapp-broadcasts/:id/status` - Get broadcast status
- `GET /whatsapp-broadcasts/:id/recipients` - Get recipient logs
- `POST /whatsapp-broadcasts/:id/retry-failed` - Retry failed messages
- `POST /whatsapp-broadcasts/:id/cancel` - Cancel broadcast

#### DTOs:

- `create-whatsapp-broadcast.dto.ts`
- `broadcast-filter.dto.ts` - Filter criteria for itsdata
- `whatsapp-broadcast-query.dto.ts`

### 3.4 Enhanced WhatsApp Meta Service

**Update `/core/service/whatsapp-meta.js`:**

Add:

- `sendTemplateMessage(phone, templateName, language, parameters)` - Generic template sender
- `sendBulkTemplateMessages(recipients, templateName, language, parameters)` - Batch sending
- `validateTemplateParameters(templateName, parameters)` - Validate parameters match template

### 3.5 Itsdata Service Enhancement

**Update `/nest/modules/itsdata/itsdata.service.ts`:**

Add:

- `getPhoneNumbersByFilter(filterCriteria)` - Get phone numbers based on filters
- `validatePhoneNumbers(phoneNumbers)` - Validate and format phone numbers
- `getRecipientsForBroadcast(filters)` - Get recipients with phone numbers

### 3.6 Background Job Processing

- Set up Bull Queue for async broadcast processing
- Create job processor for sending messages in batches
- Rate limiting (Meta API: ~1000 messages/second)
- Error handling and retry logic
- Progress tracking

---

## Phase 4: Frontend Development (React Admin)

### 4.1 WhatsApp Template Management Resource

**Create `/src/containers/whatsappTemplates/`:**

#### `index.js`

```javascript
export default {
  list: List,
  show: Show,
  create: Create,
  edit: Edit,
  icon: MessageIcon,
  name: "whatsappTemplates",
  label: "WhatsApp Templates",
};
```

#### `list.js`

- Display templates from **backend API** (which proxies Meta API)
- Filters: Status (APPROVED, PENDING, REJECTED), Category, Search
- Actions: Sync from Meta (calls backend), Refresh template (calls backend), Create, Edit, Delete
- Show: Name, Category, Language, Status, Quality Score, Last Synced
- **API Calls:** `GET /whatsapp-templates` (backend endpoint)

#### `create.js` ✅ COMPLETED

- Form to create new template
- Fields:
  - Name (required, unique)
  - Category (UTILITY, MARKETING, AUTHENTICATION)
  - Language (default: en_US)
  - Header (type: TEXT/IMAGE/VIDEO/DOCUMENT, content)
  - Body (with parameter placeholders {{1}}, {{2}}, etc.)
  - Footer (optional)
  - Buttons (QUICK_REPLY, URL, PHONE_NUMBER)
- WhatsApp-style preview component with live updates
- Example variable inputs for template parameters
- **Submit to backend API** (which proxies to Meta API)
- **API Call:** `POST /whatsapp-templates` (backend endpoint)

#### `edit.js` ✅ COMPLETED

- Edit existing template (only if status allows)
- Similar form to create with pre-populated data
- Status alert showing edit restrictions
- Current status chip display
- Record transformer for mapping API data to form fields
- WhatsApp-style preview component with live updates
- Example variable inputs with fallback to Meta API examples
- **API Call:** `PUT /whatsapp-templates/:name` (backend endpoint)

#### `shared.js` ✅ COMPLETED (Refactored)

- **Common components extracted for reuse:**
  - `TemplatePreview` - WhatsApp-style message bubble preview
  - `transformTemplateData` - Form data to Meta API format transformer
  - `ExampleVariablesInput` - Dynamic variable input fields
  - `LivePreviewCreate` - Real-time preview for create form
  - `LivePreviewEdit` - Real-time preview for edit form (with record fallback)
  - `TemplateFormFields` - Reusable form fields component
- **Benefits:** DRY code, easier maintenance, consistent behavior

#### `show.js`

- Template details view
- Show all components
- Status information
- Quality score
- Last synced timestamp
- Actions: Refresh from Meta (calls backend), Delete (calls backend)
- **API Calls:**
  - `GET /whatsapp-templates/:name` (backend endpoint)
  - `POST /whatsapp-templates/:name/refresh` (backend endpoint)
  - `DELETE /whatsapp-templates/:name` (backend endpoint)

#### Components: ✅ COMPLETED

- `shared.js` - **Common components extracted:**
  - `TemplatePreview` - WhatsApp-style preview component
  - `TemplateFormFields` - Reusable form fields
  - `ExampleVariablesInput` - Dynamic variable inputs
  - `LivePreviewCreate` / `LivePreviewEdit` - Real-time previews
  - `transformTemplateData` - Data transformation utility
- `StatusAlert` - Status-based edit restrictions (in edit.js)
- `RecordTransformer` - Maps API data to form fields (in edit.js)

### 4.2 WhatsApp Broadcast Resource

**Create `/src/containers/whatsappBroadcasts/`:**

#### `index.js`

```javascript
export default {
  list: List,
  show: Show,
  create: Create,
  icon: BroadcastIcon,
  name: "whatsappBroadcasts",
  label: "WhatsApp Broadcasts",
};
```

#### `list.js`

- List all broadcasts
- Filters: Status, Date range, Template name
- Show: Name, Template, Status, Recipients count, Success/Failure, Created date
- **API Call:** `GET /whatsapp-broadcasts` (backend endpoint)

#### `create.js`

- Broadcast creation form:
  1. **Template Selection:**
     - Dropdown of approved templates only
     - Template preview
     - Parameter mapping interface
  2. **Recipient Selection:**
     - Option 1: Filter from itsdata
       - Mohalla/Jamaat filter
       - Sector/Sub-sector filter
       - HOF/Family Member type
       - Custom filters
     - Option 2: Manual phone numbers
       - Text area for phone numbers (one per line)
       - CSV upload option
  3. **Parameter Mapping:**
     - Map itsdata fields to template parameters
     - Preview message for sample recipient
  4. **Review & Send:**
     - Summary of broadcast
     - Estimated recipient count
     - Send button
- **API Call:** `POST /whatsapp-broadcasts` (backend endpoint, which handles Meta API calls)

#### `show.js`

- Broadcast details:
  - Status dashboard (success/failure counts, progress)
  - Template information
  - Filter criteria used
  - Recipient logs table (with status, error messages)
  - Actions: Retry failed, Cancel (if pending/processing)
- **API Calls:**
  - `GET /whatsapp-broadcasts/:id` (backend endpoint)
  - `GET /whatsapp-broadcasts/:id/recipients` (backend endpoint)
  - `POST /whatsapp-broadcasts/:id/retry-failed` (backend endpoint)
  - `POST /whatsapp-broadcasts/:id/cancel` (backend endpoint)

#### Components:

- `BroadcastForm.js` - Main broadcast creation form
- `TemplateSelector.js` - Template selection with preview
- `RecipientFilter.js` - Filter builder for itsdata
- `PhoneNumberInput.js` - Manual phone number input
- `ParameterMapper.js` - Map itsdata fields to template parameters
- `BroadcastStatus.js` - Real-time status display
- `RecipientLogTable.js` - Recipient logs table with filters
- `BroadcastProgress.js` - Progress indicator

### 4.3 Integration Points

- Update `App.js` to include new resources
- Update `layout/menu.js` to add menu items
- Update permissions system:
  - `view.whatsapp.templates`
  - `edit.whatsapp.templates`
  - `view.whatsapp.broadcasts`
  - `create.whatsapp.broadcasts`

### 4.4 Custom Components & Utilities

- `PhoneNumberFormatter.js` - Format to E.164 format
- `TemplateParameterMapper.js` - Map itsdata fields to parameters
- `BroadcastProgress.js` - Progress indicator
- `RecipientSelector.js` - Multi-select for itsdata records
- `ErrorHandler.js` - Handle backend API errors gracefully (backend handles Meta API errors)

**Important:** Frontend components do NOT make direct Meta API calls. All API calls go through React Admin's dataProvider to backend endpoints.

---

## Phase 5: Meta API Integration Details

### 5.1 Template Management Endpoints

**List Templates:**

```
GET https://graph.facebook.com/v22.0/{business_account_id}/message_templates
Query params: limit, after, before, name, status, category, language
```

**Get Template:**

```
GET https://graph.facebook.com/v22.0/{business_account_id}/message_templates?name={template_name}
```

**Create Template:**

```
POST https://graph.facebook.com/v22.0/{business_account_id}/message_templates
Body: {
  name: string,
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION",
  language: string (e.g., "en_US"),
  components: [
    {
      type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS",
      format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT",
      text?: string,
      buttons?: [...]
    }
  ]
}
```

**Update Template:**

```
POST https://graph.facebook.com/v22.0/{business_account_id}/message_templates
Body: {
  name: string,  // Existing template name
  ...updated components
}
```

**Delete Template:**

```
DELETE https://graph.facebook.com/v22.0/{business_account_id}/message_templates
Body: {
  name: string
}
```

### 5.2 Template Status & Quality

- Templates have status: `APPROVED`, `PENDING`, `REJECTED`, `PAUSED`
- Quality score: `GREEN`, `YELLOW`, `RED`, `UNKNOWN`
- Only `APPROVED` templates can be used for broadcasts
- Templates can be edited when status is `APPROVED`, `REJECTED`, or `PAUSED`
- Editing approved templates may require re-approval

### 5.3 Error Handling

**Backend handles all Meta API errors and returns user-friendly messages to frontend:**

- Handle Meta API rate limits (backend implements retry logic)
- Handle template approval delays (backend provides status updates)
- Handle invalid template structure (backend validates before sending to Meta)
- Handle missing business account ID (backend validates environment variables)
- Provide user-friendly error messages (backend translates Meta errors to readable messages)
- Log all Meta API errors server-side for debugging

**Frontend only needs to handle backend API errors, not Meta API errors directly.**

---

## Phase 6: Implementation Order

1. ✅ **Environment Setup** - Add META_BUSINESS_ACCOUNT_ID
2. ✅ **Database Schema** - Prisma models for templates (cache) and broadcasts
3. ✅ **WhatsApp Client Enhancement** - Add Meta API template management methods
4. ✅ **Backend: Template Module** - CRUD operations via Meta API
5. ✅ **Frontend: Template List View** - List templates with filters and sync functionality
6. ⏳ **Backend: Broadcast Module** - Basic structure
7. ⏳ **Frontend: Template Management UI** - Create, Edit, Show views
8. ⏳ **Frontend: Broadcast Creation UI** - Form with template selection and recipient filters
9. ⏳ **Backend: Broadcast Processing** - Background jobs and message sending
10. ⏳ **Frontend: Broadcast Status & Logs** - Real-time updates and recipient logs
11. ⏳ **Testing & Refinement** - End-to-end testing

### ✅ Completed (Phase 1-5)

- ✅ Database schema for WhatsAppTemplate model
- ✅ Merged WhatsApp clients into single `whatsapp-client.js`
- ✅ Backend template service with Meta API proxy
- ✅ Backend template controller with list, get, and sync endpoints
- ✅ Frontend template list view with filters (status, category)
- ✅ Frontend sync functionality to refresh templates from Meta
- ✅ Module registration in app.module.ts
- ✅ API routing configured for `/v2/whatsappTemplates`

---

## Phase 7: Key Features

### 7.1 Template Management

- ✅ View all templates from Meta API
- ✅ Create new templates (submitted to Meta for approval)
- ✅ Edit existing templates (if status allows)
- ✅ Delete templates
- ✅ Sync templates from Meta API
- ✅ View template approval status
- ✅ Filter by status, category, language
- ✅ Preview templates before use

### 7.2 Broadcast Features

- ✅ Select approved template only
- ✅ Filter recipients from itsdata (mohalla, sector, etc.)
- ✅ Manual phone number input
- ✅ Map itsdata fields to template parameters
- ✅ Preview message before sending
- ✅ Real-time status updates
- ✅ Retry failed messages
- ✅ View recipient logs with delivery status
- ✅ Export recipient logs

### 7.3 Data Integration

- ✅ Fetch phone numbers from itsdata based on filters
- ✅ Validate phone numbers (format, existence)
- ✅ Support both `Mobile` and `WhatsApp_No` fields
- ✅ Handle missing phone numbers gracefully

---

## Phase 8: Technical Considerations

### 8.1 Rate Limiting

- Meta API: ~1000 messages/second
- Implement queue system for large broadcasts
- Batch processing with delays
- Respect rate limits

### 8.2 Error Handling

- Handle Meta API errors gracefully
- Log failed messages with reasons
- Retry mechanism for transient failures
- User notifications for completion/failures

### 8.3 Security & Permissions

- Permission checks for template CRUD
- Permission checks for broadcast creation
- Audit logging for broadcasts
- Phone number masking in logs

### 8.4 Performance

- Cache templates locally for faster access
- Pagination for large recipient lists
- Lazy loading for broadcast status
- Background job processing
- Optimistic UI updates

### 8.5 Template Sync Strategy

- Option 1: Always fetch from Meta API (slower, always fresh)
- Option 2: Cache locally and sync periodically (faster, may be stale)
- Option 3: Hybrid - cache with manual refresh button (recommended)

---

## File Structure Summary

```
Backend (NestJS):
/nest/modules/
  ├── whatsapp-template/
  │   ├── whatsapp-template.module.ts
  │   ├── whatsapp-template.controller.ts
  │   ├── whatsapp-template.service.ts
  │   └── dto/
  │       ├── create-whatsapp-template.dto.ts
  │       ├── update-whatsapp-template.dto.ts
  │       └── whatsapp-template-query.dto.ts
  └── whatsapp-broadcast/
      ├── whatsapp-broadcast.module.ts
      ├── whatsapp-broadcast.controller.ts
      ├── whatsapp-broadcast.service.ts
      └── dto/
          ├── create-whatsapp-broadcast.dto.ts
          └── whatsapp-broadcast-query.dto.ts

/core/clients/
  └── meta-whatsapp-client.js (enhanced with template methods)

/core/service/
  └── whatsapp-meta.js (enhanced)

Frontend (React Admin):
/src/containers/
  ├── whatsappTemplates/
  │   ├── index.js
  │   ├── list.js
  │   ├── create.js
  │   ├── edit.js
  │   └── show.js
  └── whatsappBroadcasts/
      ├── index.js
      ├── list.js
      ├── create.js
      └── show.js
```

---

## Dependencies

**Backend:**

- `@nestjs/bull` (for job queues)
- `bull` (job queue)
- `axios` (already in use)

**Frontend:**

- No new major dependencies needed (React Admin covers most)

---

## Notes

1. **Template Cache:** Templates are managed in Meta, but we cache them locally for faster access and better UX. The cache can be synced manually or periodically.

2. **Business Account ID:** Required for template management. Different from Phone Number ID used for sending messages.

3. **Template Approval:** Templates must be approved by Meta before use. This can take up to 24 hours.

4. **Template Limits:**

   - Unverified accounts: 250 templates
   - Verified accounts: 6,000 templates
   - Each language variant counts as separate template

5. **Rate Limits:**
   - Template creation: 100 templates/hour
   - Message sending: ~1000 messages/second

---

## Current Progress & Next Steps

### ✅ Completed

1. **Backend Infrastructure:**

   - ✅ WhatsAppTemplate Prisma model
   - ✅ Merged WhatsApp client with template management methods
   - ✅ NestJS WhatsApp Template module (service, controller, DTOs)
   - ✅ Module registered in app.module.ts
   - ✅ Environment variables configured

2. **Frontend - Template Management:**
   - ✅ Template list view with filters (status, category)
   - ✅ Sync from Meta button
   - ✅ Template show/detail view with preview
   - ✅ Template create form with WhatsApp-style preview
   - ✅ Template edit form with status restrictions
   - ✅ Live preview with example variable support
   - ✅ Common components extracted to `shared.js` (DRY refactoring)
   - ✅ Status and quality score indicators
   - ✅ Resource registered in App.js
   - ✅ API routing configured

### 🎯 Next Steps (Priority Order)

#### 1. ✅ Template Detail/Show View (COMPLETED)

**Purpose:** View full template details before using for broadcasts

**Status:** ✅ Working

- Created `show.js` component with template preview
- Displays all components (header, body, footer, buttons)
- Status and quality score chips with color coding
- Refresh from Meta functionality
- Integrated with resource configuration

#### 2. ✅ Template Create Form (COMPLETED)

**Purpose:** Create new templates via Meta API

**Status:** ✅ Fully implemented

- ✅ `create.js` component with all form fields
- ✅ WhatsApp-style live preview
- ✅ Example variable inputs for template parameters
- ✅ Form validation and submission
- ✅ Backend integration via `POST /whatsappTemplates`

#### 3. ✅ Template Edit Form (COMPLETED)

**Purpose:** Edit existing templates (if status allows)

**Status:** ✅ Fully implemented

- ✅ `edit.js` component with pre-populated data
- ✅ Status-based edit restrictions (StatusAlert component)
- ✅ Record transformer for API data mapping
- ✅ WhatsApp-style live preview with fallback to Meta examples
- ✅ Example variable inputs
- ✅ Backend integration via `PUT /whatsappTemplates/:name`

#### 3.1 ✅ Code Refactoring (COMPLETED)

**Purpose:** Extract common components for maintainability

**Status:** ✅ Completed

- ✅ Created `shared.js` with common components:
  - `TemplatePreview` - WhatsApp-style preview
  - `TemplateFormFields` - Reusable form fields
  - `ExampleVariablesInput` - Dynamic variable inputs
  - `LivePreviewCreate` / `LivePreviewEdit` - Real-time previews
  - `transformTemplateData` - Data transformation
- ✅ Reduced code duplication (create.js: 545→49 lines, edit.js: 695→182 lines)
- ✅ Improved maintainability and consistency

#### 4. Broadcast Module - Backend (High Priority)

**Purpose:** Core functionality for sending broadcasts

**Tasks:**

- Create Prisma models: `WhatsAppBroadcast`, `WhatsAppBroadcastRecipient`
- Create NestJS module structure
- Implement broadcast service:
  - Create broadcast
  - Process broadcast (send messages)
  - Track status and errors
  - Retry failed messages
- Implement broadcast controller endpoints

#### 5. Broadcast Module - Frontend (High Priority)

**Purpose:** User interface for creating and managing broadcasts

**Tasks:**

- Create broadcast resource structure
- Broadcast list view
- Broadcast creation form:
  - Template selection (only APPROVED templates)
  - Recipient filtering (mohalla, sector, etc.)
  - Manual phone number input
  - Parameter mapping
  - Preview before sending
- Broadcast detail view with status and recipient logs

### 📋 Recommended Implementation Order

1. ✅ **Template Show View** (COMPLETED)
2. ✅ **Template Create/Edit Forms** (COMPLETED)
3. ✅ **Code Refactoring - Shared Components** (COMPLETED)
4. **Broadcast Backend Module** (Core functionality) ⬅️ **NEXT**
5. **Broadcast Frontend - Create Form** (Main feature)
6. **Broadcast Frontend - List & Detail Views** (Management)

### 🔧 Technical Notes

- Template listing is working ✅
- Template create/edit forms are fully functional ✅
- All Meta API calls are properly proxied through backend ✅
- Database schema ready for caching templates ✅
- Common components extracted to `shared.js` for maintainability ✅
- WhatsApp-style preview with live updates ✅
- Example variable support with Meta API fallback ✅
- Need to run Prisma migration when ready: `npx prisma migrate dev --name add_whatsapp_templates`

### 📁 File Structure (Updated)

```
Frontend (React Admin):
/src/containers/whatsappTemplates/
  ├── index.js
  ├── list.js ✅
  ├── create.js ✅ (uses shared components)
  ├── edit.js ✅ (uses shared components)
  ├── show.js ✅
  └── shared.js ✅ (common components extracted)
```
