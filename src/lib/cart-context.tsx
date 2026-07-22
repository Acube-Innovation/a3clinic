"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

/**
 * Client-side cart. Persists to localStorage so a refresh keeps the basket.
 *
 * BACKEND SEAM: when a real store exists, replace the reducer's persistence
 * with API calls. The public hook signature (`useCart`) should not change.
 */

export type CartItem = {
  slug: string;
  name: string;
  price: number; // paise
  image?: string;
  size?: string;
  quantity: number;
};

type CartState = { items: CartItem[]; hydrated: boolean };

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "remove"; slug: string }
  | { type: "setQuantity"; slug: string; quantity: number }
  | { type: "clear" };

const STORAGE_KEY = "drr-cart-v1";
const WISHLIST_KEY = "drr-wishlist-v1";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };

    case "add": {
      const existing = state.items.find((i) => i.slug === action.item.slug);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.slug === action.item.slug
              ? { ...i, quantity: Math.min(i.quantity + action.quantity, 99) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: action.quantity }],
      };
    }

    case "remove":
      return { ...state, items: state.items.filter((i) => i.slug !== action.slug) };

    case "setQuantity":
      if (action.quantity < 1) {
        return { ...state, items: state.items.filter((i) => i.slug !== action.slug) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.slug === action.slug
            ? { ...i, quantity: Math.min(action.quantity, 99) }
            : i,
        ),
      };

    case "clear":
      return { ...state, items: [] };
  }
}

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Hydrate after mount so server and client markup match on first paint.
  //
  // Reading a one-time snapshot from localStorage (an external store) on mount
  // is the documented exception to the set-state-in-effect rule. It cannot move
  // into a useState initialiser: the server has no localStorage, so doing so
  // would produce a hydration mismatch. It runs exactly once, and the
  // `hydrated` flag guards every consumer against acting on the empty
  // pre-hydration state.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      dispatch({ type: "hydrate", items: raw ? JSON.parse(raw) : [] });
      const wishRaw = window.localStorage.getItem(WISHLIST_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      if (wishRaw) setWishlist(JSON.parse(wishRaw));
    } catch {
      // Corrupt or unavailable storage (private mode) — start empty rather
      // than breaking the page.
      dispatch({ type: "hydrate", items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* storage full or blocked — cart still works for this session */
    }
  }, [state.items, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      /* see above */
    }
  }, [wishlist, state.hydrated]);

  const add = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      dispatch({ type: "add", item, quantity });
      setDrawerOpen(true);
    },
    [],
  );

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((current) =>
      current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug],
    );
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    return {
      items: state.items,
      hydrated: state.hydrated,
      count,
      subtotal,
      add,
      remove: (slug) => dispatch({ type: "remove", slug }),
      setQuantity: (slug, quantity) =>
        dispatch({ type: "setQuantity", slug, quantity }),
      clear: () => dispatch({ type: "clear" }),
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      wishlist,
      toggleWishlist,
      isWishlisted: (slug) => wishlist.includes(slug),
    };
  }, [state.items, state.hydrated, isDrawerOpen, wishlist, add, toggleWishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
