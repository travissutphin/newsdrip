--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.deliveries (
    id integer NOT NULL,
    newsletter_id integer NOT NULL,
    subscriber_id integer NOT NULL,
    method character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    sent_at timestamp without time zone DEFAULT now(),
    opened_at timestamp without time zone
);


ALTER TABLE public.deliveries OWNER TO neondb_owner;

--
-- Name: deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.deliveries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deliveries_id_seq OWNER TO neondb_owner;

--
-- Name: deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.deliveries_id_seq OWNED BY public.deliveries.id;


--
-- Name: newsletter_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletter_categories (
    id integer NOT NULL,
    newsletter_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.newsletter_categories OWNER TO neondb_owner;

--
-- Name: newsletter_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.newsletter_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_categories_id_seq OWNER TO neondb_owner;

--
-- Name: newsletter_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.newsletter_categories_id_seq OWNED BY public.newsletter_categories.id;


--
-- Name: newsletters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletters (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    subject character varying(255),
    content text NOT NULL,
    author_id character varying NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    slug character varying(255),
    meta_description text,
    html_content text
);


ALTER TABLE public.newsletters OWNER TO neondb_owner;

--
-- Name: newsletters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.newsletters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletters_id_seq OWNER TO neondb_owner;

--
-- Name: newsletters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.newsletters_id_seq OWNED BY public.newsletters.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: subscriber_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscriber_categories (
    id integer NOT NULL,
    subscriber_id integer NOT NULL,
    category_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscriber_categories OWNER TO neondb_owner;

--
-- Name: subscriber_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscriber_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriber_categories_id_seq OWNER TO neondb_owner;

--
-- Name: subscriber_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscriber_categories_id_seq OWNED BY public.subscriber_categories.id;


--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscribers (
    id integer NOT NULL,
    email character varying(255),
    phone character varying(20),
    contact_method character varying(10) NOT NULL,
    frequency character varying(20) DEFAULT 'weekly'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    unsubscribe_token character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    preferences_token character varying(64)
);


ALTER TABLE public.subscribers OWNER TO neondb_owner;

--
-- Name: subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscribers_id_seq OWNER TO neondb_owner;

--
-- Name: subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscribers_id_seq OWNED BY public.subscribers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: deliveries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries ALTER COLUMN id SET DEFAULT nextval('public.deliveries_id_seq'::regclass);


--
-- Name: newsletter_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_categories ALTER COLUMN id SET DEFAULT nextval('public.newsletter_categories_id_seq'::regclass);


--
-- Name: newsletters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters ALTER COLUMN id SET DEFAULT nextval('public.newsletters_id_seq'::regclass);


--
-- Name: subscriber_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriber_categories ALTER COLUMN id SET DEFAULT nextval('public.subscriber_categories_id_seq'::regclass);


--
-- Name: subscribers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers ALTER COLUMN id SET DEFAULT nextval('public.subscribers_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, description, created_at) FROM stdin;
6	Pittsburgh Pirates		2025-07-21 17:40:30.526626
3	Pittsburgh Steelers	\N	2025-07-21 17:21:54.507387
1	AI	\N	2025-07-21 17:21:54.507387
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.deliveries (id, newsletter_id, subscriber_id, method, status, sent_at, opened_at) FROM stdin;
2	3	3	email	failed	2025-07-21 19:10:10.222895	\N
3	2	2	email	failed	2025-07-21 19:23:25.64042	\N
4	4	3	email	sent	2025-07-21 19:36:16.465052	\N
5	5	2	email	sent	2025-07-21 19:38:35.998946	\N
6	6	2	email	sent	2025-07-21 19:47:10.036925	\N
7	7	2	email	sent	2025-07-21 20:13:06.056237	\N
8	7	3	email	sent	2025-07-21 20:13:06.155929	\N
9	8	2	email	sent	2025-07-21 20:18:00.299739	\N
10	8	3	email	sent	2025-07-21 20:18:00.399607	\N
11	9	2	email	sent	2025-07-21 20:26:37.154457	\N
12	9	3	email	sent	2025-07-21 20:26:37.251005	\N
13	10	2	email	sent	2025-07-21 20:37:37.891161	\N
14	10	3	email	sent	2025-07-21 20:37:37.978437	\N
15	11	2	email	sent	2025-07-21 20:45:25.805381	\N
16	11	3	email	sent	2025-07-21 20:45:25.897814	\N
17	12	2	email	sent	2025-07-21 20:57:49.575804	\N
18	12	2	email	sent	2025-07-21 20:57:49.663852	\N
19	12	3	email	sent	2025-07-21 20:57:49.744716	\N
20	12	2	email	sent	2025-07-21 20:57:49.82676	\N
\.


--
-- Data for Name: newsletter_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.newsletter_categories (id, newsletter_id, category_id) FROM stdin;
1	1	6
2	2	6
3	3	1
4	4	1
5	5	6
6	6	6
7	7	1
8	7	6
9	8	1
10	8	6
11	9	1
12	9	6
13	10	6
14	10	1
15	11	1
16	11	6
17	12	1
18	12	6
19	12	3
\.


--
-- Data for Name: newsletters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.newsletters (id, title, subject, content, author_id, status, sent_at, created_at, updated_at, slug, meta_description, html_content) FROM stdin;
1	Bucs Weekly Recap: July 13-19		Pittsburgh Pirates Highlights: July 13-19, 2025\nGame Highlights\n\nJuly 12-13 vs. Minnesota Twins: Game highlights were featured, but specific outcomes were not detailed. Paul Skenes continued to shine, reinforcing his status as a key asset for the Pirates.\nJuly 18-19 vs. Chicago White Sox (Yinzerpalooza Weekend):\nThe Pirates suffered a 10-1 loss to the White Sox on July 18, marking one of their worst performances post-All-Star break.\nThe series included a tribute to Pittsburgh native Mac Miller, with a special giveaway for fans and a new item for purchase at PNC Park. Fans showed up early, more for the giveaway than the game itself.\nThe Pirates were swept by the White Sox, highlighting their struggles as they entered the trade deadline as likely sellers.\n\n\n\nTrades and Transactions\n\nAdam Frazier Trade: The Pirates traded utilityman Adam Frazier to the Kansas City Royals for minor league infielder Cam Devanney. Devanney, 28, is slashing .272/.366/.565 with 18 HRs in Triple-A and has played primarily shortstop, with some experience at third, second, and left field.\nLiover Peguero Recalled: The Pirates recalled shortstop Liover Peguero from Triple-A Indianapolis to bolster their 26-man roster.\nJohan Oviedo Rehab Update: Starting pitcher Johan Oviedo, recovering from a long-term injury, had his rehab assignment transferred from Single-A Bradenton to Double-A Altoona on July 18.\nRamírez Called Up: The Pirates called up reliever Ramírez (30) from Triple-A, where he posted a 3.19 ERA with a 29.3% strikeout rate. He is out of options but could be retained via arbitration if he performs well.\nTrade Rumors:\nMitch Keller: Rumors are heating up that Keller, with a 3.48 ERA and under contract for three more years at $54.5M, could be traded by July 31. Teams like the Mets, Yankees, and Blue Jays are interested, with potential returns including prospects like Ballesteros or Clifford.\nDavid Bednar: The Pirates’ closer, earning $5.9M in 2025, is a likely trade candidate. Despite a rough start, he’s posted a 1.74 ERA over his last 31 innings with a 36.4% strikeout rate.\nOther Potential Trades: Relievers Dennis Santana and Caleb Ferguson are also mentioned as possible trade pieces, with Ferguson quietly excelling in the bullpen.\n\n\n\nMinor League News\n\nCam Devanney Acquisition: As part of the Frazier trade, Devanney’s strong Triple-A performance (18 HRs, .272/.366/.565) adds depth to the Pirates’ infield prospects.\nJohan Oviedo’s Rehab: His move to Double-A Altoona signals progress in his recovery, with hopes of returning to the majors soon.\nKonnor Griffin’s Performance: Top prospect Konnor Griffin (MLB No. 42) has impressed in Single-A Bradenton, hitting 16 doubles, 13 HRs, and 53 RBIs in 73 games.\nBubba Chandler: Top 100 prospect Bubba Chandler (MLB No. 14) continues to shine in Triple-A Indianapolis, showing promise as a future rotation piece.\n\nOther Fun Info\n\nYinzerpalooza Weekend: The Pirates celebrated Pittsburgh culture during their White Sox series, honoring local icons like Mac Miller. The event drew significant fan interest, particularly for giveaways.\nPaul Skenes’ All-Star Dominance: Skenes, the Pirates’ lone All-Star representative, dazzled in the 2025 MLB All-Star Game, throwing mostly fastballs (four over 100 mph) and earning praise for his performance.\nOneil Cruz’s HR Derby: Center fielder Oneil Cruz participated in the Home Run Derby, showcasing his power on a big stage.\n2025 Draft Success: The Pirates’ 2025 draft class was rated the second-best in baseball by MLB Pipeline’s Jim Callis, trailing only the Orioles.\n\nInjury Updates\n\nOneil Cruz: Sidelined briefly with right hip soreness but returned to pinch-hit and run bases without issue by July 13.\nChase Shugart: Placed on the 15-day IL with left knee inflammation; received an injection and aims to resume throwing soon.\nRyan Borucki: Began a rehab assignment with Single-A Bradenton on July 8, with another outing planned.\nTim Mayza: Progressing from a shoulder lat strain, throwing out to 120 feet with good velocity.\n\nSummary\nThe Pirates struggled on the field, getting swept by the White Sox and facing a 10th consecutive season without playoffs. Trade rumors swirl around key players like Mitch Keller and David Bednar, with the team likely to sell at the deadline. Minor league prospects like Konnor Griffin and Bubba Chandler offer hope, while Paul Skenes and Oneil Cruz provided exciting All-Star moments. The Yinzerpalooza weekend added a fun cultural touch despite the team’s on-field woes.	40678640	sent	2025-07-21 18:22:54.442	2025-07-21 18:22:22.362954	2025-07-21 18:22:54.442	\N	\N	\N
3	AI for today	AI for today	this sia test of the email newsletter	40678640	sent	2025-07-21 19:10:10.267	2025-07-21 19:04:51.595788	2025-07-21 19:10:10.268	\N	\N	\N
2	Bucs news july 13-17 2024	Bucs news july 13-17 2024	ecent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses.yardbarker.comespn.com\nPaul Skenes: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made.yardbarker.comfoxsports.comespn.com\nMitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk rate, he’s attracted interest from teams like the Yankees, Mets, and Blue Jays. Keller is under contract for three more years at $54.5 million, making him valuable, but the Pirates may trade him to acquire offensive talent and make room for younger pitchers. Potential trade packages include prospects like Moises Ballesteros and Jack Neely from the Cubs or Ronny Mauricio and Jonah Tong from the Mets.mlbtraderumors.comespn.combucsdugout.com\nInjuries: Jared Jones is expected to undergo Tommy John surgery for a right UCL sprain, sidelining him for the rest of 2025 and likely most of 2026. Oneil Cruz returned to center field after missing a game due to hip soreness. Johan Oviedo (UCL surgery) is progressing in his rehab, recently throwing 3 1/3 innings at Double-A Altoona.foxsports.commlb.com\nRoster Moves: The Pirates recalled outfielder Jack Suwinski from Triple-A Indianapolis and placed pitcher Chase Shugart on the 15-day injured list with left knee inflammation. Infielder Liover Peguero was also recalled from Triple-A.pittsburghbaseballnow.commlb.com	40678640	sent	2025-07-21 19:23:25.665	2025-07-21 18:38:06.958535	2025-07-21 19:23:25.665	\N	\N	\N
4	ai at 3:35	AI at 3:35	this is to test the email sending	40678640	sent	2025-07-21 19:36:16.5	2025-07-21 19:35:35.509406	2025-07-21 19:36:16.5	\N	\N	\N
5	pirates news	pirate news	Here's the latest news on the Pittsburgh Pirates, covering Major League Baseball (MLB), Minor League Baseball, and trades, based on recent developments:\n\n### Major League Baseball News\n- **Recent Performance**: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses.[](https://www.yardbarker.com/mlb/teams/pittsburgh_pirates/22)[](https://www.espn.com/mlb/team/_/name/pit/pittsburgh-pirates)\n- **Paul Skenes**: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made.[](https://www.yardbarker.com/mlb/teams/pittsburgh_pirates/22)[](https://www.foxsports.com/mlb/pittsburgh-pirates-team)[](https://www.espn.com/mlb/story/_/id/45434376/mlb-2025-early-trade-deadline-preview-all-30-teams-jeff-passan-buehler-bichette-gallen)\n- **Mitch Keller Trade Rumors**: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk rate, he’s attracted interest from teams like the Yankees, Mets, and Blue Jays. Keller is under contract for three more years at $54.5 million, making him valuable, but the Pirates may trade him to acquire offensive talent and make room for younger pitchers. Potential trade packages include prospects like Moises Ballesteros and Jack Neely from the Cubs or Ronny Mauricio and Jonah Tong from the Mets.[](https://www.mlbtraderumors.com/pittsburgh-pirates)[](https://www.espn.com/mlb/story/_/id/45701063/2025-mlb-trade-deadline-addition-top-contenders-tigers-dodgers-cubs-mets-yankees)[](https://www.bucsdugout.com/2025/7/14/24467349/two-trade-scenarios-for-pittsburgh-pirates-mitch-keller-mlb)\n- **Injuries**: Jared Jones is expected to undergo Tommy John surgery for a right UCL sprain, sidelining him for the rest of 2025 and likely most of 2026. Oneil Cruz returned to center field after missing a game due to hip soreness. Johan Oviedo (UCL surgery) is progressing in his rehab, recently throwing 3 1/3 innings at Double-A Altoona.[](https://www.foxsports.com/mlb/pittsburgh-pirates-team)[](https://www.mlb.com/news/pirates-injuries-and-roster-moves)\n- **Roster Moves**: The Pirates recalled outfielder Jack Suwinski from Triple-A Indianapolis and placed pitcher Chase Shugart on the 15-day injured list with left knee inflammation. Infielder Liover Peguero was also recalled from Triple-A.[](https://pittsburghbaseballnow.com/)[](https://www.mlb.com/news/pirates-injuries-and-roster-moves)\n\n### Minor League Baseball News\n- **Prospect Updates**: The Pirates’ 2025 draft class is rated the second-best in baseball by MLB Pipeline’s Jim Callis, trailing only the Baltimore Orioles. They selected prep right-hander Seth Hernandez with the sixth overall pick. Top prospects like Bubba Chandler (Triple-A Indianapolis, MLB No. 14) and Konnor Griffin (Single-A Bradenton, MLB No. 42) are projected to start the season in the minors, while Thomas Harrington (MLB No. 78) is already with the MLB club.[](https://x.com/MLB/status/1944527427159601394)[](https://www.mlb.com/pirates/news)[](https://bleacherreport.com/pittsburgh-pirates)\n- **Transactions**: The Pirates released outfielder Matt Gorski after designating him for assignment to make room for reliever Yohan Ramírez. Colin Holderman’s rehab assignment ended, and he was optioned to Triple-A Indianapolis.[](https://www.mlbtraderumors.com/pittsburgh-pirates)[](https://www.yardbarker.com/mlb/teams/pittsburgh_pirates/22)\n- **Indianapolis Indians**: The Triple-A affiliate scored a season-high 13 runs in a series-clinching win over the Louisville Bats.[](https://www.milb.com/fans/affiliates/pirates)\n\n### Trades\n- **Adam Frazier Trade**: The Pirates traded utilityman Adam Frazier to the Kansas City Royals for minor league infielder Cam Devanney. Devanney, who has played mostly shortstop but also second, third, and left field, could see time at shortstop if Isiah Kiner-Falefa is traded. He has three minor league options remaining, suggesting a potential utility role long-term.[](https://www.mlbtraderumors.com/pittsburgh-pirates)[](https://pittsburghbaseballnow.com/)\n- **Tanner Rainey**: The Pirates released right-hander Tanner Rainey, who had been pitching in Triple-A Indianapolis after being designated for assignment. He has since signed a minor league deal with the Detroit Tigers.[](https://www.mlbtraderumors.com/pittsburgh-pirates)[](https://www.yardbarker.com/mlb/teams/pittsburgh_pirates/22)\n- **Trade Deadline Outlook**: With the Pirates at 39-58 and out of contention, they are expected to be sellers at the July 31 deadline. Besides Keller, players like Isiah Kiner-Falefa, Tommy Pham, Andrew Heaney, Ke’Bryan Hayes, and Bryan Reynolds could be traded to acquire young talent. The Pirates aim to bolster their offense, which has been a weak point, while making room for prospects like Bubba Chandler, Hunter Barco, and Braxton Ashcraft.[](https://www.espn.com/mlb/story/_/id/45701063/2025-mlb-trade-deadline-addition-top-contenders-tigers-dodgers-cubs-mets-yankees)[](https://www.bucsdugout.com/2025/7/14/24467349/two-trade-scenarios-for-pittsburgh-pirates-mitch-keller-mlb)[](https://www.espn.com/mlb/story/_/id/45434376/mlb-2025-early-trade-deadline-preview-all-30-teams-jeff-passan-buehler-bichette-gallen)\n\n### Additional Notes\n- **Yinzerpalooza Weekend**: The Pirates are hosting a “Yinzerpalooza” weekend at PNC Park, honoring Pittsburgh icons like Mac Miller with themed giveaways, though fan frustration is high due to the team’s poor performance.[](https://www.yardbarker.com/mlb/teams/pittsburgh_pirates/22)[](https://pittsburghbaseballnow.com/)\n- **Fan Sentiment**: Fans have expressed disappointment with the front office, booing during recent losses, reflecting ongoing frustration with the team’s low payroll and lack of competitiveness despite talents like Skenes.[](https://www.yardbarker.com/mlb/teams/pittsburgh_pirates/22)[](https://www.foxsports.com/mlb/pittsburgh-pirates-team)\n\nFor further details, check official sources like MLB.com, PittsburghBaseballNow.com, or follow the Pirates’ official X account (@Pirates) for real-time updates. If you want specific trade scenarios or prospect analysis, let me know!	40678640	sent	2025-07-21 19:38:36.036	2025-07-21 19:38:24.760384	2025-07-21 19:38:36.036	\N	\N	\N
6	Pirates News	Pirate News for Today	Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses.yardbarker.comespn.com\n\nPaul Skenes: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made.yardbarker.comfoxsports.comespn.com	40678640	sent	2025-07-21 19:47:10.072	2025-07-21 19:46:04.896034	2025-07-21 19:47:10.072	\N	\N	\N
7	bucs-xyz123	bucs-xyz123	Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses.\n\nPaul Skenes: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made.	40678640	sent	2025-07-21 20:13:06.186	2025-07-21 20:06:01.773772	2025-07-21 20:13:06.186	bucs-xyz123-7	Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...	<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>bucs-xyz123 | Newsletter Archive</title>\n    <meta name="description" content="Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...">\n    <meta name="robots" content="index, follow">\n    \n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="bucs-xyz123">\n    <meta property="og:description" content="Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...">\n    <meta property="og:site_name" content="NewsletterHub">\n    \n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="bucs-xyz123">\n    <meta name="twitter:description" content="Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...">\n    \n    <!-- Structured Data -->\n    <script type="application/ld+json">\n    {\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "bucs-xyz123",\n  "description": "Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...",\n  "datePublished": "2025-07-21T20:06:01.773Z",\n  "author": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  }\n}\n    </script>\n    \n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            margin: 0;\n            padding: 0;\n            background-color: #f8f9fa;\n            color: #333;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            min-height: 100vh;\n        }\n        .header {\n            background: linear-gradient(135deg, #2563eb, #1d4ed8);\n            color: white;\n            padding: 2rem;\n            text-align: center;\n        }\n        .header h1 {\n            margin: 0;\n            font-size: 2.5rem;\n            font-weight: 700;\n        }\n        .meta {\n            opacity: 0.9;\n            margin-top: 0.5rem;\n            font-size: 1rem;\n        }\n        .content {\n            padding: 2rem;\n        }\n        .content p {\n            margin-bottom: 1.5rem;\n            font-size: 1.1rem;\n            line-height: 1.7;\n        }\n        .footer {\n            background: #f8f9fa;\n            border-top: 1px solid #e5e7eb;\n            padding: 1.5rem 2rem;\n            text-align: center;\n            color: #6b7280;\n        }\n        .subscription-cta {\n            background: #eff6ff;\n            border: 1px solid #dbeafe;\n            border-radius: 8px;\n            padding: 1.5rem;\n            margin: 2rem 0;\n            text-align: center;\n        }\n        .cta-button {\n            display: inline-block;\n            background: #2563eb;\n            color: white;\n            padding: 0.75rem 1.5rem;\n            text-decoration: none;\n            border-radius: 6px;\n            font-weight: 600;\n            margin-top: 1rem;\n            transition: background-color 0.2s;\n        }\n        .cta-button:hover {\n            background: #1d4ed8;\n        }\n        @media (max-width: 768px) {\n            .header {\n                padding: 1.5rem 1rem;\n            }\n            .header h1 {\n                font-size: 2rem;\n            }\n            .content {\n                padding: 1.5rem 1rem;\n            }\n        }\n    </style>\n</head>\n<body>\n    <article class="container">\n        <header class="header">\n            <h1>bucs-xyz123</h1>\n            <div class="meta">Published on July 21, 2025</div>\n        </header>\n        \n        <main class="content">\n            <p>Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses.</p>\n      <p>Paul Skenes: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made.</p>\n            \n            <div class="subscription-cta">\n                <h3>Enjoyed this newsletter?</h3>\n                <p>Get the latest updates delivered directly to your inbox.</p>\n                <a href="/" class="cta-button">Subscribe Now</a>\n            </div>\n        </main>\n        \n        <footer class="footer">\n            <p>&copy; 2025 NewsletterHub. All rights reserved.</p>\n            <p>\n                <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> | \n                <a href="/archive" style="color: #2563eb; text-decoration: none;">Newsletter Archive</a>\n            </p>\n        </footer>\n    </article>\n</body>\n</html>
8	Pirates-News-111	Pirates-News-111	Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses\n\nPaul Skenes: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made	40678640	sent	2025-07-21 20:18:00.413	2025-07-21 20:17:49.256551	2025-07-21 20:18:00.413	pirates-news-111-8	Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...	<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Pirates-News-111 | Newsletter Archive</title>\n    <meta name="description" content="Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...">\n    <meta name="robots" content="index, follow">\n    \n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="Pirates-News-111">\n    <meta property="og:description" content="Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...">\n    <meta property="og:site_name" content="NewsletterHub">\n    \n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="Pirates-News-111">\n    <meta name="twitter:description" content="Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...">\n    \n    <!-- Structured Data -->\n    <script type="application/ld+json">\n    {\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "Pirates-News-111",\n  "description": "Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday...",\n  "datePublished": "2025-07-21T20:17:49.256Z",\n  "author": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  }\n}\n    </script>\n    \n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            margin: 0;\n            padding: 0;\n            background-color: #f8f9fa;\n            color: #333;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            min-height: 100vh;\n        }\n        .header {\n            background: linear-gradient(135deg, #2563eb, #1d4ed8);\n            color: white;\n            padding: 2rem;\n            text-align: center;\n        }\n        .header h1 {\n            margin: 0;\n            font-size: 2.5rem;\n            font-weight: 700;\n        }\n        .meta {\n            opacity: 0.9;\n            margin-top: 0.5rem;\n            font-size: 1rem;\n        }\n        .content {\n            padding: 2rem;\n        }\n        .content p {\n            margin-bottom: 1.5rem;\n            font-size: 1.1rem;\n            line-height: 1.7;\n        }\n        .footer {\n            background: #f8f9fa;\n            border-top: 1px solid #e5e7eb;\n            padding: 1.5rem 2rem;\n            text-align: center;\n            color: #6b7280;\n        }\n        .subscription-cta {\n            background: #eff6ff;\n            border: 1px solid #dbeafe;\n            border-radius: 8px;\n            padding: 1.5rem;\n            margin: 2rem 0;\n            text-align: center;\n        }\n        .cta-button {\n            display: inline-block;\n            background: #2563eb;\n            color: white;\n            padding: 0.75rem 1.5rem;\n            text-decoration: none;\n            border-radius: 6px;\n            font-weight: 600;\n            margin-top: 1rem;\n            transition: background-color 0.2s;\n        }\n        .cta-button:hover {\n            background: #1d4ed8;\n        }\n        @media (max-width: 768px) {\n            .header {\n                padding: 1.5rem 1rem;\n            }\n            .header h1 {\n                font-size: 2rem;\n            }\n            .content {\n                padding: 1.5rem 1rem;\n            }\n        }\n    </style>\n</head>\n<body>\n    <article class="container">\n        <header class="header">\n            <h1>Pirates-News-111</h1>\n            <div class="meta">Published on July 21, 2025</div>\n        </header>\n        \n        <main class="content">\n            <p>Recent Performance: The Pittsburgh Pirates have struggled in their first series after the All-Star break, losing to the Chicago White Sox 10-1 on Friday and 10-4 on Saturday at PNC Park. Key moments included Luis Robert Jr. hitting a homer and driving in two runs, and Mike Tauchman’s three-run double in a six-run sixth inning on Saturday. The Pirates’ bullpen faltered, contributing to these losses</p>\n      <p>Paul Skenes: The Pirates’ ace, Paul Skenes, remains a bright spot. The 23-year-old, selected first overall in the 2023 MLB Draft, started his second consecutive All-Star Game. Despite a stellar performance against the Phillies (one run allowed over eight innings, nine strikeouts), he took a loss in a 1-0 game. Skenes is a focal point of trade rumors, but the Pirates are unlikely to move him unless an extraordinary offer is made</p>\n            \n            <div class="subscription-cta">\n                <h3>Enjoyed this newsletter?</h3>\n                <p>Get the latest updates delivered directly to your inbox.</p>\n                <a href="/" class="cta-button">Subscribe Now</a>\n            </div>\n        </main>\n        \n        <footer class="footer">\n            <p>&copy; 2025 NewsletterHub. All rights reserved.</p>\n            <p>\n                <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> | \n                <a href="/archive" style="color: #2563eb; text-decoration: none;">Newsletter Archive</a>\n            </p>\n        </footer>\n    </article>\n</body>\n</html>
9	Pirates-11122	Pirates-11122	Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk rate, he’s attracted interest from teams like the Yankees, Mets, and Blue Jays. Keller is under contract for three more years at $54.5 million, making him valuable, but the Pirates may trade him to acquire offensive talent and make room for younger pitchers. Potential trade packages include prospects like Moises Ballesteros and Jack Neely from the Cubs or Ronny Mauricio and Jonah Tong from the Mets\n\nInjuries: Jared Jones is expected to undergo Tommy John surgery for a right UCL sprain, sidelining him for the rest of 2025 and likely most of 2026. Oneil Cruz returned to center field after missing a game due to hip soreness. Johan Oviedo (UCL surgery) is progressing in his rehab, recently throwing 3 1/3 innings at Double-A Altoona	40678640	sent	2025-07-21 20:26:37.267	2025-07-21 20:26:25.467932	2025-07-21 20:26:37.267	pirates-11122-9	Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk ra...	<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Pirates-11122 | Newsletter Archive</title>\n    <meta name="description" content="Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk ra...">\n    <meta name="robots" content="index, follow">\n    \n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="Pirates-11122">\n    <meta property="og:description" content="Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk ra...">\n    <meta property="og:site_name" content="NewsletterHub">\n    \n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="Pirates-11122">\n    <meta name="twitter:description" content="Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk ra...">\n    \n    <!-- Structured Data -->\n    <script type="application/ld+json">\n    {\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "Pirates-11122",\n  "description": "Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk ra...",\n  "datePublished": "2025-07-21T20:26:25.467Z",\n  "author": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  }\n}\n    </script>\n    \n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            margin: 0;\n            padding: 0;\n            background-color: #f8f9fa;\n            color: #333;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            min-height: 100vh;\n        }\n        .header {\n            background: linear-gradient(135deg, #2563eb, #1d4ed8);\n            color: white;\n            padding: 2rem;\n            text-align: center;\n        }\n        .header h1 {\n            margin: 0;\n            font-size: 2.5rem;\n            font-weight: 700;\n        }\n        .meta {\n            opacity: 0.9;\n            margin-top: 0.5rem;\n            font-size: 1rem;\n        }\n        .content {\n            padding: 2rem;\n        }\n        .content p {\n            margin-bottom: 1.5rem;\n            font-size: 1.1rem;\n            line-height: 1.7;\n        }\n        .footer {\n            background: #f8f9fa;\n            border-top: 1px solid #e5e7eb;\n            padding: 1.5rem 2rem;\n            text-align: center;\n            color: #6b7280;\n        }\n        .subscription-cta {\n            background: #eff6ff;\n            border: 1px solid #dbeafe;\n            border-radius: 8px;\n            padding: 1.5rem;\n            margin: 2rem 0;\n            text-align: center;\n        }\n        .cta-button {\n            display: inline-block;\n            background: #2563eb;\n            color: white;\n            padding: 0.75rem 1.5rem;\n            text-decoration: none;\n            border-radius: 6px;\n            font-weight: 600;\n            margin-top: 1rem;\n            transition: background-color 0.2s;\n        }\n        .cta-button:hover {\n            background: #1d4ed8;\n        }\n        @media (max-width: 768px) {\n            .header {\n                padding: 1.5rem 1rem;\n            }\n            .header h1 {\n                font-size: 2rem;\n            }\n            .content {\n                padding: 1.5rem 1rem;\n            }\n        }\n    </style>\n</head>\n<body>\n    <article class="container">\n        <header class="header">\n            <h1>Pirates-11122</h1>\n            <div class="meta">Published on July 21, 2025</div>\n        </header>\n        \n        <main class="content">\n            <p>Mitch Keller Trade Rumors: Starting pitcher Mitch Keller is a hot name on the trade market. With a 3.48 ERA over 20 starts and a career-low 5.5% walk rate, he’s attracted interest from teams like the Yankees, Mets, and Blue Jays. Keller is under contract for three more years at $54.5 million, making him valuable, but the Pirates may trade him to acquire offensive talent and make room for younger pitchers. Potential trade packages include prospects like Moises Ballesteros and Jack Neely from the Cubs or Ronny Mauricio and Jonah Tong from the Mets</p>\n      <p>Injuries: Jared Jones is expected to undergo Tommy John surgery for a right UCL sprain, sidelining him for the rest of 2025 and likely most of 2026. Oneil Cruz returned to center field after missing a game due to hip soreness. Johan Oviedo (UCL surgery) is progressing in his rehab, recently throwing 3 1/3 innings at Double-A Altoona</p>\n            \n            <div class="subscription-cta">\n                <h3>Enjoyed this newsletter?</h3>\n                <p>Get the latest updates delivered directly to your inbox.</p>\n                <a href="/" class="cta-button">Subscribe Now</a>\n            </div>\n        </main>\n        \n        <footer class="footer">\n            <p>&copy; 2025 NewsletterHub. All rights reserved.</p>\n            <p>\n                <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> | \n                <a href="/archive" style="color: #2563eb; text-decoration: none;">Newsletter Archive</a>\n            </p>\n        </footer>\n    </article>\n</body>\n</html>
10	pirates-443e-	pirates-443e-	this is the content	40678640	sent	2025-07-21 20:37:37.993	2025-07-21 20:37:32.422101	2025-07-21 20:37:37.993	pirates-443e--10	this is the content	<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>pirates-443e- | Newsletter Archive</title>\n    <meta name="description" content="this is the content">\n    <meta name="robots" content="index, follow">\n    \n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="pirates-443e-">\n    <meta property="og:description" content="this is the content">\n    <meta property="og:site_name" content="NewsletterHub">\n    \n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="pirates-443e-">\n    <meta name="twitter:description" content="this is the content">\n    \n    <!-- Structured Data -->\n    <script type="application/ld+json">\n    {\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "pirates-443e-",\n  "description": "this is the content",\n  "datePublished": "2025-07-21T20:37:32.422Z",\n  "author": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  }\n}\n    </script>\n    \n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            margin: 0;\n            padding: 0;\n            background-color: #f8f9fa;\n            color: #333;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            min-height: 100vh;\n        }\n        .header {\n            background: linear-gradient(135deg, #2563eb, #1d4ed8);\n            color: white;\n            padding: 2rem;\n            text-align: center;\n        }\n        .header h1 {\n            margin: 0;\n            font-size: 2.5rem;\n            font-weight: 700;\n        }\n        .meta {\n            opacity: 0.9;\n            margin-top: 0.5rem;\n            font-size: 1rem;\n        }\n        .content {\n            padding: 2rem;\n        }\n        .content p {\n            margin-bottom: 1.5rem;\n            font-size: 1.1rem;\n            line-height: 1.7;\n        }\n        .footer {\n            background: #f8f9fa;\n            border-top: 1px solid #e5e7eb;\n            padding: 1.5rem 2rem;\n            text-align: center;\n            color: #6b7280;\n        }\n        .subscription-cta {\n            background: #eff6ff;\n            border: 1px solid #dbeafe;\n            border-radius: 8px;\n            padding: 1.5rem;\n            margin: 2rem 0;\n            text-align: center;\n        }\n        .cta-button {\n            display: inline-block;\n            background: #2563eb;\n            color: white;\n            padding: 0.75rem 1.5rem;\n            text-decoration: none;\n            border-radius: 6px;\n            font-weight: 600;\n            margin-top: 1rem;\n            transition: background-color 0.2s;\n        }\n        .cta-button:hover {\n            background: #1d4ed8;\n        }\n        @media (max-width: 768px) {\n            .header {\n                padding: 1.5rem 1rem;\n            }\n            .header h1 {\n                font-size: 2rem;\n            }\n            .content {\n                padding: 1.5rem 1rem;\n            }\n        }\n    </style>\n</head>\n<body>\n    <article class="container">\n        <header class="header">\n            <h1>pirates-443e-</h1>\n            <div class="meta">Published on July 21, 2025</div>\n        </header>\n        \n        <main class="content">\n            <p>this is the content</p>\n            \n            <div class="subscription-cta">\n                <h3>Enjoyed this newsletter?</h3>\n                <p>Get the latest updates delivered directly to your inbox.</p>\n                <a href="/" class="cta-button">Subscribe Now</a>\n            </div>\n        </main>\n        \n        <footer class="footer">\n            <p>&copy; 2025 NewsletterHub. All rights reserved.</p>\n            <p>\n                <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> | \n                <a href="/archive" style="color: #2563eb; text-decoration: none;">Newsletter Archive</a>\n            </p>\n        </footer>\n    </article>\n</body>\n</html>
11	testing the emails	testing the emails	testing	40678640	sent	2025-07-21 20:45:25.947	2025-07-21 20:45:24.743488	2025-07-21 20:45:25.947	testing-the-emails-11	testing	<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>testing the emails | Newsletter Archive</title>\n    <meta name="description" content="testing">\n    <meta name="robots" content="index, follow">\n    \n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="testing the emails">\n    <meta property="og:description" content="testing">\n    <meta property="og:site_name" content="NewsletterHub">\n    \n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="testing the emails">\n    <meta name="twitter:description" content="testing">\n    \n    <!-- Structured Data -->\n    <script type="application/ld+json">\n    {\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "testing the emails",\n  "description": "testing",\n  "datePublished": "2025-07-21T20:45:24.743Z",\n  "author": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  }\n}\n    </script>\n    \n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            margin: 0;\n            padding: 0;\n            background-color: #f8f9fa;\n            color: #333;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            min-height: 100vh;\n        }\n        .header {\n            background: linear-gradient(135deg, #2563eb, #1d4ed8);\n            color: white;\n            padding: 2rem;\n            text-align: center;\n        }\n        .header h1 {\n            margin: 0;\n            font-size: 2.5rem;\n            font-weight: 700;\n        }\n        .meta {\n            opacity: 0.9;\n            margin-top: 0.5rem;\n            font-size: 1rem;\n        }\n        .content {\n            padding: 2rem;\n        }\n        .content p {\n            margin-bottom: 1.5rem;\n            font-size: 1.1rem;\n            line-height: 1.7;\n        }\n        .footer {\n            background: #f8f9fa;\n            border-top: 1px solid #e5e7eb;\n            padding: 1.5rem 2rem;\n            text-align: center;\n            color: #6b7280;\n        }\n        .subscription-cta {\n            background: #eff6ff;\n            border: 1px solid #dbeafe;\n            border-radius: 8px;\n            padding: 1.5rem;\n            margin: 2rem 0;\n            text-align: center;\n        }\n        .cta-button {\n            display: inline-block;\n            background: #2563eb;\n            color: white;\n            padding: 0.75rem 1.5rem;\n            text-decoration: none;\n            border-radius: 6px;\n            font-weight: 600;\n            margin-top: 1rem;\n            transition: background-color 0.2s;\n        }\n        .cta-button:hover {\n            background: #1d4ed8;\n        }\n        @media (max-width: 768px) {\n            .header {\n                padding: 1.5rem 1rem;\n            }\n            .header h1 {\n                font-size: 2rem;\n            }\n            .content {\n                padding: 1.5rem 1rem;\n            }\n        }\n    </style>\n</head>\n<body>\n    <article class="container">\n        <header class="header">\n            <h1>testing the emails</h1>\n            <div class="meta">Published on July 21, 2025</div>\n        </header>\n        \n        <main class="content">\n            <p>testing</p>\n            \n            <div class="subscription-cta">\n                <h3>Enjoyed this newsletter?</h3>\n                <p>Get the latest updates delivered directly to your inbox.</p>\n                <a href="/" class="cta-button">Subscribe Now</a>\n            </div>\n        </main>\n        \n        <footer class="footer">\n            <p>&copy; 2025 NewsletterHub. All rights reserved.</p>\n            <p>\n                <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> | \n                <a href="/archive" style="color: #2563eb; text-decoration: none;">Newsletter Archive</a>\n            </p>\n        </footer>\n    </article>\n</body>\n</html>
12	new letter	new letter	testing	40678640	sent	2025-07-21 20:57:49.841	2025-07-21 20:57:18.813606	2025-07-21 20:57:49.841	new-letter-12	testing	<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>new letter | Newsletter Archive</title>\n    <meta name="description" content="testing">\n    <meta name="robots" content="index, follow">\n    \n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="new letter">\n    <meta property="og:description" content="testing">\n    <meta property="og:site_name" content="NewsletterHub">\n    \n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="new letter">\n    <meta name="twitter:description" content="testing">\n    \n    <!-- Structured Data -->\n    <script type="application/ld+json">\n    {\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "new letter",\n  "description": "testing",\n  "datePublished": "2025-07-21T20:57:18.813Z",\n  "author": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsletterHub"\n  }\n}\n    </script>\n    \n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            margin: 0;\n            padding: 0;\n            background-color: #f8f9fa;\n            color: #333;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            min-height: 100vh;\n        }\n        .header {\n            background: linear-gradient(135deg, #2563eb, #1d4ed8);\n            color: white;\n            padding: 2rem;\n            text-align: center;\n        }\n        .header h1 {\n            margin: 0;\n            font-size: 2.5rem;\n            font-weight: 700;\n        }\n        .meta {\n            opacity: 0.9;\n            margin-top: 0.5rem;\n            font-size: 1rem;\n        }\n        .content {\n            padding: 2rem;\n        }\n        .content p {\n            margin-bottom: 1.5rem;\n            font-size: 1.1rem;\n            line-height: 1.7;\n        }\n        .footer {\n            background: #f8f9fa;\n            border-top: 1px solid #e5e7eb;\n            padding: 1.5rem 2rem;\n            text-align: center;\n            color: #6b7280;\n        }\n        .subscription-cta {\n            background: #eff6ff;\n            border: 1px solid #dbeafe;\n            border-radius: 8px;\n            padding: 1.5rem;\n            margin: 2rem 0;\n            text-align: center;\n        }\n        .cta-button {\n            display: inline-block;\n            background: #2563eb;\n            color: white;\n            padding: 0.75rem 1.5rem;\n            text-decoration: none;\n            border-radius: 6px;\n            font-weight: 600;\n            margin-top: 1rem;\n            transition: background-color 0.2s;\n        }\n        .cta-button:hover {\n            background: #1d4ed8;\n        }\n        @media (max-width: 768px) {\n            .header {\n                padding: 1.5rem 1rem;\n            }\n            .header h1 {\n                font-size: 2rem;\n            }\n            .content {\n                padding: 1.5rem 1rem;\n            }\n        }\n    </style>\n</head>\n<body>\n    <article class="container">\n        <header class="header">\n            <h1>new letter</h1>\n            <div class="meta">Published on July 21, 2025</div>\n        </header>\n        \n        <main class="content">\n            <p>testing</p>\n            \n            <div class="subscription-cta">\n                <h3>Enjoyed this newsletter?</h3>\n                <p>Get the latest updates delivered directly to your inbox.</p>\n                <a href="/" class="cta-button">Subscribe Now</a>\n            </div>\n        </main>\n        \n        <footer class="footer">\n            <p>&copy; 2025 NewsletterHub. All rights reserved.</p>\n            <p>\n                <a href="/" style="color: #2563eb; text-decoration: none;">Home</a> | \n                <a href="/archive" style="color: #2563eb; text-decoration: none;">Newsletter Archive</a>\n            </p>\n        </footer>\n    </article>\n</body>\n</html>
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
70_hVqP8S7ncn_npBGxg7zYHXRjj6vtz	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-28T20:46:57.845Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "bcd85b59-3ecb-4e14-a0a3-32a7633d31c5", "exp": 1753134417, "iat": 1753130817, "iss": "https://replit.com/oidc", "sub": "36292144", "email": "travis.sutphin@gmail.com", "at_hash": "KCQG3T1XfhUdeg1Qxp1qwQ", "username": "travissutphin", "auth_time": 1753130817, "last_name": "Sutphin", "first_name": "Travis"}, "expires_at": 1753134417, "access_token": "1e-xhG5LLYJHiwsZGF4juYZxz0GffrDBsP0l9O8-6LV", "refresh_token": "dmpl5rg7gbVAEY2WeI8WrKifLWr3tMzkYSKXILaZJ95"}}}	2025-07-29 02:49:47
d1dTO4fiklQT-_Vq9Fg1tSMsXhcVJF2Q	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-28T20:25:29.996Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "90a949e5-9d4a-4804-be58-668675fcce7a", "exp": 1753133129, "iat": 1753129529, "iss": "https://replit.com/oidc", "sub": "40678640", "email": "travis@businessbldrs.com", "at_hash": "mlWB86GVgyoUgwNTnHJVyg", "username": "travis125", "auth_time": 1753129529, "last_name": "Sutphin", "first_name": "Travis"}, "expires_at": 1753133129, "access_token": "YUsvOx_qbcr90MEfMBJt2gWbsJoXB8qkB9KQsD9IQJe", "refresh_token": "2mMqVVfmYUqV708Gukxoo7gUaWwgXUlQGNS0hJSnCI6"}}}	2025-07-28 20:57:51
lJo6XVs4Ay_3yxfnNgPa0oWPZB3tsbg9	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-30T19:41:28.858Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "f8984f64-4c43-421b-bb7b-871122b6c9a8", "exp": 1753303288, "iat": 1753299688, "iss": "https://replit.com/oidc", "sub": "40678640", "email": "travis@businessbldrs.com", "at_hash": "WfegeAUMYy1yTlu0CInbFw", "username": "travis125", "auth_time": 1753299688, "last_name": "Sutphin", "first_name": "Travis"}, "expires_at": 1753303288, "access_token": "TvL7PxUi586uVcbDt3gsb8BGktL2CUQ5sTSz8jvMUGd", "refresh_token": "ukhMf5dwokt7IAL2PTfn6oDCCcxoABCnagFNaIw3Fta"}}}	2025-07-30 19:57:26
wBwc6aT02PzmgAi-5KqN2QirPlB_SVY4	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-28T21:59:40.132Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "f8984f64-4c43-421b-bb7b-871122b6c9a8", "exp": 1753138779, "iat": 1753135179, "iss": "https://replit.com/oidc", "sub": "40678640", "email": "travis@businessbldrs.com", "at_hash": "Ego6Bl8bj03HDtFHisKADA", "username": "travis125", "auth_time": 1753123588, "last_name": "Sutphin", "first_name": "Travis"}, "expires_at": 1753138779, "access_token": "3SJzv0NBuHIv5nUkmYHD5eTTZvPM1IJV7s9Pdyu2K2b", "refresh_token": "O1pWZ4l9xcXjc3MM23WfArrm7gHKwTxuGegvr-mca2b"}}}	2025-07-28 22:48:47
\.


