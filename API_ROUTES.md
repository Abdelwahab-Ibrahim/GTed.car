# GTed API Routes Documentation

## Base URL
```
http://localhost:3000
```

---

## Authentication Routes (`/auth`)

### 1. Register
**Endpoint:** `POST /auth/register`  
**Auth Required:** No  
**Description:** Create a new user account

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully"
}
```

**Error Responses:**
- `400` - All fields are required
- `409` - User already exists
- `500` - Server error

---

### 2. Login
**Endpoint:** `POST /auth/login`  
**Auth Required:** No  
**Description:** Authenticate user and receive access token

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "accessToken": "jwt_token_string"
}
```

**Cookie Set:**
- `jwt`: Refresh token (httpOnly, 24 hours)

**Error Responses:**
- `400` - Email and password are required
- `401` - User not found / Invalid password
- `500` - Server error

---

### 3. Logout
**Endpoint:** `POST /auth/logout`  
**Auth Required:** No  
**Description:** Clear refresh token and logout user

**Request Body:** Empty

**Success Response (200):**
```json
{
  "message": "logged out"
}
```

---

### 4. Refresh Token
**Endpoint:** `POST /auth/refresh`  
**Auth Required:** No (uses cookie)  
**Description:** Get a new access token using refresh token

**Request Body:** Empty  
**Cookies Required:** `jwt` (refresh token)

**Success Response (200):**
```json
{
  "accessToken": "new_jwt_token_string"
}
```

**Error Responses:**
- `401` - No refresh token provided
- `403` - Invalid or expired refresh token

---

## User Routes (`/user`)

### 1. Update Avatar
**Endpoint:** `PATCH /user/avatar`  
**Auth Required:** Yes (JWT)  
**Description:** Upload and update user avatar

**Request:**
- Method: PATCH
- Auth Header: `Authorization: Bearer <accessToken>`
- Content-Type: multipart/form-data
- Form Data:
  - `avatar`: File (image file, single)

**Success Response (200):**
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": "user_id",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "avatar": "/uploads/avatars/filename.jpg"
  }
}
```

**Error Responses:**
- `404` - User not found
- `500` - Server error

---

### 2. Update Profile
**Endpoint:** `PATCH /user/profile`  
**Auth Required:** Yes (JWT)  
**Description:** Update user profile information

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "email": "string (optional, unique)"
}
```

**Success Response (200):**
```json
{
  "message": "profile updated",
  "user": {
    "id": "user_id",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "avatar": "/uploads/avatars/filename.jpg or null"
  }
}
```

**Error Responses:**
- `404` - User not found
- `409` - Email already in use
- `500` - Server error

---

### 3. Get Me
**Endpoint:** `GET /user/getMe`  
**Auth Required:** Yes (JWT)  
**Description:** Get current authenticated user's profile

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "avatar": "/uploads/avatars/filename.jpg or null"
  }
}
```

**Error Responses:**
- `404` - User not found

---

## Car Routes (`/cars`)

### 1. Get All Available Cars
**Endpoint:** `GET /cars/list`  
**Auth Required:** No  
**Description:** Get all available cars with minimal details

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "id": "car_id",
    "manufacturer": "string",
    "model": "string",
    "year": "number",
    "price": "number",
    "image": "/uploads/cars/exterior_image.jpg"
  }
]
```

**Error Responses:**
- `500` - Error fetching cars

---

