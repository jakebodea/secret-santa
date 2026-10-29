import { describe, expect, it } from "vitest";

import { planMail } from "./assignment-mail";

const players = [
  { email: "ann@example.com", id: "a", isAdmin: true, name: "Ann Lee" },
  { email: "bo@example.com", id: "b", isAdmin: false, name: "Bo" },
];
const assignments = [
  { giverId: "a", receiverId: "b" },
  { giverId: "b", receiverId: "a" },
];

describe(planMail, () => {
  it("emails each giver their receiver and links admins to compact results", () => {
    const { participants, admins } = planMail({
      assignments,
      origin: "https://supersimplesecretsanta.com",
      partyName: "Office",
      players,
    });

    expect(participants).toStrictEqual([
      {
        giverName: "Ann Lee",
        kind: "assignment",
        partyName: "Office",
        receiverName: "Bo",
        subject: "Hey Ann Lee! You've been assigned for Office...",
        to: "ann@example.com",
      },
      {
        giverName: "Bo",
        kind: "assignment",
        partyName: "Office",
        receiverName: "Ann Lee",
        subject: "Hey Bo! You've been assigned for Office...",
        to: "bo@example.com",
      },
    ]);
    const summaries = admins.map(({ resultsUrl, ...mail }) => {
      const url = new URL(resultsUrl);
      return {
        ...mail,
        data: JSON.parse(atob(url.searchParams.get("data") ?? "")),
        origin: url.origin,
      };
    });
    expect(summaries).toStrictEqual([
      {
        adminName: "Ann Lee",
        data: {
          assignments: [
            { giver: "Ann L", receiver: "Bo" },
            { giver: "Bo", receiver: "Ann L" },
          ],
          partyName: "Office",
        },
        kind: "admin",
        origin: "https://supersimplesecretsanta.com",
        partyName: "Office",
        subject: "Admin: Office Results",
        to: "ann@example.com",
      },
    ]);
  });

  it("falls back to Secret Santa when the party has no name", () => {
    const { participants } = planMail({
      assignments: [{ giverId: "b", receiverId: "a" }],
      origin: "http://localhost:3000",
      partyName: undefined,
      players,
    });
    expect(participants[0]?.subject).toBe(
      "Hey Bo! You've been assigned for Secret Santa..."
    );
  });

  it("refuses an assignment that names an unknown player", () => {
    expect(() =>
      planMail({
        assignments: [{ giverId: "a", receiverId: "zzz" }],
        origin: "http://localhost:3000",
        partyName: undefined,
        players,
      })
    ).toThrow("Invalid assignment: player not found");
  });

  it("skips givers and organizers without email", () => {
    const { participants, admins } = planMail({
      assignments: [
        { giverId: "k", receiverId: "b" },
        { giverId: "b", receiverId: "k" },
      ],
      origin: "http://localhost:3000",
      partyName: undefined,
      players: [
        { email: "", id: "k", isAdmin: true, name: "Kid" },
        { email: "bo@example.com", id: "b", isAdmin: false, name: "Bo" },
      ],
    });
    expect(participants.map((mail) => mail.to)).toStrictEqual([
      "bo@example.com",
    ]);
    expect(admins).toStrictEqual([]);
  });

  it("sends the summary to an organizer who sits out of the draw", () => {
    const { participants, admins } = planMail({
      assignments,
      origin: "http://localhost:3000",
      partyName: undefined,
      players: [
        ...players.map((player) => ({ ...player, isAdmin: false })),
        {
          email: "mom@example.com",
          id: "m",
          isAdmin: true,
          name: "Mom",
          sitsOut: true,
        },
      ],
    });
    expect(participants).toHaveLength(2);
    expect(admins.map((mail) => mail.to)).toStrictEqual(["mom@example.com"]);
  });
});
