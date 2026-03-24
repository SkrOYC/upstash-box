import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Agent, Box, ClaudeCode } from "../../index.js";
import { UPSTASH_BOX_API_KEY } from "./setup.js";

describe.skipIf(!UPSTASH_BOX_API_KEY)("schedule", () => {
  let box: Box;

  beforeAll(async () => {
    box = await Box.create({
      apiKey: UPSTASH_BOX_API_KEY!,
      agent: { provider: Agent.ClaudeCode, model: ClaudeCode.Opus_4_6 },
    });
  }, 120000);

  afterAll(async () => {
    try {
      await box?.delete();
    } catch {
      // cleanup best-effort
    }
  }, 30000);

  it("schedule.exec: creates, gets, lists, and deletes an exec schedule", async () => {
    const schedule = await box.schedule.exec({
      cron: "* * * * *",
      command: ["bash", "-c", "date >> /workspace/home/cron.log && echo scheduled-ok"],
    });

    expect(schedule.id).toBeDefined();
    expect(schedule.type).toBe("exec");
    expect(schedule.cron).toBe("* * * * *");

    const fetched = await box.schedule.get(schedule.id);
    expect(fetched.id).toBe(schedule.id);

    const list = await box.schedule.list();
    expect(list.some((s) => s.id === schedule.id)).toBe(true);

    await box.schedule.delete(schedule.id);

    const listAfter = await box.schedule.list();
    expect(listAfter.some((s) => s.id === schedule.id)).toBe(false);
  }, 30000);

  it("schedule.agent: creates and deletes an agent schedule", async () => {
    const schedule = await box.schedule.agent({
      cron: "0 9 * * *",
      prompt: "Run the test suite and fix any failures",
    });

    expect(schedule.id).toBeDefined();
    expect(schedule.type).toBe("agent");
    expect(schedule.cron).toBe("0 9 * * *");

    await box.schedule.delete(schedule.id);
  }, 30000);
});
