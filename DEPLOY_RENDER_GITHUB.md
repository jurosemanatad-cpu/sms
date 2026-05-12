# Deploy checklist (GitHub + Render)

## A. Push to GitHub

1. Create an empty GitHub repository.
2. Run these commands from project root:

```bash
git init
git add .
git commit -m "Initial SMS full-stack setup"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

## B. Deploy via Render Blueprint

1. Open Render and choose **New -> Blueprint**.
2. Connect your GitHub account and select your repo.
3. Render will use `render.yaml` and provision:
   - `sms-db` Postgres
   - `sms-api` web service
   - `sms-web` static site
4. In service settings, verify:
   - `CORS_ORIGINS` = your `sms-web` URL
   - `VITE_API_URL` = your `sms-api` URL

## C. Validate deployment

- API health: `https://<sms-api-domain>/health`
- Frontend: `https://<sms-web-domain>`
- Create a student from UI and verify it appears in list.
