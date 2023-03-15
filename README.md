# Numoen LP Token List Generator

Generates the token list of Numoen LP tokens.

## Updating the Token List

```
# Update the token list
# This assumes that the token list is in the directory `ROOT/../token-list`.
git fetch upstream
git reset --hard upstream/main
git push origin main

# Build and update
yarn build
yarn copy-to-solana
yarn update-solana-token-list
```

## License

AGPL-3.0
