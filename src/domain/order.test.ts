import { describe, expect, it } from 'vitest';
import { createBlankProject, createTextLayer } from './design';
import { addCartItem, createOrderFromCart } from './order';

describe('cart and order flow', () => {
  it('turns saved custom designs into order items with production payloads', () => {
    const project = createTextLayer(createBlankProject('floor-mat', 'mat-sand'), 'HELLO');
    const cart = addCartItem([], project, 2, 'preview-data-url');
    const order = createOrderFromCart(cart, '测试客户');

    expect(order.customerName).toBe('测试客户');
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].productId).toBe('floor-mat');
    expect(order.items[0].production.status).toBe('ready');
    expect(order.items[0].production.designJson.views.front.layers[0].type).toBe('text');
  });
});