--
-- Data for Name: subscriber_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscriber_categories (id, subscriber_id, category_id, created_at) FROM stdin;
5	3	1	2025-07-21 18:46:15.683804
6	2	1	2025-07-21 20:46:42.99144
7	2	6	2025-07-21 20:46:42.99144
8	2	3	2025-07-21 20:46:42.99144
\.


--
-- Data for Name: subscribers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscribers (id, email, phone, contact_method, frequency, is_active, unsubscribe_token, created_at, updated_at, preferences_token) FROM stdin;
3	travis@businessbldrs.com	\N	email	daily	t	AZGwmUQTKNxqLGBGeTefG	2025-07-21 18:46:15.601296	2025-07-21 18:46:15.601296	761851f618f32becc0533b9fe86693a3
2	travis.sutphin+NewsNudge1@gmail.com	\N	email	daily	t	3QAWuzEZIUPXpP_dwK44C	2025-07-21 18:35:59.411237	2025-07-21 20:46:42.907	1b9208deefecc199b2ddb05a68bf2ce9
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) FROM stdin;
36292144	travis.sutphin@gmail.com	Travis	Sutphin	\N	2025-07-21 20:46:57.759843	2025-07-21 20:46:57.759843
40678640	travis@businessbldrs.com	Travis	Sutphin	\N	2025-07-21 17:27:20.900867	2025-07-23 19:41:28.413
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: deliveries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.deliveries_id_seq', 20, true);


