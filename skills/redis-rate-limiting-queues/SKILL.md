---
name: redis-rate-limiting-queues
description: Sliding-window rate limiters, token buckets, and distributed task queues using Redis and Valkey Lua scripts.
metadata:
  origin: NEXUS-OS
---

# Redis Rate Limiting & Distributed Queues

Use this skill to implement atomic sliding-window rate limiters and background worker queues using Redis / Valkey.

## Sliding-Window Rate Limiter (Atomic Lua)

```lua
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local clearBefore = now - window
redis.call('ZREMRANGEBYSCORE', key, '-inf', clearBefore)
local currentRequests = redis.call('ZCARD', key)

if currentRequests < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
else
    return 0
end
```
