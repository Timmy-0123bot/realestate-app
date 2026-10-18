-- =========================================================
-- サンプルデータ（任意）
-- schema.sql の実行後に、テストユーザー demo@example.com の物件として登録します
-- =========================================================
insert into public.properties (user_id, name, rent, area, layout)
select u.id, v.name, v.rent, v.area, v.layout
from auth.users u
cross join (values
  ('サンライズ渋谷',       128000, '東京都渋谷区',   '1LDK'),
  ('グリーンハイツ世田谷',  95000, '東京都世田谷区', '1K'),
  ('パークサイド横浜',      82000, '神奈川県横浜市', '2DK'),
  ('リバーテラス大阪',      76000, '大阪府大阪市',   '1DK'),
  ('メゾン栄',              68000, '愛知県名古屋市', '1K'),
  ('シーサイド博多',        61000, '福岡県福岡市',   '2LDK')
) as v(name, rent, area, layout)
where u.email = 'demo@example.com';
