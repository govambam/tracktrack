// GrowthBook API Client for managing feature flags programmatically
const GROWTHBOOK_API_HOST = "https://api.growthbook.io";
const SECRET_KEY = "secret_user_btmV7USvLUv7ZqSYYy4IqTLbhzbIIKGgFJYGgkRPX4U";

export interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  project: string;
  valueType: "boolean" | "string" | "number" | "json";
  defaultValue: any;
  environments: Record<
    string,
    {
      enabled: boolean;
      rules: any[];
    }
  >;
}

export interface CreateFeatureFlagRequest {
  key: string;
  description: string;
  valueType: "boolean" | "string" | "number" | "json";
  defaultValue: any;
}

class GrowthBookAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${GROWTHBOOK_API_HOST}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GrowthBook API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Get all feature flags
  async getFeatures(): Promise<FeatureFlag[]> {
    try {
      const response = await this.request("/api/v1/features");
      // Handle different response formats from GrowthBook API
      if (Array.isArray(response)) {
        return response;
      }
      // If response has a features property (common API pattern)
      if (response && Array.isArray(response.features)) {
        return response.features;
      }
      // If response has a data property
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      // Default to empty array if response format is unexpected
      console.warn("Unexpected API response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch feature flags:", error);
      return []; // Return empty array instead of throwing
    }
  }

  // Get a specific feature flag
  async getFeature(id: string): Promise<FeatureFlag> {
    return this.request(`/api/v1/features/${id}`);
  }

  // Create a new feature flag
  async createFeature(data: CreateFeatureFlagRequest): Promise<FeatureFlag> {
    return this.request("/api/v1/features", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update a feature flag
  async updateFeature(
    id: string,
    data: Partial<FeatureFlag>,
  ): Promise<FeatureFlag> {
    return this.request(`/api/v1/features/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete a feature flag
  async deleteFeature(id: string): Promise<void> {
    return this.request(`/api/v1/features/${id}`, {
      method: "DELETE",
    });
  }

  // Enable/disable a feature flag in a specific environment
  async toggleFeature(
    id: string,
    environment: string = "production",
    enabled: boolean,
  ): Promise<FeatureFlag> {
    const feature = await this.getFeature(id);

    if (!feature.environments[environment]) {
      feature.environments[environment] = {
        enabled: false,
        rules: [],
      };
    }

    feature.environments[environment].enabled = enabled;

    return this.updateFeature(id, {
      environments: feature.environments,
    });
  }

  // Set feature flag value in a specific environment
  async setFeatureValue(
    id: string,
    value: any,
    environment: string = "production",
  ): Promise<FeatureFlag> {
    const feature = await this.getFeature(id);

    if (!feature.environments[environment]) {
      feature.environments[environment] = {
        enabled: true,
        rules: [],
      };
    }

    // For simple value changes, we'll update the default value
    // In production, you might want to use rules for more complex targeting
    feature.defaultValue = value;

    return this.updateFeature(id, {
      defaultValue: value,
      environments: feature.environments,
    });
  }

  // Create demo feature flags
  async createDemoFlags(): Promise<FeatureFlag[]> {
    const demoFlags: CreateFeatureFlagRequest[] = [
      {
        key: "new-ui-design",
        description: "Enable new UI design elements",
        valueType: "boolean",
        defaultValue: false,
      },
      {
        key: "button-color",
        description: "Dynamic button color theme",
        valueType: "string",
        defaultValue: "default",
      },
      {
        key: "max-users-limit",
        description: "Maximum number of users allowed",
        valueType: "number",
        defaultValue: 100,
      },
      {
        key: "welcome-message",
        description: "Custom welcome message for users",
        valueType: "string",
        defaultValue: "Welcome to GolfOS!",
      },
      {
        key: "enable-dark-mode",
        description: "Enable dark mode theme",
        valueType: "boolean",
        defaultValue: false,
      },
      {
        key: "beta-leaderboard",
        description: "Enable beta leaderboard features",
        valueType: "boolean",
        defaultValue: false,
      },
      {
        key: "ai_quickstart_create_flow",
        description:
          "Enable AI-powered quickstart flow for creating golf events",
        valueType: "boolean",
        defaultValue: false,
      },
    ];

    const createdFlags: FeatureFlag[] = [];
    for (const flag of demoFlags) {
      try {
        const created = await this.createFeature(flag);
        if (created) {
          createdFlags.push(created);
          console.log(`Created feature flag: ${flag.key}`);
        }
      } catch (error) {
        console.error(`Failed to create feature flag ${flag.key}:`, error);
        // Continue with other flags even if one fails
      }
    }

    return createdFlags;
  }
}

export const growthbookApi = new GrowthBookAPI();

// Utility functions for common operations
export const featureFlagUtils = {
  // Quick enable/disable
  enable: (id: string, environment?: string) =>
    growthbookApi.toggleFeature(id, environment, true),

  disable: (id: string, environment?: string) =>
    growthbookApi.toggleFeature(id, environment, false),

  // Quick value setters
  setBooleanFlag: (id: string, value: boolean, environment?: string) =>
    growthbookApi.setFeatureValue(id, value, environment),

  setStringFlag: (id: string, value: string, environment?: string) =>
    growthbookApi.setFeatureValue(id, value, environment),

  setNumberFlag: (id: string, value: number, environment?: string) =>
    growthbookApi.setFeatureValue(id, value, environment),

  // Create all demo flags at once
  setupDemoFlags: () => growthbookApi.createDemoFlags(),
};