### 2. Get My Cars (User's Listed Cars)
**Endpoint:** `GET /cars/my-cars`  
**Auth Required:** Yes (JWT)  
**Description:** Get all cars listed by authenticated user

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
[
  {
    "id": "car_id",
    "manufacturer": "string",
    "model": "string",
    "year": "number",
    "price": "number",
    "available": true/false,
    "image": "/uploads/cars/exterior_image.jpg"
  }
]
```

**Error Responses:**
- `500` - Error fetching your cars

---

### 3. Get Car Details
**Endpoint:** `GET /cars/:id`  
**Auth Required:** No  
**Description:** Get detailed information about a specific car

**URL Parameters:**
- `id`: Car MongoDB ID

**Success Response (200):**
```json
{
  "car": {
    "_id": "car_id",
    "manufacturer": "string",
    "model": "string",
    "year": "number",
    "price": "number",
    "color": "string",
    "milage": "number",
    "hp": "number",
    "engine": "string",
    "images": {
      "exterior": "/uploads/cars/exterior_image.jpg",
      "interior": "/uploads/cars/interior_image.jpg or null"
    },
    "available": true/false,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "seller": {
    "_id": "seller_id",
    "firstName": "string",
    "lastName": "string",
    "avatar": "/uploads/avatars/avatar.jpg or null"
  }
}
```

**Error Responses:**
- `404` - Car not found / Seller not found

---

### 4. Create Car
**Endpoint:** `POST /cars/`  
**Auth Required:** Yes (JWT)  
**Description:** List a new car for sale

**Request:**
- Method: POST
- Auth Header: `Authorization: Bearer <accessToken>`
- Content-Type: multipart/form-data
- Form Data:
  - `manufacturer`: string (required)
  - `model`: string (required)
  - `year`: number (required)
  - `price`: number (required)
  - `color`: string (required)
  - `milage`: number (required)
  - `hp`: number (required)
  - `engine`: string (required)
  - `images`: File array (exactly 2 files: exterior, interior)

**Success Response (201):**
```json
{
  "message": "Car created successfully",
  "id": "car_id"
}
```

**Error Responses:**
- `400` - Missing required fields
- `500` - Server error

---

### 5. Update Car
**Endpoint:** `PATCH /cars/:id`  
**Auth Required:** Yes (JWT)  
**Description:** Update car details (only seller can update)

**URL Parameters:**
- `id`: Car MongoDB ID

**Request Body:**
```json
{
  "manufacturer": "string (optional)",
  "model": "string (optional)",
  "year": "number (optional)",
  "price": "number (optional)",
  "color": "string (optional)",
  "milage": "number (optional)",
  "hp": "number (optional)",
  "engine": "string (optional)",
  "available": "boolean (optional)"
}
```

**Success Response (200):**
```json
{
  "message": "Car updated successfully"
}
```

**Error Responses:**
- `403` - Not authorized (not the seller)
- `404` - Car not found
- `500` - Server error

---

### 6. Delete Car
**Endpoint:** `DELETE /cars/:id`  
**Auth Required:** Yes (JWT)  
**Description:** Delete car and remove uploaded images (only seller can delete)

**URL Parameters:**
- `id`: Car MongoDB ID

**Success Response (200):**
```json
{
  "message": "car deleted successfully"
}
```

**Error Responses:**
- `403` - Not authorized (not the seller)
- `404` - Car not found
- `500` - Server error

---

### 7. Search Cars
**Endpoint:** `GET /cars/search`  
**Auth Required:** No  
**Description:** Search available cars by query (manufacturer, model, or color)

**Query Parameters:**
- `q`: Search query string (required)

**Example:** `GET /cars/search?q=toyota`

**Success Response (200):**
```json
[
  {
    "id": "car_id",
    "manufacturer": "string",
    "model": "string",
    "year": "number",
    "price": "number",
    "image": "/uploads/cars/exterior_image.jpg"
  }
]
```

**Error Responses:**
- `400` - Search query is required
- `500` - Server error

---

## Order Routes (`/order`)

### 1. Get User's Orders
**Endpoint:** `GET /order/list`  
**Auth Required:** Yes (JWT)  
**Description:** Get all orders made by authenticated user

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
[
  {
    "id": "order_id",
    "car": {
      "_id": "car_id",
      "manufacturer": "string",
      "model": "string",
      "year": "number",
      "price": "number",
      "images": { ... }
    },
    "price": "number",
    "createdAt": "timestamp"
  }
]
```

**Error Responses:**
- `500` - Server error

---

### 2. Create Order
**Endpoint:** `POST /order/`  
**Auth Required:** Yes (JWT)  
**Description:** Create a new order for a car

**Request Body:**
```json
{
  "carid": "car_id (required)",
  "price": "number (required)"
}
```

**Success Response (201):**
```json
{
  "message": "Order created successfully",
  "id": "order_id"
}
```

**Error Responses:**
- `400` - Missing carid/price or car is not available
- `404` - Car not found
- `500` - Server error

**Side Effects:**
- Car's `available` status is set to `false`

---

### 3. Cancel Order
**Endpoint:** `DELETE /order/:id`  
**Auth Required:** Yes (JWT)  
**Description:** Cancel an order (only the buyer can cancel their order)

**URL Parameters:**
- `id`: Order MongoDB ID

**Success Response (200):**
```json
{
  "message": "Order canceled successfully"
}
```

**Error Responses:**
- `403` - Not authorized (not the order creator)
- `404` - Order not found
- `500` - Server error

**Side Effects:**
- Associated car's `available` status is set to `true`

---

## Authentication Header Format

For all protected endpoints (marked "Auth Required: Yes"), include:

```
Authorization: Bearer <accessToken>
```

Where `<accessToken>` is obtained from the login or refresh endpoints.

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "Error details (optional)"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## File Upload Endpoints

- **Avatar Upload:** Single image file (multipart/form-data)
- **Car Images Upload:** Exactly 2 image files in array format (multipart/form-data)
  - First file: Exterior image
  - Second file: Interior image

Uploaded files are stored in:
- Avatars: `/uploads/avatars/`
- Car images: `/uploads/cars/`

---

## Token Expiration

- **Access Token:** 40 seconds
- **Refresh Token:** 15 minutes (stored in httpOnly cookie)

Once access token expires, use the refresh endpoint to get a new one.