--
-- Name: newsletter_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.newsletter_categories_id_seq', 19, true);


--
-- Name: newsletters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.newsletters_id_seq', 12, true);


--
-- Name: subscriber_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subscriber_categories_id_seq', 8, true);


--
-- Name: subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.subscribers_id_seq', 3, true);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: newsletter_categories newsletter_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_categories
    ADD CONSTRAINT newsletter_categories_pkey PRIMARY KEY (id);


--
-- Name: newsletters newsletters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);


--
-- Name: newsletters newsletters_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_slug_key UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: subscriber_categories subscriber_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriber_categories
    ADD CONSTRAINT subscriber_categories_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_preferences_token_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_preferences_token_key UNIQUE (preferences_token);


--
-- Name: subscribers subscribers_unsubscribe_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_unsubscribe_token_unique UNIQUE (unsubscribe_token);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: deliveries deliveries_newsletter_id_newsletters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_newsletter_id_newsletters_id_fk FOREIGN KEY (newsletter_id) REFERENCES public.newsletters(id);


--
-- Name: deliveries deliveries_subscriber_id_subscribers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_subscriber_id_subscribers_id_fk FOREIGN KEY (subscriber_id) REFERENCES public.subscribers(id);


--
-- Name: newsletter_categories newsletter_categories_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_categories
    ADD CONSTRAINT newsletter_categories_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: newsletter_categories newsletter_categories_newsletter_id_newsletters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_categories
    ADD CONSTRAINT newsletter_categories_newsletter_id_newsletters_id_fk FOREIGN KEY (newsletter_id) REFERENCES public.newsletters(id);


--
-- Name: newsletters newsletters_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: subscriber_categories subscriber_categories_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriber_categories
    ADD CONSTRAINT subscriber_categories_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: subscriber_categories subscriber_categories_subscriber_id_subscribers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriber_categories
    ADD CONSTRAINT subscriber_categories_subscriber_id_subscribers_id_fk FOREIGN KEY (subscriber_id) REFERENCES public.subscribers(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

