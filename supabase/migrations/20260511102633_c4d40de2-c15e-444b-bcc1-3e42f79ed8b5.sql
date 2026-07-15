ALTER TABLE public.custom_pages
  ADD COLUMN IF NOT EXISTS alignment text NOT NULL DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS max_width text NOT NULL DEFAULT 'max-w-4xl',
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS show_hero boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS body_size text NOT NULL DEFAULT 'base';