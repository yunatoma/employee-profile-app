import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { db } from '../lib/firebase';

const now = new Date().toISOString();

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

type Emp = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: string;
  status: string;
  joinedAt: string;
  skills: string[];
  projects?: string[];
  profile: string;
  selfIntroduction?: string;
  strengths?: string;
  growthSkills?: string;
  interests?: string;
  hobbies?: string;
  personalMessage?: string;
  workLocation?: string;
  availability?: string;
  careerHistory?: string;
  certifications?: string;
  avatarUrl: string;
  managerId?: string;
  uid: null;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

const PROJECTS = {
  SAAS_RENEWAL:     'SaaS基盤刷新',
  MOBILE_APP:       '新規モバイルアプリ開発',
  DATA_PLATFORM:    'データ分析基盤構築',
  SECURITY:         'セキュリティ強化',
  API_PLATFORM:     'API外部連携プラットフォーム',
  RECRUIT_SYS:      '採用管理システム開発',
  HR_SYS:           '社内HR管理システム',
  CRM:              '営業CRM導入',
  CORP_SITE:        'コーポレートサイトリニューアル',
  AI_PROJECT:       'AI活用推進',
  GLOBAL:           'グローバル展開',
  EXPENSE_SYS:      '経費精算システム導入',
  CS_STRENGTHEN:    'カスタマーサクセス強化',
  EC_SITE:          'ECサイト構築',
  INTERNAL_COMM:    '社内コミュニケーションツール導入',
} as const;

function emp(
  orgId: string,
  id: string, name: string, email: string,
  department: string, position: string,
  employmentType: string, status: string,
  joinedAt: string, skills: string[], profile: string,
  avatarSeed: string, managerId?: string,
  role: 'admin' | 'member' = 'member',
): Emp {
  return {
    id, organizationId: orgId, name, email, department, position,
    employmentType, status, joinedAt, skills, profile,
    avatarUrl: avatar(avatarSeed),
    ...(managerId ? { managerId } : {}),
    uid: null, role, createdAt: now, updatedAt: now, createdBy: 'seed',
  };
}

