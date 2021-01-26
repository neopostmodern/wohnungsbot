keysFile="${BASH_SOURCE%/*}/../../app/constants/keys.json"
gpg --symmetric --cipher-algo AES256 \
  --output "${keysFile}.gpg" \
  "${keysFile}"
