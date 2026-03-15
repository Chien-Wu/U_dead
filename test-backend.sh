#!/bin/bash
# Backend API Connectivity Test Script
# Tests all U Dead backend endpoints

echo "🧪 Testing U Dead Backend API"
echo "================================"
echo ""

# Load API URL from .env
API_URL="https://yael-preeligible-jewel.ngrok-free.dev/api/v1"

echo "📍 API URL: $API_URL"
echo ""

# Test 1: Google Auth Endpoint
echo "1️⃣  Testing POST /auth/google (with mock token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"id_token":"test-token"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
  echo "   ✅ Status: $HTTP_CODE"
  echo "   Response: $(echo $BODY | jq -r '.user.email // .error // .' 2>/dev/null || echo $BODY | head -c 100)"
else
  echo "   ❌ Status: $HTTP_CODE"
  echo "   Error: $(echo $BODY | head -c 200)"
fi
echo ""

# Test 2: Status Endpoint (requires auth, will likely fail)
echo "2️⃣  Testing GET /status (no auth)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/status")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "401" ]; then
  echo "   ⚠️  Status: $HTTP_CODE (Expected - requires authentication)"
elif [ "$HTTP_CODE" == "200" ]; then
  echo "   ✅ Status: $HTTP_CODE"
else
  echo "   ❌ Status: $HTTP_CODE"
fi
echo ""

# Test 3: Settings Endpoint
echo "3️⃣  Testing GET /settings (no auth)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/settings")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "404" ]; then
  echo "   ❌ Status: $HTTP_CODE (Endpoint not implemented)"
elif [ "$HTTP_CODE" == "401" ]; then
  echo "   ⚠️  Status: $HTTP_CODE (Requires auth - endpoint exists!)"
elif [ "$HTTP_CODE" == "200" ]; then
  echo "   ✅ Status: $HTTP_CODE"
else
  echo "   ❌ Status: $HTTP_CODE"
fi
echo ""

# Test 4: Contacts Endpoint
echo "4️⃣  Testing GET /contacts (no auth)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/contacts")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "404" ]; then
  echo "   ❌ Status: $HTTP_CODE (Endpoint not implemented)"
elif [ "$HTTP_CODE" == "401" ]; then
  echo "   ⚠️  Status: $HTTP_CODE (Requires auth - endpoint exists!)"
elif [ "$HTTP_CODE" == "200" ]; then
  echo "   ✅ Status: $HTTP_CODE"
else
  echo "   ❌ Status: $HTTP_CODE"
fi
echo ""

# Test 5: Check-in Endpoint
echo "5️⃣  Testing POST /check-in (no auth)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/check-in" \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "404" ]; then
  echo "   ❌ Status: $HTTP_CODE (Endpoint not implemented)"
elif [ "$HTTP_CODE" == "401" ]; then
  echo "   ⚠️  Status: $HTTP_CODE (Requires auth - endpoint exists!)"
elif [ "$HTTP_CODE" == "200" ]; then
  echo "   ✅ Status: $HTTP_CODE"
else
  echo "   ❌ Status: $HTTP_CODE"
fi
echo ""

echo "================================"
echo "✅ Test complete!"
echo ""
echo "💡 Tips:"
echo "  - 401 errors are OK (means endpoint exists but needs auth)"
echo "  - 404 errors mean endpoint is not implemented in backend"
echo "  - 200/201 means endpoint is working!"
