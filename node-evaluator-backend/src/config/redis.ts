import { createClient } from "redis";

class RedisConfig {
	private static instance: RedisConfig;
	private client: any | null = null;
	private blockingClient: any | null = null;

	private constructor() {
		// Private constructor to enforce singleton
	}

	public static getInstance(): RedisConfig {
		if (!RedisConfig.instance) {
			RedisConfig.instance = new RedisConfig();
		}
		return RedisConfig.instance;
	}

	// Shared client for general non-blocking commands
	public getClient(): any {
		if (!this.client) {
			this.client = this.createClient("General");
		}
		return this.client;
	}

	// Dedicated client for blocking operations (like XREAD BLOCK)
	public async getBlockingClient(): Promise<any> {
		if (!this.blockingClient) {
			this.blockingClient = this.createClient("Blocking");
			await this.blockingClient.connect();
		}
		return this.blockingClient;
	}

	private createClient(label: string) {
		const url = process.env.REDIS_URL || "redis://localhost:6379";
		console.log(`[RedisConfig] Initializing ${label} client... URL: ${url}`);
		const client = createClient({ url });
		client.on("error", (err) =>
			console.error(`[RedisConfig:${label}] Client Error`, err),
		);
		client.on("connect", () =>
			console.log(`[RedisConfig:${label}] Client Connected`),
		);
		return client;
	}

	public async connect(): Promise<void> {
		const client = this.getClient();
		if (!client.isOpen) {
			await client.connect();
		}
	}

	public async testConnection(): Promise<boolean> {
		try {
			const client = this.getClient();
			await this.connect();
			const result = await client.ping();
			console.log(`[RedisConfig] Test Connection Result: ${result}`);
			return result === "PONG";
		} catch (error) {
			console.error("[RedisConfig] Test Connection Failed:", error);
			return false;
		}
	}
}

export const redisConfig = RedisConfig.getInstance();