function buildEmployees(ORG_ID: string): Emp[] {
  const e = (
    id: string, name: string, email: string,
    department: string, position: string,
    employmentType: string, status: string,
    joinedAt: string, skills: string[], profile: string,
    avatarSeed: string, managerId?: string,
    role: 'admin' | 'member' = 'member',
  ) => emp(ORG_ID, id, name, email, department, position, employmentType, status, joinedAt, skills, profile, avatarSeed, managerId, role);

  const P = PROJECTS;

  return [
    // ── 経営 (4名) ────────────────────────────────────────
    { ...e('prod-ceo-001', '山崎 誠一', 'yamazaki@example.com',
      '経営', '代表取締役社長', 'full-time', 'active', '2010-04-01',
      ['経営戦略', 'M&A', 'ファイナンス'],
      '創業以来、会社の成長を牽引。ビジョン実現に向けてチーム全員と向き合っています。',
      'lion-king', undefined, 'admin'),
      projects: [P.GLOBAL, P.AI_PROJECT],
      selfIntroduction: '創業から15年、「テクノロジーで働く人を幸せにする」というミッションを胸に経営しています。社員一人ひとりが誇りを持てる会社を目指しています。',
      strengths: '長期ビジョンの設定と組織への浸透。投資家・パートナーとの関係構築。',
      interests: 'スタートアップエコシステム、ソーシャルインパクト、次世代人材育成',
      hobbies: 'ゴルフ、読書（歴史・哲学）、料理',
      personalMessage: '人が動けば、会社が動く。',
      workLocation: '東京本社（海外出張あり）',
      availability: 'フルタイム',
      careerHistory: '総合商社（5年）→ 外資系コンサル（3年）→ 当社創業',
      certifications: 'MBA（慶應義塾大学）' },

    { ...e('prod-exec-001', '岩田 龍二', 'iwata@example.com',
      '経営', '取締役CTO', 'full-time', 'active', '2011-07-01',
      ['TypeScript', 'Go', 'AWS', 'アーキテクチャ設計'],
      '技術戦略の立案と開発組織の統括を担当。エンジニア文化の醸成に取り組んでいます。',
      'tiger-ryu', 'prod-ceo-001'),
      projects: [P.SAAS_RENEWAL, P.SECURITY, P.AI_PROJECT],
      selfIntroduction: '元々はバックエンドエンジニアとして10年以上キャリアを積み、現在はCTOとして技術戦略全般を担っています。エンジニアが誇りを持って働ける環境づくりを最も大切にしています。',
      strengths: '技術の深さと広さのバランス感覚。エンジニアチームの心理的安全性を高めるマネジメント。',
      growthSkills: 'LLMを活用したプロダクト設計、MLOps',
      interests: 'AI・機械学習の実プロダクト応用、OSS活動、開発生産性向上',
      hobbies: 'ロードバイク、自作キーボード、SF小説',
      personalMessage: 'エンジニアが技術で会社を動かせる文化を一緒につくりましょう。',
      workLocation: '週3出社、週2リモート',
      availability: 'フルタイム',
      careerHistory: '大手SIer（5年）→ スタートアップCTO（3年）→ 当社',
      certifications: 'AWS Solutions Architect Professional, Google Cloud Professional Data Engineer' },

    { ...e('prod-exec-002', '中島 裕美子', 'nakajima@example.com',
      '経営', '取締役（営業・マーケティング担当）', 'full-time', 'active', '2012-04-01',
      ['マーケティング戦略', '営業マネジメント', 'ブランド戦略'],
      '営業とマーケティングを統括。顧客起点のビジネス成長を推進しています。',
      'fox-yumi', 'prod-ceo-001'),
      projects: [P.GLOBAL, P.CRM, P.CORP_SITE],
      selfIntroduction: '「売れる仕組み」をゼロから作ることが得意です。顧客の声に徹底的に向き合いながら、ブランドと営業を一体化させた成長戦略を描いています。',
      strengths: 'ブランド戦略と営業戦略の融合。エグゼクティブへの提案力。',
      interests: 'グローバルマーケティング、D2C、サステナビリティ経営',
      hobbies: 'ワイン、海外旅行、ピラティス',
      personalMessage: '顧客に選ばれ続ける会社を作りたい。',
      workLocation: '東京本社（国内外出張あり）',
      availability: 'フルタイム',
      certifications: 'MBA（一橋大学）, 中小企業診断士' },

    { ...e('prod-exec-003', '大野 健太', 'ohno@example.com',
      '経営', '取締役COO', 'full-time', 'active', '2013-01-01',
      ['コンサルタント', '組織設計', 'オペレーション改善'],
      '管理部門全体を統括。人事・総務・カスタマーサポートの基盤整備を推進しています。',
      'bear-kenta', 'prod-ceo-001'),
      projects: [P.HR_SYS, P.INTERNAL_COMM, P.CS_STRENGTHEN],
      selfIntroduction: '「仕組みで会社を強くする」をモットーに、バックオフィスのオペレーション改革を推進しています。コンサルタント出身の視点で、現場との橋渡し役を担っています。',
      strengths: 'プロセス設計と組織横断プロジェクトの推進力。数字とロジックを軸にした意思決定。',
      interests: '組織開発、BPR（業務改革）、Well-being経営',
      hobbies: 'マラソン、キャンプ、家族との時間',
      personalMessage: '強い組織は、強い個人の集まり。',
      workLocation: '週4出社',
      availability: 'フルタイム',
      certifications: 'PMP（プロジェクトマネジメント）, TOEIC 900点' },

    // ── 開発部 (12名) ─────────────────────────────────────
    { ...e('prod-dev-001', '田中 太郎', 'tanaka@example.com',
      '開発部', '部長', 'full-time', 'active', '2015-04-01',
      ['TypeScript', 'Go', 'AWS', 'Docker'],
      'バックエンドからインフラまで幅広く担当。チームのリードとして活動しています。',
      'cat-felix', 'prod-exec-001'),
      projects: [P.SAAS_RENEWAL, P.API_PLATFORM, P.SECURITY],
      selfIntroduction: 'バックエンドエンジニアとしてキャリアをスタートし、現在は開発部の部長としてチーム全体の技術リードを担っています。',
      strengths: 'システム設計とコードレビュー。チームメンバーの強みを引き出すコーチング。',
      growthSkills: 'プラットフォームエンジニアリング、チームトポロジー設計',
      interests: 'DDD、マイクロサービス、SRE',
      hobbies: '登山、料理、技術書読書',
      personalMessage: '良いコードは良いチームから生まれます。',
      workLocation: '東京オフィス（リモート可）',
      availability: 'フルタイム',
      careerHistory: 'Web系スタートアップ（4年）→ メガベンチャー（2年）→ 当社',
      certifications: 'AWS Solutions Architect Associate' },

    { ...e('prod-dev-002', '鈴木 花子', 'suzuki@example.com',
      '開発部', 'リードエンジニア', 'full-time', 'active', '2017-04-01',
      ['React', 'TypeScript', 'Figma'],
      'フロントエンド開発を中心に、UI/UX にこだわったプロダクト開発が得意です。',
      'cat-mimi', 'prod-dev-001'),
      projects: [P.SAAS_RENEWAL, P.MOBILE_APP, P.CORP_SITE],
      selfIntroduction: 'ユーザーが「使いやすい」と感じる瞬間をつくるのが好きです。デザインとエンジニアリングの橋渡し役として価値を発揮しています。',
      strengths: 'デザインシステムの構築とコンポーネント設計。アクセシビリティへの深い理解。',
      growthSkills: 'Web パフォーマンス最適化、React Server Components',
      interests: 'デザインシステム、アクセシビリティ、インタラクションデザイン',
      hobbies: 'カフェ巡り、イラスト制作、映画鑑賞',
      personalMessage: 'コードもデザインも、ユーザーへの手紙だと思っています。',
      workLocation: 'フルリモート可',
      availability: 'フルタイム',
      careerHistory: 'Webデザイナー（2年）→ フロントエンドエンジニア（3年）→ 当社',
      certifications: 'Google UX Design Certificate' },

    { ...e('prod-dev-003', '佐藤 健', 'sato@example.com',
      '開発部', 'シニアエンジニア', 'full-time', 'active', '2019-04-01',
      ['React', 'TypeScript', 'Node.js'],
      'フロントエンド開発を中心に担当しています。',
      'dog-pochi', 'prod-dev-002'),
      projects: [P.MOBILE_APP, P.EC_SITE],
      selfIntroduction: 'React と TypeScript を中心に、ユーザーに届くプロダクトを作るのが好きです。',
      strengths: 'コンポーネントの再利用設計と状態管理。コードレビューでの建設的なフィードバック。',
      growthSkills: 'バックエンド（Node.js 深堀り）、モバイル開発',
      hobbies: 'バスケットボール、ゲーム、料理',
      personalMessage: 'コードは読む人のために書く。',
      workLocation: 'フルリモート可',
      certifications: 'AWS Cloud Practitioner' },

    { ...e('prod-dev-004', '高橋 美咲', 'takahashi@example.com',
      '開発部', 'エンジニア', 'full-time', 'active', '2021-04-01',
      ['Vue.js', 'JavaScript', 'Figma'],
      '新卒入社。日々成長中です。',
      'dog-hachi', 'prod-dev-002'),
      projects: [P.CORP_SITE, P.EC_SITE],
      selfIntroduction: '新卒でエンジニアになり3年目。毎日楽しくコードを書いています！',
      strengths: 'Figma を使った UI 確認と実装の橋渡し。素直に学ぶ姿勢。',
      growthSkills: 'TypeScript 習得、React への移行',
      hobbies: 'イラスト、映画鑑賞、ボードゲーム',
      personalMessage: '失敗を恐れずチャレンジし続けます！',
      workLocation: '週3出社' },

    { ...e('prod-dev-005', '伊藤 大輔', 'ito@example.com',
      '開発部', 'リードエンジニア', 'full-time', 'active', '2016-07-01',
      ['Go', 'Python', 'PostgreSQL', 'Docker'],
      'バックエンドからインフラまで幅広く担当。',
      'bear-kuma', 'prod-dev-001'),
      projects: [P.SAAS_RENEWAL, P.DATA_PLATFORM, P.API_PLATFORM],
      selfIntroduction: 'バックエンドとデータ基盤の設計が専門です。パフォーマンスとスケーラビリティを意識した設計でプロダクトの成長を支えています。',
      strengths: 'データモデリングとクエリ最適化。大規模バッチ処理の設計。',
      growthSkills: 'ストリーミング処理（Kafka）、データエンジニアリング',
      interests: 'OLAP、データウェアハウス設計、分散システム',
      hobbies: 'キャンプ、自作PC、将棋',
      personalMessage: 'データは嘘をつかない。正しく設計されたシステムが正しい意思決定を支えます。',
      workLocation: '週2出社、週3リモート',
      availability: 'フルタイム',
      careerHistory: 'データエンジニア（SIer・3年）→ バックエンドエンジニア（スタートアップ・3年）→ 当社',
      certifications: 'データベーススペシャリスト, PostgreSQL CE Silver' },

    { ...e('prod-dev-006', '渡辺 さくら', 'watanabe@example.com',
      '開発部', 'シニアエンジニア', 'full-time', 'active', '2018-10-01',
      ['Python', 'Node.js', 'PostgreSQL'],
      'データ分析とビジネス改善が専門。',
      'rabbit-usagi', 'prod-dev-005'),
      projects: [P.DATA_PLATFORM, P.AI_PROJECT],
      selfIntroduction: 'データを通じてビジネスの課題を発見し、解決策を提案するのが好きです。',
      strengths: 'EDA（探索的データ分析）と可視化。ビジネスサイドへの分かりやすい説明。',
      growthSkills: '機械学習モデルの本番運用、MLOps',
      interests: 'データサイエンス、自然言語処理、ビジネス分析',
      hobbies: 'ヨガ、読書（ビジネス書）、料理',
      personalMessage: 'データで人の行動が変わる瞬間が好きです。',
      workLocation: 'フルリモート',
      availability: 'フルタイム',
      certifications: 'Python 3 エンジニア認定データ分析試験, AWS Certified Machine Learning – Specialty' },

    { ...e('prod-dev-007', '山本 拓也', 'yamamoto@example.com',
      '開発部', 'エンジニア', 'full-time', 'leave', '2020-04-01',
      ['Go', 'Docker', 'AWS'],
      'インフラ・バックエンドを担当しています。',
      'fox-kitsune', 'prod-dev-005'),
      projects: [P.SECURITY, P.API_PLATFORM] },

    { ...e('prod-dev-008', '中村 麻衣', 'nakamura@example.com',
      '開発部', 'リードエンジニア', 'full-time', 'active', '2017-10-01',
      ['AWS', 'GCP', 'Docker', 'Terraform'],
      'インフラ全般を担当しています。',
      'hamster-choco', 'prod-dev-001'),
      projects: [P.SAAS_RENEWAL, P.SECURITY, P.DATA_PLATFORM],
      selfIntroduction: 'クラウドインフラの設計・構築・運用を担当。「止まらないシステム」を作ることにやりがいを感じています。',
      strengths: 'IaC（Infrastructure as Code）によるインフラ自動化。コスト最適化とセキュリティ設計の両立。',
      growthSkills: 'FinOps、Kubernetes 上級運用',
      interests: 'SRE、カオスエンジニアリング、ゼロトラストセキュリティ',
      hobbies: 'ゲーム（FPS）、猫、DIY',
      personalMessage: 'インフラは縁の下の力持ち。見えないところで支えることに誇りを持っています。',
      workLocation: '週1出社、週4リモート',
      availability: 'フルタイム',
      careerHistory: 'ネットワークエンジニア（2年）→ インフラエンジニア（3年）→ 当社',
      certifications: 'AWS Solutions Architect Professional, CKA（Kubernetes）' },

    { ...e('prod-dev-009', '小林 翔', 'kobayashi@example.com',
      '開発部', 'エンジニア', 'full-time', 'active', '2022-04-01',
      ['AWS', 'Docker', 'Python'],
      '新卒入社。インフラを中心に学んでいます。',
      'penguin-pen', 'prod-dev-008'),
      projects: [P.SECURITY, P.EXPENSE_SYS] },

    { ...e('prod-dev-010', '加藤 由美', 'kato@example.com',
      '開発部', 'エンジニア', 'contract', 'active', '2023-01-01',
      ['GCP', 'Docker', 'SQL'],
      '契約社員としてインフラチームをサポートしています。',
      'owl-fukuro', 'prod-dev-008'),
      projects: [P.DATA_PLATFORM] },

    { ...e('prod-dev-011', '西村 光', 'nishimura@example.com',
      '開発部', 'エンジニア', 'full-time', 'active', '2023-04-01',
      ['React', 'TypeScript'],
      '新卒入社。フロントエンドを中心に取り組んでいます。',
      'deer-shika', 'prod-dev-002'),
      projects: [P.MOBILE_APP, P.RECRUIT_SYS] },

    { ...e('prod-dev-012', '森田 明美', 'morita@example.com',
      '開発部', 'エンジニア', 'full-time', 'active', '2022-10-01',
      ['Node.js', 'PostgreSQL', 'Git'],
      'バックエンドAPIの開発を担当しています。',
      'bear-panda', 'prod-dev-005'),
      projects: [P.API_PLATFORM, P.RECRUIT_SYS] },

    // ── 人事部 (6名) ──────────────────────────────────────
    { ...e('prod-hr-001', '吉田 誠', 'yoshida@example.com',
      '人事部', '部長', 'full-time', 'active', '2014-04-01',
      ['Excel', 'コンサルタント'],
      '採用・育成・制度設計を担当。社員が働きやすい環境づくりを目指しています。',
      'deer-bambi', 'prod-exec-003'),
      projects: [P.RECRUIT_SYS, P.HR_SYS, P.INTERNAL_COMM],
      selfIntroduction: '人が輝ける場所をつくることが仕事だと思っています。採用から育成、制度設計まで、社員のライフステージに寄り添った人事を目指しています。',
      strengths: '採用戦略の立案と実行。社員の強みを見つけてポジションに活かすアサイン力。',
      growthSkills: 'ピープルアナリティクス、HRテック活用',
      interests: '組織心理学、1on1コーチング、女性活躍推進',
      hobbies: 'マラソン、読書（小説）、子どもとの公園遊び',
      personalMessage: '人を信じる、チームを信じる。それが人事の仕事の出発点です。',
      workLocation: '週4出社、週1リモート',
      availability: 'フルタイム',
      careerHistory: '人材紹介会社（3年）→ 事業会社 HR マネージャー（4年）→ 当社',
      certifications: '国家資格キャリアコンサルタント, メンタルヘルス・マネジメント検定Ⅱ種' },

    { ...e('prod-hr-002', '山田 彩', 'yamada@example.com',
      '人事部', 'マネージャー', 'full-time', 'active', '2018-04-01',
      ['Excel', 'アナリスト'],
      '採用チームのマネージャーとして採用活動全般を統括しています。',
      'cat-tama', 'prod-hr-001'),
      projects: [P.RECRUIT_SYS, P.HR_SYS],
      selfIntroduction: '「いいマッチングをしたい」が採用のモットー。候補者にも会社にも誠実でいることを大切にしています。',
      strengths: 'スカウト文章の改善と返信率向上。候補者体験（CX）の設計。',
      growthSkills: 'データを使った採用予測、ピープルアナリティクス',
      hobbies: '登山、ヨガ、読書',
      personalMessage: 'いい採用は、会社の未来をつくります。',
      workLocation: '週4出社' },

    { ...e('prod-hr-003', '佐々木 航', 'sasaki@example.com',
      '人事部', '採用担当', 'full-time', 'active', '2020-04-01',
      ['Excel', 'アナリスト'],
      '中途採用を中心に担当しています。',
      'dog-maron', 'prod-hr-002'),
      projects: [P.RECRUIT_SYS] },

    { ...e('prod-hr-004', '松本 京子', 'matsumoto@example.com',
      '人事部', '採用担当', 'part-time', 'active', '2021-07-01',
      ['Excel'],
      '新卒採用とインターン採用を担当しています。',
      'rabbit-mochi', 'prod-hr-002'),
      projects: [P.RECRUIT_SYS] },

    { ...e('prod-hr-005', '井上 蓮', 'inoue@example.com',
      '人事部', 'マネージャー', 'full-time', 'active', '2019-04-01',
      ['Excel', 'コンサルタント'],
      '人事制度・評価制度の設計を担当しています。',
      'bear-grizzly', 'prod-hr-001'),
      projects: [P.HR_SYS, P.INTERNAL_COMM] },

    { ...e('prod-hr-006', '坂本 拳', 'sakamoto@example.com',
      '人事部', '人事担当', 'full-time', 'active', '2022-04-01',
      ['Excel'],
      '労務管理・給与計算を担当しています。',
      'hamster-pika', 'prod-hr-005'),
      projects: [P.HR_SYS] },

    // ── 営業部 (12名) ─────────────────────────────────────
    { ...e('prod-sales-001', '木村 奈々', 'kimura@example.com',
      '営業部', '部長', 'full-time', 'active', '2013-04-01',
      ['SQL', 'Excel', 'アナリスト'],
      '営業部門全体のマネジメントを担当しています。',
      'fox-sora', 'prod-exec-002'),
      projects: [P.CRM, P.GLOBAL, P.CS_STRENGTHEN],
      selfIntroduction: '数字で語り、人で動かすのが営業の醍醐味だと思っています。チームが成果を出せる仕組みづくりと個々の成長支援を大切にしています。',
      strengths: 'データドリブンな営業戦略の立案。チームの目標設定とモチベーション管理。',
      growthSkills: 'グローバル営業、SaaS のカスタマーサクセス連携',
      interests: 'セールステック、ABM（アカウントベースドマーケティング）、海外展開',
      hobbies: 'テニス、ワイン、海外旅行',
      personalMessage: '営業は会社の未来をつくる仕事です。一緒に挑戦しましょう！',
      workLocation: '週5出社（訪問営業あり）',
      availability: 'フルタイム',
      careerHistory: '商社（営業・3年）→ IT企業（法人営業・4年）→ 当社',
      certifications: 'ITパスポート, 中小企業診断士（取得中）' },

    { ...e('prod-sales-002', '林 雄介', 'hayashi@example.com',
      '営業部', 'リーダー', 'full-time', 'active', '2017-04-01',
      ['Excel', 'SQL'],
      '第一営業チームのリーダーとして既存顧客対応を担当しています。',
      'penguin-taro', 'prod-sales-001'),
      projects: [P.CRM, P.CS_STRENGTHEN],
      selfIntroduction: '既存顧客との長期的な信頼関係づくりが得意です。',
      strengths: '顧客の課題ヒアリングと提案の精度。チームメンバーの進捗管理。',
      hobbies: 'サッカー観戦、BBQ、DIY',
      personalMessage: '営業は信頼を売る仕事。',
      workLocation: '週5出社（訪問営業あり）',
      certifications: 'ビジネス実務法務検定 2 級' },

    { ...e('prod-sales-003', '清水 沙織', 'shimizu@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2020-04-01',
      ['Excel'],
      '既存顧客のフォローを担当しています。',
      'owl-wise', 'prod-sales-002'),
      projects: [P.CRM] },

    { ...e('prod-sales-004', '山口 隼人', 'yamaguchi@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2021-04-01',
      ['Excel'],
      '新規開拓営業を中心に担当しています。',
      'cat-kuro', 'prod-sales-002'),
      projects: [P.GLOBAL] },

    { ...e('prod-sales-005', '池田 真由', 'ikeda@example.com',
      '営業部', 'リーダー', 'full-time', 'active', '2016-10-01',
      ['Excel', 'アナリスト'],
      '第二営業チームのリーダーとして新規顧客開拓を担当しています。',
      'rabbit-luna', 'prod-sales-001'),
      projects: [P.CRM, P.GLOBAL] },

    { ...e('prod-sales-006', '橋本 浩二', 'hashimoto@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2022-04-01',
      ['Excel'],
      '新規開拓営業を担当しています。',
      'fox-hana', 'prod-sales-005'),
      projects: [P.GLOBAL] },

    { ...e('prod-sales-007', '野口 麻子', 'noguchi@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2021-10-01',
      ['Excel', 'SQL'],
      '既存顧客のアップセルを担当しています。',
      'cat-shiro', 'prod-sales-002'),
      projects: [P.CRM, P.CS_STRENGTHEN] },

    { ...e('prod-sales-008', '菊地 大樹', 'kikuchi@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2022-07-01',
      ['Excel'],
      '新規開拓を中心に担当しています。',
      'dog-coco', 'prod-sales-005'),
      projects: [P.CRM] },

    { ...e('prod-sales-009', '原田 千尋', 'harada@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2023-04-01',
      ['Excel'],
      '新卒入社。先輩のもとで営業を学んでいます。',
      'bear-brown', 'prod-sales-002'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-sales-010', '上田 涼', 'ueda@example.com',
      '営業部', '営業担当', 'full-time', 'active', '2023-04-01',
      ['Excel'],
      '新卒入社。新規開拓に取り組んでいます。',
      'bear-honey', 'prod-sales-005'),
      projects: [P.GLOBAL] },

    { ...e('prod-sales-011', '三浦 里奈', 'miura@example.com',
      '営業部', '営業担当', 'part-time', 'active', '2022-01-01',
      ['Excel'],
      '既存顧客サポートを担当しています。',
      'rabbit-snow', 'prod-sales-002'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-sales-012', '藤原 雄大', 'fujiwara@example.com',
      '営業部', '営業担当', 'full-time', 'leave', '2020-07-01',
      ['Excel', 'アナリスト'],
      '大手顧客を中心に担当しています。',
      'dog-koro', 'prod-sales-005'),
      projects: [P.CRM] },

    // ── 総務部 (6名) ──────────────────────────────────────
    { ...e('prod-ga-001', '阿部 葵', 'abe@example.com',
      '総務部', '部長', 'full-time', 'active', '2015-10-01',
      ['Excel', 'コンサルタント'],
      '総務・法務・経理を統括しています。',
      'cat-kuro2', 'prod-exec-003'),
      projects: [P.EXPENSE_SYS, P.INTERNAL_COMM],
      selfIntroduction: '「縁の下の力持ち」として、会社の土台を支える仕事にやりがいを感じています。',
      strengths: '契約・法務リスクの早期発見。社内ルール整備と周知展開。',
      interests: 'コーポレートガバナンス、働き方改革、オフィスデザイン',
      hobbies: '茶道、観劇、ハイキング',
      personalMessage: '見えないところで、みんなを支えます。',
      workLocation: '週5出社',
      certifications: '宅地建物取引士, 社会保険労務士（取得中）' },

    { ...e('prod-ga-002', '石川 竜也', 'ishikawa@example.com',
      '総務部', 'マネージャー', 'full-time', 'active', '2018-04-01',
      ['Excel'],
      '総務全般のマネジメントを担当しています。',
      'dog-coco2', 'prod-ga-001'),
      projects: [P.EXPENSE_SYS, P.INTERNAL_COMM] },

    { ...e('prod-ga-003', '前田 愛', 'maeda@example.com',
      '総務部', '総務担当', 'full-time', 'active', '2020-10-01',
      ['Excel'],
      '庶務・経費精算を担当しています。',
      'bear-panda2', 'prod-ga-002'),
      projects: [P.EXPENSE_SYS] },

    { ...e('prod-ga-004', '藤田 悠', 'fujita@example.com',
      '総務部', '総務担当', 'full-time', 'leave', '2021-04-01',
      ['Excel'],
      '施設管理・備品管理を担当しています。',
      'bear-brown2', 'prod-ga-002'),
      projects: [P.INTERNAL_COMM] },

    { ...e('prod-ga-005', '岸本 美羽', 'kishimoto@example.com',
      '総務部', '経理担当', 'full-time', 'active', '2019-07-01',
      ['Excel', 'SQL'],
      '経理・決算業務を担当しています。',
      'fox-hana2', 'prod-ga-001'),
      projects: [P.EXPENSE_SYS] },

    { ...e('prod-ga-006', '浜田 慎吾', 'hamada@example.com',
      '総務部', '法務担当', 'full-time', 'active', '2020-01-01',
      ['コンサルタント', 'Excel'],
      '契約書レビュー・法務相談を担当しています。',
      'owl-fukuro2', 'prod-ga-001'),
      projects: [P.GLOBAL] },

    // ── マーケティング部 (7名) ────────────────────────────
    { ...e('prod-mkt-001', '後藤 理沙', 'goto@example.com',
      'マーケティング部', '部長', 'full-time', 'active', '2016-04-01',
      ['JavaScript', 'アナリスト', 'Figma'],
      'マーケティング戦略の立案・実行を担当しています。',
      'rabbit-luna2', 'prod-exec-002'),
      projects: [P.CORP_SITE, P.EC_SITE, P.GLOBAL],
      selfIntroduction: 'ブランドと顧客の接点をデザインするのがマーケターの仕事だと思っています。',
      strengths: 'ブランド戦略の設計と実行。コンテンツ×データのハイブリッドアプローチ。',
      growthSkills: 'プロダクトマーケティング、グロースハック',
      interests: 'コンテンツマーケティング、SEO/SEM、グローバルブランディング',
      hobbies: '写真撮影、美術館巡り、ヨガ',
      personalMessage: 'マーケティングは「伝える」ではなく「共感する」こと。',
      workLocation: '週3出社、週2リモート',
      availability: 'フルタイム',
      careerHistory: '広告代理店（3年）→ D2Cブランド マーケティングマネージャー（3年）→ 当社',
      certifications: 'Google Analytics 認定資格, Google 広告認定資格' },

    { ...e('prod-mkt-002', '岡田 亮', 'okada@example.com',
      'マーケティング部', 'マネージャー', 'full-time', 'active', '2019-07-01',
      ['JavaScript', 'アナリスト'],
      'コンテンツマーケティングを担当しています。',
      'fox-kitsune2', 'prod-mkt-001'),
      projects: [P.CORP_SITE, P.EC_SITE] },

    { ...e('prod-mkt-003', '長谷川 菜穂', 'hasegawa@example.com',
      'マーケティング部', 'マーケター', 'full-time', 'active', '2022-04-01',
      ['JavaScript', 'Figma'],
      '新卒入社。SNSマーケティングを中心に担当しています。',
      'rabbit-snow2', 'prod-mkt-002'),
      projects: [P.CORP_SITE] },

    { ...e('prod-mkt-004', '中野 彩花', 'nakano@example.com',
      'マーケティング部', 'マーケター', 'full-time', 'active', '2021-04-01',
      ['Figma', 'JavaScript'],
      'デザインとコンテンツ制作を担当しています。',
      'cat-mimi2', 'prod-mkt-002'),
      projects: [P.CORP_SITE, P.EC_SITE] },

    { ...e('prod-mkt-005', '小島 剛志', 'kojima@example.com',
      'マーケティング部', 'マネージャー', 'full-time', 'active', '2018-10-01',
      ['アナリスト', 'SQL', 'Excel'],
      'データドリブンなマーケティング施策を推進しています。',
      'bear-grizzly2', 'prod-mkt-001'),
      projects: [P.DATA_PLATFORM, P.EC_SITE] },

    { ...e('prod-mkt-006', '辻 友里', 'tsuji@example.com',
      'マーケティング部', 'マーケター', 'full-time', 'active', '2022-07-01',
      ['Excel', 'アナリスト'],
      '広告運用・効果測定を担当しています。',
      'dog-hachi2', 'prod-mkt-005'),
      projects: [P.EC_SITE] },

    { ...e('prod-mkt-007', '桜井 翔太', 'sakurai@example.com',
      'マーケティング部', 'マーケター', 'contract', 'active', '2023-01-01',
      ['JavaScript', 'Figma'],
      'Web制作・LP制作を担当しています。',
      'penguin-pen2', 'prod-mkt-005'),
      projects: [P.CORP_SITE] },

    // ── カスタマーサポート部 (7名) ────────────────────────
    { ...e('prod-cs-001', '村田 剛', 'murata@example.com',
      'カスタマーサポート部', '部長', 'full-time', 'active', '2017-04-01',
      ['Excel', 'コンサルタント'],
      'カスタマーサポート全体を統括しています。',
      'bear-honey2', 'prod-exec-003'),
      projects: [P.CS_STRENGTHEN, P.INTERNAL_COMM],
      selfIntroduction: 'お客様の声こそがプロダクト改善のヒントだと信じています。サポートチームが誇りを持って働けるよう環境整備に取り組んでいます。',
      strengths: 'VOC（顧客の声）の収集・分析・フィードバック。チームの応対品質向上。',
      growthSkills: 'カスタマーサクセスの指標設計（NPS・CSAT）、AIチャットボット活用',
      interests: 'CX（カスタマーエクスペリエンス）設計、コミュニティ運営',
      hobbies: 'バスケットボール、家庭菜園、アニメ鑑賞',
      personalMessage: 'サポートは「対応」ではなく「関係構築」です。',
      workLocation: '週4出社（対応状況による）',
      availability: 'フルタイム',
      careerHistory: 'コールセンター SV（2年）→ CS マネージャー（3年）→ 当社',
      certifications: 'サービス接遇検定 1 級' },

    { ...e('prod-cs-002', '近藤 春奈', 'kondo@example.com',
      'カスタマーサポート部', 'リーダー', 'full-time', 'active', '2020-04-01',
      ['Excel'],
      'サポートチームのリーダーとしてお客様対応を統括しています。',
      'rabbit-usagi2', 'prod-cs-001'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-cs-003', '内田 葵', 'uchida@example.com',
      'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2021-04-01',
      ['Excel'],
      'お客様からの問い合わせ対応を担当しています。',
      'cat-tama2', 'prod-cs-002'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-cs-004', '三浦 健一', 'miura2@example.com',
      'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2022-04-01',
      ['Excel'],
      'テクニカルサポートを担当しています。',
      'dog-pochi2', 'prod-cs-002'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-cs-005', '宮本 彩', 'miyamoto@example.com',
      'カスタマーサポート部', 'サポート担当', 'part-time', 'active', '2022-07-01',
      ['Excel'],
      'チャットサポートを中心に担当しています。',
      'fox-sora2', 'prod-cs-002'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-cs-006', '藤井 大志', 'fujii@example.com',
      'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2023-04-01',
      ['Excel'],
      '新卒入社。お客様の声を大切にしながら対応しています。',
      'owl-wise2', 'prod-cs-002'),
      projects: [P.CS_STRENGTHEN] },

    { ...e('prod-cs-007', '中川 美里', 'nakagawa@example.com',
      'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2023-07-01',
      ['Excel'],
      'メールサポートを担当しています。',
      'deer-bambi2', 'prod-cs-002'),
      projects: [P.CS_STRENGTHEN] },
  ];
}

