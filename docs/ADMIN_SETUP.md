# 🛡️ Super Admin Setup Guide

Since you requested the "Super Admin" dependency for sensitive operations (like creating organizations), follow these steps to grant yourself those privileges.

## 🚀 How to become a Super Admin

Smello has a built-in API endpoint to promote your user account. 

### Option 1: Using the Browser Console (Easiest)
1. Open your Smello app in the browser (e.g., http://localhost:3000).
2. Open the **Developer Tools** (Press `F12` or `Ctrl+Shift+I`).
3. Click on the **Console** tab.
4. Paste the following code and press **Enter**:

```javascript
fetch('/api/make-super-admin', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err));
```

5. You should see a success message! Now reload the page.

### Option 2: Using the Command Line
Run this command in your terminal while the app is running:

```bash
curl -X POST http://localhost:3000/api/make-super-admin
```

## 🔍 Why is this necessary?
To prevent unauthorized users from creating organizations in a multi-tenant environment, Smello restricts certain actions to "Super Admins". By following the steps above, you tag your Clerk user ID in Firestore as an admin.

## ✅ What this enables:
- **Organization Creation**: You can now create new Orgs from the sidebar.
- **Member Management**: You can invite and manage users across the platform.
- **RESTORING PREVIOUS RULES**: I have reverted the Firestore security rules to strictly check for this `isSuperAdmin` flag as you requested.
