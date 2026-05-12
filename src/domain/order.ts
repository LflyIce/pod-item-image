import type { CartItem, DesignProject, Order } from './types';

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export function addCartItem(
  cart: CartItem[],
  project: DesignProject,
  quantity: number,
  previewUrl: string
): CartItem[] {
  return [
    ...cart,
    {
      id: uid('cart'),
      project,
      productId: project.productId,
      variantId: project.variantId,
      quantity,
      previewUrl
    }
  ];
}

export function createOrderFromCart(cart: CartItem[], customerName: string): Order {
  if (cart.length === 0) {
    throw new Error('Cannot create an order from an empty cart');
  }

  const createdAt = new Date().toISOString();
  return {
    id: uid('order'),
    customerName,
    createdAt,
    status: 'pending-production',
    items: cart.map((item, index) => ({
      id: uid('order_item'),
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      previewUrl: item.previewUrl,
      production: {
        status: 'ready',
        designJson: item.project,
        fileName: `${item.productId}-${createdAt.slice(0, 10)}-${index + 1}.json`
      }
    }))
  };
}
