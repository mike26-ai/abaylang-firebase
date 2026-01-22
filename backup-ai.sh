#!/bin/bash
TAG_NAME="ai-backup-$(date +%Y-%m-%d_%H-%M-%S)"
git add -A
if git commit -m "🔒 Snapshot before AI changes ($TAG_NAME)"; then
  echo "✅ Commit created"
else
  echo "ℹ️ No changes to commit (using current state)"
fi
git tag "$TAG_NAME"
echo "✅ Snapshot saved with tag: $TAG_NAME"
<<<<<<< HEAD
echo "💡 To restore later: git checkout -b restore-from-backup $TAG_NAME"

=======

# Push the commit and tags to the remote repository
git push --follow-tags
echo "✅ Changes pushed to remote repository."

echo "💡 To restore later: git checkout -b restore-from-backup $TAG_NAME"
>>>>>>> before-product-selection-rewrite
