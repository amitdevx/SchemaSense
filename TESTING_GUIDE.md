# Testing Guide: Navigation Audit & Feature Completion

## Quick Test Checklist

### Phase 1: Navigation Testing

#### Public Navigation (Header)
```
Test: Open homepage
- [ ] Click "Product" → Should navigate to /product
- [ ] Click "How It Works" → Should navigate to /how-it-works
- [ ] Click "Pricing" → Should navigate to /pricing
- [ ] Click "Docs" → Should navigate to /docs
- [ ] Click "Support" → Should navigate to /support
- [ ] Click "Get Started" button → Should navigate to /sign-up
- [ ] Click logo → Should navigate back to home
```

#### Dashboard Navigation (Sidebar)
```
Test: Login and check sidebar
- [ ] "Overview" link → Should navigate to /dashboard
- [ ] "Analysis" link → Should navigate to /dashboard/analysis
- [ ] "Chat" link → Should navigate to /dashboard/chat
- [ ] "Integrations" link → Should navigate to /dashboard/integrations
- [ ] "Exports" link → Should navigate to /dashboard/exports
- [ ] "Profile" link → Should navigate to /dashboard/profile
- [ ] "Settings" link → Should navigate to /dashboard/settings
- [ ] "Billing" link → Should navigate to /dashboard/billing
- [ ] "Help & Support" link → Should navigate to /support
- [ ] Active link highlighting → Should work correctly
```

#### Footer Navigation
```
Test: Check footer
- [ ] "Product" links → Work correctly
- [ ] "Resources" links → Work correctly
- [ ] "User" links → Work correctly
- [ ] "Demo" link → Should navigate to /dashboard/analysis
```

---

### Phase 2: Profile Management

#### Load Profile
```
Test: Navigate to /dashboard/profile
Expected Results:
- [ ] Page loads without errors
- [ ] Profile form displays with current data
- [ ] All fields are populated (First Name, Last Name, Email, Organization)
- [ ] Loading state shows briefly if needed
```

#### Save Profile
```
Test: Modify profile and save
Steps:
1. Go to /dashboard/profile
2. Change any field (e.g., First Name)
3. Click "Save Changes"

Expected Results:
- [ ] Button shows "Saving..." state
- [ ] Success message appears ("Profile saved successfully!")
- [ ] Message disappears after 3 seconds
- [ ] Data is persisted (reload page and verify)
- [ ] No console errors
```

#### Error Handling
```
Test: Error scenarios
- [ ] Slow network: Simulate with DevTools → Should show loading state
- [ ] Network error: Disconnect → Should show error message
- [ ] Invalid data: (if validation exists) → Should show error
```

---

### Phase 3: Settings Management

#### Load Settings
```
Test: Navigate to /dashboard/settings
Expected Results:
- [ ] Page loads with current settings
- [ ] All toggle switches display correctly
- [ ] Theme, Language, Privacy Level dropdowns show current values
- [ ] Sync interval input shows current value
```

#### Modify Settings
```
Test: Toggle notification settings
Steps:
1. Go to /dashboard/settings
2. Toggle "Email Notifications" switch
3. Toggle "Slack Notifications" switch
4. Change "Theme" dropdown
5. Click "Save Settings"

Expected Results:
- [ ] Toggles respond immediately to clicks
- [ ] Dropdown changes update state
- [ ] "Save Settings" button shows loading state
- [ ] Success message appears
- [ ] Settings persist (reload page and verify)
```

---

### Phase 4: Integration Management

#### List Integrations
```
Test: Navigate to /dashboard/integrations
Expected Results:
- [ ] Page loads
- [ ] Integrations list displays
- [ ] Each integration shows:
    - [ ] Name
    - [ ] Type (PostgreSQL, etc.)
    - [ ] Host:Port
    - [ ] Status badge (Connected/Disconnected)
    - [ ] Last sync timestamp
- [ ] "Add Database" button is visible
```

#### Test Connection
```
Test: Click "Test" button on any integration
Expected Results:
- [ ] Button shows loading state with spinner
- [ ] Test completes and shows success/error message
- [ ] Message persists for 3 seconds then disappears
- [ ] No page refresh needed
```

#### Disconnect Integration
```
Test: Click "Disconnect" button
Steps:
1. Click "Disconnect" on any integration
2. Confirm in dialog

Expected Results:
- [ ] Confirmation dialog appears
- [ ] Button shows loading state during deletion
- [ ] Integration disappears from list
- [ ] Success message appears
- [ ] List refreshes automatically
```

---

### Phase 5: Analysis Pages

#### Table List with Metadata
```
Test: Navigate to /dashboard/analysis
Expected Results:
- [ ] Table count displayed ("X Tables Found")
- [ ] Each table shows:
    - [ ] Table name
    - [ ] Column count (e.g., "5 columns")
    - [ ] Row count (e.g., "1,234 rows")
    - [ ] "View Details" button
    - [ ] "Ask AI" button
```

#### Table Detail with Schema
```
Test: Click "View Details" on any table
Expected Results:
- [ ] Page loads with table name
- [ ] Quality metrics display (if data available)
- [ ] Table Statistics section shows:
    - [ ] Total Rows
    - [ ] Columns count
    - [ ] Average Completeness
- [ ] Schema table displays with columns:
    - [ ] Column Name
    - [ ] Type (with syntax highlighting)
    - [ ] Nullable status (Yes/No badge)
    - [ ] Primary Key indicator (🔑)
- [ ] Each row scrollable if many columns
- [ ] Export button in header
```

