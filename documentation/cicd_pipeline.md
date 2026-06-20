# CI/CD Pipeline

ExpenseFlow takes advantage of fully integrated serverless CI/CD pipelines provided by modern PaaS platforms. There is no need to manually configure GitHub Actions workflows for deployment.

## Frontend (Vercel)
Vercel automatically integrates with the GitHub repository.

1. **Commit & Push**: Any push to the `main` branch triggers a new Vercel deployment automatically.
2. **Build Process**: Vercel executes `npm run build` using Vite.
3. **Preview Deployments**: Any Pull Request or branch push automatically gets a unique preview URL generated for testing.
4. **Production**: Merging to `main` seamlessly promotes the build to the live production URL.

## Backend (Render)
Render continuously monitors the `main` branch.

1. **Commit & Push**: Pushing to `main` triggers a Render build.
2. **Build Process**: Render automatically installs Python dependencies from `requirements.txt`.
3. **Database Migrations**: When the application boots (`uvicorn app.main:app`), SQLAlchemy `Base.metadata.create_all()` verifies that the database schema is up-to-date and creates any newly added tables directly on the Neon Postgres instance.
4. **Zero-Downtime Deploys**: Render spins up the new service version and waits for it to become healthy before routing traffic away from the old version.

## Version Control Guidelines
- Commit logically grouped changes.
- Ensure all environment variables are correctly mapped in the Render and Vercel dashboards.
- Never commit `.env` files or API secrets (like Resend keys or Postgres URLs) to the repository.
