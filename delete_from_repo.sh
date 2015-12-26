#git filter-branch --tag-name-filter cat --index-filter 'git rm -r --cached --ignore-unmatch .DS_Store' --prune-empty -f -- --all

rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now
git gc --aggressive --prune=now
