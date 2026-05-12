// Test login endpoint
const API_URL = "http://localhost:3000";

async function testLogin() {
  console.log("🧪 Testing Login Endpoint...\n");

  try {
    // Test admin login
    console.log("1. Testing admin login...");
    const adminResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@school.com",
        password: "admin123"
      })
    });

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log("✅ Admin login successful:");
      console.log("   User:", adminData.user.email, "(", adminData.user.role, ")");
      console.log("   Token:", adminData.token.substring(0, 20) + "...");
    } else {
      console.log("❌ Admin login failed:", adminResponse.status);
    }

    // Test teacher login
    console.log("\n2. Testing teacher login...");
    const teacherResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "teacher@school.com",
        password: "teacher123"
      })
    });

    if (teacherResponse.ok) {
      const teacherData = await teacherResponse.json();
      console.log("✅ Teacher login successful:");
      console.log("   User:", teacherData.user.email, "(", teacherData.user.role, ")");
      console.log("   Token:", teacherData.token.substring(0, 20) + "...");
    } else {
      console.log("❌ Teacher login failed:", teacherResponse.status);
    }

    // Test invalid login
    console.log("\n3. Testing invalid login...");
    const invalidResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid@test.com",
        password: "wrongpassword"
      })
    });

    if (invalidResponse.status === 401) {
      console.log("✅ Invalid login properly rejected");
    } else {
      console.log("❌ Invalid login handling incorrect:", invalidResponse.status);
    }

    console.log("\n🎉 Login testing complete!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("- Make sure API server is running on http://localhost:10000");
    console.log("- Check CORS configuration allows localhost:5174");
    console.log("- Verify mock authentication is implemented");
  }
}

testLogin();
