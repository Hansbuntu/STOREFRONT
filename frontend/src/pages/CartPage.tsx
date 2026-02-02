import { Link } from "react-router-dom";

function CartPage() {
  // Later: integrate with cart state and /cart API
  const demoItems = [
    { id: 1, title: "Digital design service", price: 150, currency: "GHS" },
  ];
  const total = demoItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Your cart</h1>
      <div className="space-y-3">
        {demoItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border border-slate-800 rounded-lg px-4 py-3"
          >
            <span className="text-sm">{item.title}</span>
            <span className="text-sm text-slate-200">
              {item.currency} {item.price.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-slate-300">
          Total: <span className="font-semibold">GHS {total}</span>
        </p>
        <Link
          to="/checkout"
          className="bg-brand-600 hover:bg-brand-700 text-sm font-medium px-4 py-2 rounded"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}

export default CartPage;


