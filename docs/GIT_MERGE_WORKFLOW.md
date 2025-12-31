# 🔄 Proper Git Workflow: Branch → Main

## 📚 **Understanding the Workflow**

When you work in a feature branch and want to merge to `main`, here's the **proper workflow**:

---

## ✅ **The Right Way: Merge Workflow**

### **Scenario**: You've been working in `smello-for-teams` and want to merge to `main`

```bash
# Step 1: Make sure your feature branch is up to date and committed
git checkout smello-for-teams
git add .
git commit -m "Your changes"
git push origin smello-for-teams

# Step 2: Switch to main
git checkout main

# Step 3: Pull latest changes from remote main
git pull origin main

# Step 4: Merge your feature branch INTO main
git merge smello-for-teams

# Step 5: Resolve any conflicts (if they exist)
# Git will tell you if there are conflicts
# Edit the conflicted files, then:
git add .
git commit -m "Merge smello-for-teams into main"

# Step 6: Push main to remote
git push origin main
```

---

## 🎯 **Why This Order Matters**

### **What You Were Trying to Do** ❌
```bash
git checkout main
# (main has old code)
git push origin main  # ❌ FAILS - remote is ahead
```

**Problem**: You merged `smello-for-teams` into your LOCAL `main`, but the REMOTE `main` on GitHub doesn't have those changes yet. Git prevents you from pushing because you might overwrite someone else's work.

### **The Right Way** ✅
```bash
git checkout main
git pull origin main      # ✅ Get latest from remote
git merge smello-for-teams  # ✅ Merge your branch
git push origin main      # ✅ Now you can push
```

---

## 🌿 **Complete Workflow Example**

Let's say you're working on a new feature:

### **1. Create Feature Branch**
```bash
# Start from main
git checkout main
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Work on your code...
# Make changes, test, etc.
```

### **2. Commit Your Work**
```bash
# Stage changes
git add .

# Commit
git commit -m "feat: Add new feature"

# Push to remote
git push origin feature/new-feature
```

### **3. Preview on Vercel**
- Vercel automatically deploys your branch
- You get a preview URL like: `smello-git-feature-new-feature-yourname.vercel.app`
- Test your changes there!

### **4. Ready to Merge to Main**
```bash
# Switch to main
git checkout main

# Pull latest changes (IMPORTANT!)
git pull origin main

# Merge your feature branch
git merge feature/new-feature

# If there are conflicts:
# - Git will tell you which files
# - Open them, resolve conflicts
# - Then: git add . && git commit

# Push to main
git push origin main
```

### **5. Deploy to Production**
- Vercel automatically deploys `main` to production
- Your changes are now live!

---

## 🔍 **Common Scenarios**

### **Scenario 1: Main Changed While You Were Working**

```bash
# You're on feature/new-feature
git checkout feature/new-feature

# Get latest main changes
git checkout main
git pull origin main

# Go back to your branch
git checkout feature/new-feature

# Merge main into your branch (to get updates)
git merge main

# Resolve any conflicts
# Then continue working or merge to main
```

### **Scenario 2: Multiple People Working**

```bash
# Always pull before merging!
git checkout main
git pull origin main  # ← Gets everyone else's changes

# Then merge your work
git merge feature/your-feature
git push origin main
```

### **Scenario 3: You Want to Test Main Locally**

```bash
# Save your current work
git add .
git stash save "Work in progress"

# Switch to main
git checkout main
git pull origin main

# Test it
npm run dev

# Go back to your work
git checkout feature/your-feature
git stash pop
```

---

## 📊 **Visual Workflow**

```
Your Local Machine:
┌─────────────────────────────────────────┐
│ feature/new-feature (your work)         │
│   ↓ git add . && git commit             │
│   ↓ git push origin feature/new-feature │
└─────────────────────────────────────────┘
                ↓
GitHub (Remote):
┌─────────────────────────────────────────┐
│ origin/feature/new-feature              │
│   → Vercel Preview Deploy 🔍            │
└─────────────────────────────────────────┘
                ↓
When Ready to Merge:
┌─────────────────────────────────────────┐
│ 1. git checkout main                    │
│ 2. git pull origin main ← IMPORTANT!    │
│ 3. git merge feature/new-feature        │
│ 4. git push origin main                 │
└─────────────────────────────────────────┘
                ↓
GitHub (Remote):
┌─────────────────────────────────────────┐
│ origin/main (updated)                   │
│   → Vercel Production Deploy 🚀         │
└─────────────────────────────────────────┘
```

---

## 🎯 **Your Specific Situation**

### **What Happened to You**:

1. You were on `main` locally
2. You merged `smello-for-teams` into local `main`
3. You tried to push to remote `main`
4. **ERROR**: Remote `main` was different (had the old code)

### **Why It Failed**:

```
Remote main:     A---B---C
                          ↑ (GitHub)
                          
Your local main: A---B---C---D---E---F
                          ↑           ↑
                    (old state)  (your merge)
```

Git said: "Wait! Remote has C, but you're trying to push F. Did you get the latest changes first?"

### **The Fix**:

```bash
# Pull first (merge remote into local)
git pull origin main

# Now your local main has everything
# Then push
git push origin main
```

---

## 💡 **Best Practices**

### **1. Always Pull Before Merging**
```bash
git checkout main
git pull origin main  # ← Never skip this!
git merge feature/your-branch
```

### **2. Keep Feature Branches Small**
- Work on one feature at a time
- Merge frequently
- Don't let branches get too far behind main

### **3. Use Vercel Previews**
- Every branch gets a preview URL
- Test there before merging to main
- Share preview URLs with team for review

### **4. Delete Merged Branches**
```bash
# After merging to main
git branch -d feature/old-feature  # Delete local
git push origin --delete feature/old-feature  # Delete remote
```

### **5. Use Descriptive Branch Names**
```bash
# Good
feature/bulk-invites
fix/duplicate-import
chore/cleanup-docs

# Bad
test
temp
asdf
```

---

## 🚀 **Your Current Setup**

You have:
- `main` - Production branch (deploys to main site)
- `smello-for-teams` - Team features (has preview URL)
- `smello-for-pms` - PM features (has preview URL)

### **Recommended Workflow**:

```bash
# Work on teams features
git checkout smello-for-teams
# Make changes
git add .
git commit -m "feat: Add new team feature"
git push origin smello-for-teams
# → Test on Vercel preview

# When ready for production
git checkout main
git pull origin main
git merge smello-for-teams
git push origin main
# → Deploys to production
```

---

## ✅ **Quick Reference**

### **Starting New Work**
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

### **Saving Work**
```bash
git add .
git commit -m "Description"
git push origin feature/my-feature
```

### **Merging to Main**
```bash
git checkout main
git pull origin main          # ← KEY STEP!
git merge feature/my-feature
git push origin main
```

### **Checking Status**
```bash
git status                    # What changed?
git branch                    # What branch am I on?
git log --oneline -5          # Recent commits
git diff                      # What's different?
```

---

## 🎊 **Summary**

**The Golden Rule**: 
> Always `git pull origin main` BEFORE merging your branch into main!

This ensures you have the latest code and prevents conflicts.

**Your Workflow**:
1. Work in feature branch
2. Push to remote (get Vercel preview)
3. Test preview
4. Switch to main
5. **Pull latest** ← Don't skip!
6. Merge feature branch
7. Push to main
8. Production deploy! 🚀

That's it! 🎉
