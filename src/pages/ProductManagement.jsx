import { useState } from "react";
import { sampleMenu } from "../data/sampleMenu.js";

export default function ProductManagement() {
  const [menu, setMenu] = useState(sampleMenu);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product List</h2>
      <ul>
        {menu.map((item) => (
          <li key={item.id} className="mb-2">
            {item.name} - ₱{item.price} ({item.category})
          </li>
        ))}
      </ul>
    </div>
  );
}
