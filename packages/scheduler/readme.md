# Scheduler ⏰

Scheduler for show update and insertions.

```
   +--------------------------+
   | Emit event every 2 hours |
   +------------+-------------+
                |
                |
                v
+-----------------------------------+
| Fetch updated shows from TheTvDB  |
| Fetch all titels from Dragonstone |
| Compare and decide what to update |
+----------------+------------------+
                 |
                 |
                 v
 +---------------+---------------+
 | Emit event to show-update for |
 | every show and episode list   |
 +-------------------------------+
```
