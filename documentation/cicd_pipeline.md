# CI/CD Pipeline Guide

Continuous Integration and Continuous Deployment (CI/CD) ensures that code changes are automatically tested and deployed to production. This guide outlines a standard GitHub Actions pipeline for ExpenseFlow.

## CI/CD Architecture
- **Version Control:** GitHub
- **CI Provider:** GitHub Actions
- **Testing:** Pytest (Backend) & Vitest/Jest (Frontend)
- **Deployment Target:** AWS EC2 or Container Registry (Docker)

## 1. The GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Create a YAML file in your repository to define the pipeline.

```yaml
name: ExpenseFlow CI/CD

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest
    - name: Run Pytest
      run: |
        cd backend
        pytest

  build-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install and Build
      run: |
        cd frontend
        npm install
        npm run build

  deploy:
    needs: [test-backend, build-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Server via SSH
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/expenseflow
          git pull origin main
          
          # Backend
          cd backend
          source venv/bin/activate
          pip install -r requirements.txt
          sudo systemctl restart expenseflow-api
          
          # Frontend
          cd ../frontend
          npm install
          npm run build
          sudo cp -r dist/* /var/www/html/
```

## 2. Secrets Management
You must configure the following repository secrets in GitHub (`Settings > Secrets and variables > Actions`):
- `SERVER_HOST`: The IP address of your production server.
- `SERVER_USER`: The SSH username (e.g., `ubuntu`).
- `SSH_PRIVATE_KEY`: Your server's SSH private key.

## 3. Pipeline Flow
1. **Push to Main:** A developer merges code into the `main` branch.
2. **Automated Testing:** GitHub Actions spins up isolated containers to run unit tests on the backend and build the frontend.
3. **Deployment Trigger:** If all tests pass, the `deploy` job initiates an SSH connection to the production server.
4. **Execution:** The server pulls the latest code, installs new dependencies, rebuilds the frontend Vite bundle, and restarts the backend Gunicorn service.
