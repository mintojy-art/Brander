// Maps the plain Unicode emoji already used throughout the site (as data —
// category icons, badge icons, occasion icons, etc.) to a Lucide icon
// component. <Y2kIcon> renders the mapped Lucide icon, or falls back to the
// plain emoji character for anything not mapped, so an unmapped emoji never
// breaks — it just renders as before.
import {
  Package, Truck, ShieldCheck, Settings, AlertTriangle, CheckCircle2, Plus,
  Smile, MessageCircle, Paperclip, Inbox, Microscope, Printer,
  Image as ImageIcon, Shapes, ShoppingBag, ShoppingCart, Magnet, ToyBrick,
  Flame, FileText, Flag, Wrench, VenetianMask,
} from 'lucide-react'

export const Y2K_ICON_MAP = {
  '📦': Package,
  '🚚': Truck,
  '🛡️': ShieldCheck,
  '⚙️': Settings,
  '⚠️': AlertTriangle,
  '✅': CheckCircle2,
  '➕': Plus,
  '🎎': Smile,
  '💬': MessageCircle,
  '📎': Paperclip,
  '📥': Inbox,
  '🔬': Microscope,
  '🖨️': Printer,
  '🖼️': ImageIcon,
  '🗿': Shapes,
  '🛍️': ShoppingBag,
  '🛒': ShoppingCart,
  '🧲': Magnet,
  '🧸': ToyBrick,
  '🪔': Flame,
  '📝': FileText,
  '🇮🇳': Flag,
  '🛠️': Wrench,
  '🎭': VenetianMask,
}
