// Test production API
const API_URL = "https://sms-api-3y9r.onrender.com";

async function testProductionAPI() {
  console.log("🧪 Testing Production API...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health:", healthData);
    console.log("");

    // Test registration
    console.log("2. Testing registration...");
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123",
        role: "ADMIN"
      })
    });

    if (registerResponse.status === 201) {
      const registerData = await registerResponse.json();
      console.log("✅ Registration successful:", registerData.user.email);
    } else if (registerResponse.status === 409) {
      console.log("✅ User already exists (expected)");
    } else {
      const errorData = await registerResponse.json();
      console.log("❌ Registration failed:", errorData);
    }
    console.log("");

    // Test login
    console.log("3. Testing login...");
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123"
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("✅ Login successful:");
      console.log("   User:", loginData.user.email, "(", loginData.user.role, ")");
      console.log("   Token:", loginData.token.substring(0, 20) + "...");
    } else {
      const errorData = await loginResponse.json();
      console.log("❌ Login failed:", errorData);
    }

    console.log("\n🎉 Production API test complete!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testProductionAPI();
