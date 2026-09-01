# 🚀 CrimeSync Team Collaboration & Git Guide (No Conflicts!)

This guide explains how all 5 team members can work simultaneously with **ZERO merge conflicts**.

---

## 🔑 The Golden Rule
> **Only edit files in your assigned folder and pages.**
> Never edit someone else's files in `server/src/modules/` or their React page in `src/pages/`.

---

## 👤 Member Setup (Do this ONCE)

### Step 1: Clone Repository
```bash
git clone https://github.com/Ankush-devino/Crimesync.git
cd Crimesync
npm install
```

### Step 2: Switch to YOUR Branch
Run the command matching your assigned role:

- **Member 1:** `git checkout feat/backend-auth-cases`
- **Member 2:** `git checkout feat/backend-evidence-blockchain`
- **Member 3:** `git checkout feat/backend-threat-deception`
- **Member 4:** `git checkout feat/backend-geo-financial-identity`
- **Member 5:** `git checkout feat/backend-ai-graph-reports`

---

## 🔄 Daily Workflow: 3 Simple Commands

Whenever you sit down to work:

### 1️⃣ Before starting work (Pull latest)
```bash
git pull origin main
```

### 2️⃣ While working (Save your progress)
```bash
git add .
git commit -m "feat: added new feature in my module"
```

### 3️⃣ When done (Push to GitHub)
```bash
git push origin HEAD
```

---

## 🔀 Merging into `main` (When your feature is ready)

When your feature is complete:
1. Go to [GitHub Repository](https://github.com/Ankush-devino/Crimesync).
2. You will see a button **"Compare & pull request"**. Click it.
3. Set base: `main` ⟵ compare: `your-branch-name`.
4. Click **Create Pull Request**, then click **Merge Pull Request**.

---

## 🛡️ Quick Fix: "What if I get a conflict?"

If Git ever stops you with a conflict:
```bash
# 1. Save your changes
git add .
git commit -m "work in progress"

# 2. Get latest main code
git pull origin main

# 3. Push to your branch
git push origin HEAD
```
