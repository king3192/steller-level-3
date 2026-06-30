# RentStar CI/CD Quick Setup Checklist

Set up your production-grade automated deployment pipelines in under 5 minutes.

---

## 🚀 Visual Process Flow

```
   [ Developer Push ]
          │
          ▼
┌───────────────────┐
│  Test Contracts   │ ───► Rust unit tests + WASM compile
└───────────────────┘
          │ (Success)
          ▼
┌───────────────────┐
│  Build Frontend   │ ───► ESLint check + Vite Production Build
└───────────────────┘
          │ (Success + Push to main)
          ▼
┌───────────────────┐
│   Deploy Pages    │ ───► Deploy bundle to GitHub Pages environment
└───────────────────┘
          │ (Commit contains 'release:')
          ▼
┌───────────────────┐
│  Create Release   │ ───► Generate GitHub Release v{run_number}
└───────────────────┘
```

---

## 📋 Critical Setup Checklist (1-10)

Follow these 10 numbered steps to enable automatic deployments:

1. **Verify Local Workspace**: Check that all new pipeline files are present in your workspace.
2. **Commit Changes**: Add all updated and new files to git: `git add .`
3. **Commit Message**: Commit the files to your branch: `git commit -m "ci: implement automated deployment pipeline"`
4. **Push Code**: Push the files to GitHub: `git push origin main`
5. **Open Settings**: Navigate to your GitHub repository settings page.
6. **Set Pages Source**: Go to **Pages** in the left sidebar, set **Source** to **GitHub Actions**.
7. **Set Workflow Permissions**: Go to **Actions** -> **General**, select **Read and write permissions**, and click **Save**.
8. **Monitor Actions Run**: Click on the **Actions** tab in GitHub and click on your running pipeline to watch jobs execute.
9. **Verify Deployment Panel**: Go to the main code page of your repository. Confirm that a **Deployments** section appears on the right sidebar.
10. **Verify Live URL**: Click on the live link in the Deployments panel and ensure the RentStar app loads correctly.

---

## 📂 File Checklist

Confirm these files exist in your workspace before pushing:

- `[x]` `vite.config.js` *(Updated with base routing and drop console settings)*
- `[x]` `.github/workflows/ci.yml` *(Main CI/CD Pipeline)*
- `[x]` `.github/workflows/pr-validation.yml` *(Pull Request Quality & Security Checks)*
- `[x]` `CI_CD_SETUP_GUIDE.md` *(Complete setup details)*
- `[x]` `QUICK_SETUP.md` *(This file)*
- `[x]` `DEPLOYMENT_CHECKLIST.md` *(Pre/post-flight checklists)*

---

## 🔄 Before / After Bug Comparison

| Feature | Before (Broken State) | After (Fixed State) |
| :--- | :--- | :--- |
| **Pipeline Visibility** | "No CI/CD pipeline on the right side panel" | Green check status visible in the right side panel. |
| **Pages Deployment** | Pages deployment not configured; manual build required. | Fully automated deployment using official GitHub Pages actions. |
| **Smart Contract Tests** | Run manually on local environments. | Run automatically on every push inside isolated runner containers. |
| **Security Auditing** | No vulnerability checks in developers' flow. | Automated security audits (`npm audit`) and TruffleHog secrets scan run on PRs. |
| **Bundle Size Control** | Files bundle size was untracked, risking high load times. | Automated warning if bundle exceeds 2MB, with a file-by-file breakdown report. |

---

## 📊 Quick Status Reference

Use this table to know where to find details about your pipeline status:

| Goal | Where to check | What to look for |
| :--- | :--- | :--- |
| **Test & Build Logs** | GitHub -> Actions -> [Click Run] | Individual job logs for Rust compilation and Node execution. |
| **Job Summaries** | GitHub -> Actions -> [Click Run] -> Summary | Markdown status table containing contract build outputs. |
| **PR Merge Checks** | Bottom of your Pull Request page | Green checks indicating passing lint, safety, and sizes. |
| **Live Deploy Status** | Repository code main page (Right sidebar) | **Deployments** panel showing active deployment URL. |

---

## ⚡ 2-Minute Troubleshooting Table

| Error message | Diagnosis | Quick Fix |
| :--- | :--- | :--- |
| **`403 Permission Denied`** on Pages upload | Runner does not have write access to write pages. | Settings -> Actions -> General -> Set permissions to **Read and write permissions**. |
| **`eslint command not found`** | `eslint` has not been installed properly in runner environment. | Ensure `npm ci` is executed before linting, and that devDependencies are intact. |
| **`dist folder not found`** | The React build process failed during the build step. | Run `npm run build` locally to diagnose React compiler errors. |
| **`Resource not accessible by integration`** | Token lacks release permissions. | Enable **Read and write permissions** in actions settings. |
