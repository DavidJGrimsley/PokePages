
-- Update main event_counters row for shiny-chien-pao
UPDATE public.event_counters
SET
  total_count = 421,
  updated_at = '2025-08-13T05:30:38.290Z'::timestamptz
WHERE event_key = 'chien-pao';

-- Upsert player counts for chien-pao event using the correct table structure
INSERT INTO public.anonymous_event_participation (event_id, anonymous_id, contribution_count, last_contributed_at, created_at, updated_at)
SELECT 
  (SELECT id FROM public.event_counters WHERE event_key = 'chien-pao'),
  anonymous_data.anonymous_id,
  anonymous_data.contribution_count,
  '2025-08-13T05:30:38.290Z'::timestamptz,
  '2025-08-13T05:30:38.290Z'::timestamptz,
  '2025-08-13T05:30:38.290Z'::timestamptz
FROM (VALUES
  ('player_m13etxw3e_mdw1z7q4', 6),
  ('player_xly3gn1l3_mdwn5l7k', 18),
  ('player_mgz5pmwna_mdpl359u', 114),
  ('player_0uuc4l5g6_mdwzu37h', 46),
  ('player_pkamcvdqw_mdx00i5e', 35),
  ('player_rdn3yt0l7_mdxacxx1', 1),
  ('player_n8o7gbngc_mdxa3hl6', 2),
  ('player_piyevpji2_mdxbh4an', 1),
  ('player_vyw4in8s2_mdxcc1p1', 1),
  ('player_nbk6puup5_mdxexbbo', 8),
  ('player_85wrjfw47_mdxhjya1', 1),
  ('player_scpoupm87_mdxsdacf', 1),
  ('player_e79lgl9gy_mdpfxim1', 27),
  ('player_gsvnzzh3a_mdy1bt8d', 1),
  ('player_kohwu9t3u_mdyipw7p', 5),
  ('player_hyj0gcvdr_mdykwz2p', 1),
  ('player_99v85zm30_mdz3oov8', 2),
  ('player_6ypadqpje_mdz5n5pi', 1),
  ('player_zjgfyowhw_mdz6yvn8', 2),
  ('player_asmfnk1f3_mdz85bo6', 1),
  ('player_7yae9de6w_mdz8cxtn', 2),
  ('player_3tlbg9bxw_mdzzi300', 2),
  ('player_kx9fg1zbm_me1b0e3b', 2),
  ('player_iyphkwk5v_me1qntc7', 1),
  ('player_dk9aysvem_me1vua9c', 1),
  ('player_48wncei99_me1wxoh0', 1),
  ('player_not264wl1_me1xegen', 10),
  ('player_xdpardg1m_me2ac4w7', 5),
  ('player_kr7mha5x4_me3d03wo', 1),
  ('player_fpur9cmkc_me3fw7x6', 3),
  ('player_etu2kfrk0_me4ehrfs', 9),
  ('player_tvq9ov3jl_me4wnf42', 2),
  ('player_idmuy8en1_me6dgzct', 1),
  ('player_7bq76yojs_me6nlykp', 64),
  ('player_s8bxm69g5_me6tzmho', 5),
  ('player_bebcq5dqy_me6p5hcf', 10),
  ('player_pug2o7e4a_mdrt4xms', 3),
  ('player_pjhbjlpt3_me8nfa0g', 2),
  ('player_w6ocqgyxk_me9j7741', 23)
) AS anonymous_data(anonymous_id, contribution_count)
ON CONFLICT (event_id, anonymous_id) DO UPDATE
SET contribution_count = EXCLUDED.contribution_count,
    last_contributed_at = EXCLUDED.last_contributed_at,
    updated_at = EXCLUDED.updated_at;