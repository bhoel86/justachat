# JUSTACHAT VPS - COMMON COMMANDS

## Editing Files
```bash
# Open a file for editing
nano /var/www/justachat/<filepath>

# Save: Ctrl+O, Enter
# Exit: Ctrl+X
```

## Git Operations
```bash
cd /var/www/justachat
git pull origin main
# Or use safe-pull:
sudo bash public/vps-deploy/safe-pull.sh
```

## Building Frontend
```bash
cd /var/www/justachat
sudo chown -R unix:unix .
rm -rf dist node_modules/.vite
npm run build
```

## Docker / Supabase
```bash
# Check container status
sudo docker ps --format 'table {{.Names}}\t{{.Status}}'

# Restart all Supabase
cd /home/unix/supabase/docker && sudo docker compose --env-file .env down --remove-orphans && sudo docker compose --env-file .env up -d

# View logs for a container
sudo docker logs supabase-auth --tail 50
sudo docker logs supabase-kong --tail 50

# Database shell
sudo docker exec supabase-db psql -U supabase_admin -d postgres
```

## Edge Functions
```bash
# Mirror a function to runtime
sudo cp -r /var/www/justachat/supabase/functions/<func-name> /home/unix/supabase/docker/volumes/functions/main/

# Restart edge functions container
sudo docker restart supabase-edge-functions
```

## Health Checks
```bash
sudo bash /var/www/justachat/public/vps-deploy/health-check.sh
```

## Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

*Last updated: 2026-02-14*