#### Export Button
```
Test: Click "Export" button on table detail
Expected Results:
- [ ] Button is clickable
- [ ] Navigates to /dashboard/exports (with table parameter)
- [ ] Export page shows the selected table pre-selected
```

---

### Phase 6: Connection Status

#### Global Status Indicator
```
Test: On any dashboard page
Expected Results:
- [ ] Connection status box appears at top
- [ ] Shows "Database Connected" or "Database Disconnected"
- [ ] Shows database name
- [ ] Shows last sync time
- [ ] Color is green if connected, red if disconnected
- [ ] Status refreshes every 30 seconds
- [ ] No console errors
```

#### Status on Multiple Pages
```
Test: Navigate between pages
Expected Results:
- [ ] Connection status appears on all dashboard pages:
    - [ ] /dashboard
    - [ ] /dashboard/analysis
    - [ ] /dashboard/profile
    - [ ] /dashboard/settings
    - [ ] /dashboard/integrations
```

---

### Phase 7: API Integration Testing

#### Profile API
```bash
# Test GET profile
curl -X GET http://localhost:8000/api/profile

# Test PUT profile
curl -X PUT http://localhost:8000/api/profile \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith"}'

Expected: 
- [ ] GET returns profile data
- [ ] PUT updates and returns success
```

#### Settings API
```bash
# Test GET settings
curl -X GET http://localhost:8000/api/settings

# Test PUT settings
curl -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"emailNotifications":false,"autoSync":true}'

Expected:
- [ ] GET returns settings
- [ ] PUT updates settings
```

#### Integrations API
```bash
# Test LIST integrations
curl -X GET http://localhost:8000/api/integrations

# Test POST create integration (example)
curl -X POST http://localhost:8000/api/integrations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test DB","type":"postgresql","host":"localhost","port":5432,"user":"admin","password":"pass","database":"testdb"}'

# Test DELETE integration
curl -X DELETE http://localhost:8000/api/integrations/int_001

# Test POST test integration
curl -X POST http://localhost:8000/api/integrations/int_001/test

Expected:
- [ ] LIST returns array of integrations
- [ ] POST creates and returns new integration
- [ ] DELETE removes integration
- [ ] Test returns connection status
```

---

### Phase 8: Error Handling & Edge Cases

#### Network Errors
```
Test: Simulate network issues
- [ ] Slow 3G network: Should show loading state
- [ ] Offline: Should show error message
- [ ] Timeout: Should show timeout error
- [ ] Server error (500): Should show error message
```

#### Invalid Data
```
Test: Edge cases
- [ ] Empty form submission: Should validate (if implemented)
- [ ] Very long input: Should handle gracefully
- [ ] Special characters: Should handle safely
- [ ] SQL injection attempts: Should be safe
```

#### Concurrent Operations
```
Test: Multiple simultaneous operations
- [ ] Save profile while settings loading: Should handle
- [ ] Navigate away during loading: Should cancel properly
- [ ] Rapid button clicks: Should debounce/prevent duplicates
```

---

## Quick Start Testing

### Backend Testing
```bash
# 1. Start backend
cd backend
source venv/bin/activate
python main.py

# 2. Check health
curl http://localhost:8000/health

# 3. Check new endpoints exist
curl http://localhost:8000/docs  # Should show new endpoints in Swagger
```

### Frontend Testing
```bash
# 1. Start frontend
npm run dev

# 2. Open browser
open http://localhost:3000

# 3. Navigate and test flows
```

---

## Test Data

### Sample Profile Data
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "organization": "Acme Corp"
}
```

### Sample Settings
```json
{
  "emailNotifications": true,
  "slackNotifications": false,
  "theme": "dark",
  "language": "en",
  "privacyLevel": "private",
  "autoSync": true,
  "syncInterval": 3600
}
```

### Sample Integration
```json
{
  "name": "Production Database",
  "type": "postgresql",
  "host": "db.example.com",
  "port": 5432,
  "user": "admin",
  "password": "secure_password",
  "database": "production"
}
```

---

## Browser DevTools Checks

### Console
- [ ] No JavaScript errors
- [ ] No 404 errors for resources
- [ ] No CORS errors
- [ ] API responses logged correctly (if debug mode on)

### Network Tab
- [ ] All API calls return 200 or expected status codes
- [ ] Response times reasonable (< 2 seconds)
- [ ] No failed requests
- [ ] Proper Content-Type headers

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No layout shifts during loading
- [ ] Images/assets load correctly
- [ ] No console warnings about React

---

## Success Criteria

### Must Have ✅
- [ ] All navigation links work
- [ ] Profile save persists
- [ ] Settings save persists
- [ ] Integration management works
- [ ] Schema displays correctly
- [ ] Connection status visible
- [ ] No console errors

### Should Have 🎯
- [ ] Success notifications appear
- [ ] Error messages are helpful
- [ ] Loading states show
- [ ] Mobile responsive

### Nice to Have 💫
- [ ] Smooth animations
- [ ] Keyboard navigation
- [ ] Accessibility features
- [ ] Performance optimized

---

## Rollback Plan

If issues are found:

1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify backend is running (`curl http://localhost:8000/health`)
4. Verify environment variables are set
5. Clear browser cache and reload
6. Restart backend server
7. Check backend logs for errors

---

## Sign-Off Checklist

- [ ] All tests completed
- [ ] No critical issues found
- [ ] No console errors
- [ ] Navigation working
- [ ] API endpoints responding
- [ ] Data persistence verified
- [ ] Ready for production deployment

---

**Testing Date:** _______________  
**Tester Name:** _______________  
**Status:** ☐ PASS ☐ FAIL ☐ PARTIAL
