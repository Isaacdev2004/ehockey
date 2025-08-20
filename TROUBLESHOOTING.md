# 🚨 Troubleshooting Guide

## Database Setup Issues

### Error: "policy already exists" or "duplicate_object"

**Problem**: The client is getting errors like:
```
ERROR: 42710: policy "Enable read access for all users" for table "leagues" already exists
```

**Solution**: Use the simplified database setup script:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Create New Query**
3. **Copy and paste** the content from `scripts/setup-database-simple.sql`
4. **Run the script**

This script uses `DROP POLICY IF EXISTS` and `CREATE TABLE IF NOT EXISTS` to safely handle existing objects.

### Error: "API error has occurred when trying to connect to the server"

**Problem**: The application can't connect to Supabase.

**Solutions**:

1. **Check Environment Variables**:
   - Ensure `.env.local` has correct Supabase credentials
   - Verify the URL and keys are copied exactly

2. **Check Supabase Project Status**:
   - Go to Supabase Dashboard
   - Ensure project is active (not paused)
   - Check if you're on the correct project

3. **Verify Database Tables**:
   - Go to Supabase Dashboard → Table Editor
   - Ensure all tables exist: `accounts`, `leagues`, `teams`, `players`, etc.

## Application Issues

### Error: "Your project's URL and Key are required"

**Problem**: Supabase client can't find environment variables.

**Solution**:
1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Check `.env.local` file exists** in the project root

3. **Verify environment variables**:
   ```bash
   # Windows PowerShell
   Get-Content .env.local
   ```

### Error: "Failed to generate title" or API errors

**Problem**: API endpoints are failing.

**Solutions**:

1. **Check Database Connection**:
   - Run the seed script to test connection:
   ```bash
   $env:NEXT_PUBLIC_SUPABASE_URL="your-url"; $env:SUPABASE_SERVICE_ROLE_KEY="your-key"; npm run seed
   ```

2. **Verify RLS Policies**:
   - The simplified setup script creates permissive policies for demo
   - Check Supabase Dashboard → Authentication → Policies

3. **Check API Routes**:
   - Ensure all API files exist in `src/app/api/`
   - Check browser console for specific error messages

## Quick Fix Commands

### Reset Database (if needed):
```sql
-- Run this in Supabase SQL Editor to clear everything
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Re-run Setup:
1. Run `scripts/setup-database-simple.sql`
2. Run the seed script
3. Restart the development server

## Environment Variables Checklist

Ensure your `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Issues & Solutions

### Issue: "Is it supposed to be private?"
**Answer**: No, the application is designed to be public-facing. The "private" error usually means:
- Database connection issues
- Missing environment variables
- RLS policies blocking access

### Issue: Application won't start
**Solution**:
1. Check if port 3000 is available
2. Ensure all dependencies are installed: `npm install`
3. Check for TypeScript errors: `npm run build`

### Issue: Demo users not working
**Solution**:
1. Re-run the seed script
2. Check if demo users exist in Supabase Dashboard → Table Editor → accounts

## Getting Help

If issues persist:

1. **Check the browser console** for specific error messages
2. **Check the terminal** where `npm run dev` is running
3. **Verify Supabase project settings**:
   - API settings match your `.env.local`
   - Project is not paused
   - Database is accessible

## Success Indicators

✅ **Application loads** at http://localhost:3000  
✅ **No console errors** in browser  
✅ **Seed script runs** without errors  
✅ **Demo users can login** (player@ehockey.net, etc.)  
✅ **All panels accessible** (Player, Manager, Admin)  

If all these work, the application is ready for use! 🎉