async function seedProd() {
  // 既存の社員（シード以外）が属する組織IDを特定
  const empsSnap = await db.collection('employees').get();
  const realEmp = empsSnap.docs.find((d) => !d.id.startsWith('prod-') && !d.id.startsWith('dev-'));
  if (!realEmp) {
    console.error('実ユーザーの社員データが見つかりません。先に管理者が組織を作成してください。');
    process.exit(1);
  }
  const ORG_ID = realEmp.data().organizationId as string;
  console.log(`使用する組織ID: ${ORG_ID}`);

  const employees = buildEmployees(ORG_ID);

  // 既存の seed データのみ削除（prod- プレフィックスのもの）
  const existing = await db.collection('employees')
    .where('organizationId', '==', ORG_ID)
    .get();

  const seedDocs = existing.docs.filter((d) => d.id.startsWith('prod-'));
  if (seedDocs.length > 0) {
    const deleteBatch = db.batch();
    seedDocs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`既存のシードデータ ${seedDocs.length} 件を削除しました`);
  }

  // Firestore バッチ上限(500)を超えないよう分割して投入
  const CHUNK = 400;
  for (let i = 0; i < employees.length; i += CHUNK) {
    const batch = db.batch();
    employees.slice(i, i + CHUNK).forEach((e) => {
      batch.set(db.collection('employees').doc(e.id), e);
    });
    await batch.commit();
  }

  console.log(`${employees.length} 件のテストデータを本番環境に登録しました`);
  process.exit(0);
}

seedProd().catch((err) => {
  console.error('seed-prod failed:', err);
  process.exit(1);
});
