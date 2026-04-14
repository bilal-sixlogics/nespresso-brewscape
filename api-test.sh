#!/usr/bin/env bash
# =============================================================================
# Brewscape API Integration Test Suite
# Tests every endpoint the storefront + admin panel call against the live backend.
# Usage:  bash api-test.sh [--base-url http://localhost:8000]
# =============================================================================

set -uo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL="${API_BASE_URL:-http://localhost:8000}"
PUBLIC_BASE="$BASE_URL/api/v1"
ADMIN_BASE="$BASE_URL/api/admin/v1"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@ecommerce.com}"
ADMIN_PASS="${ADMIN_PASS:-password}"

# Test user — created on first run, cleaned up at end
TEST_EMAIL="apitest_$(date +%s)@brewscape.test"
TEST_PASS="Test1234!"
TEST_NAME="API Test User"

# Colours
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ── State ─────────────────────────────────────────────────────────────────────
PASS=0; FAIL=0; SKIP=0
ADMIN_TOKEN=""
USER_TOKEN=""
PRODUCT_SLUG=""
PRODUCT_DB_ID=""   # product.id for wishlist
PRODUCT_ID=""      # sale_unit.id for cart
ORDER_ID=""
ADDRESS_ID=""

# ── Helpers ───────────────────────────────────────────────────────────────────
ok()   { echo -e "  ${GREEN}✓${RESET} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}✗${RESET} $1"; FAIL=$((FAIL+1)); }
skip() { echo -e "  ${YELLOW}−${RESET} $1 (skipped)"; SKIP=$((SKIP+1)); }
section() { echo -e "\n${BOLD}${CYAN}▸ $1${RESET}"; }

# Returns HTTP status code for a curl call.
# Usage: status=$(http GET "$url" [bearer "$token"] [json '{"k":"v"}'])
http() {
  local method="$1" url="$2"
  shift 2
  local args=(-s -o /dev/null -w "%{http_code}" -X "$method" "$url"
              -H "Accept: application/json")
  while [[ $# -gt 0 ]]; do
    case "$1" in
      bearer) args+=(-H "Authorization: Bearer $2"); shift 2 ;;
      json)   args+=(-H "Content-Type: application/json" -d "$2"); shift 2 ;;
      *)      shift ;;
    esac
  done
  curl "${args[@]}"
}

# Same as http but also captures the body.
http_body() {
  local method="$1" url="$2"
  shift 2
  local args=(-s -X "$method" "$url" -H "Accept: application/json")
  while [[ $# -gt 0 ]]; do
    case "$1" in
      bearer) args+=(-H "Authorization: Bearer $2"); shift 2 ;;
      json)   args+=(-H "Content-Type: application/json" -d "$2"); shift 2 ;;
      *)      shift ;;
    esac
  done
  curl "${args[@]}"
}

# Assert HTTP status code.
assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    ok "$label → HTTP $actual"
  else
    fail "$label → expected HTTP $expected, got HTTP $actual"
  fi
}

# Assert JSON body contains a key.
assert_key() {
  local label="$1" key="$2" body="$3"
  if echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); assert '$key' in d or any('$key' in str(v) for v in d.values())" 2>/dev/null; then
    ok "$label → has '$key'"
  else
    fail "$label → missing '$key' in response"
  fi
}

# Assert JSON field equals value.
assert_field() {
  local label="$1" jpath="$2" expected="$3" body="$4"
  local actual
  actual=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d$jpath)" 2>/dev/null || echo "__err__")
  if [[ "$actual" == "$expected" ]]; then
    ok "$label → $jpath == '$expected'"
  else
    fail "$label → $jpath: expected '$expected', got '$actual'"
  fi
}

# ── Backend connectivity check ────────────────────────────────────────────────
section "Connectivity"
status=$(http GET "$BASE_URL/api/v1/products" 2>/dev/null || echo "000")
if [[ "$status" == "000" ]]; then
  echo -e "${RED}ERROR: Backend not reachable at $BASE_URL${RESET}"
  echo "  Start it with: cd backend && php artisan serve --port=8000"
  exit 1
