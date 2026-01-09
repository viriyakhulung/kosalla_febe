/**
 * Mock API untuk testing UI
 * Akan di-replace dengan actual backend API ketika Laravel server ready
 */

const MOCK_USERS = {
  admin: {
    id: 1,
    name: "Admin Viriya",
    email: "admin@viriya.com",
    master_role: "super_admin",
    roles: ["super-admin"],
  },
  user: {
    id: 2,
    name: "John Engineer",
    email: "engineer@viriya.com",
    master_role: "engineer-manager",
    roles: ["engineer-manager"],
  },
};

type MockUser = keyof typeof MOCK_USERS;

let currentMockUser: MockUser | null = null;

export async function mockLogin(
  email: string,
  password: string
): Promise<{ token: string; user: any }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Demo credentials
  if (email === "admin@viriya.com" && password === "admin123") {
    currentMockUser = "admin";
    return {
      token: "mock_token_admin_" + Math.random().toString(36).substr(2, 9),
      user: MOCK_USERS.admin,
    };
  }

  if (email === "engineer@viriya.com" && password === "engineer123") {
    currentMockUser = "user";
    return {
      token: "mock_token_engineer_" + Math.random().toString(36).substr(2, 9),
      user: MOCK_USERS.user,
    };
  }

  throw new Error("Invalid credentials. Try admin@viriya.com / admin123");
}

export async function mockGetMe(): Promise<{ user: any }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!currentMockUser) {
    throw new Error("Not authenticated");
  }

  return {
    user: MOCK_USERS[currentMockUser],
  };
}

export function mockLogout(): void {
  currentMockUser = null;
}

// Export flag to check if using mock API
export const USE_MOCK_API =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
