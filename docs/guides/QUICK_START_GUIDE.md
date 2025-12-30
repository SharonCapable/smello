# 🎯 Quick Start Guide - Setting Up Smello for Teams

## ✅ **Step-by-Step Setup**

### **Step 1: Make Yourself Super Admin** (2 minutes)

You have **3 options** to become a super admin:

#### **Option A: Use the API Endpoint** (Easiest!)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to Smello with your account

3. Visit this URL in your browser:
   ```
   http://localhost:3000/api/make-super-admin
   ```

4. You'll see a JSON response showing your status. If it says `"exists": false`, then:

5. Make a POST request to become super admin:
   ```bash
   # Option 1: Use your browser console
   fetch('/api/make-super-admin', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   
   # Option 2: Use curl
   curl -X POST http://localhost:3000/api/make-super-admin \
     -H "Cookie: your-session-cookie"
   ```

6. Refresh the GET endpoint to confirm:
   ```
   http://localhost:3000/api/make-super-admin
   ```
   Should show: `"isSuperAdmin": true`

#### **Option B: Use Firebase Console** (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Navigate to **users** collection
5. Find your user document (your Clerk user ID)
   - If it doesn't exist, create it:
     - Click "Add document"
     - Document ID: `your-clerk-user-id`
     - Add field: `isSuperAdmin` = `true` (boolean)
6. If it exists, click on it and add:
   - Field: `isSuperAdmin`
   - Type: `boolean`
   - Value: `true`
7. Save

#### **Option C: Use Code** (For developers)

Create a temporary file `scripts/make-super-admin.ts`:

```typescript
import admin from 'firebase-admin'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any)
})

const userId = 'YOUR_CLERK_USER_ID' // Replace with your Clerk user ID

admin.firestore()
  .collection('users')
  .doc(userId)
  .set({ isSuperAdmin: true }, { merge: true })
  .then(() => console.log('✅ You are now a super admin!'))
  .catch(console.error)
```

Run it:
```bash
tsx scripts/make-super-admin.ts
```

---

### **Step 2: Update Firestore Rules** (Already Done! ✅)

You mentioned you've already updated the Firestore rules. Perfect!

To verify:
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure the rules include the `isSuperAdmin()` function
3. Click "Publish" if you haven't already

---

### **Step 3: Create Your Organization** (In the app)

Now that you're a super admin, you can create your "Wizzle" organization.

I'll create a simple UI for this:

---

## 📧 **How the Invitation System Works** (No Email Server Needed!)

### **The Smart Way: Link-Based Invitations**

Instead of sending actual emails (which requires SMTP setup), we use **shareable invitation links**:

```
┌─────────────────────────────────────────────────────────┐
│              INVITATION FLOW                             │
└─────────────────────────────────────────────────────────┘

1. You (Admin) → Click "Invite Team Member"
   ├─ Enter email: teammate@wizzle.ai
   ├─ Choose role: Member
   └─ Click "Send Invitation"

2. System → Generates unique invite link
   ├─ Link: https://smello.com/accept-invite?id=inv_xyz123
   ├─ Expires in 7 days
   └─ Shows you the link to copy

3. You → Share link manually
   ├─ Copy the link
   ├─ Send via email (Gmail, Outlook, etc.)
   ├─ Or send via Slack
   ├─ Or send via WhatsApp
   └─ Or any messaging app!

4. Teammate → Clicks the link
   ├─ Opens Smello
   ├─ Sees invitation details
   ├─ Clicks "Accept"
   └─ Joins your organization!

5. Done! 🎉
   └─ Teammate can now access team features
```

### **Why This Approach?**

✅ **No SMTP Setup** - No need for email server configuration  
✅ **No Email Costs** - No SendGrid, Mailgun, or AWS SES needed  
✅ **More Flexible** - Share via any channel (email, Slack, WhatsApp, etc.)  
✅ **Instant** - No email delivery delays  
✅ **Trackable** - See who accepted, who's pending  
✅ **Secure** - Link expires in 7 days, one-time use  

