import { describe, it, expect, vi, afterEach } from "vitest";
import { mockResponse, createTestBox } from "./helpers.js";

describe("Box schedule operations", () => {
  afterEach(() => vi.restoreAllMocks());

  describe("schedule.exec", () => {
    it("creates an exec schedule", async () => {
      const { box, fetchMock } = await createTestBox();
      const schedule = {
        id: "sched-1",
        type: "exec",
        cron: "* * * * *",
        command: ["bash", "-c", "echo hello"],
        created_at: 1710000000,
      };
      fetchMock.mockResolvedValueOnce(mockResponse(schedule));

      const result = await box.schedule.exec({
        cron: "* * * * *",
        command: ["bash", "-c", "echo hello"],
      });

      expect(result.id).toBe("sched-1");
      expect(result.type).toBe("exec");

      const [url, init] = fetchMock.mock.calls[1]!;
      expect(url).toContain("/schedules");
      expect(init?.method).toBe("POST");
      const body = JSON.parse(init?.body as string);
      expect(body.type).toBe("exec");
      expect(body.command).toEqual(["bash", "-c", "echo hello"]);
      expect(body.cron).toBe("* * * * *");
    });
  });

  describe("schedule.agent", () => {
    it("creates an agent schedule", async () => {
      const { box, fetchMock } = await createTestBox();
      const schedule = {
        id: "sched-2",
        type: "agent",
        cron: "0 9 * * *",
        prompt: "Run tests",
        created_at: 1710000000,
      };
      fetchMock.mockResolvedValueOnce(mockResponse(schedule));

      const result = await box.schedule.agent({
        cron: "0 9 * * *",
        prompt: "Run tests",
      });

      expect(result.id).toBe("sched-2");
      expect(result.type).toBe("agent");

      const body = JSON.parse(fetchMock.mock.calls[1]![1]?.body as string);
      expect(body.type).toBe("agent");
      expect(body.prompt).toBe("Run tests");
      expect(body.cron).toBe("0 9 * * *");
    });
  });

  describe("schedule.list", () => {
    it("returns all schedules", async () => {
      const { box, fetchMock } = await createTestBox();
      const schedules = [
        { id: "sched-1", type: "exec", cron: "* * * * *", created_at: 1710000000 },
        { id: "sched-2", type: "agent", cron: "0 9 * * *", created_at: 1710000000 },
      ];
      fetchMock.mockResolvedValueOnce(mockResponse({ schedules }));

      const result = await box.schedule.list();

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe("sched-1");
      expect(result[1]!.id).toBe("sched-2");

      const [url, init] = fetchMock.mock.calls[1]!;
      expect(url).toContain("/schedules");
      expect(init?.method).toBe("GET");
    });
  });

  describe("schedule.get", () => {
    it("returns a specific schedule", async () => {
      const { box, fetchMock } = await createTestBox();
      const schedule = {
        id: "sched-1",
        type: "exec",
        cron: "* * * * *",
        command: ["echo", "hi"],
        created_at: 1710000000,
      };
      fetchMock.mockResolvedValueOnce(mockResponse(schedule));

      const result = await box.schedule.get("sched-1");

      expect(result.id).toBe("sched-1");

      const [url] = fetchMock.mock.calls[1]!;
      expect(url).toContain("/schedules/sched-1");
    });
  });

  describe("schedule.delete", () => {
    it("deletes a schedule", async () => {
      const { box, fetchMock } = await createTestBox();
      fetchMock.mockResolvedValueOnce(mockResponse(undefined));

      await box.schedule.delete("sched-1");

      const [url, init] = fetchMock.mock.calls[1]!;
      expect(url).toContain("/schedules/sched-1");
      expect(init?.method).toBe("DELETE");
    });
  });
});
