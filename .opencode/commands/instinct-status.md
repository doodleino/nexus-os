---
description: Show learned instincts (project + global) with confidence
agent: build
---

# Instinct Status Command

Show instinct status from continuous-learning-v2: $ARGUMENTS

## Your Task

Resolve the active NEXUS-OS plugin root with the same walker `hooks/hooks.json`
uses (env var → standard install → known plugin roots → plugin cache →
fallback), then run the instinct CLI. This avoids reading a stale legacy
`~/.claude/skills/continuous-learning-v2/` install when the plugin is
active under `~/.claude/plugins/cache/...` (#2037).

```bash
NEXUS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "var r=(function(){var p=require('path'),f=require('fs'),o=require('os');var e=process.env.NEXUS_ROOT||process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var d=p.join(o.homedir(),'.claude');function L(x){try{return require(p.join(x,'scripts','lib','resolve-nexus-root')).resolveNexusRoot()}catch(_){return null}}var r=L(d);if(r)return r;var s=['nexus-os','nexus-os@nexus-os','marketplaces/nexus-os'];for(var i=0;i<s.length;i++){r=L(p.join(d,'plugins',s[i]));if(r)return r}try{var g=['nexus-os'];for(var j=0;j<g.length;j++){var c=p.join(d,'plugins','cache',g[j]);if(f.existsSync(c)){var O=f.readdirSync(c);for(var k=0;k<O.length;k++){var q=p.join(c,O[k]);var V=f.readdirSync(q);for(var m=0;m<V.length;m++){r=L(p.join(q,V[m]));if(r)return r}}}}}catch(_){}return d})();console.log(r)")}"
python3 "$NEXUS_ROOT/skills/continuous-learning-v2/scripts/instinct-cli.py" status
```

## Behavior Notes

- Output includes both project-scoped and global instincts.
- Project instincts override global instincts when IDs conflict.
- Output is grouped by domain with confidence bars.
- This command does not support extra filters in v2.1.
