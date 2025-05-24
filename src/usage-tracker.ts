import { promises as fs } from "fs";
import os from "os";
import path from "path";

// Use temp directory or home directory for usage file
const USAGE_DIR =
  process.env.MCP_USAGE_DIR || path.join(os.homedir(), ".mcp-google-search");
const USAGE_FILE = path.join(USAGE_DIR, "usage.json");

interface UsageData {
  date: string;
  count: number;
}

async function ensureUsageDir(): Promise<void> {
  try {
    await fs.mkdir(USAGE_DIR, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }
}

export async function trackUsage(): Promise<{
  used: number;
  remaining: number;
}> {
  try {
    await ensureUsageDir();

    const today = new Date().toISOString().split("T")[0] ?? '';
    let usage: UsageData;

    try {
      const data = await fs.readFile(USAGE_FILE, "utf-8");
      usage = JSON.parse(data);

      if (usage.date !== today) {
        // New day, reset counter
        usage = { date: today, count: 1 };
      } else {
        usage.count++;
      }
    } catch {
      // File doesn't exist, create new
      usage = { date: today, count: 1 };
    }

    await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2));

    return {
      used: usage.count,
      remaining: Math.max(0, 100 - usage.count),
    };
  } catch (error) {
    // If tracking fails, just return default values and continue
    console.error("Usage tracking error:", error);
    return { used: 0, remaining: 100 };
  }
}

export async function getUsage(): Promise<{ used: number; remaining: number }> {
  try {
    await ensureUsageDir();

    const today = new Date().toISOString().split("T")[0] ?? '';

    try {
      const data = await fs.readFile(USAGE_FILE, "utf-8");
      const usage: UsageData = JSON.parse(data);

      if (usage.date !== today) {
        return { used: 0, remaining: 100 };
      }

      return {
        used: usage.count,
        remaining: Math.max(0, 100 - usage.count),
      };
    } catch {
      return { used: 0, remaining: 100 };
    }
  } catch (error) {
    console.error("Usage tracking error:", error);
    return { used: 0, remaining: 100 };
  }
}

