export const delay =
  <T>(ms: number) =>
  (v?: T): Promise<T | void> =>
    new Promise((resolve, _reject) =>
      setTimeout(() => {
        resolve(v);
      }, ms)
    );
