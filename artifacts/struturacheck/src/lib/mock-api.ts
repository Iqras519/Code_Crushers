/**
 * Mock API Service for Development/Demo
 * Provides simulated API responses for testing without a real backend
 */

export interface MockAuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
}

export interface MockStatsData {
  totalImagesChecked: number;
  defectsFound: number;
  averageConfidence: number;
  trendPercent: number;
}

// Simulate storage of authenticated users
const mockUsers = new Map<string, MockAuthResponse>([
  [
    "demo@example.com",
    {
      token: "demo-token-12345",
      user: {
        id: 1,
        name: "Demo User",
        email: "demo@example.com",
        role: "engineer",
        avatarUrl: null,
      },
    },
  ],
  [
    "admin@example.com",
    {
      token: "admin-token-67890",
      user: {
        id: 2,
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        avatarUrl: null,
      },
    },
  ],
]);

export const mockApi = {
  // Auth endpoints
  async login(email: string, password: string): Promise<MockAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === "demo@example.com" && password === "password123") {
      return mockUsers.get("demo@example.com")!;
    }
    if (email === "admin@example.com" && password === "password123") {
      return mockUsers.get("admin@example.com")!;
    }

    throw new Error("Invalid credentials");
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: string,
  ): Promise<MockAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mockUsers.has(email)) {
      throw new Error("Email already registered");
    }

    const newUser: MockAuthResponse = {
      token: `token-${Date.now()}`,
      user: {
        id: mockUsers.size + 1,
        name,
        email,
        role,
        avatarUrl: null,
      },
    };

    mockUsers.set(email, newUser);
    return newUser;
  },

  // Stats endpoints
  async getStatsSummary(): Promise<MockStatsData> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      totalImagesChecked: 1234,
      defectsFound: 356,
      averageConfidence: 94.2,
      trendPercent: 12,
    };
  },

  async getStatsHistory(): Promise<Array<{ date: string; defectsFound: number; imagesChecked: number }>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const days = 30;
    const data = [];
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        defectsFound: Math.floor(Math.random() * 50) + 5,
        imagesChecked: Math.floor(Math.random() * 100) + 20,
      });
    }
    return data;
  },

  async getDefectDistribution(): Promise<Array<{ severity: string; count: number }>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      { severity: "high", count: 45 },
      { severity: "medium", count: 128 },
      { severity: "low", count: 183 },
    ];
  },

  async listAnalyses(): Promise<
    Array<{
      id: number;
      name: string;
      createdAt: string;
      severity: string;
      status: string;
      defectsFound: number;
    }>
  > {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: 1,
        name: "Building A - Facade Analysis",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        severity: "high",
        status: "completed",
        defectsFound: 12,
      },
      {
        id: 2,
        name: "Bridge Structure - Foundation Check",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        severity: "medium",
        status: "completed",
        defectsFound: 8,
      },
      {
        id: 3,
        name: "Parking Lot - Surface Inspection",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        severity: "low",
        status: "completed",
        defectsFound: 3,
      },
    ];
  },

  async getAnalysis(id: number): Promise<{
    id: number;
    name: string;
    description: string;
    createdAt: string;
    status: string;
    defectsFound: number;
    imagesProcessed: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      name: `Analysis ${id}`,
      description: "Mock analysis description",
      createdAt: new Date().toISOString(),
      status: "completed",
      defectsFound: Math.floor(Math.random() * 20) + 1,
      imagesProcessed: Math.floor(Math.random() * 100) + 50,
    };
  },

  async uploadImage(file: File): Promise<{ id: number; url: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: Math.floor(Math.random() * 10000),
      url: URL.createObjectURL(file),
    };
  },

  async analyzeImage(imageId: number): Promise<{
    id: number;
    analysisId: number;
    defectsFound: number;
    severity: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      id: imageId,
      analysisId: 1,
      defectsFound: Math.floor(Math.random() * 10) + 1,
      severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
    };
  },

  async getRecommendations(): Promise<
    Array<{
      id: number;
      title: string;
      description: string;
      priority: string;
      estimatedCost: number;
    }>
  > {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: 1,
        title: "Facade Repair",
        description: "Address crack in facade wall",
        priority: "high",
        estimatedCost: 5000,
      },
      {
        id: 2,
        title: "Joint Sealant",
        description: "Replace deteriorated joint sealant",
        priority: "medium",
        estimatedCost: 2000,
      },
    ];
  },

  async getHealth(): Promise<{ status: "healthy" | "unhealthy"; timestamp: string }> {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  },
};