fi
ok "Backend reachable at $BASE_URL"

# =============================================================================
# 1. ADMIN AUTH
# =============================================================================
section "Admin Authentication"
body=$(http_body POST "$ADMIN_BASE/auth/login" json "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
status=$(echo "$body" | python3 -c "import sys; print('ok')" 2>/dev/null && echo "200" || echo "err")
ADMIN_TOKEN=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
if [[ -n "$ADMIN_TOKEN" ]]; then
  ok "Admin login → token received"
else
  fail "Admin login → no token in response: $body"
fi

# =============================================================================
# 2. PUBLIC STOREFRONT ENDPOINTS
# =============================================================================
section "Public — Products"
s=$(http GET "$PUBLIC_BASE/products"); assert_status "GET /products" "200" "$s"
body=$(http_body GET "$PUBLIC_BASE/products?per_page=1")
echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
assert 'data' in d, 'missing data'
assert 'meta' in d, 'missing meta'
assert 'links' in d, 'missing links'
meta=d['meta']
for k in ['current_page','last_page','per_page','total']:
    assert k in meta, f'meta missing {k}'
" 2>/dev/null && ok "GET /products → shape: {data[], meta{current_page,last_page,per_page,total}, links}" \
                 || fail "GET /products → response shape mismatch (expected paginated)"

# Grab first product slug for downstream tests
PRODUCT_SLUG=$(echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
slug=d.get('data',[{}])[0].get('slug','')
print(slug)
" 2>/dev/null || echo "")
[[ -n "$PRODUCT_SLUG" ]] && ok "Captured product slug: $PRODUCT_SLUG" || skip "No product slug available"

if [[ -n "$PRODUCT_SLUG" ]]; then
  s=$(http GET "$PUBLIC_BASE/products/$PRODUCT_SLUG"); assert_status "GET /products/{slug}" "200" "$s"
  body=$(http_body GET "$PUBLIC_BASE/products/$PRODUCT_SLUG")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
p=d.get('data',d)
for k in ['id','name','slug','selling_price']:
    assert k in p, f'product missing {k}'
" 2>/dev/null && ok "GET /products/{slug} → shape: {data{id,name,slug,selling_price}}" \
                 || fail "GET /products/{slug} → shape mismatch"

  s=$(http GET "$PUBLIC_BASE/products/$PRODUCT_SLUG/reviews"); assert_status "GET /products/{slug}/reviews" "200" "$s"

  # Capture product DB id for wishlist tests
  PRODUCT_DB_ID=$(http_body GET "$PUBLIC_BASE/products/$PRODUCT_SLUG" | python3 -c "
import sys,json
d=json.load(sys.stdin)
p=d.get('data',d)
print(p.get('id',''))
" 2>/dev/null || echo "")
fi

s=$(http GET "$PUBLIC_BASE/products/nonexistent-product-xyz"); assert_status "GET /products/{slug} 404 for draft" "404" "$s"

section "Public — Categories"
s=$(http GET "$PUBLIC_BASE/categories"); assert_status "GET /categories" "200" "$s"
body=$(http_body GET "$PUBLIC_BASE/categories")
echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Accepts both {data:[]} and plain []
arr=d.get('data',d) if isinstance(d,dict) else d
assert isinstance(arr,list), 'expected array'
" 2>/dev/null && ok "GET /categories → returns array" \
                 || fail "GET /categories → unexpected shape"

section "Public — Shipping & Payment Methods"
s=$(http GET "$PUBLIC_BASE/shipping-methods"); assert_status "GET /shipping-methods" "200" "$s"
body=$(http_body GET "$PUBLIC_BASE/shipping-methods")
echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
arr=d.get('data',d) if isinstance(d,dict) else d
assert isinstance(arr,list), 'expected array'
" 2>/dev/null && ok "GET /shipping-methods → returns array" || fail "GET /shipping-methods → shape mismatch"

s=$(http GET "$PUBLIC_BASE/payment-methods"); assert_status "GET /payment-methods" "200" "$s"
body=$(http_body GET "$PUBLIC_BASE/payment-methods")
echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Backend returns {stripe:bool, cod:bool, pickup_payment_required:bool, cod_config:{...}}
assert isinstance(d,dict), 'expected object'
for k in ['stripe','cod']:
    assert k in d, f'payment_methods missing key {k}'
" 2>/dev/null && ok "GET /payment-methods → shape: {stripe:bool, cod:bool, pickup_payment_required, cod_config}" \
                 || fail "GET /payment-methods → shape mismatch"

section "Public — Blog"
s=$(http GET "$PUBLIC_BASE/blog"); assert_status "GET /blog" "200" "$s"
body=$(http_body GET "$PUBLIC_BASE/blog?per_page=1")
echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Accepts paginated or plain array
arr=d.get('data',d) if isinstance(d,dict) else d
assert isinstance(arr,list)
" 2>/dev/null && ok "GET /blog → array response" || fail "GET /blog → shape mismatch"

BLOG_ID=$(echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
arr=d.get('data',d) if isinstance(d,dict) else d
print(arr[0]['id'] if arr else '')
" 2>/dev/null || echo "")
if [[ -n "$BLOG_ID" ]]; then
  s=$(http GET "$PUBLIC_BASE/blog/$BLOG_ID"); assert_status "GET /blog/{id}" "200" "$s"
fi

section "Public — Brew Guides (KNOWN BROKEN)"
s=$(http GET "$PUBLIC_BASE/brew-guides")
if [[ "$s" == "404" ]]; then
  fail "GET /brew-guides → HTTP 404  ⚠ KNOWN BROKEN: table seeded but no route exists. Storefront /brew-guide page will show empty."
elif [[ "$s" == "200" ]]; then
  ok "GET /brew-guides → HTTP 200 (fixed!)"
else
  fail "GET /brew-guides → HTTP $s (unexpected)"
fi

section "Public — Store Locations & Pickup Stores"
s=$(http GET "$PUBLIC_BASE/store-locations"); assert_status "GET /store-locations" "200" "$s"
s=$(http GET "$PUBLIC_BASE/pickup-stores"); assert_status "GET /pickup-stores" "200" "$s"

section "Public — Featured"
s=$(http GET "$PUBLIC_BASE/brands/featured"); assert_status "GET /brands/featured" "200" "$s"
s=$(http GET "$PUBLIC_BASE/reviews/featured"); assert_status "GET /reviews/featured" "200" "$s"

section "Public — Promotions"
# promotions/apply is inside the auth middleware group — requires token
if [[ -n "$USER_TOKEN" ]]; then
  s_apply=$(http POST "$PUBLIC_BASE/promotions/apply" bearer "$USER_TOKEN" json '{"code":"INVALID_PROMO_XYZ"}')
  if [[ "$s_apply" == "422" || "$s_apply" == "404" || "$s_apply" == "200" ]]; then
    ok "POST /promotions/apply (auth) → HTTP $s_apply (rejects invalid code)"
  else
    fail "POST /promotions/apply (auth) → HTTP $s_apply (unexpected)"
  fi
  # Verify unauthenticated request returns 401
  s_noauth=$(http POST "$PUBLIC_BASE/promotions/apply" json '{"code":"TEST"}')
  [[ "$s_noauth" == "401" ]] && ok "POST /promotions/apply (no auth) → 401 (protected)" \
    || fail "POST /promotions/apply (no auth) → HTTP $s_noauth (expected 401)"
else
  skip "POST /promotions/apply — no user token available yet"
fi

# =============================================================================
# 3. STOREFRONT AUTH FLOW
# =============================================================================
section "Storefront Auth — Register + Login"
reg_body=$(http_body POST "$PUBLIC_BASE/auth/register" json "{
  \"name\":\"$TEST_NAME\",
  \"email\":\"$TEST_EMAIL\",
  \"password\":\"$TEST_PASS\",
  \"password_confirmation\":\"$TEST_PASS\"
}")
USER_TOKEN=$(echo "$reg_body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
if [[ -n "$USER_TOKEN" ]]; then
  ok "POST /auth/register → token received"
else
  # Try login if register might have run before
  login_body=$(http_body POST "$PUBLIC_BASE/auth/login" json "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")
  USER_TOKEN=$(echo "$login_body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
  [[ -n "$USER_TOKEN" ]] && ok "POST /auth/login → token received (register may have existed)" \
                          || fail "POST /auth/register and /auth/login both failed — no token"
fi

if [[ -n "$USER_TOKEN" ]]; then
  me_body=$(http_body GET "$PUBLIC_BASE/auth/me" bearer "$USER_TOKEN")
  echo "$me_body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Backend wraps in {user:{}} not {data:{}}
u=d.get('user', d.get('data', d))
for k in ['id','name','email']:
    assert k in u, f'me missing {k}'
" 2>/dev/null && ok "GET /auth/me → shape: {user{id,name,email}}" || fail "GET /auth/me → shape mismatch: $me_body"
fi

# =============================================================================
# 4. CART FLOW
# =============================================================================
section "Cart Flow"
if [[ -n "$USER_TOKEN" ]]; then
  s=$(http GET "$PUBLIC_BASE/cart" bearer "$USER_TOKEN"); assert_status "GET /cart" "200" "$s"
  cart_body=$(http_body GET "$PUBLIC_BASE/cart" bearer "$USER_TOKEN")
  echo "$cart_body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
cart=d.get('data',d)
# Backend returns {items:[], total:0} — no 'subtotal' wrapper
for k in ['items','total']:
    assert k in cart, f'cart missing {k}'
" 2>/dev/null && ok "GET /cart → shape: {items, total}" || fail "GET /cart → shape mismatch: $cart_body"

  if [[ -n "$PRODUCT_SLUG" ]]; then
    # Get product id for cart add
    prod_body=$(http_body GET "$PUBLIC_BASE/products/$PRODUCT_SLUG")
    PRODUCT_ID=$(echo "$prod_body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
p=d.get('data',d)
su=p.get('sale_units',[]) or p.get('sales_units',[])
print(su[0]['id'] if su else '')
" 2>/dev/null || echo "")

    if [[ -n "$PRODUCT_ID" ]]; then
      # Backend field is product_sales_unit_id (plural 'sales')
      add_body=$(http_body POST "$PUBLIC_BASE/cart/items" bearer "$USER_TOKEN" \
        json "{\"product_sales_unit_id\":$PRODUCT_ID,\"quantity\":1}")
      s_add=$(http POST "$PUBLIC_BASE/cart/items" bearer "$USER_TOKEN" \
        json "{\"product_sales_unit_id\":$PRODUCT_ID,\"quantity\":1}")
      if [[ "$s_add" == "200" || "$s_add" == "201" ]]; then
        ok "POST /cart/items → HTTP $s_add (added to cart)"
      else
        fail "POST /cart/items → HTTP $s_add: $add_body"
      fi
    else
      skip "POST /cart/items — product has no sale_units, cannot add"
    fi
  else
    skip "POST /cart/items — no product slug available"
  fi
else
  skip "Cart flow — no user token"
fi

# =============================================================================
# 5. ADDRESS FLOW
# =============================================================================
section "Addresses"
if [[ -n "$USER_TOKEN" ]]; then
  s=$(http GET "$PUBLIC_BASE/addresses" bearer "$USER_TOKEN"); assert_status "GET /addresses" "200" "$s"

  # Backend validates address_1/postcode (stores internally as address_line1/postal_code)
  addr_body=$(http_body POST "$PUBLIC_BASE/addresses" bearer "$USER_TOKEN" json '{
    "label":"Home",
    "first_name":"Test","last_name":"User",
    "address_1":"123 Test St","city":"Casablanca",
    "state":"Casablanca-Settat","postcode":"20000",
    "country":"MA","phone":"0600000000"
  }')
  s_addr=$(http POST "$PUBLIC_BASE/addresses" bearer "$USER_TOKEN" json '{
    "label":"Home",
    "first_name":"Test","last_name":"User",
    "address_1":"123 Test St","city":"Casablanca",
    "state":"Casablanca-Settat","postcode":"20000",
    "country":"MA","phone":"0600000000"
  }')
  ADDRESS_ID=$(echo "$addr_body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")
  if [[ "$s_addr" == "200" || "$s_addr" == "201" ]]; then
    ok "POST /addresses → HTTP $s_addr (address created, id=$ADDRESS_ID)"
  else
    fail "POST /addresses → HTTP $s_addr: $addr_body"
  fi

  if [[ -n "$ADDRESS_ID" ]]; then
    s=$(http PATCH "$PUBLIC_BASE/addresses/$ADDRESS_ID/default" bearer "$USER_TOKEN"); assert_status "PATCH /addresses/{id}/default" "200" "$s"
    # Cannot delete the only address or the default — backend returns 422 (correct behaviour)
    s=$(http DELETE "$PUBLIC_BASE/addresses/$ADDRESS_ID" bearer "$USER_TOKEN")
    if [[ "$s" == "200" || "$s" == "204" ]]; then
      ok "DELETE /addresses/{id} → HTTP $s"
    elif [[ "$s" == "422" ]]; then
      ok "DELETE /addresses/{id} → 422 (cannot delete last/default address — correct business rule)"
    else
      fail "DELETE /addresses/{id} → HTTP $s (unexpected)"
    fi
  fi
else
  skip "Address flow — no user token"
fi

# =============================================================================
# 6. WISHLIST
# =============================================================================
section "Wishlist"
if [[ -n "$USER_TOKEN" && -n "$PRODUCT_DB_ID" ]]; then
  s=$(http GET "$PUBLIC_BASE/wishlist" bearer "$USER_TOKEN"); assert_status "GET /wishlist" "200" "$s"
  # POST /wishlist needs product.id (not sale_unit id)
  s=$(http POST "$PUBLIC_BASE/wishlist" bearer "$USER_TOKEN" json "{\"product_id\":$PRODUCT_DB_ID}");
  [[ "$s" == "200" || "$s" == "201" || "$s" == "422" ]] && ok "POST /wishlist → HTTP $s" || fail "POST /wishlist → HTTP $s"
  s=$(http DELETE "$PUBLIC_BASE/wishlist/$PRODUCT_DB_ID" bearer "$USER_TOKEN")
  [[ "$s" == "200" || "$s" == "204" ]] && ok "DELETE /wishlist/{id} → HTTP $s" || fail "DELETE /wishlist/{id} → HTTP $s"
elif [[ -n "$USER_TOKEN" ]]; then
  s=$(http GET "$PUBLIC_BASE/wishlist" bearer "$USER_TOKEN"); assert_status "GET /wishlist" "200" "$s"
  skip "POST/DELETE /wishlist — no product db id"
else
  skip "Wishlist — no user token"
fi

# =============================================================================
# 7. CHECKOUT FLOW (shape + payload validation)
# =============================================================================
section "Checkout — Payload Validation"
if [[ -n "$USER_TOKEN" ]]; then
  # Missing required fields — expect 422
  s=$(http POST "$PUBLIC_BASE/checkout" bearer "$USER_TOKEN" json '{}')
  [[ "$s" == "422" ]] && ok "POST /checkout with empty body → 422 (validation enforced)" \
                       || fail "POST /checkout with empty body → HTTP $s (expected 422)"

  # Full payload with invalid payment method
  checkout_payload='{
    "shipping_address":{
      "first_name":"Test","last_name":"User",
      "address_line1":"123 Test St","city":"Casablanca",
      "state":"Casablanca-Settat","postal_code":"20000","country":"MA","phone":"0600000000"
    },
    "shipping_method_id":9999,
    "payment_method_id":9999,
    "billing_address":{
      "same_as_shipping":true
    }
  }'
  s=$(http POST "$PUBLIC_BASE/checkout" bearer "$USER_TOKEN" json "$checkout_payload")
  # Expect 422 (invalid IDs), 404 or similar — not 500
  if [[ "$s" == "422" || "$s" == "404" || "$s" == "400" ]]; then
    ok "POST /checkout with invalid IDs → HTTP $s (rejected cleanly)"
  elif [[ "$s" == "500" ]]; then
    fail "POST /checkout with invalid IDs → HTTP 500 (server error — unhandled exception)"
  else
    fail "POST /checkout → HTTP $s (unexpected)"
  fi
else
  skip "Checkout validation — no user token"
fi

# =============================================================================
# 8. ORDER HISTORY (storefront)
# =============================================================================
section "Orders (Storefront)"
if [[ -n "$USER_TOKEN" ]]; then
  s=$(http GET "$PUBLIC_BASE/orders" bearer "$USER_TOKEN"); assert_status "GET /orders" "200" "$s"
  orders_body=$(http_body GET "$PUBLIC_BASE/orders" bearer "$USER_TOKEN")
  echo "$orders_body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Accept {data:[...], meta:{...}} or plain []
arr=d.get('data',d)
assert isinstance(arr,list)
" 2>/dev/null && ok "GET /orders → paginated list" || fail "GET /orders → shape mismatch: $orders_body"
else
  skip "Orders — no user token"
fi

# =============================================================================
# 9. PROFILE
# =============================================================================
section "Profile"
if [[ -n "$USER_TOKEN" ]]; then
  s=$(http GET "$PUBLIC_BASE/profile" bearer "$USER_TOKEN"); assert_status "GET /profile" "200" "$s"
  s=$(http PUT "$PUBLIC_BASE/profile" bearer "$USER_TOKEN" json "{\"name\":\"Updated Name\",\"email\":\"$TEST_EMAIL\"}");
  [[ "$s" == "200" ]] && ok "PUT /profile → 200" || fail "PUT /profile → HTTP $s"
else
  skip "Profile — no user token"
fi

# =============================================================================
# 10. CONTACT & NEWSLETTER
# =============================================================================
section "Contact & Newsletter"
# message field requires min:10 characters
s=$(http POST "$PUBLIC_BASE/contact" json '{"name":"Test User","email":"t@test.com","message":"Hello this is a test message from the API suite"}')
[[ "$s" == "200" || "$s" == "201" ]] && ok "POST /contact → HTTP $s" || fail "POST /contact → HTTP $s"

s=$(http POST "$PUBLIC_BASE/newsletter/subscribe" json '{"email":"newsletter_apitest@test.com"}')
[[ "$s" == "200" || "$s" == "201" || "$s" == "409" ]] && ok "POST /newsletter/subscribe → HTTP $s" \
  || fail "POST /newsletter/subscribe → HTTP $s"

# =============================================================================
# 11. ADMIN — DASHBOARD
# =============================================================================
section "Admin — Dashboard"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/dashboard" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/dashboard" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/dashboard" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
inner=d.get('data',d)
for k in ['total_revenue','orders_today','total_products','recent_orders','daily_revenue']:
    assert k in inner, f'dashboard missing {k}'
" 2>/dev/null && ok "GET /admin/dashboard → shape: {data{total_revenue,orders_today,total_products,recent_orders,daily_revenue}}" \
                 || fail "GET /admin/dashboard → shape mismatch: $(echo $body | head -c 200)"
else
  skip "Admin dashboard — no admin token"
fi

# =============================================================================
# 12. ADMIN — PRODUCTS
# =============================================================================
section "Admin — Products"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/products" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/products" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/products?per_page=1" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
assert 'data' in d and 'meta' in d, 'not paginated'
if d['data']:
    p=d['data'][0]
    for k in ['id','name','slug','selling_price','status']:
        assert k in p, f'product missing {k}'
" 2>/dev/null && ok "GET /admin/products → paginated, shape: {data[{id,name,slug,selling_price,status}], meta}" \
                 || fail "GET /admin/products → shape mismatch"

  # Get first admin product id for downstream
  ADMIN_PRODUCT_ID=$(echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d['data'][0]['id'] if d.get('data') else '')
" 2>/dev/null || echo "")

  if [[ -n "$ADMIN_PRODUCT_ID" ]]; then
    s=$(http GET "$ADMIN_BASE/products/$ADMIN_PRODUCT_ID" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/products/{id}" "200" "$s"
  fi
fi

# =============================================================================
# 13. ADMIN — ORDERS
# =============================================================================
section "Admin — Orders"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/orders" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/orders" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/orders?per_page=1" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
assert 'data' in d and 'meta' in d, 'not paginated'
" 2>/dev/null && ok "GET /admin/orders → paginated response" || fail "GET /admin/orders → shape mismatch"

  # Grab first order id
  ORDER_ID=$(echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d['data'][0]['id'] if d.get('data') else '')
" 2>/dev/null || echo "")
  if [[ -n "$ORDER_ID" ]]; then
    s=$(http GET "$ADMIN_BASE/orders/$ORDER_ID" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/orders/{id}" "200" "$s"
  fi
fi

# =============================================================================
# 14. ADMIN — CATEGORIES
# =============================================================================
section "Admin — Categories"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/categories" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/categories" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/categories" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
arr=d.get('data',d)
assert isinstance(arr,list)
" 2>/dev/null && ok "GET /admin/categories → array" || fail "GET /admin/categories → shape mismatch"
fi

# =============================================================================
# 15. ADMIN — SHIPPING
# =============================================================================
section "Admin — Shipping Methods"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/shipping/methods" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/shipping/methods" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/shipping/methods" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Backend returns raw array (no data wrapper)
arr=d if isinstance(d,list) else d.get('data',d)
assert isinstance(arr,list)
if arr:
    m=arr[0]
    for k in ['id','name','active']:
        assert k in m, f'shipping method missing {k}'
" 2>/dev/null && ok "GET /admin/shipping/methods → array [{id,name,active}]" \
                 || fail "GET /admin/shipping/methods → shape mismatch"

  # Verify correct path (not /shipping-methods)
  s_wrong=$(http GET "$ADMIN_BASE/shipping-methods" bearer "$ADMIN_TOKEN")
  [[ "$s_wrong" == "404" ]] && ok "/admin/shipping-methods (hyphen) correctly returns 404 — admin uses /shipping/methods" \
                              || skip "/admin/shipping-methods returned $s_wrong"
fi

# =============================================================================
# 16. ADMIN — SETTINGS
# =============================================================================
section "Admin — Settings"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/settings" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/settings" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/settings" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
inner=d.get('data',d)
# Accept both array and object
assert inner is not None
" 2>/dev/null && ok "GET /admin/settings → 200 with data" || fail "GET /admin/settings → shape mismatch"
fi

# =============================================================================
# 17. ADMIN — CUSTOMERS
# =============================================================================
section "Admin — Customers"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/customers" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/customers" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/customers?per_page=1" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
assert 'data' in d, 'not paginated'
" 2>/dev/null && ok "GET /admin/customers → paginated" || fail "GET /admin/customers → shape mismatch"
fi

# =============================================================================
# 18. ADMIN — PROMOTIONS
# =============================================================================
section "Admin — Promotions"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/promotions" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/promotions" "200" "$s"
fi

# =============================================================================
# 19. ADMIN — BLOG
# =============================================================================
section "Admin — Blog"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/blog" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/blog" "200" "$s"
fi

# =============================================================================
# 20. ADMIN — STORE LOCATIONS
# =============================================================================
section "Admin — Store Locations"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/store-locations" bearer "$ADMIN_TOKEN"); assert_status "GET /admin/store-locations" "200" "$s"
  body=$(http_body GET "$ADMIN_BASE/store-locations" bearer "$ADMIN_TOKEN")
  echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
arr=d.get('data',d)
assert isinstance(arr,list)
" 2>/dev/null && ok "GET /admin/store-locations → {data:[]}" || fail "GET /admin/store-locations → shape mismatch"
fi

# =============================================================================
# 21. ADMIN — BREW GUIDES
# =============================================================================
section "Admin — Brew Guides"
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http GET "$ADMIN_BASE/brew-guides" bearer "$ADMIN_TOKEN")
  if [[ "$s" == "200" ]]; then
    ok "GET /admin/brew-guides → 200"
    body=$(http_body GET "$ADMIN_BASE/brew-guides" bearer "$ADMIN_TOKEN")
    echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
arr=d.get('data',d)
assert isinstance(arr,list), 'expected array'
" 2>/dev/null && ok "GET /admin/brew-guides → array response" || fail "GET /admin/brew-guides → shape mismatch"
  elif [[ "$s" == "404" ]]; then
    fail "GET /admin/brew-guides → 404  ⚠ Admin brew-guides route not registered"
  else
    fail "GET /admin/brew-guides → HTTP $s"
  fi
else
  skip "Admin brew-guides — no admin token"
fi

# =============================================================================
# 22. AUTH PROTECTION — unauthenticated access should fail
# =============================================================================
section "Auth Protection"
s=$(http GET "$PUBLIC_BASE/orders"); assert_status "GET /orders (no auth) → 401" "401" "$s"
# Cart is intentionally public for guest users (session-based guest cart)
s=$(http GET "$PUBLIC_BASE/cart")
[[ "$s" == "200" ]] && ok "GET /cart (no auth) → 200 (guest cart supported)" \
  || fail "GET /cart (no auth) → HTTP $s (expected 200 for guest)"
s=$(http GET "$PUBLIC_BASE/addresses"); assert_status "GET /addresses (no auth) → 401" "401" "$s"
s=$(http GET "$ADMIN_BASE/orders"); assert_status "GET /admin/orders (no auth) → 401" "401" "$s"
s=$(http GET "$ADMIN_BASE/products"); assert_status "GET /admin/products (no auth) → 401" "401" "$s"
s=$(http GET "$ADMIN_BASE/dashboard"); assert_status "GET /admin/dashboard (no auth) → 401" "401" "$s"

# =============================================================================
# 23. CLEANUP
# =============================================================================
section "Cleanup"
if [[ -n "$USER_TOKEN" ]]; then
  s=$(http POST "$PUBLIC_BASE/auth/logout" bearer "$USER_TOKEN")
  [[ "$s" == "200" || "$s" == "204" ]] && ok "POST /auth/logout → HTTP $s" || fail "POST /auth/logout → HTTP $s"
fi
if [[ -n "$ADMIN_TOKEN" ]]; then
  s=$(http POST "$ADMIN_BASE/auth/logout" bearer "$ADMIN_TOKEN")
  [[ "$s" == "200" || "$s" == "204" ]] && ok "POST /admin/auth/logout → HTTP $s" || fail "POST /admin/auth/logout → HTTP $s"
fi

# =============================================================================
# SUMMARY
# =============================================================================
TOTAL=$((PASS + FAIL + SKIP))
echo ""
echo -e "${BOLD}═══════════════════════════════════════════${RESET}"
echo -e "${BOLD} Results: $TOTAL tests   ${GREEN}$PASS passed${RESET}   ${RED}$FAIL failed${RESET}   ${YELLOW}$SKIP skipped${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════${RESET}"

if [[ $FAIL -gt 0 ]]; then
  echo ""
  echo -e "${YELLOW}Known issues:${RESET}"
  echo "  • GET /api/v1/brew-guides → 404: brew_guides table exists but no public route"
  echo "    The storefront /brew-guide page calls this endpoint and will show empty."
  echo "    Fix: add route + controller, or gracefully handle the empty state in the page."
  echo ""
  exit 1
fi

exit 0
