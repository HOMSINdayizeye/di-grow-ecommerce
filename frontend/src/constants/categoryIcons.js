/**
 * Curated set of icons a category can use. Importing named icons (instead of
 * the whole lucide namespace) keeps the bundle small.
 */
import {
  Pill,
  Sprout,
  Sparkles,
  Baby,
  Stethoscope,
  Tractor,
  Leaf,
  HeartPulse,
  Tag,
  Apple,
  Droplets,
  Sun,
  Syringe,
  Thermometer,
  Wheat,
  Flower2,
  Shield,
  Dumbbell,
  Eye,
  Bone,
  Brain,
  Smile,
  Bug,
  Package,
  ShoppingBasket,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  Pill,
  Sprout,
  Sparkles,
  Baby,
  Stethoscope,
  Tractor,
  Leaf,
  HeartPulse,
  Tag,
  Apple,
  Droplets,
  Sun,
  Syringe,
  Thermometer,
  Wheat,
  Flower2,
  Shield,
  Dumbbell,
  Eye,
  Bone,
  Brain,
  Smile,
  Bug,
  Package,
  ShoppingBasket,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] || Tag;
}

export default CATEGORY_ICONS;
