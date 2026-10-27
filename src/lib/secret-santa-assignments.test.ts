import { describe, expect, test } from "vitest";

import { generateAssignments } from "./secret-santa-assignments";

const players = [
  { email: "a@example.com", id: "a", isAdmin: true, name: "Alice" },
  { email: "b@example.com", id: "b", isAdmin: false, name: "Bob" },
  { email: "c@example.com", id: "c", isAdmin: false, name: "Cara" },
];
const previous = [
  { giverId: "a", receiverId: "b" },
  { giverId: "b", receiverId: "c" },
  { giverId: "c", receiverId: "a" },
];

describe(generateAssignments, () => {
  test("redraw finds a different valid draw even with the same players", () => {
    const result = generateAssignments(players, [], previous);
    expect(result.success).toBeTruthy();
    expect(result.assignments).toStrictEqual(
      expect.arrayContaining([
        { giverId: "a", receiverId: "c" },
        { giverId: "b", receiverId: "a" },
        { giverId: "c", receiverId: "b" },
      ])
    );
  });

  test("a single possible draw is preserved rather than returned as a redraw", () => {
    const result = generateAssignments(
      players,
      [{ id: "rule", giverId: "a", receiverId: "c", bidirectional: false }],
      previous
    );
    expect(result.success).toBeFalsy();
    expect(result.error).toBe("No different draw available");
    expect(result.assignments).toBeUndefined();
    expect(previous).toHaveLength(3);
  });
});
