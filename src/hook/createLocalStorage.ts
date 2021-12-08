import { useEffect, useState } from "react";

type Setter = (value: string | null) => void;
type UseLocalStorage = () => [string | null, Setter];

// inefficient in all but the simplest cases with very few values in localStorage
// but works sufficiently for now and should not be needed in the future much either
export function createLocalStorage(key: string): UseLocalStorage {
  if (typeof window === "undefined" || window.localStorage === undefined) {
    return () => [
      null,
      (_value) => {
        return;
      },
    ];
  }

  return () => {
    const initialValue = localStorage.getItem(key);
    const [val, setVal] = useState(initialValue);

    const handleStorage = (ev: StorageEvent) => {
      const { key: evKey, oldValue, newValue } = ev;
      if (key !== evKey) return;
      if (oldValue === newValue) return;

      setVal(newValue);
    };

    useEffect(() => {
      window.addEventListener("storage", handleStorage);

      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    }, []);

    return [
      val,
      (value: string | null) => {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
        setVal(value);
      },
    ];
  };
}
