-- ============================================================
-- GREEN SOIL Agri Services — Complete Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fast text search


-- ─────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum (
    'SUPER_ADMIN', 'DIRECTOR', 'CEO', 'ADMIN', 'EMPLOYEE', 'CUSTOMER'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('COD', 'BANK_TRANSFER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employment_status as enum (
    'ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RESIGNED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_message_status as enum ('NEW', 'READ', 'REPLIED', 'ARCHIVED');
exception when duplicate_object then null; end $$;


-- ─────────────────────────────────────────────────────────────
-- 2. ROLES TABLE  (must exist before profiles)
-- ─────────────────────────────────────────────────────────────
create table if not exists roles (
  id          uuid primary key default uuid_generate_v4(),
  name        user_role not null unique,
  description text,
  created_at  timestamptz not null default now()
);

-- Seed roles
insert into roles (name, description) values
  ('SUPER_ADMIN', 'Full system access'),
  ('DIRECTOR',    'Director — management access'),
  ('CEO',         'CEO — management access'),
  ('ADMIN',       'Store admin'),
  ('EMPLOYEE',    'Staff employee'),
  ('CUSTOMER',    'Regular customer')
on conflict (name) do nothing;


-- ─────────────────────────────────────────────────────────────
-- 3. PROFILES  (extends auth.users — auto-created on signup)
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  role_id     uuid references roles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_role_id uuid;
begin
  select id into v_customer_role_id
  from public.roles
  where name = 'CUSTOMER'
  limit 1;

  insert into public.profiles (id, full_name, phone, role_id, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), null),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), ''),
    v_customer_role_id,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;

exception when others then
  raise warning 'handle_new_user failed for user %: % %', new.id, sqlerrm, sqlstate;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to postgres;
grant insert, select on public.profiles to supabase_auth_admin;
grant select on public.roles to supabase_auth_admin;


