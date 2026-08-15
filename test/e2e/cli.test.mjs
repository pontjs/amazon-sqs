import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function run(...args) {
  return spawnSync(process.execPath, ["dist/bin/cli.cjs", ...args], {
    encoding: "utf8",
  });
}

describe("built CLI", () => {
  it("lists every generated action", () => {
    const result = run("list", "apis");
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.split("\n").includes("SendMessage"));
    assert.equal(result.stdout.split("\n").filter(Boolean).length, 23);
  });

  it("produces a redacted preview and rejects an unconfirmed call", () => {
    const input = '{"QueueUrl":"https://sqs.us-east-1.amazonaws.com/123456789012/example","MessageBody":"private"}';
    const preview = run("preview", "SendMessage", "--input", input);
    assert.equal(preview.status, 0, preview.stderr);
    const parsed = JSON.parse(preview.stdout);
    assert.equal(parsed.input.MessageBody, "[REDACTED]");
    assert.match(parsed.confirmationToken, /^ptx1_[a-f0-9]{64}$/);

    const denied = run("call", "SendMessage", "--input", input);
    assert.equal(denied.status, 1);
    assert.match(denied.stderr, /Call denied/);
  });
});
