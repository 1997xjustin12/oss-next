export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  originalPrice?: number
  sku?: string
  size?: string
  condition?: string
  orderType?: string
  shipNote?: string
  image?: string
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}
