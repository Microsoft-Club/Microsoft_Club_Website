#!/usr/bin/env node
// PreToolUse guard: stop Claude from writing to .env files, which hold real secrets.
// .env.example stays editable. Exit code 2 blocks the tool call and shows the message to Claude.
let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    filePath = JSON.parse(input).tool_input?.file_path ?? '';
  } catch {
    process.exit(0);
  }
  const isEnvFile = /(^|[\\/])\.env(\.[^\\/]*)?$/.test(filePath);
  if (isEnvFile && !filePath.endsWith('.env.example')) {
    console.error('Blocked: .env files hold real secrets. Edit .env.example instead and set real values on Render / locally.');
    process.exit(2);
  }
  process.exit(0);
});
