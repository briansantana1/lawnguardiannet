# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed.

## Quick Setup (Windows)

**Option 1: Use the Setup Script (Recommended)**
```powershell
# Run the automated setup script
.\setup.ps1
```

**Option 2: Manual Installation**

1. **Install Node.js** (if not already installed):
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS version (Windows Installer .msi)
   - Run the installer and ensure "Add to PATH" is checked
   - Restart your terminal after installation

2. **Verify installation**:
   ```powershell
   node --version
   npm --version
   ```

3. **Install dependencies**:
   ```powershell
   npm install
   ```

4. **Start the development server**:
   ```powershell
   npm run dev
   ```

**Alternative: Using Winget (Windows 10/11)**
```powershell
winget install OpenJS.NodeJS.LTS
npm install
npm run dev
```

**Alternative: Using Bun (Faster)**
```powershell
# Install Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# Install dependencies
bun install

# Start dev server
bun run dev
```

## Manual Setup Steps

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
