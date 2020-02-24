# Scheduler ⏰

Scheduler for show update and insertions.

```
   +-----------------------------+
   | Emit event every 30 minutes |
   +------------+----------------+
                |
                |
                v
+-----------------------------------+
| Fetch the ten oldes shows from    |
| Dragonstone                       |
+----------------+------------------+
                 |
                 |
                 v
 +---------------+---------------+
 | Emit a new event to           |
 | show-update for each show     |
 +-------------------------------+
```
