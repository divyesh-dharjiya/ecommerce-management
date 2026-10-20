import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/download";

describe("toCsv", () => {
  it("quotes every field and escapes quotes", () => {
    expect(toCsv(["Name"], [['Say "hi"']])).toBe('"Name"\n"Say ""hi"""');
  });

  it("neutralises spreadsheet formulas in text but keeps negative numbers", () => {
    const csv = toCsv(["Name", "Total"], [['=HYPERLINK("x")', -5]]);
    expect(csv.split("\n")[1]).toBe('"\'=HYPERLINK(""x"")","-5"');
  });
});
