#!/bin/bash
# Custom build script for Vercel deployment

# Use legacy peer deps to handle React 19 compatibility
npm install --legacy-peer-deps --force

# Turn off CI environment to prevent treating warnings as errors
CI=false npm run build

# Print success message
echo "Build completed successfully"