### **Optional: Add Real Email Later**

If you want to send actual emails later, you can easily add it:

```typescript
// In sendOrganizationInvite function, add:
await sendEmail({
  to: inviteData.email,
  subject: `You're invited to join ${inviteData.orgName}`,
  body: `Click here to accept: ${inviteLink}`
})
```

But for now, **manual sharing works perfectly** and is actually preferred by many teams!

---

## 🎯 **Complete Workflow Example**

### **Scenario: You want to add your teammate John**

1. **You become super admin** (Step 1 above)

2. **You create "Wizzle" organization**
   - Go to Smello for Teams
   - Click "Create Organization"
   - Name: "Wizzle"
   - Domain: "wizzle.ai" (optional)

3. **You invite John**
   - Go to Settings → Team Members
   - Click "Invite Member"
   - Email: john@wizzle.ai
   - Role: Member
   - Message: "Hey John, join our team!"
   - Click "Send Invitation"

4. **System shows you the invite link**
   ```
   https://smello.vercel.app/accept-invite?id=inv_abc123xyz
   ```

5. **You share the link with John**
   - Send him an email:
     ```
     Hey John,
     
     I've invited you to join our team on Smello!
     Click here to accept: https://smello.vercel.app/accept-invite?id=inv_abc123xyz
     
     This link expires in 7 days.
     
     Thanks!
     ```
   - Or message him on Slack
   - Or text him the link

6. **John clicks the link**
   - Opens the page
   - Sees: "You're invited to join Wizzle!"
   - Clicks "Accept Invitation"
   - Redirected to team dashboard

7. **Done!** John is now part of your team

---

## 📁 **Files Created for This**

1. **`/app/api/make-super-admin/route.ts`**
   - API endpoint to make yourself super admin
   - GET: Check status
   - POST: Become super admin

2. **`/components/teams/invitation-manager.tsx`**
   - UI for sending invitations
   - Shows generated invite links
   - Lists pending invites

3. **`/app/accept-invite/page.tsx`**
   - Page where users accept invitations
   - Validates invite
   - Adds user to organization

---

## 🔍 **Finding Your Clerk User ID**

If you need your Clerk user ID for Option C:

1. Log in to Smello
2. Open browser console (F12)
3. Type:
   ```javascript
   // If using Clerk
   console.log(window.Clerk.user.id)
   ```

Or check in your Clerk Dashboard:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to Users
4. Find yourself
5. Copy your User ID

---

## ✅ **Verification Checklist**

After setup, verify everything works:

- [ ] You are super admin (check `/api/make-super-admin`)
- [ ] Firestore rules are updated
- [ ] You can create an organization
- [ ] You can generate invite links
- [ ] Invite links work when clicked
- [ ] Users can accept invitations
- [ ] Users appear in organization members

---

## 🎊 **Summary**

**What You Need to Do:**
1. ✅ Make yourself super admin (use API endpoint - easiest!)
2. ✅ Firestore rules updated (you already did this!)
3. ✅ Create your organization (in the app)
4. ✅ Invite team members (share links manually)

**No Email Server Needed!**
- Generate invite links
- Share via email/Slack/WhatsApp
- Users click and accept
- Simple and effective!

**Ready to go!** 🚀

---

## 🆘 **Troubleshooting**

### "User document not found"
- Use the `/api/make-super-admin` endpoint
- It will create the document automatically

### "Only super admins can create organizations"
- Make sure `isSuperAdmin: true` is set in your user document
- Check `/api/make-super-admin` to verify

### "Invitation not found"
- Link might be expired (7 days)
- Generate a new invitation

### "Email doesn't match"
- User must log in with the email the invite was sent to
- Or update the invite email to match their account

---

**Need help?** Check the files or ask! 😊
