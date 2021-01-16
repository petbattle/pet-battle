#!/bin/bash
#set -x

if [ $# -ne 6 ]; then
  echo "Usage: . $0 hostname realm username clientid"
  echo "  options:"
  echo "    hostname: localhost:8080"
  echo "    realm: pbrealm"
  echo "    username: pbadmin"
  echo "    clientid: pbclient"
  echo "    clientsecret: XXX"
  echo
  echo "    For verify ssl: use 'y' (otherwise it will send curl post with --insecure)"
  exit 1  
fi

HOSTNAME=$1
REALM_NAME=$2
USERNAME=$3
CLIENT_ID=$4
CLIENT_SECRET=$5
SECURE=$6

if [[ $SECURE = 'y' ]]; then
  KEYCLOAK_URL=https://$HOSTNAME/auth/realms/$REALM_NAME/protocol/openid-connect/token
	INSECURE=
else
  KEYCLOAK_URL=http://$HOSTNAME/auth/realms/$REALM_NAME/protocol/openid-connect/token
	INSECURE=--insecure
fi

echo "Using Keycloak: $KEYCLOAK_URL"
echo "realm: $REALM_NAME"
echo "client-id: $CLIENT_ID"
echo "client-secret: $CLIENT_SECRET"
echo "username: $USERNAME"
echo "secure: $SECURE"

echo -n Password:
read -s PASSWORD

export TOKEN=$(curl -s -X POST "$KEYCLOAK_URL" "$INSECURE" \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -d "username=$USERNAME" \
 -d "password=$PASSWORD" \
 -d 'grant_type=password' \
 -d "client_id=$CLIENT_ID" \
 -d "client_secret=$CLIENT_SECRET" | jq -r '.access_token')

echo
echo $TOKEN

if [[ $(echo $TOKEN) != 'null' ]]; then
	export KEYCLOAK_TOKEN=$TOKEN
fi
