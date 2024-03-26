#!/bin/bash
keysFile="${BASH_SOURCE%/*}/../../app/constants/keys.json"
gpg --quiet --batch --yes --decrypt \
  --passphrase="${KEYS_DECRYPT_PASSPHRASE}" \
  --output "${keysFile}" \
   "${keysFile}.gpg"
