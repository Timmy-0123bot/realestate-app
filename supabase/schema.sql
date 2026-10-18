-- =========================================================
-- 不動産管理アプリ用テーブル定義
-- Supabaseダッシュボードの「SQL Editor」に貼り付けて実行してください
-- =========================================================

-- 物件テーブル
create table if not exists public.properties (
  id          bigint generated always as identity primary key,
  -- 登録したユーザー（ユーザー削除時は物件も削除）
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),  -- 物件名
  rent        integer not null check (rent >= 0),                          -- 家賃（円）
  area        text not null check (char_length(area) between 1 and 100),  -- エリア名
  layout      text not null check (char_length(layout) between 1 and 20), -- 間取り（例：1LDK）
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ユーザーごとの一覧取得を高速化するためのインデックス
create index if not exists properties_user_id_idx on public.properties (user_id);

-- 更新時にupdated_atを自動で現在時刻にするトリガー
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- RLS（行レベルセキュリティ）
-- ---------------------------------------------------------
alter table public.properties enable row level security;

-- 再実行できるように既存のポリシーを削除
drop policy if exists "自分の物件のみ参照できる" on public.properties;
drop policy if exists "自分の物件のみ登録できる" on public.properties;
drop policy if exists "自分の物件のみ更新できる" on public.properties;
drop policy if exists "自分の物件のみ削除できる" on public.properties;

-- 参照：自分が登録した物件のみ
create policy "自分の物件のみ参照できる"
  on public.properties for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 登録：user_idが自分のIDである場合のみ
create policy "自分の物件のみ登録できる"
  on public.properties for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 更新：自分の物件のみ、かつ所有者を他人に変更できない
create policy "自分の物件のみ更新できる"
  on public.properties for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 削除：自分の物件のみ
create policy "自分の物件のみ削除できる"
  on public.properties for delete
  to authenticated
  using ((select auth.uid()) = user_id);