-- ─────────────────────────────────────────────────────────────
-- 4. PERMISSIONS + ROLE_PERMISSIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists permissions (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id       uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- Seed permissions
insert into permissions (code, description) values
  ('products.view',       'View products'),
  ('products.create',     'Create products'),
  ('products.edit',       'Edit products'),
  ('products.delete',     'Delete/archive products'),
  ('orders.view_all',     'View all orders'),
  ('orders.view_own',     'View own orders'),
  ('orders.manage',       'Update order status'),
  ('customers.view',      'View customer list'),
  ('customers.manage',    'Manage customers'),
  ('employees.view',      'View employee list'),
  ('employees.manage',    'Manage employees'),
  ('reports.view',        'View reports'),
  ('content.manage',      'Manage content'),
  ('settings.manage',     'Manage site settings'),
  ('audit_logs.view',     'View audit logs')
on conflict (code) do nothing;


-- ─────────────────────────────────────────────────────────────
-- 5. DEPARTMENTS + EMPLOYEES
-- ─────────────────────────────────────────────────────────────
create table if not exists departments (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists employees (
  id                 uuid primary key default uuid_generate_v4(),
  profile_id         uuid not null unique references profiles(id) on delete cascade,
  employee_code      text not null unique,
  department_id      uuid references departments(id) on delete set null,
  designation        text,
  joining_date       date,
  employment_status  employment_status not null default 'ACTIVE',
  address            text,
  emergency_contact  jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create index if not exists idx_employees_profile_id on employees(profile_id);
create index if not exists idx_employees_status     on employees(employment_status);


-- ─────────────────────────────────────────────────────────────
-- 6. ADDRESSES  (saved addresses for customers)
-- ─────────────────────────────────────────────────────────────
create table if not exists addresses (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references profiles(id) on delete cascade,
  label         text not null default 'Home',
  full_name     text not null,
  phone         text,
  address_line1 text not null,
  address_line2 text,
  city          text not null,
  province      text,
  country       text not null default 'Pakistan',
  postal_code   text,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_addresses_profile_id on addresses(profile_id);


-- ─────────────────────────────────────────────────────────────
-- 7. PRODUCT CATEGORIES
-- ─────────────────────────────────────────────────────────────
create table if not exists product_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  icon        text,
  parent_id   uuid references product_categories(id) on delete set null,
  sort_order  int not null default 0,
  status      text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists idx_categories_slug   on product_categories(slug);
create index if not exists idx_categories_status on product_categories(status);


-- ─────────────────────────────────────────────────────────────
-- 8. PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table if not exists products (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  slug                 text not null unique,
  sku                  text not null unique,
  category_id          uuid references product_categories(id) on delete set null,
  short_description    text,
  description          text,
  price                numeric(12,2) not null check (price >= 0),
  compare_at_price     numeric(12,2) check (compare_at_price >= 0),
  cost_price           numeric(12,2) check (cost_price >= 0),
  stock_quantity       int not null default 0 check (stock_quantity >= 0),
  reserved_quantity    int not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold  int not null default 10,
  packaging_size       text,
  unit                 text,
  brand                text,
  status               product_status not null default 'DRAFT',
  featured             boolean not null default false,
  benefits             jsonb,         -- array of strings
  usage_instructions   text,
  composition          text,
  specifications       jsonb,         -- key-value object
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);

create index if not exists idx_products_slug       on products(slug);
create index if not exists idx_products_sku        on products(sku);
create index if not exists idx_products_status     on products(status);
create index if not exists idx_products_category   on products(category_id);
create index if not exists idx_products_featured   on products(featured);
create index if not exists idx_products_deleted    on products(deleted_at);
create index if not exists idx_products_name_trgm  on products using gin (name gin_trgm_ops);


-- ─────────────────────────────────────────────────────────────
-- 9. PRODUCT IMAGES
-- ─────────────────────────────────────────────────────────────
create table if not exists product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on product_images(product_id);


-- ─────────────────────────────────────────────────────────────
-- 10. PRODUCT VIDEOS  (YouTube links, can be standalone or linked to product)
-- ─────────────────────────────────────────────────────────────
create table if not exists product_videos (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid references products(id) on delete set null,
  title         text not null,
  description   text,
  youtube_url   text not null,
  thumbnail_url text,
  category      text,
  status        text not null default 'PUBLISHED' check (status in ('PUBLISHED','DRAFT')),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists idx_product_videos_product_id on product_videos(product_id);
create index if not exists idx_product_videos_status     on product_videos(status);


-- ─────────────────────────────────────────────────────────────
-- 11. CART ITEMS
-- ─────────────────────────────────────────────────────────────
create table if not exists cart_items (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (profile_id, product_id)
);

create index if not exists idx_cart_profile_id on cart_items(profile_id);


-- ─────────────────────────────────────────────────────────────
-- 12. ORDERS + ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  order_number      text not null unique,
  customer_id       uuid not null references profiles(id) on delete restrict,
  status            order_status not null default 'PENDING',
  payment_method    payment_method not null,
  payment_status    payment_status not null default 'PENDING',
  subtotal          numeric(12,2) not null default 0,
  shipping_amount   numeric(12,2) not null default 0,
  discount_amount   numeric(12,2) not null default 0,
  tax_amount        numeric(12,2) not null default 0,
  total_amount      numeric(12,2) not null,
  shipping_address  jsonb not null,
  customer_notes    text,
  admin_notes       text,
  payment_proof_url text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_orders_customer_id   on orders(customer_id);
create index if not exists idx_orders_status        on orders(status);
create index if not exists idx_orders_created_at    on orders(created_at desc);
create index if not exists idx_orders_order_number  on orders(order_number);

create table if not exists order_items (
  id                     uuid primary key default uuid_generate_v4(),
  order_id               uuid not null references orders(id) on delete cascade,
  product_id             uuid references products(id) on delete set null,
  product_name_snapshot  text not null,
  sku_snapshot           text not null,
  unit_price_snapshot    numeric(12,2) not null,
  quantity               int not null check (quantity > 0),
  subtotal               numeric(12,2) not null,
  created_at             timestamptz not null default now()
);

create index if not exists idx_order_items_order_id   on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);


-- ─────────────────────────────────────────────────────────────
-- 13. WISHLISTS
-- ─────────────────────────────────────────────────────────────
create table if not exists wishlists (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (profile_id, product_id)
);


-- ─────────────────────────────────────────────────────────────
-- 14. SERVICES  (agri services offered by GREEN SOIL)
-- ─────────────────────────────────────────────────────────────
create table if not exists services (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  slug              text not null unique,
  short_description text,
  description       text,
  image_url         text,
  icon              text,
  features          jsonb,
  status            text not null default 'PUBLISHED' check (status in ('PUBLISHED','DRAFT','ARCHIVED')),
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index if not exists idx_services_status on services(status);
create index if not exists idx_services_slug   on services(slug);


-- ─────────────────────────────────────────────────────────────
-- 15. CONTACT MESSAGES
-- ─────────────────────────────────────────────────────────────
create table if not exists contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  status      contact_message_status not null default 'NEW',
  admin_notes text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_contact_messages_status on contact_messages(status);


-- ─────────────────────────────────────────────────────────────
-- 16. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  type        text not null default 'INFO',
  entity_type text,
  entity_id   text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_profile_id on notifications(profile_id);
create index if not exists idx_notifications_read_at    on notifications(read_at);


-- ─────────────────────────────────────────────────────────────
-- 17. AUDIT LOGS
-- ─────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_logs_user_id     on audit_logs(user_id);
create index if not exists idx_audit_logs_entity      on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at  on audit_logs(created_at desc);


-- ─────────────────────────────────────────────────────────────
-- 18. CEO MESSAGE
-- ─────────────────────────────────────────────────────────────
create table if not exists ceo_message (
  id            uuid primary key default uuid_generate_v4(),
  ceo_name      text not null default 'CEO Name',
  designation   text not null default 'Chief Executive Officer',
  photo_url     text,
  signature_url text,
  message       text not null default '',
  vision        text,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references profiles(id) on delete set null
);

-- Seed one default row
insert into ceo_message (ceo_name, designation, message, vision)
values (
  'Muhammad Ali',
  'Chief Executive Officer',
  'We are committed to empowering Pakistani farmers with the highest quality agricultural inputs and services. Our mission is to ensure every farmer has access to the tools they need to grow better crops and build a prosperous future.',
  'To become Pakistan''s most trusted and innovative agricultural company, driving sustainable farming practices across the nation.'
)
on conflict do nothing;


-- ─────────────────────────────────────────────────────────────
-- 19. ABOUT CONTENT
-- ─────────────────────────────────────────────────────────────
create table if not exists about_content (
  id          uuid primary key default uuid_generate_v4(),
  section_key text not null unique,
  title       text,
  body        jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references profiles(id) on delete set null
);

insert into about_content (section_key, title, body) values
  ('hero',    'About GREEN SOIL', '{"text": "Pakistan''s leading agri-input company providing premium fertilizers and agricultural solutions."}'),
  ('mission', 'Our Mission',      '{"text": "To empower farmers with premium quality products and expert support for maximum crop yield."}'),
  ('vision',  'Our Vision',       '{"text": "To become Pakistan''s most trusted agricultural company driving sustainable farming."}'),
  ('values',  'Our Values',       '{"items": ["Quality", "Integrity", "Innovation", "Farmer-First"]}')
on conflict (section_key) do nothing;


-- ─────────────────────────────────────────────────────────────
-- 20. SITE SETTINGS  (key-value config store)
-- ─────────────────────────────────────────────────────────────
create table if not exists site_settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references profiles(id) on delete set null
);

insert into site_settings (key, value) values
  ('company_name',      '"GREEN SOIL Agri Services (PVT) Limited"'),
  ('company_phone',     '"+92 300 000 0000"'),
  ('company_email',     '"info@greensoilagri.com"'),
  ('company_address',   '"Pakistan"'),
  ('company_website',   '"https://greensoilagri.com"'),
  ('currency',          '"PKR"'),
  ('tax_rate',          '0'),
  ('shipping_flat_rate','0'),
  ('facebook_url',      '""'),
  ('instagram_url',     '""'),
  ('youtube_url',       '""'),
  ('twitter_url',       '""')
on conflict (key) do nothing;


-- ─────────────────────────────────────────────────────────────
-- 21. HOMEPAGE SECTIONS  (optional CMS blocks)
-- ─────────────────────────────────────────────────────────────
create table if not exists homepage_sections (
  id          uuid primary key default uuid_generate_v4(),
  section_key text not null unique,
  title       text,
  subtitle    text,
  content     jsonb,
  status      text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────
-- 22. STOCK DECREMENT FUNCTION  (called from orderService.createOrder)
-- ─────────────────────────────────────────────────────────────
create or replace function decrement_stock(p_product_id uuid, p_quantity int)
returns void language plpgsql security definer as $$
begin
  update products
  set
    stock_quantity   = greatest(0, stock_quantity - p_quantity),
    reserved_quantity = greatest(0, reserved_quantity - p_quantity),
    updated_at       = now()
  where id = p_product_id;
end;
$$;


-- ─────────────────────────────────────────────────────────────
-- 23. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- Helper: get current user role
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select r.name::text
  from profiles p
  join roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1;
$$;

-- Helper: is admin/staff
create or replace function is_admin_or_staff()
returns boolean language sql security definer stable as $$
  select get_my_role() in ('SUPER_ADMIN','DIRECTOR','CEO','ADMIN','EMPLOYEE');
$$;

-- ── profiles ──
alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can read all profiles"
  on profiles for select using (is_admin_or_staff());

-- ── products ──
alter table products enable row level security;

create policy "Anyone can view published products"
  on products for select
  using (status = 'PUBLISHED' and deleted_at is null);

create policy "Admins can do everything on products"
  on products for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── product_categories ──
alter table product_categories enable row level security;

create policy "Anyone can view active categories"
  on product_categories for select
  using (status = 'ACTIVE' and deleted_at is null);

create policy "Admins can manage categories"
  on product_categories for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── product_images ──
alter table product_images enable row level security;

create policy "Anyone can view product images"
  on product_images for select using (true);

create policy "Admins can manage product images"
  on product_images for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── product_videos ──
alter table product_videos enable row level security;

create policy "Anyone can view published videos"
  on product_videos for select using (status = 'PUBLISHED' and deleted_at is null);

create policy "Admins can manage product videos"
  on product_videos for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── cart_items ──
alter table cart_items enable row level security;

create policy "Users manage their own cart"
  on cart_items for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Admins can view all carts"
  on cart_items for select using (is_admin_or_staff());

-- ── orders ──
alter table orders enable row level security;

create policy "Customers see their own orders"
  on orders for select using (auth.uid() = customer_id);

create policy "Customers can insert orders"
  on orders for insert with check (auth.uid() = customer_id);

create policy "Admins can do everything on orders"
  on orders for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── order_items ──
alter table order_items enable row level security;

create policy "Customers see their own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

create policy "Admins can manage order items"
  on order_items for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

create policy "System can insert order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

-- ── services ──
alter table services enable row level security;

create policy "Anyone can view published services"
  on services for select using (status = 'PUBLISHED' and deleted_at is null);

create policy "Admins can manage services"
  on services for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── contact_messages ──
alter table contact_messages enable row level security;

create policy "Anyone can submit contact messages"
  on contact_messages for insert with check (true);

create policy "Admins can manage contact messages"
  on contact_messages for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── notifications ──
alter table notifications enable row level security;

create policy "Users see their own notifications"
  on notifications for select using (auth.uid() = profile_id);

create policy "Users can mark their notifications as read"
  on notifications for update using (auth.uid() = profile_id);

create policy "Admins can manage all notifications"
  on notifications for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── audit_logs ──
alter table audit_logs enable row level security;

create policy "Admins can view audit logs"
  on audit_logs for select using (is_admin_or_staff());

create policy "System can insert audit logs"
  on audit_logs for insert with check (true);

-- ── ceo_message ──
alter table ceo_message enable row level security;

create policy "Anyone can read ceo_message"
  on ceo_message for select using (true);

create policy "Admins can manage ceo_message"
  on ceo_message for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── about_content ──
alter table about_content enable row level security;

create policy "Anyone can read about content"
  on about_content for select using (true);

create policy "Admins can manage about content"
  on about_content for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── site_settings ──
alter table site_settings enable row level security;

create policy "Anyone can read site settings"
  on site_settings for select using (true);

create policy "Admins can manage site settings"
  on site_settings for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── employees ──
alter table employees enable row level security;

create policy "Admins and staff can view employees"
  on employees for select using (is_admin_or_staff());

create policy "Admins can manage employees"
  on employees for all
  using (get_my_role() in ('SUPER_ADMIN','DIRECTOR','CEO','ADMIN'))
  with check (get_my_role() in ('SUPER_ADMIN','DIRECTOR','CEO','ADMIN'));

-- ── departments ──
alter table departments enable row level security;

create policy "Admins and staff can view departments"
  on departments for select using (is_admin_or_staff());

create policy "Admins can manage departments"
  on departments for all
  using (get_my_role() in ('SUPER_ADMIN','DIRECTOR','CEO','ADMIN'))
  with check (get_my_role() in ('SUPER_ADMIN','DIRECTOR','CEO','ADMIN'));

-- ── addresses ──
alter table addresses enable row level security;

create policy "Users manage their own addresses"
  on addresses for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Admins can view all addresses"
  on addresses for select using (is_admin_or_staff());

-- ── roles ──
alter table roles enable row level security;

create policy "Anyone can read roles"
  on roles for select using (true);

-- ── homepage_sections ──
alter table homepage_sections enable row level security;

create policy "Anyone can view active sections"
  on homepage_sections for select using (status = 'ACTIVE');

create policy "Admins can manage homepage sections"
  on homepage_sections for all
  using (is_admin_or_staff())
  with check (is_admin_or_staff());

-- ── wishlists ──
alter table wishlists enable row level security;

create policy "Users manage their own wishlist"
  on wishlists for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);


-- ─────────────────────────────────────────────────────────────
-- 24. STORAGE BUCKETS  (run separately if needed)
-- ─────────────────────────────────────────────────────────────
-- In Supabase Dashboard → Storage → New bucket, create these public buckets:
--   product-images
--   employee-photos
--   ceo-photos
--   service-images
--   payment-proofs  (private)
--
-- Or run via SQL:
insert into storage.buckets (id, name, public) values
  ('product-images',  'product-images',  true),
  ('employee-photos', 'employee-photos', true),
  ('ceo-photos',      'ceo-photos',      true),
  ('service-images',  'service-images',  true),
  ('payment-proofs',  'payment-proofs',  false)
on conflict (id) do nothing;

-- Storage RLS: allow anyone to view public bucket objects
create policy "Public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins upload product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin_or_staff());

create policy "Admins delete product-images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin_or_staff());

create policy "Public read ceo-photos"
  on storage.objects for select
  using (bucket_id = 'ceo-photos');

create policy "Admins upload ceo-photos"
  on storage.objects for insert
  with check (bucket_id = 'ceo-photos' and is_admin_or_staff());

create policy "Public read service-images"
  on storage.objects for select
  using (bucket_id = 'service-images');

create policy "Admins upload service-images"
  on storage.objects for insert
  with check (bucket_id = 'service-images' and is_admin_or_staff());

create policy "Users upload own payment-proofs"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.uid() is not null);

create policy "Admins view payment-proofs"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and is_admin_or_staff());


-- ─────────────────────────────────────────────────────────────
-- 25. SEED: SAMPLE DATA  (optional — gives you something to see)
-- ─────────────────────────────────────────────────────────────

-- Sample categories
insert into product_categories (name, slug, description, sort_order, status) values
  ('Fertilizers',       'fertilizers',       'All types of fertilizers for crops',       1, 'ACTIVE'),
  ('Pesticides',        'pesticides',        'Crop protection chemicals',                 2, 'ACTIVE'),
  ('Seeds',             'seeds',             'High-yield certified seeds',                3, 'ACTIVE'),
  ('Soil Conditioners', 'soil-conditioners', 'Products to improve soil health',           4, 'ACTIVE'),
  ('Micronutrients',    'micronutrients',    'Trace elements for plant nutrition',        5, 'ACTIVE'),
  ('Equipment',         'equipment',         'Farming tools and spraying equipment',      6, 'ACTIVE')
on conflict (slug) do nothing;

-- Sample services
insert into services (title, slug, short_description, description, sort_order, status) values
  (
    'Soil Testing',
    'soil-testing',
    'Professional soil analysis to determine nutrient deficiencies.',
    'Our certified agronomists collect and analyze your soil samples to provide a detailed report on nutrient levels, pH, and recommended fertilizer plans.',
    1, 'PUBLISHED'
  ),
  (
    'Crop Advisory',
    'crop-advisory',
    'Expert advice on crop selection, planting schedules, and fertilizer application.',
    'Get personalized crop management advice from our team of agricultural specialists. We help you maximize yield while minimizing input costs.',
    2, 'PUBLISHED'
  ),
  (
    'Fertilizer Consultation',
    'fertilizer-consultation',
    'Customized fertilizer programs based on your crop and soil type.',
    'Our experts design a tailored fertilizer plan based on your soil test results, crop type, and target yield to ensure optimal plant nutrition.',
    3, 'PUBLISHED'
  ),
  (
    'Nationwide Delivery',
    'nationwide-delivery',
    'Fast and reliable delivery of agri-inputs across Pakistan.',
    'We deliver our products to all major cities and rural areas across Pakistan. Bulk orders qualify for free delivery.',
    4, 'PUBLISHED'
  ),
  (
    'Training Programs',
    'training-programs',
    'Farmer training workshops on modern agricultural practices.',
    'We conduct regular training sessions for farmers covering best practices in fertilizer application, irrigation, and pest management.',
    5, 'PUBLISHED'
  ),
  (
    'After-Sale Support',
    'after-sale-support',
    'Dedicated support team to assist you after your purchase.',
    'Our agronomists remain available to answer questions and guide you through the growing season after you purchase our products.',
    6, 'PUBLISHED'
  )
on conflict (slug) do nothing;

-- Sample departments
insert into departments (name, description) values
  ('Sales',          'Sales and marketing team'),
  ('Operations',     'Logistics and supply chain'),
  ('Agronomy',       'Agricultural advisory team'),
  ('Finance',        'Accounts and finance'),
  ('IT',             'Information technology')
on conflict (name) do nothing;


-- ─────────────────────────────────────────────────────────────
-- DONE ✓
-- Next steps:
--   1. Copy .env.example to .env and fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
--   2. Create your first admin user via Supabase Auth
--   3. Manually update that user's role in the profiles table:
--        UPDATE profiles
--        SET role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')
--        WHERE id = '<your-user-uuid>';
-- ─────────────────────────────────────────────────────────────
