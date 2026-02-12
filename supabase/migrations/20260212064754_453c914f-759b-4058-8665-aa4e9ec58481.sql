-- Grant permissions on user_roles table to authenticated users
GRANT SELECT ON public.user_roles TO authenticated;

-- Also ensure profiles and profiles_public have proper grants
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Grant all necessary table permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_members TO authenticated;
GRANT SELECT ON public.bot_settings TO authenticated;
GRANT SELECT ON public.channel_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friend_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_messages TO authenticated;
GRANT SELECT, INSERT ON public.donation_clicks TO authenticated;
GRANT SELECT, UPDATE ON public.donation_settings TO authenticated;
GRANT SELECT ON public.registered_nicks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_channel_visits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_conversation_topics TO authenticated;
GRANT SELECT ON public.channel_registrations TO authenticated;
GRANT SELECT ON public.channel_moderation_settings TO authenticated;
GRANT SELECT ON public.room_admins TO authenticated;
GRANT SELECT ON public.art_pieces TO authenticated;
GRANT SELECT ON public.art_discussions TO authenticated;
GRANT SELECT ON public.bot_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.trivia_scores TO authenticated;
GRANT SELECT ON public.klines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_users TO authenticated;
GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.dating_profiles TO authenticated;
GRANT SELECT, INSERT ON public.dating_swipes TO authenticated;
GRANT SELECT, INSERT ON public.dating_matches TO authenticated;
GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT SELECT ON public.network_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT SELECT ON public.channel_access_list TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mutes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_mutes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_admins TO authenticated;
GRANT SELECT ON public.user_locations TO authenticated;
GRANT SELECT ON public.user_locations_public TO anon, authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.login_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bans TO authenticated;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channel_access_list TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.channel_moderation_settings TO authenticated;
GRANT SELECT, INSERT ON public.channel_registrations TO authenticated;