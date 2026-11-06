import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, it } from 'vitest'

it('deployment preview confines deletion to build output and never invokes SSH restart', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mp-deploy-'))
  try {
    const log = join(dir, 'calls')
    for (const name of ['rsync', 'ssh']) {
      const file = join(dir, name)
      writeFileSync(file, `#!/bin/sh\nprintf '%s\\n' '${name}' "$@" >> "$DEPLOY_TEST_LOG"\n`)
      chmodSync(file, 0o755)
    }
    mkdirSync(join(dir, 'scripts'))
    mkdirSync(join(dir, '.output/server'), { recursive: true })
    writeFileSync(join(dir, '.output/server/index.mjs'), '')
    const script = join(dir, 'scripts/deploy.sh')
    writeFileSync(script, readFileSync(resolve('scripts/deploy.sh')))
    const env = { ...process.env, PATH: `${dir}:${process.env.PATH}`, DEPLOY_TEST_LOG: log, DEPLOY_SERVER: 'deploy@test-host', DEPLOY_DIR: '/opt/maplenpine-staging' }
    const result = spawnSync('bash', [script], { env, encoding: 'utf8' })
    expect(result.status, result.stderr).toBe(0)
    const calls = readFileSync(log, 'utf8')
    expect(calls).toContain('--dry-run')
    expect(calls).toContain('/opt/maplenpine-staging/.output/')
    expect(calls).not.toContain('\nssh\n')
    const transfers = calls.split('rsync\n').slice(1)
    expect(transfers[0]).toContain('--delete')
    expect(transfers[1]).not.toContain('--delete')
    expect(transfers[1]).toContain('--dry-run')
    for (const target of ['/', '/opt/../production', '/opt/app;touch-bad']) {
      const invalid = spawnSync('bash', [script], { env: { ...env, DEPLOY_DIR: target }, encoding: 'utf8' })
      expect(invalid.status).not.toBe(0)
    }
    expect(readFileSync(log, 'utf8')).toBe(calls)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
