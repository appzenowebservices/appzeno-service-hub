'use client';

import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';

export default function Cart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  
  // Subscribe to ALL store changes
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Calculate inline - SIMPLE!
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + ((item.discountedPrice || item.price) * item.quantity), 0);
  
  // Group by vendor
  const vendorMap: Record<string, any> = {};
  items.forEach(item => {
    if (!vendorMap[item.vendorId]) {
      vendorMap[item.vendorId] = {
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        businessType: item.vendorBusinessType,
        items: [],
        deliveryFee: item.deliveryFee || 30,
      };
    }
    vendorMap[item.vendorId].items.push(item);
  });
  
  const vendorGroups = Object.values(vendorMap);
  const deliveryFees = vendorGroups.reduce((sum: number, g: any) => sum + g.deliveryFee, 0);
  const grandTotal = subtotal + deliveryFees;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag className="h-6 w-6" />
            <h2 className="text-xl font-bold">My Cart</h2>
            {totalItems > 0 && (
              <Badge className="bg-white text-green-600 font-bold">{totalItems}</Badge>
            )}
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2">Cart is empty</h3>
            <Button onClick={onClose} className="bg-green-600 text-white mt-4 cursor-pointer">Start Shopping</Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {vendorGroups.map((group: any) => (
                <div key={group.vendorId} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="text-lg">🏪</span>
                    <div>
                      <h3 className="font-bold">{group.vendorName}</h3>
                      <p className="text-xs text-gray-500">{group.businessType}</p>
                    </div>
                  </div>

                  {group.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{item.name}</h4>
                        <p className="text-green-600 font-bold">₹{item.discountedPrice || item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 border-2 border-cyan-500 text-cyan-500 rounded flex items-center justify-center cursor-pointer">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-cyan-500 text-white rounded flex items-center justify-center">
                            <Plus className="h-3 w-3" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-red-500 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Items ({totalItems})</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className="font-bold">₹{deliveryFees}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-green-600">₹{grandTotal}</span>
                </div>
              </div>

              <Button onClick={() => { onClose(); router.push('/checkout'); }} className="w-full bg-green-600 text-white py-6 text-lg cursor-pointer">
                Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
