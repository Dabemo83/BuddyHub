# Getting your ESPN league ID and cookies

## League ID
Open your league on fantasy.espn.com. The URL contains `leagueId=XXXXXX` — that number is `ESPN_LEAGUE_ID`.

## Cookies (required for private leagues)
1. Log in to fantasy.espn.com in Chrome.
2. Open DevTools (Option+Cmd+I) -> Application -> Storage -> Cookies -> https://fantasy.espn.com.
3. Copy the **Value** of `espn_s2` -> `ESPN_S2`.
4. Copy the **Value** of `SWID` (including the `{ }` braces) -> `ESPN_SWID`.

Cookies expire every few months. When Standings/Stats show the "couldn't reach ESPN"
message, repeat these steps and update the values in Vercel -> Settings -> Environment Variables,
then redeploy.
