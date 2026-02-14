

# VPS Fixes and Changes -- 10-Item Plan

This plan addresses all 10 issues reported for the VPS. Each fix includes the code changes and VPS CLI commands needed.

---

## Issue 1: Profile Name Change Not Working

**Problem**: The profile edit modal uses `supabase.functions.invoke('upload-image')` and `supabase.auth.updateUser()` which rely on the Supabase JS client -- known to hang on VPS. The username change itself uses REST helpers correctly, but the password change still uses the JS client which can block the entire save.

**Fix**: Replace `supabase.auth.updateUser()` for password changes with a direct REST call to the GoTrue endpoint. Also ensure the profile save button works independently of the password tab.

**VPS sync**:
```
cd /var/www/justachat && git pull origin main && npm run build && sudo cp -r dist/* /var/www/justachat/dist/
```

---

## Issue 2: Chat Not Working

**Problem**: The console logs show `JWT expired` errors on all authenticated REST calls. The `restSelect` function uses a cached token that is not being refreshed when the JWT expires. The `supabase.auth.onAuthStateChange` listener should refresh the token, but the auto-refresh may not be triggering properly on VPS.

**Fix**: Update `supabaseRest.ts` to add a fallback: when a REST call returns 401, attempt one token refresh via `supabase.auth.refreshSession()` and retry the request. This self-healing pattern ensures expired tokens don't break the entire chat.

**VPS sync**: Same build/deploy as above.

---

## Issue 3: Sending Images in Chat Not Working

**Problem**: The `upload-image` edge function may not be synced to VPS Docker volumes, or the function is calling Lovable Cloud storage URLs instead of VPS-local storage.

**Fix**: Verify the `upload-image` edge function code handles VPS URL mapping. The existing `fix-upload-image.sh` script should handle this. Add a diagnostic note to the KB.

**VPS command**:
```
sudo bash /var/www/justachat/public/vps-deploy/fix-upload-image.sh
```

---

## Issue 4: Friends List Not Working

**Problem**: Friends list queries (`useFriends.ts`) likely fail with 401 JWT expired errors (same root cause as Issue 2). Fixing the token refresh in Issue 2 will resolve this.

**Fix**: Covered by Issue 2's token retry logic.

---

## Issue 5: Lobby Count Not Accurate

**Problem**: The lobby member count queries are also failing with 401 errors (visible in console logs). The `channel_members` REST calls return empty due to expired JWT. Same root cause as Issue 2.

**Fix**: Covered by Issue 2's token retry logic. Additionally, ensure the lobby count polling uses the anon key as fallback for public-readable data (channel_members has a public SELECT policy).

---

## Issue 6: Moderator Bot Not Responding to Chat

**Problem**: The moderator bot system relies on the `chat-bot` or `chat-bot-cloud` edge function. On VPS, this function needs to be synced to Docker volumes and the bot_settings table must have the correct channels enabled.

**Fix**: Ensure the edge function is synced and verify `bot_settings` has `moderator_bots_enabled = true`.

**VPS commands**:
```
# Check bot settings
sudo bash -c 'cd /root/supabase/docker && docker exec supabase-db psql -U supabase_admin -d postgres -c "SELECT * FROM public.bot_settings LIMIT 1;"'

# Sync edge function
sudo cp -r /var/www/justachat/supabase/functions/chat-bot/* /root/supabase/docker/volumes/functions/main/chat-bot/
sudo bash -c 'cd /root/supabase/docker && docker compose restart functions'
```

---

## Issue 7: Users Can See Each Other

**Clarification needed**: This sounds like it might mean users CAN'T see each other in the member list, or it could mean something about visibility/privacy. Based on the JWT expired errors, the member list is failing to load -- so users likely CANNOT see each other. This is fixed by Issue 2's token retry.

---

## Issue 8: Themes Icon in Chat Rooms (Not Just Lobby)

**Problem**: The `ThemeSelector` component is only rendered in `Home.tsx` (the lobby). It is not included in the `ChatHeader.tsx` or anywhere in the chat room view.

**Fix**: Add the `ThemeSelector` component to `ChatHeader.tsx` so users can change themes from within any chat room.

---

## Issue 9: Remove API Keys Section from Admin

**Problem**: The `/admin/api` route and its sidebar link should be removed.

**Fix**:
- Remove the `{ label: "API Keys", href: "/admin/api", icon: Key, ownerOnly: true }` entry from `AdminSidebar.tsx`
- Remove the route `<Route path="/admin/api" element={<AdminAPI />} />` from `App.tsx`
- Delete `src/pages/AdminAPI.tsx`

---

## Issue 10: Remove Deploy Section from Admin

**Problem**: The `/admin/deploy` route and its sidebar link should be removed.

**Fix**:
- Remove the `{ label: "Deploy", href: "/admin/deploy", icon: Rocket, ownerOnly: true }` entry from `AdminSidebar.tsx`
- Remove the route `<Route path="/admin/deploy" element={<AdminDeploy />} />` from `App.tsx`
- Delete `src/pages/AdminDeploy.tsx`

---

## Technical Summary

| # | Issue | Root Cause | Fix Location |
|---|-------|------------|-------------|
| 1 | Profile name change | JS client hanging | `ProfileEditModal.tsx` |
| 2 | Chat not working | JWT expired, no retry | `supabaseRest.ts` |
| 3 | Images not sending | Edge function not synced | VPS script |
| 4 | Friends list | JWT expired (same as 2) | `supabaseRest.ts` |
| 5 | Lobby count | JWT expired (same as 2) | `supabaseRest.ts` |
| 6 | Bot not responding | Edge function not synced | VPS script |
| 7 | Users visibility | JWT expired (same as 2) | `supabaseRest.ts` |
| 8 | Themes in chat rooms | ThemeSelector missing | `ChatHeader.tsx` |
| 9 | Remove API Keys | Admin nav/route cleanup | `AdminSidebar.tsx`, `App.tsx` |
| 10 | Remove Deploy | Admin nav/route cleanup | `AdminSidebar.tsx`, `App.tsx` |

## Files Modified
- `src/lib/supabaseRest.ts` -- Add 401 retry with token refresh
- `src/components/profile/ProfileEditModal.tsx` -- Replace JS client password update with REST
- `src/components/chat/ChatHeader.tsx` -- Add ThemeSelector
- `src/components/admin/AdminSidebar.tsx` -- Remove API Keys and Deploy nav items
- `src/App.tsx` -- Remove API Keys and Deploy routes

## Files Deleted
- `src/pages/AdminAPI.tsx`
- `src/pages/AdminDeploy.tsx`

## KB Issue File Created
- `docs/vps-kb/issues/jwt-expired-retry.md` -- Documents the JWT retry fix

## VPS Deploy Steps (after approval and implementation)
```bash
cd /var/www/justachat
git pull origin main
npm run build
sudo cp -r dist/* /var/www/justachat/dist/
sudo bash /var/www/justachat/public/vps-deploy/fix-upload-image.sh
```

