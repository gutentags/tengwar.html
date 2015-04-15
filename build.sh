#!/bin/bash
set -e

function rdtree() {
    local DIR="$1"
    ls -- "$DIR" | while read FILE; do
        if [ -f "$DIR/$FILE" ]; then
            MODE=100644
            # if [ -x "$DIR/$FILE" ]; then
            #     MODE=100755
            # fi
            OBJECT=$(git hash-object -w --no-filters "$DIR/$FILE")
            if [ -n "$OBJECT" ]; then
                echo "$MODE blob $OBJECT"$'\t'"$FILE"
            fi
        fi
        if [ -d "$DIR/$FILE" ]; then
            OBJECT=$(mktree "$DIR/$FILE")
            if [ -n "$OBJECT" ]; then
                echo "040000 tree $OBJECT"$'\t'"$FILE"
            fi
        fi
    done
}

function mktree() {
    local DIR="$1"
    rdtree "$DIR" | git mktree
}

HERE=$(cd -L $(dirname -- $0); pwd)
export PATH="$HERE/node_modules/.bin":"$PATH"
export GIT_DIR="$HERE/.git"
export GIT_INDEX_FILE=$(mktemp "$GIT_DIR/TEMP.XXXXXX")

export GIT_AUTHOR_NAME="Kris Kowal"
export GIT_AUTHOR_EMAIL="kris@cixar.com"
export GIT_AUTHOR_DATE="$NOW"
export GIT_COMMITTER_NAME="Kris Kowal"
export GIT_COMMITTER_EMAIL="kris@cixar.com"
export GIT_COMMITTER_DATE="$NOW"

function gentree1() {
    NODE_MODULES=$(mktree $HERE/node_modules)
    echo "040000 tree $NODE_MODULES"$'\t'"node_modules"
    JS_BUNDLE=$(git hash-object -w <(mrs index.js))
    echo "100644 blob $JS_BUNDLE"$'\t'"bundle.js"
    CSS_BUNDLE=$(git hash-object -w <(lessc index.less))
    echo "100644 blob $CSS_BUNDLE"$'\t'"bundle.css"
}

OVERLAY=$(gentree1 | git mktree)
git read-tree --empty
git read-tree --prefix=/ refs/heads/master
git read-tree --prefix=/ "$OVERLAY"
TREE=$(git write-tree --missing-ok)
PARENT=$(git rev-parse refs/heads/master)
COMMIT=$(git commit-tree -p "$PARENT" "$TREE" < <(echo "Create bundles"))

function gentree2() {
    GH_PAGES_TREE=$(git cat-file commit gh-pages | grep '^tree ' | cut -d' ' -f2)
    INDEX_BLOB=$(git ls-tree "$GH_PAGES_TREE" | grep '\tindex.html$' | awk '{print $3}')
    echo "100644 blob $INDEX_BLOB"$'\t'"index.html"
}
PARENT=$COMMIT
OVERLAY=$(gentree2 | git mktree)
git read-tree -m -i "$OVERLAY" "$TREE"
TREE=$(git write-tree --missing-ok)
COMMIT=$(git commit-tree -p "$PARENT" "$TREE" < <(echo "Update index"))

git update-ref refs/heads/gh-pages $COMMIT

rm $GIT_INDEX_FILE
